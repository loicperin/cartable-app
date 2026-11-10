/* Service worker du lanceur du Cartable.
   Il rend l'application installable (Chrome et Edge l'exigent) et garde la page du lanceur
   en cache pour qu'elle s'affiche même sans réseau. Le Cartable lui-même vit sur claude.ai. */
const CACHE = 'cartable-lanceur-v1';
const FILES = ['./', './index.html', './manifest.webmanifest', './icons/cartable-192.png', './icons/cartable-512.png', './icons/cartable-32.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  // réseau d'abord (le lanceur reste à jour), cache si hors ligne
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
      return res;
    }).catch(() => caches.match(req, { ignoreSearch: true }).then((r) => r || caches.match('./index.html')))
  );
});
