// Service worker: cachet de volledige app-shell zodat de app na de eerste keer laden
// volledig offline werkt (belangrijk, want er is geen server/back-end).

const CACHE_NAAM = "perimenopauze-tracker-v1";

const APP_SHELL = [
  "./",
  "./index.html",
  "./manifest.json",
  "./css/style.css",
  "./js/symptoms-data.js",
  "./js/db.js",
  "./js/entry-view.js",
  "./js/history-view.js",
  "./js/export-xlsx.js",
  "./js/backup.js",
  "./js/app.js",
  "./vendor/chart.umd.min.js",
  "./vendor/xlsx.full.min.js",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/apple-touch-icon.png",
  "./icons/icon-maskable-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAAM)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(namen =>
      Promise.all(
        namen.filter(naam => naam !== CACHE_NAAM)
             .map(naam => caches.delete(naam))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request)
        .then(response => {
          const kopie = response.clone();
          caches.open(CACHE_NAAM).then(cache => cache.put(event.request, kopie));
          return response;
        })
        .catch(() => cached);
    })
  );
});
