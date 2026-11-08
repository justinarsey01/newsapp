const V='v2',PAGES='pages-'+V,STATIC='static-'+V,IMG='img-'+V,KEEP=[PAGES,STATIC,IMG];
const put=(n,r,res)=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(n).then(async c=>{await c.put(r,cp);
 if(n===IMG){const k=await c.keys();if(k.length>250)await c.delete(k[0])}})}return res};
const first=(r,n)=>caches.match(r).then(m=>m||fetch(r).then(res=>put(n,r,res)));
self.addEventListener('install',e=>e.waitUntil(caches.open(PAGES).then(c=>c.add('/offline')).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>!KEEP.includes(x)).map(x=>caches.delete(x)))).then(()=>clients.claim())));
self.addEventListener('fetch',e=>{const r=e.request,u=new URL(r.url);if(r.method!=='GET')return;
 if(u.origin!==location.origin){if(r.destination==='image'&&u.hostname.endsWith('.supabase.co'))e.respondWith(first(r,IMG));return}
 if(u.pathname.startsWith('/admin')||u.pathname.startsWith('/api'))return;
 if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>put(PAGES,r,res)).catch(()=>caches.match(r).then(m=>m||caches.match('/offline'))));return}
 if(u.pathname.startsWith('/_next/static')||/\.(png|jpg|jpeg|svg|woff2?)$/.test(u.pathname))e.respondWith(first(r,STATIC))});
self.addEventListener('message',e=>{const d=e.data;if(!d||d.type!=='precache')return;
 e.waitUntil(Promise.all(d.urls.slice(0,150).map(async s=>{try{const x=new URL(s,location.origin);
  if(x.origin===location.origin)put(PAGES,x.href,await fetch(x.href));
  else if(x.hostname.endsWith('.supabase.co'))put(IMG,x.href,await fetch(x.href,{mode:'no-cors'}))}catch(_){}})))});
