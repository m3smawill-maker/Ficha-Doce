// Service worker do Ficha Doce: guarda o app no aparelho para funcionar sem internet.
// Ao publicar uma versão nova do app, mude o número em CACHE (ex.: v2) para forçar a atualização.
const CACHE = 'ficha-doce-v1';
const ARQUIVOS = [
  './', 'index.html', 'manifest.webmanifest',
  'vendor/tailwind.js', 'vendor/chart.umd.js', 'vendor/fontawesome/css/all.min.css',
  'vendor/fontawesome/webfonts/fa-solid-900.woff2', 'vendor/fontawesome/webfonts/fa-brands-400.woff2',
  'vendor/fontawesome/webfonts/fa-regular-400.woff2',
  'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png', 'icons/apple-touch-icon.png'
];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(ARQUIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys()
      .then((ks) => Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Responde na hora com o que está guardado e atualiza a cópia em segundo plano.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;
  e.respondWith(
    caches.match(e.request, { ignoreSearch: true }).then((guardado) => {
      const rede = fetch(e.request)
        .then((r) => {
          if (r && r.ok) { const copia = r.clone(); caches.open(CACHE).then((c) => c.put(e.request, copia)); }
          return r;
        })
        .catch(() => guardado || caches.match('index.html'));
      return guardado || rede;
    })
  );
});
