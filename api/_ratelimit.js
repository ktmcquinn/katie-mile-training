// Lightweight per-IP rate limiter for the serverless proxies.
//
// IMPORTANT: serverless instances are ephemeral and NOT shared, so each warm
// instance keeps its own counter. This is best-effort protection against a
// single client hammering an endpoint (notably the Anthropic-backed label
// proxy, which costs money) — not a global guarantee. For a hard, shared limit
// use a durable store (e.g. Upstash Redis) keyed the same way.

const buckets = new Map(); // key -> { start, count }

export function rateLimit(req, res, { limit = 30, windowMs = 60000, name = "default" } = {}) {
  const fwd = req.headers["x-forwarded-for"] || "";
  const ip = fwd.split(",")[0].trim() || (req.socket && req.socket.remoteAddress) || "unknown";
  const key = `${name}:${ip}`;
  const now = Date.now();

  let b = buckets.get(key);
  if (!b || now - b.start >= windowMs) { b = { start: now, count: 0 }; buckets.set(key, b); }
  b.count++;

  // Opportunistic cleanup so the map can't grow unbounded.
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (now - v.start >= windowMs) buckets.delete(k);
  }

  res.setHeader("X-RateLimit-Limit", String(limit));
  res.setHeader("X-RateLimit-Remaining", String(Math.max(0, limit - b.count)));

  if (b.count > limit) {
    res.setHeader("Retry-After", String(Math.ceil((b.start + windowMs - now) / 1000)));
    res.status(429).json({ error: "Rate limit exceeded — please slow down and try again shortly." });
    return false;
  }
  return true;
}
