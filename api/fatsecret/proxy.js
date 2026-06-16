// Vercel serverless function — server-side proxy for the FatSecret Platform API.
//
// Why this exists:
//   FatSecret needs an OAuth 2.0 bearer token that's obtained via your
//   consumer_key + consumer_secret. Those credentials must NEVER appear in
//   client-side code, so we mint the token here, server-side, and forward
//   only the food data back to the browser.
//
// Routes (all GET ?method=...):
//   ?method=search&query=goldfish&page=0          → foods.search (autocomplete)
//   ?method=food&id=12345                         → food.get.v2 (full nutrition)
//
// Env vars required (set in Vercel → Settings → Environment Variables):
//   FATSECRET_CONSUMER_KEY
//   FATSECRET_CONSUMER_SECRET
//
// Note on IP whitelisting: FatSecret Basic restricts API access to specific
// IPs. Vercel uses dynamic IPs across many edge regions, so the practical
// solution is to whitelist 0.0.0.0/0 in your FatSecret app settings. Your
// credentials remain the actual gate — the IP list is defense in depth.

// Module-scope token cache. Vercel keeps warm function instances alive for a
// while between requests, so we avoid re-minting a token on every call. On a
// cold start the cache is empty and we mint a fresh one (~150ms overhead).
let cachedToken = null;
let cachedTokenExpiresAt = 0; // epoch ms

const TOKEN_URL = "https://oauth.fatsecret.com/connect/token";
const API_URL = "https://platform.fatsecret.com/rest/server.api";

async function getAccessToken() {
  const now = Date.now();
  // Give ourselves a 60s safety margin so we don't try to use a token that's
  // about to expire mid-request.
  if (cachedToken && now < cachedTokenExpiresAt - 60_000) {
    return cachedToken;
  }
  const key = process.env.FATSECRET_CONSUMER_KEY;
  const secret = process.env.FATSECRET_CONSUMER_SECRET;
  if (!key || !secret) {
    throw new Error(
      "Server misconfigured: FATSECRET_CONSUMER_KEY and FATSECRET_CONSUMER_SECRET must be set as Vercel environment variables.",
    );
  }
  const basic = Buffer.from(`${key}:${secret}`).toString("base64");
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    scope: "basic", // "premier" if you get accepted into Premier Free
  });
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      `FatSecret token request failed (${res.status}): ${data.error || JSON.stringify(data)}`,
    );
  }
  cachedToken = data.access_token;
  // expires_in is seconds; convert to absolute epoch ms
  cachedTokenExpiresAt = now + (data.expires_in || 3600) * 1000;
  return cachedToken;
}

// Helper: call the FatSecret REST API with the bearer token and return JSON.
async function callApi(params) {
  const token = await getAccessToken();
  const url = new URL(API_URL);
  for (const [k, v] of Object.entries(params)) {
    if (v != null) url.searchParams.set(k, String(v));
  }
  url.searchParams.set("format", "json");
  const res = await fetch(url.toString(), {
    method: "GET",
    headers: { "Authorization": `Bearer ${token}` },
  });
  const text = await res.text();
  let data;
  try { data = JSON.parse(text); } catch (e) {
    throw new Error(`FatSecret returned non-JSON (${res.status}): ${text.slice(0, 200)}`);
  }
  if (!res.ok) {
    throw new Error(`FatSecret API error (${res.status}): ${JSON.stringify(data)}`);
  }
  // FatSecret returns errors inside a 200 response under data.error
  if (data.error) {
    throw new Error(`FatSecret error ${data.error.code}: ${data.error.message}`);
  }
  return data;
}

// ---- Response normalizers ---------------------------------------------------
// FatSecret returns nested + sometimes single-vs-array shapes (e.g.
// `foods.food` is a single object when there's one match, an array when
// many). Normalize for the client.

function normalizeSearchResults(raw) {
  const foods = raw && raw.foods && raw.foods.food;
  if (!foods) return [];
  const list = Array.isArray(foods) ? foods : [foods];
  return list.map((f) => ({
    food_id: f.food_id,
    name: f.food_name,
    brand: f.brand_name || null,
    type: f.food_type, // "Generic" or "Brand"
    // food_description is something like "Per 1 oz - Calories: 150kcal | Fat: 6g | Carbs: 20g | Protein: 4g"
    description: f.food_description || "",
  }));
}

function normalizeFoodDetail(raw) {
  const f = raw && raw.food;
  if (!f) return null;
  // f.servings.serving can be one object or an array
  const servingsRaw = f.servings && f.servings.serving;
  const servings = servingsRaw
    ? (Array.isArray(servingsRaw) ? servingsRaw : [servingsRaw])
    : [];
  return {
    food_id: f.food_id,
    name: f.food_name,
    brand: f.brand_name || null,
    type: f.food_type,
    servings: servings.map((s) => ({
      serving_id: s.serving_id,
      description: s.serving_description, // "1 oz", "30 pieces", "1 cup"
      // Macronutrients we care about (FatSecret returns them as strings)
      calories:        toNum(s.calories),
      protein:         toNum(s.protein),
      carbs:           toNum(s.carbohydrate),
      fat:             toNum(s.fat),
      saturated_fat:   toNum(s.saturated_fat),
      sodium:          toNum(s.sodium),
      fiber:           toNum(s.fiber),
      sugar:           toNum(s.sugar),
      // Useful metadata
      metric_serving_amount: toNum(s.metric_serving_amount),
      metric_serving_unit:   s.metric_serving_unit,
      measurement_description: s.measurement_description,
      number_of_units:       toNum(s.number_of_units),
    })),
  };
}

function toNum(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

// ---- Handler ----------------------------------------------------------------

import { setCorsHeaders } from "../_cors.js";
import { rateLimit } from "../_ratelimit.js";

export default async function handler(req, res) {
  // CORS — locked to ALLOWED_ORIGIN env var (see api/_cors.js)
  setCorsHeaders(req, res, "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  if (!rateLimit(req, res, { name: "fatsecret", limit: 60, windowMs: 60000 })) return;

  const method = String(req.query.method || "").trim();

  try {
    if (method === "search") {
      const query = String(req.query.query || "").trim();
      if (!query) return res.status(400).json({ error: "Missing 'query' parameter" });
      const page = parseInt(req.query.page || "0", 10) || 0;
      const max = Math.min(parseInt(req.query.max || "10", 10) || 10, 20);
      const data = await callApi({
        method: "foods.search",
        search_expression: query,
        page_number: page,
        max_results: max,
      });
      return res.status(200).json({ results: normalizeSearchResults(data) });
    }

    if (method === "food") {
      const id = String(req.query.id || "").trim();
      if (!id) return res.status(400).json({ error: "Missing 'id' parameter" });
      const data = await callApi({
        method: "food.get.v2",
        food_id: id,
      });
      const food = normalizeFoodDetail(data);
      if (!food) return res.status(404).json({ error: "Food not found" });
      return res.status(200).json({ food });
    }

    return res.status(400).json({
      error: "Unknown 'method'. Use ?method=search&query=... or ?method=food&id=...",
    });
  } catch (err) {
    return res.status(500).json({
      error: "FatSecret request failed: " + String(err && err.message || err),
    });
  }
}
