const CACHE_NAME = "psy-vorbereitung-v3";

const APP_SHELL = [
  "./",
  "./PSY-Vorbereitung.html",
  "./manifest.webmanifest",
  "./assets/css/app.css",
  "./assets/js/core.js",
  "./assets/js/exercises.js",
  "./assets/js/scoring-models.js",
  "./assets/js/scoring-norms.js",
  "./assets/js/scoring-metrics.js",
  "./assets/js/app-copy.js",
  "./assets/js/scoring-interpretation.js",
  "./assets/js/scoring-engine.js",
  "./assets/js/scoring-ui.js",
  "./assets/js/analytics.js",
  "./assets/icons/icon-192.png",
  "./assets/icons/icon-512.png",
  "./assets/icons/apple-touch-icon-180.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") {
    return;
  }

  const requestUrl = new URL(event.request.url);
  if (requestUrl.origin !== self.location.origin) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== "basic") {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          return networkResponse;
        })
        .catch(() => caches.match("./PSY-Vorbereitung.html"));
    })
  );
});
