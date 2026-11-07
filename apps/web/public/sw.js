const V='v1',PAGES='pages-'+V,STATIC='static-'+V;
self.addEventListener('install',e=>e.waitUntil(caches.open(PAGES).then(c=>c.add('/offline')).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==PAGES&&x!==STATIC).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);
 if(r.method!=='GET'||u.origin!==location.origin||u.pathname.startsWith('/admin')||u.pathname.startsWith('/api'))return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(PAGES).then(x=>x.put(r,c))}return res})
  .catch(()=>caches.match(r).then(m=>m||caches.match('/offline'))));return}
 if(u.pathname.startsWith('/_next/static')||/\.(png|jpg|jpeg|svg|woff2?)$/.test(u.pathname))
  e.respondWith(caches.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(STATIC).then(x=>x.put(r,c))}return res})))});
