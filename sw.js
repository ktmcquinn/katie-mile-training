// Katie's Mile Training - Service Worker
// Bump CACHE_VERSION whenever the HTML changes to force clients to get the new version.
const CACHE_VERSION = "v2.9.0";
const CACHE_NAME = `mile-training-${CACHE_VERSION}`;

// Files to pre-cache on install. Anything not in this list will be cached on first fetch.
const PRECACHE_URLS = [
  "./",
  "./Katie_Mile_Training_Calendar_Interactive.html",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon.png"
];

// On install: pre-cache the core app shell so it can boot offline.
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

// On activate: drop any old caches from previous versions.
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// On fetch: try cache first; fall back to network; cache new GETs.
// Cache-first works well for this app because the HTML and assets rarely change.
self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        // Only cache same-origin successful responses
        if (!res || res.status !== 200 || res.type !== "basic") return res;
        const copy = res.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        return res;
      }).catch(() => {
        // Offline fallback: return the main HTML for navigation requests
        if (req.mode === "navigate") {
          return caches.match("./Katie_Mile_Training_Calendar_Interactive.html");
        }
      });
    })
  );
});

// Allow the page to ask the SW to activate a fresh version immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
