const CACHE = "mi-gimnasio-v6";
const CORE = ["./manifest.webmanifest","./icon-192.png","./icon-512.png"];

self.addEventListener("install", event => {
  self.skipWaiting();
  event.waitUntil(caches.open(CACHE).then(c => c.addAll(CORE)).catch(()=>{}));
});

self.addEventListener("activate", event => {
  event.waitUntil((async()=>{
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const req = event.request;
  const url = new URL(req.url);

  // Para páginas HTML/navegación: SIEMPRE intenta red primero para evitar versiones antiguas cacheadas.
  if (req.mode === "navigate" || req.destination === "document") {
    event.respondWith((async()=>{
      try {
        const fresh = await fetch(req, {cache:"no-store"});
        const cache = await caches.open(CACHE);
        cache.put("./index.html", fresh.clone()).catch(()=>{});
        return fresh;
      } catch(e) {
        return (await caches.match("./index.html")) || Response.error();
      }
    })());
    return;
  }

  // Recursos estáticos: caché primero, red después.
  event.respondWith(caches.match(req).then(cached => cached || fetch(req).then(res => {
    const copy = res.clone();
    caches.open(CACHE).then(c => c.put(req, copy)).catch(()=>{});
    return res;
  })));
});
