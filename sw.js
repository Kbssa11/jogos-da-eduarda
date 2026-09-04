const CACHE='jogos-v23';
const ARQS=['./','./index.html','./matematica.html','./portugues.html','./ciencias.html','./manifest.json','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(CACHE).then(c=>Promise.all(
    ARQS.map(u=>fetch(u,{cache:'no-store'}).then(r=>r.ok?c.put(u,r):null).catch(()=>null))
  )));
  self.skipWaiting();});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))));
  self.clients.claim();});
/* Paginas (HTML): busca na rede ignorando cache do navegador, para que um jogo novo
   apareca ja na 1a abertura. Sem internet, usa a copia guardada.
   Outros arquivos (icones, manifest): cache primeiro. */
self.addEventListener('fetch',e=>{
  const req=e.request;
  if(req.method!=='GET')return;
  const ehPagina = req.mode==='navigate' || (req.headers.get('accept')||'').includes('text/html');
  if(ehPagina){
    e.respondWith(
      fetch(req,{cache:'no-store'}).catch(()=>fetch(req)).then(r=>{
        if(r&&r.ok){const copia=r.clone();caches.open(CACHE).then(c=>c.put(req,copia)).catch(()=>{});}
        return r;
      }).catch(()=>caches.match(req).then(r=>r||caches.match('./index.html')))
    );
    return;}
  e.respondWith(caches.match(req).then(r=>r||fetch(req)));
});
