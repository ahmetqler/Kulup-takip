"use strict";
/* Minimal uygulama-kabuğu önbelleği. Sadece aşağıdaki sabit dosyaları
   cache-first olarak önbellekler; Firebase/Firestore/Auth/App Check/
   reCAPTCHA dahil BAŞKA HİÇBİR isteğe dokunmaz (canlı veri her zaman
   ağdan gelir). Yeni bir sürüm yayınlarken CACHE_NAME'i artırın —
   activate aşaması eski önbellekleri otomatik temizler. */
const CACHE_NAME = "kulup-takip-shell-v5";
const SHELL_FILES = [
  "./",
  "./index.html",
  "./app.js",
  "./firebaseConfig.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-180.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET" || new URL(req.url).origin !== self.location.origin) return;
  if (!SHELL_FILES.some((f) => req.url.endsWith(f.replace("./", "")))) return;

  event.respondWith(
    caches.match(req).then((cached) => cached || fetch(req))
  );
});
