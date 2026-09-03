const CACHE='jogos-v20';
const ARQS=['./','./index.html','./matematica.html','./portugues.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ARQS)));self.skipWaiting();});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim();});
/* paginas (HTML): tenta a rede primeiro para pegar jogos novos ja na 1a abertura;
   sem internet, usa o cache. Demais arquivos: cache primeiro. */
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const ehPagina = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(ehPagina){
    e.respondWith(
      fetch(req).then(r=>{
        const copia=r.clone();
        caches.open(CACHE).then(c=>c.put(req,copia)).catch(()=>{});
        return r;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
    return;
  }
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
