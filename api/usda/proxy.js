// Vercel serverless function — server-side proxy for the USDA FoodData
// Central API.
//
// Why this exists (vs calling USDA directly from the browser):
//   The USDA API key isn't actually a "secret" the way FatSecret's is — it's
//   a public-ish access token. But going through a proxy lets us:
//     (a) keep the key out of git / client source,
//     (b) normalize USDA's verbose response shape into something the Fuel
//         tab can render without knowing about USDA-specific fields,
//     (c) match the same request shape the FatSecret proxy uses, so the
//         frontend swap is just a URL change.
//
// Routes (all GET ?method=...):
//   ?method=search&query=goldfish&max=10          → /foods/search
//   ?method=food&id=2342765                       → /food/{fdcId}
//
// Env vars required (set in Vercel → Settings → Environment Variables):
//   USDA_API_KEY    — free key from https://fdc.nal.usda.gov/api-key-signup
//
// No IP whitelisting needed. Standard rate limit is 1,000 req/hr per key,
// way more than personal logging needs.

const API_BASE = "https://api.nal.usda.gov/fdc/v1";

// USDA assigns each nutrient a stable numeric ID. These are the ones we
// care about. Source: https://fdc.nal.usda.gov/docs/USDA_Branded_Food_Products_Database_Documentation.pdf
const NUTRIENT_IDS = {
  CALORIES:      1008, // Energy (kcal)
  PROTEIN:       1003, // Protein
  FAT:           1004, // Total lipid (fat)
  CARBS:         1005, // Carbohydrate, by difference
  FIBER:         1079, // Fiber, total dietary
  SUGAR:         2000, // Sugars, total
  SODIUM:        1093, // Sodium, Na (mg)
  SATURATED_FAT: 1258, // Fatty acids, total saturated
};

// USDA returns nutrient values in a few different containers depending on the
// food's dataType. This helper finds the value for a given nutrient ID across
// the possible shapes.
function findNutrient(food, nutrientId) {
  const list = food.foodNutrients || [];
  for (const n of list) {
    // SR Legacy / Foundation / Survey style: { nutrient: { id, name }, amount }
    if (n.nutrient && n.nutrient.id === nutrientId) {
      return toNum(n.amount);
    }
    // Branded sometimes flattens: { nutrientId, value }
    if (n.nutrientId === nutrientId) {
      return toNum(n.value);
    }
    // Older shape: { nutrientNumber, value }
    if (n.nutrientNumber && parseInt(n.nutrientNumber, 10) === nutrientId) {
      return toNum(n.value);
    }
  }
  return null;
}

function toNum(v) {
  if (v == null || v === "") return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
}

// Build a one-line nutrition teaser for the search dropdown — mirrors how
// FatSecret's food_description used to look, e.g. "Per 30 g: 140 cal | 5g
// fat | 19g carbs | 3g protein". For branded foods we use the declared
// serving; for others we say "Per 100 g".
function buildDescription(food) {
  const cal     = findNutrient(food, NUTRIENT_IDS.CALORIES);
  const fat     = findNutrient(food, NUTRIENT_IDS.FAT);
  const carbs   = findNutrient(food, NUTRIENT_IDS.CARBS);
  const protein = findNutrient(food, NUTRIENT_IDS.PROTEIN);
  const serv = food.servingSize && food.servingSizeUnit
    ? `${food.servingSize}${food.servingSizeUnit}`
    : "100 g";
  if (cal == null && fat == null && carbs == null && protein == null) return "";
  const bits = [];
  if (cal != null)     bits.push(`${Math.round(cal)} cal`);
  if (fat != null)     bits.push(`${fmt(fat)}g fat`);
  if (carbs != null)   bits.push(`${fmt(carbs)}g carbs`);
  if (protein != null) bits.push(`${fmt(protein)}g protein`);
  return `Per ${serv}: ${bits.join(" | ")}`;
}

function fmt(n) {
  if (n == null) return "—";
  return n < 10 ? n.toFixed(1) : String(Math.round(n));
}

// ---- Response normalizers ---------------------------------------------------
// Match the shape the frontend already expects — see api/fatsecret/proxy.js
// for the original schema.

function normalizeSearchResults(raw) {
  const foods = raw && raw.foods;
  if (!Array.isArray(foods)) return [];
  return foods.map((f) => ({
    food_id: String(f.fdcId),
    name: f.description,
    brand: f.brandOwner || f.brandName || null,
    // USDA dataType values: "Branded", "Foundation", "Survey (FNDDS)", "SR Legacy"
    type: f.dataType,
    description: buildDescription(f),
  }));
}

// Build the array of selectable servings for a USDA food. Strategy:
//   1. Branded foods: include the declared label serving as the primary
//      option. Pull nutrients from `labelNutrients` (already per-serving)
//      OR from foodNutrients scaled by servingSize / 100. Plus a "100 g"
//      fallback so the user can measure in grams if they prefer.
//   2. Non-branded foods (Foundation, SR Legacy, Survey): start with "100 g"
//      as the base, then add any entries from `foodPortions` (USDA's
//      household-measure list — "1 cup", "1 piece", etc.) with their
//      gram weights scaled from the 100 g baseline.
function buildServings(food) {
  const servings = [];

  const isBranded = food.dataType === "Branded";

  // Nutrients per-100g — we'll use this as the baseline for scaling.
  const per100 = {
    calories:      findNutrient(food, NUTRIENT_IDS.CALORIES),
    protein:       findNutrient(food, NUTRIENT_IDS.PROTEIN),
    carbs:         findNutrient(food, NUTRIENT_IDS.CARBS),
    fat:           findNutrient(food, NUTRIENT_IDS.FAT),
    fiber:         findNutrient(food, NUTRIENT_IDS.FIBER),
    sugar:         findNutrient(food, NUTRIENT_IDS.SUGAR),
    sodium:        findNutrient(food, NUTRIENT_IDS.SODIUM),
    saturated_fat: findNutrient(food, NUTRIENT_IDS.SATURATED_FAT),
  };

  if (isBranded) {
    // Branded foods report nutrients per 100g BUT also include a declared
    // serving (servingSize + servingSizeUnit). We add that as serving #1.
    if (food.servingSize && food.servingSizeUnit) {
      const factor = food.servingSize / 100; // grams of serving / 100
      const desc = food.householdServingFullText
        || `${food.servingSize} ${food.servingSizeUnit}`;
      // If labelNutrients exists, prefer those values (what's actually
      // printed on the Nutrition Facts panel). Otherwise scale from per-100g.
      const ln = food.labelNutrients || {};
      const get = (key, fallback) => {
        if (ln[key] && ln[key].value != null) return toNum(ln[key].value);
        return fallback == null ? null : fallback * factor;
      };
      servings.push({
        serving_id: "label",
        description: desc,
        calories:      get("calories",     per100.calories),
        protein:       get("protein",      per100.protein),
        carbs:         get("carbohydrates", per100.carbs),
        fat:           get("fat",          per100.fat),
        fiber:         get("fiber",        per100.fiber),
        sugar:         get("sugars",       per100.sugar),
        sodium:        get("sodium",       per100.sodium),
        saturated_fat: get("saturatedFat", per100.saturated_fat),
      });
    }
    // Always include a "100 g" option for branded foods too — useful if the
    // user weighs portions on a kitchen scale.
    servings.push(servingFromBase("100 g", 1, per100, "100g"));
  } else {
    // Foundation / SR Legacy / Survey: per-100g is the canonical form.
    servings.push(servingFromBase("100 g", 1, per100, "100g"));
    // Add any household portions USDA provides (e.g., "1 cup, chopped").
    const portions = food.foodPortions || [];
    for (const p of portions) {
      const grams = toNum(p.gramWeight);
      if (!grams) continue;
      const factor = grams / 100;
      // USDA portion descriptions are often split across two fields
      // (modifier + measureUnit.name). Build a readable string.
      const desc = (p.portionDescription
        || [p.amount, p.measureUnit && p.measureUnit.name, p.modifier]
            .filter(Boolean).join(" ").trim())
        || `${grams} g portion`;
      servings.push(servingFromBase(desc, factor, per100, `p${p.id || servings.length}`));
    }
  }

  // Filter out servings where calories couldn't be computed — they'd be
  // useless to log against.
  return servings.filter((s) => s.calories != null);
}

function servingFromBase(description, factor, per100, id) {
  const scale = (v) => v == null ? null : v * factor;
  return {
    serving_id: id,
    description,
    calories:      scale(per100.calories),
    protein:       scale(per100.protein),
    carbs:         scale(per100.carbs),
    fat:           scale(per100.fat),
    fiber:         scale(per100.fiber),
    sugar:         scale(per100.sugar),
    sodium:        scale(per100.sodium),
    saturated_fat: scale(per100.saturated_fat),
  };
}

function normalizeFoodDetail(raw) {
  if (!raw || !raw.fdcId) return null;
  return {
    food_id: String(raw.fdcId),
    name: raw.description,
    brand: raw.brandOwner || raw.brandName || null,
    type: raw.dataType,
    servings: buildServings(raw),
  };
}

// ---- Handler ----------------------------------------------------------------

import { setCorsHeaders } from "../_cors.js";

export default async function handler(req, res) {
  // CORS — locked to ALLOWED_ORIGIN env var (see api/_cors.js)
  setCorsHeaders(req, res, "GET, OPTIONS");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const apiKey = process.env.USDA_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfigured: USDA_API_KEY must be set as a Vercel environment variable.",
    });
  }

  const method = String(req.query.method || "").trim();

  try {
    if (method === "search") {
      const query = String(req.query.query || "").trim();
      if (!query) return res.status(400).json({ error: "Missing 'query' parameter" });
      const max = Math.min(parseInt(req.query.max || "10", 10) || 10, 25);
      const url = new URL(`${API_BASE}/foods/search`);
      url.searchParams.set("api_key", apiKey);
      url.searchParams.set("query", query);
      url.searchParams.set("pageSize", String(max));
      // Note: previously passed dataType=Branded,Foundation,SR Legacy,Survey
      // (FNDDS) but the parens + space in "Survey (FNDDS)" can break url
      // parsing in api.data.gov's gateway layer. Leaving it off pulls from
      // all types — slightly more noise in results, but a working request.
      const data = await usdaFetch(url);
      return res.status(200).json({ results: normalizeSearchResults(data) });
    }

    if (method === "food") {
      const id = String(req.query.id || "").trim();
      if (!id) return res.status(400).json({ error: "Missing 'id' parameter" });
      const url = new URL(`${API_BASE}/food/${encodeURIComponent(id)}`);
      url.searchParams.set("api_key", apiKey);
      const data = await usdaFetch(url);
      const food = normalizeFoodDetail(data);
      if (!food) return res.status(404).json({ error: "Food not found" });
      return res.status(200).json({ food });
    }

    return res.status(400).json({
      error: "Unknown 'method'. Use ?method=search&query=... or ?method=food&id=...",
    });
  } catch (err) {
    return res.status(500).json({
      error: "USDA request failed: " + String(err && err.message || err),
    });
  }
}

// Fetch helper with proper error surfacing — captures the raw response body
// so HTML error pages from the api.data.gov gateway (which proxies the USDA
// FDC API) show up in the client error message instead of a cryptic "not
// valid JSON" parse error.
async function usdaFetch(url) {
  const response = await fetch(url.toString(), {
    headers: { "Accept": "application/json" },
  });
  const text = await response.text();
  // Try to parse as JSON regardless of status code — both successful
  // responses and api.data.gov errors typically come back as JSON.
  let data;
  try {
    data = JSON.parse(text);
  } catch (e) {
    // Non-JSON (usually HTML from an upstream gateway error). Surface the
    // first ~250 chars so we can see what actually came back.
    const snippet = text.slice(0, 250).replace(/\s+/g, " ").trim();
    throw new Error(
      `USDA returned non-JSON (HTTP ${response.status}). First bytes: ${snippet}`,
    );
  }
  if (!response.ok) {
    // api.data.gov error shape: { error: { code, message } }
    // USDA error shape:         { error: "..."}  or  { code, message }
    let msg;
    if (data && data.error && typeof data.error === "object") {
      msg = `${data.error.code || response.status}: ${data.error.message || JSON.stringify(data.error)}`;
    } else if (data && data.error) {
      msg = String(data.error);
    } else if (data && data.message) {
      msg = `${data.code || response.status}: ${data.message}`;
    } else {
      msg = JSON.stringify(data);
    }
    throw new Error(`USDA error (HTTP ${response.status}): ${msg}`);
  }
  return data;
}
