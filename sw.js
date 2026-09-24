'use strict';
// Deliberately network-first: model revisions must not remain stuck in the old cache.
const CACHE='medtropic-ar-realistic-20260924-blender';
const CORE=['./','./index.html','./styles.css?v=20260924-blender','./app.js?v=20260924-blender','./model-viewer.min.js','./medtropic_showroom.glb','./medtropic-white.svg','./fairafric-white.svg','./enchi-white.svg','./icon-192.png','./icon-512.png','./hanken-grotesk-800.woff2','./manifest.webmanifest'];
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(CORE)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil((async()=>{
  const keys=await caches.keys();await Promise.all(keys.filter(k=>k.startsWith('medtropic-ar-realistic-')&&k!==CACHE).map(k=>caches.delete(k)));await self.clients.claim();
})()));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  event.respondWith((async()=>{
    const cache=await caches.open(CACHE);
    try{const response=await fetch(event.request);if(response.ok&&response.type==='basic')await cache.put(event.request,response.clone());return response;}
    catch(error){const hit=await cache.match(event.request);if(hit)return hit;throw error;}
  })());
});
