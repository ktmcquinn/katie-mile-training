// Vercel serverless function — reads a photo of a nutrition label with a
// vision model (Claude) and returns structured nutrition JSON.
//
// Why server-side: the Anthropic API key must never appear in client code —
// same pattern as the Strava/FatSecret/USDA proxies.
//
// Request:  POST { image: "<base64 jpeg/png, no data: prefix>", mediaType: "image/jpeg" }
// Response: { name, brand, serving, basis, cal, protein_g, carbs_g, fat_g,
//             fiber_g, sodium_mg, confidence }
//   basis is "per_serving" | "per_100g" | "unknown" — EU labels are usually
//   per 100 g, US labels per serving. The client tells the user which it got.
//
// Env vars required (Vercel → Settings → Environment Variables):
//   ANTHROPIC_API_KEY — from https://console.anthropic.com
//   ANTHROPIC_MODEL   — optional override; defaults to Haiku (cheap + fast)

import { setCorsHeaders } from "../_cors.js";
import { rateLimit } from "../_ratelimit.js";

const DEFAULT_MODEL = "claude-haiku-4-5-20251001";

const PROMPT = `Read this photo of a food product's nutrition label. It may be in English, German, Danish, or another language (e.g. "Brennwert" = energy, "Eiweiß" = protein, "Kohlenhydrate" = carbs, "Fett" = fat, "Ballaststoffe" = fiber, "Salz" = salt).

Reply with ONLY a JSON object, no other text:
{
  "name": "<product name if visible, else a short description like 'pasta salad'>",
  "brand": "<brand if visible, else null>",
  "serving": "<serving size text if stated, e.g. '40 g', else null>",
  "basis": "per_serving" | "per_100g" | "unknown",
  "cal": <kcal as number>,
  "protein_g": <grams or null>,
  "carbs_g": <grams or null>,
  "fat_g": <grams or null>,
  "fiber_g": <grams or null>,
  "sodium_mg": <milligrams or null>,
  "confidence": <0.0-1.0, how readable/complete the label was>
}

Rules:
- Prefer the per-serving column when both per-100g and per-serving are shown; set basis accordingly.
- If the label lists salt (Salz) instead of sodium, convert: sodium_mg = salt_g / 2.5 * 1000.
- If energy is only in kJ, convert: kcal = kJ / 4.184.
- Use null for anything unreadable. Numbers must be plain numbers, not strings.`;

export default async function handler(req, res) {
  setCorsHeaders(req, res, "POST, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });
  // Tight cap — this endpoint calls Anthropic and costs money per request.
  if (!rateLimit(req, res, { name: "label", limit: 15, windowMs: 60000 })) return;

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({
      error: "Server misconfigured: set ANTHROPIC_API_KEY in Vercel environment variables (see SCAN_SETUP.md).",
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const image = body.image;
  const mediaType = body.mediaType || "image/jpeg";
  if (!image) return res.status(400).json({ error: "Missing 'image' (base64) in request body" });
  if (image.length > 5_000_000) return res.status(413).json({ error: "Image too large — resize before upload" });

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: process.env.ANTHROPIC_MODEL || DEFAULT_MODEL,
        max_tokens: 500,
        messages: [{
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: PROMPT },
          ],
        }],
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json({ error: (data.error && data.error.message) || "Vision API error" });
    }
    const text = (data.content || []).map((c) => c.text || "").join("");
    // Model replies with bare JSON; strip code fences defensively.
    const cleaned = text.replace(/^```(json)?/m, "").replace(/```\s*$/m, "").trim();
    const start = cleaned.indexOf("{"), end = cleaned.lastIndexOf("}");
    if (start === -1 || end === -1) {
      return res.status(502).json({ error: "Could not parse label — try a sharper, closer photo." });
    }
    const parsed = JSON.parse(cleaned.slice(start, end + 1));
    if (parsed.cal == null) {
      return res.status(422).json({ error: "No calorie value found on the label — try a closer photo of the nutrition table." });
    }
    return res.status(200).json(parsed);
  } catch (err) {
    return res.status(500).json({ error: "Label read failed: " + String((err && err.message) || err) });
  }
}
