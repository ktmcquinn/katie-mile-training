// Shared CORS helper for all serverless functions.
//
// Set ALLOWED_ORIGIN in Vercel → Settings → Environment Variables to your
// exact deployment URL (e.g. "https://katie-mile-training.vercel.app").
// If unset, the helper allows any *.vercel.app origin and localhost so that
// Vercel preview deployments and local dev still work.

export function setCorsHeaders(req, res, methods = "GET, OPTIONS") {
  const origin = req.headers.origin || "";
  const allowed = process.env.ALLOWED_ORIGIN;

  let allowedOrigin = null;
  if (allowed) {
    // Exact match against the configured production domain.
    if (origin === allowed) allowedOrigin = origin;
  } else {
    // Fallback: permit any *.vercel.app host and localhost.
    if (
      /^https?:\/\/localhost(:\d+)?$/.test(origin) ||
      /^https:\/\/[^/]+\.vercel\.app$/.test(origin)
    ) {
      allowedOrigin = origin;
    }
  }

  // If the origin isn't recognised we still set the header to the configured
  // value (or omit it) — the browser will block the request; we just don't
  // echo back an arbitrary origin.
  res.setHeader("Access-Control-Allow-Origin", allowedOrigin || (allowed || ""));
  res.setHeader("Access-Control-Allow-Methods", methods);
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (allowedOrigin) res.setHeader("Vary", "Origin");
}
