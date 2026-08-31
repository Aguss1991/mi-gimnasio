const CACHE="mi-gimnasio-v5";
const CORE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",event=>event.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener("activate",event=>event.waitUntil(self.clients.claim()));
self.addEventListener("fetch",event=>{
  if(event.request.method!=="GET") return;
  event.respondWith(
    caches.match(event.request).then(cached=>cached || fetch(event.request).then(response=>{
      const copy=response.clone();
      caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{});
      return response;
    }).catch(()=>caches.match("./index.html")))
  );
});
