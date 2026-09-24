const C='toppen-v3', T='toppen-terrein-v1', CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==C&&x!==T).map(x=>caches.delete(x)))));self.clients.claim();});
self.addEventListener('fetch',e=>{
  const req=e.request; if(req.method!=='GET')return;
  const url=new URL(req.url);
  // terreintegels veranderen nooit: eerst uit de cache, zo werkt het terrein ook offline op plekken die je al bekeek
  if(url.pathname.includes('/terrarium/')){
    e.respondWith(caches.open(T).then(c=>c.match(req,{ignoreVary:true}).then(hit=>hit||fetch(req).then(r=>{ if(r.ok) c.put(req,r.clone()); return r; }))));
    return;
  }
  // de app zelf: eerst het netwerk, zodat updates meteen doorkomen; offline uit de cache
  if(url.origin===location.origin){
    e.respondWith(fetch(req).then(r=>{ if(r.ok){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp));} return r; })
      .catch(()=>caches.match(req).then(hit=>hit||caches.match('index.html'))));
    return;
  }
  // lettertypes e.d.: cache, op de achtergrond vernieuwen
  e.respondWith(caches.match(req).then(hit=>{
    const net=fetch(req).then(r=>{ if(r&&(r.ok||r.type==='opaque')){const cp=r.clone();caches.open(C).then(c=>c.put(req,cp));} return r;}).catch(()=>hit);
    return hit||net;
  }));
});
