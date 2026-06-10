// Vercel serverless function — exchanges a Strava OAuth code for access + refresh tokens.
// The client_secret must NEVER appear in client-side code; that's why this runs server-side.
// Triggered by a POST from the frontend after Strava redirects back with ?code=...

import { setCorsHeaders } from "../_cors.js";

export default async function handler(req, res) {
  // CORS — locked to ALLOWED_ORIGIN env var (see api/_cors.js)
  setCorsHeaders(req, res, "POST, OPTIONS");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return res.status(500).json({
      error: "Server misconfigured: STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set as Vercel environment variables.",
    });
  }

  // Vercel's body parser may give us either an object or a string
  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const code = body.code;
  if (!code) {
    return res.status(400).json({ error: "Missing 'code' in request body" });
  }

  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        code: code,
        grant_type: "authorization_code",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    // Return only what the client needs (no client_secret leak)
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
      athlete: data.athlete ? { id: data.athlete.id, firstname: data.athlete.firstname, lastname: data.athlete.lastname } : null,
    });
  } catch (err) {
    return res.status(500).json({ error: "Token exchange failed: " + String(err && err.message || err) });
  }
}
