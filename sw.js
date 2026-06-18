// The Dresden Half - Service Worker
//
// Strategy:
//   - App code (HTML, JS, CSS, manifest): STALE-WHILE-REVALIDATE. Serve the
//     cached copy instantly (fast launches, works offline), and refresh the
//     cache from the network in the background so the next launch is current.
//     The page's update banner (SKIP_WAITING) still lets the user jump to a
//     fresh version immediately when one is installed.
//   - Static assets (icons, images): CACHE-FIRST. They never change without
//     also renaming, so cache hits are always safe and fast.
//
// CACHE_VERSION only needs bumping if you want to force-purge old caches
// (e.g. after renaming/removing files), not on every content change.
const CACHE_VERSION = "v6.0.0";
const CACHE_NAME = `mile-training-${CACHE_VERSION}`;

// Files to pre-cache on install so the app can boot offline immediately.
const PRECACHE_URLS = [
  "./",
  "./index.html",
  "./Katie_Mile_Training_Calendar_Interactive.html",
  "./styles.css",
  "./app.js",
  "./plan.js",
  "./lib/training-math.js",
  "./lib/format.js",
  "./manifest.json",
  "./icon-192.png",
  "./icon-512.png",
  "./icon-192-maskable.png",
  "./icon-512-maskable.png",
  "./apple-touch-icon.png",
  "./favicon.png"
];

// On install: pre-cache the core app shell.
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

// True for requests that should be served network-first (the app's own code).
function isAppCode(req) {
  if (req.mode === "navigate") return true;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return false;
  return /\.(html|js|css)$/.test(url.pathname) || url.pathname.endsWith("manifest.json");
}

function cachePut(req, res) {
  // Only cache same-origin successful responses
  if (!res || res.status !== 200 || res.type !== "basic") return res;
  const copy = res.clone();
  caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
  return res;
}

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;

  if (isAppCode(req)) {
    // Stale-while-revalidate: serve cache immediately, refresh it in the
    // background. Falls back to network (then the main HTML for navigations)
    // when there's no cached copy yet.
    event.respondWith(
      caches.match(req).then((cached) => {
        const network = fetch(req)
          .then((res) => cachePut(req, res))
          .catch(() => {
            if (!cached && req.mode === "navigate") {
              return caches.match("./index.html");
            }
            return cached;
          });
        // Cached copy now (fast), network refresh in the background.
        return cached || network;
      })
    );
    return;
  }

  // Everything else: cache-first, populate cache on first fetch.
  event.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => cachePut(req, res));
    })
  );
});

// Allow the page to ask the SW to activate a fresh version immediately.
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
