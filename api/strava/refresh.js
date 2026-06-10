// Vercel serverless function — uses refresh_token to get a new access_token when expired.
// Strava access tokens expire after 6 hours; refresh tokens are long-lived.

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
      error: "Server misconfigured: STRAVA_CLIENT_ID and STRAVA_CLIENT_SECRET must be set.",
    });
  }

  const body = typeof req.body === "string" ? JSON.parse(req.body || "{}") : (req.body || {});
  const refreshToken = body.refresh_token;
  if (!refreshToken) {
    return res.status(400).json({ error: "Missing 'refresh_token'" });
  }

  try {
    const response = await fetch("https://www.strava.com/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        client_id: clientId,
        client_secret: clientSecret,
        refresh_token: refreshToken,
        grant_type: "refresh_token",
      }),
    });
    const data = await response.json();
    if (!response.ok) {
      return res.status(response.status).json(data);
    }
    return res.status(200).json({
      access_token: data.access_token,
      refresh_token: data.refresh_token,
      expires_at: data.expires_at,
    });
  } catch (err) {
    return res.status(500).json({ error: "Refresh failed: " + String(err && err.message || err) });
  }
}
