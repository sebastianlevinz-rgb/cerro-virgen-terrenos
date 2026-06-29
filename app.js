/* ===========================================================================
   app.js  ·  toda la logica (render + interaccion). JS vanilla.
   Lee de DATA (data.js). No toca localStorage.
   Modelo de 3 niveles del corredor Acceso Norte:
     A = cerro crudo · B = El Portico · C = La Lucinda · X = contraste (Valle Escondido)
   =========================================================================== */
'use strict';

const C = DATA.comparables;
const COSTOS = DATA.costos;
const DOLAR = DATA.dolar.valor;

/* config de niveles: color (mapa/grafico), etiqueta */
const NIVELES = {
  A: { color:'#B4502E', label:'A · Cerro crudo' },
  B: { color:'#C98A2B', label:'B · El Portico' },
  C: { color:'#4F6B4A', label:'C · La Lucinda' },
  X: { color:'#7A6A55', label:'Contraste (Valle Escondido)' },
};
function nivelColor(n){ return (NIVELES[n] || NIVELES.X).color; }

/* numero de marcador estable (posicion en el dataset, no cambia al ordenar) */
const NUM = {};
C.forEach((c, i) => { NUM[c.id] = i + 1; });

/* ----------  helpers de formato  ---------- */
const nf = new Intl.NumberFormat('es-AR');
function fUSD(n){ return n == null ? 's/d' : 'US$ ' + nf.format(Math.round(n)); }
function fARS(n){ return n == null ? 's/d' : '$ ' + nf.format(Math.round(n)); }
function usdM2(c){ return (c.usd == null || !c.m2) ? null : c.usd / c.m2; }

/* ----------  scoring  ---------- */
function valueScore(um2){
  if (um2 == null) return null;
  const s = (60 - um2) / (60 - 5) * 100;   // 5 USD/m2 -> 100 ; 60 -> 0
  return Math.max(0, Math.min(100, s));
}
function buildScore(c){
  let s = 100;
  s += ({ red:0, cerca:-10, no:-25 }[c.luz] ?? -15);
  s += ({ red:0, pozo:-18, no:-30 }[c.agua] ?? -15);
  s += ({ natural:0, envasado:-5, no:-8 }[c.gas] ?? -5);
  s += ({ plano:0, suave:-10, fuerte:-25 }[c.pendiente] ?? -10);
  s += ({ asfalto:0, ripio:-12 }[c.acceso] ?? -8);
  s += (c.cloaca === true ? 2 : c.cloaca === false ? -3 : -3);
  return Math.max(0, Math.min(100, s));
}
function titleScore(c){ return ({ escritura:100, boleto:50, posesion:25 }[c.titulo]) ?? 40; }
let WEIGHTS = { value: 40, build: 35, title: 25 };
function overallScore(c){
  const v = valueScore(usdM2(c)), b = buildScore(c), t = titleScore(c);
  let parts = [];
  if (v != null) parts.push([v, WEIGHTS.value]);
  parts.push([b, WEIGHTS.build], [t, WEIGHTS.title]);
  const wsum = parts.reduce((a, p) => a + p[1], 0) || 1;
  const score = parts.reduce((a, p) => a + p[0] * p[1], 0) / wsum;
  return { score: Math.round(score), v: v == null ? null : Math.round(v), b: Math.round(b), t: Math.round(t) };
}

/* ----------  etiquetas de servicio  ---------- */
function lblAgua(v){ return v==='red'?['red','text-cerro font-semibold']:v==='pozo'?['pozo','text-terracota']:v==='no'?['no','text-tinta/40']:['s/d','text-tinta/40']; }
function lblLuz(v){ return v==='red'?['si','text-cerro font-bold']:v==='cerca'?['cerca','text-ocre']:v==='no'?['no','text-terracota']:['s/d','text-tinta/40']; }
function lblGas(v){ return v==='natural'?['red','text-cerro font-semibold']:v==='envasado'?['env.','text-ocre']:v==='no'?['no','text-tinta/40']:['s/d','text-tinta/40']; }
function lblCloaca(v){ return v===true?['si','text-cerro font-bold']:v===false?['no','text-terracota font-semibold']:['s/d','text-tinta/40']; }
function lblPend(v){ return v==='plano'?['plano','text-cerro']:v==='suave'?['suave','text-ocre']:v==='fuerte'?['fuerte','text-terracota']:['s/d','text-tinta/40']; }
function chip([txt, cls]){ return `<span class="${cls}">${txt}</span>`; }
function badgeNivel(n){
  const cl = { A:'bg-terracota/15 text-terraDark', B:'bg-ocre/20 text-ocre', C:'bg-cerro/15 text-cerroDark', X:'bg-tinta/10 text-tinta/60' }[n] || 'bg-hueso2';
  return `<span class="text-[11px] font-bold rounded px-1.5 py-0.5 ${cl}">${n}</span>`;
}
function badgeTitulo(t){
  const m = { escritura:['Escritura','bg-cerro/15 text-cerroDark'], boleto:['Boleto','bg-terracota/15 text-terraDark'], posesion:['Posesion','bg-terracota/15 text-terraDark'] };
  const [txt, cls] = m[t] || ['s/d','bg-hueso2 text-tinta/50'];
  return `<span class="text-[11px] font-semibold rounded px-1.5 py-0.5 ${cls}">${txt}</span>`;
}

/* ===========================  ESTADO  =========================== */
let sortKey = 'usdm2', sortDir = 1;
let activeFilters = new Set();
let shortlist = new Set();
const GRUPOS = { nivel:['nivel-A','nivel-B','nivel-C','nivel-X'], titulo:['escritura','posesion'], cloaca:['cloaca-si','cloaca-no'] };

function decorate(c){
  const um2 = usdM2(c);
  return { ...c, usdm2: um2, ars: um2 == null ? null : um2 * DOLAR, score: overallScore(c).score, _sc: overallScore(c) };
}
function getRows(){
  let rows = C.map(decorate);
  ['A','B','C','X'].forEach(n => { if (activeFilters.has('nivel-'+n)) rows = rows.filter(r => r.nivel===n); });
  if (activeFilters.has('escritura')) rows = rows.filter(r => r.titulo==='escritura');
  if (activeFilters.has('posesion'))  rows = rows.filter(r => r.titulo==='posesion' || r.titulo==='boleto');
  if (activeFilters.has('cloaca-si')) rows = rows.filter(r => r.cloaca===true);
  if (activeFilters.has('cloaca-no')) rows = rows.filter(r => r.cloaca===false);
  rows.sort((a, b) => {
    let va = a[sortKey], vb = b[sortKey];
    if (va == null && vb == null) return 0;
    if (va == null) return 1;
    if (vb == null) return -1;
    if (typeof va === 'string') return va.localeCompare(vb) * sortDir;
    return (va - vb) * sortDir;
  });
  const obj = rows.filter(r => r.objetivo), resto = rows.filter(r => !r.objetivo);
  return [...obj, ...resto];
}

/* ===========================  TABLA  =========================== */
function renderTabla(){
  const body = document.getElementById('tabla-body');
  const rows = getRows();
  if (!rows.length){ body.innerHTML = '<tr><td colspan="15" class="text-center text-tinta/50 py-6">Sin resultados con estos filtros.</td></tr>'; return; }
  body.innerHTML = rows.map(c => {
    const estim = c.esEstimacion ? '<span class="ml-1 inline-block bg-ocreLight/40 text-terraDark font-semibold rounded px-1.5 py-0.5 text-[10px] align-middle">estimacion</span>' : '';
    const link = c.url ? `<a href="${c.url}" target="_blank" rel="noopener" class="text-terracota hover:text-terraDark underline">ver</a>` : '<span class="text-tinta/30">s/d</span>';
    const rowBg = c.objetivo ? 'bg-ocreLight/25' : (c.nivel==='X' ? 'bg-tinta/[0.04]' : '');
    const usdTxt = c.usd==null ? '<span class="text-tinta/40 italic">a consultar</span>' : '$'+nf.format(c.usd);
    const um2Txt = c.usdm2==null ? '<span class="text-tinta/40">s/d</span>' : nf.format(Math.round(c.usdm2));
    const arsTxt = c.ars==null ? '<span class="text-tinta/40">s/d</span>' : nf.format(Math.round(c.ars/1000)) + 'k';
    const sc = c._sc;
    const checked = shortlist.has(c.id) ? 'checked' : '';
    return `<tr data-id="${c.id}" class="comp-row border-t border-hueso2 ${rowBg} hover:bg-hueso/60">
      <td class="px-2 py-2.5 text-center no-print"><input type="checkbox" class="sl-check w-4 h-4" data-id="${c.id}" ${checked}></td>
      <td class="px-2 py-2.5 text-center text-tinta/50 font-semibold">${NUM[c.id]}</td>
      <td class="px-2 py-2.5 text-center">${badgeNivel(c.nivel)}</td>
      <td class="px-3 py-2.5">
        <div class="font-medium leading-tight ${c.objetivo?'text-terraDark':''}">${c.objetivo?'&#9733; ':''}${c.zona}${estim}</div>
        <div class="text-[11px] text-tinta/50">${c.fuente} · ${c.fecha}</div>
      </td>
      <td class="px-3 py-2.5 text-right tabular-nums">${nf.format(c.m2)}</td>
      <td class="px-3 py-2.5 text-right tabular-nums">${usdTxt}</td>
      <td class="px-3 py-2.5 text-right tabular-nums font-bold text-terracota">${um2Txt}</td>
      <td class="px-3 py-2.5 text-right tabular-nums text-tinta/60">${arsTxt}</td>
      <td class="px-2 py-2.5 text-center">${chip(lblAgua(c.agua))}</td>
      <td class="px-2 py-2.5 text-center">${chip(lblLuz(c.luz))}</td>
      <td class="px-2 py-2.5 text-center">${chip(lblGas(c.gas))}</td>
      <td class="px-2 py-2.5 text-center">${chip(lblCloaca(c.cloaca))}</td>
      <td class="px-3 py-2.5">${badgeTitulo(c.titulo)}</td>
      <td class="px-3 py-2.5 w-[120px]">
        <div class="flex items-center gap-2">
          <span class="font-bold text-cerroDark tabular-nums w-7">${sc.score}</span>
          <div class="flex-1 space-y-0.5" title="valor ${sc.v==null?'s/d':sc.v} · desarrollo ${sc.b} · titulo ${sc.t}">
            <div class="scorebar"><span style="width:${sc.v==null?0:sc.v}%;background:#B4502E"></span></div>
            <div class="scorebar"><span style="width:${sc.b}%;background:#C98A2B"></span></div>
            <div class="scorebar"><span style="width:${sc.t}%;background:#4F6B4A"></span></div>
          </div>
        </div>
      </td>
      <td class="px-3 py-2.5 text-center no-print">${link}</td>
    </tr>`;
  }).join('');

  body.querySelectorAll('.sl-check').forEach(ch => ch.addEventListener('change', e => {
    const id = e.target.dataset.id;
    if (e.target.checked){ if (shortlist.size >= 3){ e.target.checked = false; return; } shortlist.add(id); }
    else shortlist.delete(id);
    renderComparar();
  }));
  body.querySelectorAll('.comp-row').forEach(tr => tr.addEventListener('click', e => {
    if (e.target.closest('input,a')) return;
    focusPin(tr.dataset.id);
  }));
}

/* ----------  sort / filtros / pesos  ---------- */
function wireSort(){
  document.querySelectorAll('th.sortable').forEach(th => th.addEventListener('click', () => {
    const k = th.dataset.key;
    if (sortKey === k) sortDir *= -1; else { sortKey = k; sortDir = (k==='score') ? -1 : 1; }
    document.querySelectorAll('th.sortable').forEach(t => t.classList.remove('sort-active'));
    th.classList.add('sort-active');
    renderTabla();
  }));
}
function wireFiltros(){
  document.querySelectorAll('.filtro-btn').forEach(btn => btn.addEventListener('click', () => {
    const f = btn.dataset.filter;
    if (f === 'all') activeFilters.clear();
    else {
      const g = Object.keys(GRUPOS).find(k => GRUPOS[k].includes(f));
      if (activeFilters.has(f)) activeFilters.delete(f);
      else { GRUPOS[g].forEach(o => activeFilters.delete(o)); activeFilters.add(f); }
    }
    document.querySelectorAll('.filtro-btn').forEach(b => {
      const bf = b.dataset.filter;
      const on = bf === 'all' ? activeFilters.size === 0 : activeFilters.has(bf);
      b.classList.remove('bg-cerro','bg-terracota','bg-ocre','text-white');
      if (on){
        b.classList.add('text-white');
        if (bf === 'all' || bf.startsWith('nivel')) b.classList.add('bg-cerro');
        else if (['escritura','posesion'].includes(bf)) b.classList.add('bg-terracota');
        else b.classList.add('bg-ocre');
      }
    });
    renderTabla();
  }));
}
function wirePesos(){
  const ids = ['value','build','title'];
  ids.forEach(k => {
    const inp = document.getElementById('w-'+k);
    inp.addEventListener('input', () => {
      WEIGHTS[k] = +inp.value;
      ids.forEach(j => { document.getElementById('w-'+j+'-val').textContent = document.getElementById('w-'+j).value + '%'; });
      renderTabla(); renderComparar();
    });
  });
}

/* ===========================  KPIs + BANDAS  =========================== */
function median(arr){ if(!arr.length) return null; const s=[...arr].sort((a,b)=>a-b); const m=Math.floor(s.length/2); return s.length%2?s[m]:(s[m-1]+s[m])/2; }
function renderKpis(){
  const conPrecio = C.filter(c => usdM2(c)!=null);
  const lucinda = C.filter(c => c.nivel==='C').map(usdM2).filter(x=>x!=null);
  const portico = C.filter(c => c.nivel==='B').map(usdM2).filter(x=>x!=null);
  const kpis = [
    { n: C.length, l: 'comparables' },
    { n: conPrecio.length, l: 'con precio publicado' },
    { n: median(lucinda)==null?'s/d':nf.format(Math.round(median(lucinda))), l: 'USD/m2 mediana La Lucinda' },
    { n: median(portico)==null?'s/d':nf.format(Math.round(median(portico))), l: 'USD/m2 mediana El Portico' },
  ];
  document.getElementById('kpis').innerHTML = kpis.map(k =>
    `<div class="bg-white rounded-xl border border-hueso2 p-4 shadow-sm">
       <div class="font-serif text-3xl font-black text-terracota">${k.n}</div>
       <div class="text-xs text-tinta/60 mt-1">${k.l}</div>
     </div>`).join('');
}
function renderBandas(){
  document.getElementById('bandas').innerHTML = DATA.bandas.map(b => {
    const arsMin = nf.format(Math.round(b.min*DOLAR/1000)), arsMax = nf.format(Math.round(b.max*DOLAR/1000));
    const col = nivelColor(b.nivel);
    return `<div class="bg-white rounded-2xl border shadow-sm p-5 flex flex-col" style="border-color:${col}55;border-top:4px solid ${col}">
      <div class="flex items-center gap-2 mb-1">
        <span class="text-xs font-bold rounded px-1.5 py-0.5" style="background:${col}22;color:${col}">${b.nivel}</span>
        <span class="text-xs font-semibold uppercase tracking-wide text-tinta/60">${b.tag}</span>
      </div>
      <h3 class="font-serif text-lg font-semibold mb-1">${b.titulo}</h3>
      <div class="font-serif text-3xl font-black my-1" style="color:${col}">${b.min} a ${b.max} <span class="text-sm font-sans font-medium text-tinta/50">USD/m2</span></div>
      <div class="text-xs text-tinta/50 mb-2">aprox. $${arsMin}k a $${arsMax}k ARS/m2</div>
      <ul class="text-xs text-tinta/75 space-y-1 mt-1 list-disc list-inside">${b.li.map(x=>`<li>${x}</li>`).join('')}</ul>
    </div>`;
  }).join('');
}

/* ===========================  GALERIA / LISTAS  =========================== */
function renderGaleria(){
  document.getElementById('galeria').innerHTML = DATA.galeria.map((img, i) => {
    const tall = i===0 ? 'sm:col-span-2 sm:row-span-2' : '';
    return `<figure class="relative overflow-hidden rounded-xl shadow-sm ${tall} group">
      <img src="${img.src}" alt="${img.alt}" loading="lazy"
        class="w-full h-full object-cover ${i===0?'min-h-[220px] sm:min-h-[300px]':'h-32 sm:h-40'}"
        onerror="const f=this.parentElement;f.classList.add('ph-grad','flex','items-center','justify-center','min-h-[8rem]');const c=f.querySelector('figcaption');if(c)c.classList.add('!relative','!bg-transparent','text-center');this.remove();" />
      <figcaption class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-tinta/80 to-transparent text-hueso text-xs font-medium px-2 py-1.5">${img.rotulo}</figcaption>
    </figure>`;
  }).join('');
}
function renderProsContras(){
  document.getElementById('proscontras').innerHTML = DATA.proscontras.map(pc => {
    const col = nivelColor(pc.nivel);
    return `<div class="bg-white rounded-2xl border border-hueso2 shadow-sm overflow-hidden">
      <div class="px-5 py-3 text-white font-serif text-lg font-semibold" style="background:${col}">${pc.titulo}</div>
      <div class="p-5 space-y-3 text-sm">
        <div><div class="font-semibold text-cerro mb-1">A favor</div>
          <ul class="space-y-1">${pc.pros.map(t=>`<li class="flex gap-2"><span class="text-cerro font-bold">✓</span><span>${t}</span></li>`).join('')}</ul></div>
        <div><div class="font-semibold text-terracota mb-1">En contra</div>
          <ul class="space-y-1">${pc.contras.map(t=>`<li class="flex gap-2"><span class="text-terracota font-bold">✗</span><span>${t}</span></li>`).join('')}</ul></div>
      </div>
    </div>`;
  }).join('');
}
function renderListas(){
  document.getElementById('fuentes-list').innerHTML = DATA.fuentes.map(f =>
    `<li><a href="${f.url}" target="_blank" rel="noopener" class="text-terracota hover:text-terraDark underline break-words">${f.txt}</a> <span class="text-tinta/40 text-xs">(${f.fecha})</span></li>`).join('');
  document.getElementById('checklist-list').innerHTML = DATA.checklist.map(t =>
    `<li class="flex gap-2"><span class="text-ocre">&#9744;</span><span>${t}</span></li>`).join('');
}
function renderNormativa(){
  document.getElementById('normativa-list').innerHTML = DATA.normativa.map(n => {
    const badge = n.estado==='todo'
      ? '<span class="text-[10px] font-bold uppercase bg-terracota/15 text-terraDark rounded px-1.5 py-0.5">TODO</span>'
      : '<span class="text-[10px] font-bold uppercase bg-cerro/15 text-cerroDark rounded px-1.5 py-0.5">dato</span>';
    return `<div class="bg-white border border-hueso2 rounded-xl p-4">
      <div class="flex items-start justify-between gap-2 mb-1"><h3 class="font-semibold text-sm">${n.tema}</h3>${badge}</div>
      <p class="text-sm text-tinta/75 mb-2">${n.texto}</p>
      <p class="text-xs text-cerroDark bg-hueso/60 rounded px-2 py-1.5"><strong>Consultar:</strong> ${n.consultar}</p>
    </div>`;
  }).join('');
}
function renderCostoOculto(){
  document.getElementById('co-septica').textContent = fUSD(COSTOS.septica.usd);
  const agua = COSTOS.perforacionMetros.def * COSTOS.perforacionPorM.usd + COSTOS.bomba.usd + COSTOS.perforacionExtras.usd;
  document.getElementById('co-agua').textContent = '~' + fUSD(agua);
  const luz = 100 * COSTOS.tendidoPorM.usd + COSTOS.conexionLuz.usd;
  document.getElementById('co-luz').textContent = '~' + fUSD(luz);
}
function renderHero(){
  document.getElementById('fecha-act').textContent = DATA.actualizado;
  document.getElementById('dolar-chip').textContent = DATA.dolar.tipo + ' $' + nf.format(DOLAR);
}

/* ===========================  MAPA  =========================== */
let MAP, MARKERS = {};
function pinHtml(c){
  const bg = nivelColor(c.nivel);
  const bstyle = c.titulo==='escritura' ? 'solid' : (c.titulo==='posesion'||c.titulo==='boleto') ? 'dashed' : 'dotted';
  const ring = c.objetivo ? 'box-shadow:0 0 0 3px #E3B765,0 1px 4px rgba(0,0,0,.4);' : 'box-shadow:0 1px 4px rgba(0,0,0,.4);';
  return `<div class="pin-num" style="background:${bg};border:2px ${bstyle} #fff;${ring}"><span>${NUM[c.id]}</span></div>`;
}
function focusPin(id){
  document.querySelectorAll('tr.comp-row').forEach(t => t.classList.toggle('row-highlight', t.dataset.id===id));
  const m = MARKERS[id];
  if (m && MAP){ MAP.panTo(m.getLatLng()); m.openPopup(); }
  const tr = document.querySelector(`tr.comp-row[data-id="${id}"]`);
  if (tr) tr.scrollIntoView({ behavior:'smooth', block:'center' });
}
function renderLegend(){
  document.getElementById('map-legend').innerHTML = ['A','B','C','X'].map(n =>
    `<span class="inline-flex items-center gap-1.5"><span class="w-3 h-3 rounded-full" style="background:${NIVELES[n].color}"></span> ${NIVELES[n].label}</span>`).join('');
}
function initMapa(){
  const co = DATA.coords;
  MAP = L.map('map', { scrollWheelZoom:false }).setView([co.virgen.lat, co.virgen.lng], 14);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom:19, attribution:'&copy; OpenStreetMap' }).addTo(MAP);

  const hito = (color) => L.divIcon({ className:'', iconSize:[16,16], iconAnchor:[8,16],
    html:`<div style="width:16px;height:16px;border-radius:50% 50% 50% 0;background:${color};transform:rotate(-45deg);border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.5)"></div>` });
  const refs = [];
  Object.values(co).forEach(h => {
    L.marker([h.lat, h.lng], { icon:hito('#2A211A') }).addTo(MAP).bindPopup('<strong>'+h.label+'</strong>');
    refs.push([h.lat, h.lng]);
  });
  if (DATA.zonaObjetivo) L.polygon(DATA.zonaObjetivo, { color:'#C98A2B', weight:2, fillColor:'#C98A2B', fillOpacity:0.12 }).addTo(MAP).bindPopup('Zona objetivo aprox. (cerro crudo)');

  C.forEach(c => {
    if (!c.coord) return;
    const m = L.marker(c.coord, { icon: L.divIcon({ className:'', iconSize:[22,22], iconAnchor:[11,22], html: pinHtml(c) }) }).addTo(MAP);
    const um2 = usdM2(c);
    m.bindPopup(`<strong>#${NUM[c.id]} ${c.zona}</strong><br/>${nf.format(c.m2)} m2 · ${um2==null?'precio a consultar':'US$ '+nf.format(Math.round(um2))+'/m2'}<br/>`
      + `${c.coordAprox?'<em>ubicacion aproximada</em><br/>':''}` + (c.url?`<a href="${c.url}" target="_blank" rel="noopener">ver aviso</a>`:''));
    m.on('click', () => focusPin(c.id));
    MARKERS[c.id] = m;
  });

  MAP.fitBounds(L.latLngBounds(refs).pad(0.4));
}

/* ===========================  GRAFICO  =========================== */
let CHART, chartMode = 'scatter';
function buildScatter(){
  const pts = C.filter(c => usdM2(c)!=null);
  const mk = (n) => pts.filter(c => c.nivel===n).map(c => ({ x:c.m2, y:Math.round(usdM2(c)), id:c.id,
    r: Math.max(5, Math.min(22, Math.sqrt((c.usd||0))/40)), titulo:c.titulo, zona:c.zona }));
  const ptStyle = (arr) => arr.map(p => (p.titulo==='escritura')?'circle':(p.titulo==='posesion'||p.titulo==='boleto')?'triangle':'rectRot');
  const ds = (n, lbl) => { const arr = mk(n); return { label:lbl, data:arr,
    backgroundColor: nivelColor(n)+'b0', borderColor: nivelColor(n), pointStyle:ptStyle(arr), radius:arr.map(p=>p.r), hoverRadius:arr.map(p=>p.r+2) }; };
  return {
    type:'scatter',
    data:{ datasets:[ ds('A','A · Cerro crudo'), ds('B','B · El Portico'), ds('C','C · La Lucinda'), ds('X','Contraste') ] },
    options:{ maintainAspectRatio:false,
      scales:{ x:{ title:{display:true,text:'Superficie (m2)'} }, y:{ title:{display:true,text:'USD / m2'} } },
      plugins:{ legend:{ position:'top' },
        tooltip:{ callbacks:{ label:(ctx)=>{ const p=ctx.raw; return `${p.zona}: ${nf.format(p.x)} m2, US$ ${p.y}/m2`; },
          afterLabel:()=> 'forma = titulo (circulo escritura, triangulo posesion)' } } } }
  };
}
function buildHist(){
  const vals = C.map(usdM2).filter(x=>x!=null);
  const buckets = [ [0,12], [12,20], [20,30], [30,45], [45,70] ];
  const labels = buckets.map(b => b[0]+' a '+b[1]);
  const counts = buckets.map(b => vals.filter(v => v>=b[0] && v<b[1]).length);
  return { type:'bar',
    data:{ labels, datasets:[{ label:'Cantidad de comparables', data:counts, backgroundColor:'rgba(201,138,43,.7)', borderColor:'#8A3A1F', borderWidth:1 }] },
    options:{ maintainAspectRatio:false, scales:{ x:{ title:{display:true,text:'USD/m2'} }, y:{ title:{display:true,text:'comparables'}, ticks:{ precision:0 } } },
      plugins:{ legend:{ display:false } } } };
}
function renderChart(){
  const cfg = chartMode==='scatter' ? buildScatter() : buildHist();
  if (CHART) CHART.destroy();
  CHART = new Chart(document.getElementById('chart'), cfg);
}
function wireChart(){
  const bs = document.getElementById('chart-scatter'), bh = document.getElementById('chart-hist');
  const set = (mode) => { chartMode=mode; renderChart();
    bs.className = 'px-3 py-1.5 rounded-full font-medium ' + (mode==='scatter'?'bg-terracota text-white':'border border-terracota text-terracota');
    bh.className = 'px-3 py-1.5 rounded-full font-medium ' + (mode==='hist'?'bg-terracota text-white':'border border-terracota text-terracota');
  };
  bs.addEventListener('click', ()=>set('scatter'));
  bh.addEventListener('click', ()=>set('hist'));
}

/* ===========================  CALCULADORA  =========================== */
function bandaDe(nivel){ return DATA.bandas.find(b => b.nivel===nivel) || DATA.bandas.find(b => b.nivel==='A'); }
function calcCompute(){
  const m2 = +document.getElementById('calc-m2').value || 0;
  const precio = +document.getElementById('calc-precio').value || 0;
  const modo = document.getElementById('calc-precio-modo').value;
  const aguaRed = document.getElementById('calc-agua-red').checked;
  const aljibe = document.getElementById('calc-aljibe').checked;
  const perfM = +document.getElementById('calc-perf-m').value || 0;
  const luzLote = document.getElementById('calc-luz-lote').checked;
  const posteM = +document.getElementById('calc-poste-m').value || 0;
  const pend = document.getElementById('calc-pend').value;
  const conSeptica = document.getElementById('calc-septica').checked;
  const nivel = document.getElementById('calc-nivel').value;

  document.getElementById('calc-agua-box').style.display = aguaRed ? 'none' : '';
  document.getElementById('calc-luz-box').style.display = luzLote ? 'none' : '';
  document.getElementById('calc-perf-m').disabled = aljibe;

  const adq = modo==='m2' ? precio*m2 : precio;
  const cSeptica = conSeptica ? COSTOS.septica.usd : 0;
  let cAgua = 0, aguaDesc = 'agua de red (sin costo)';
  if (!aguaRed){
    if (aljibe){ cAgua = COSTOS.aljibe.usd; aguaDesc = 'aljibe / cisterna'; }
    else { cAgua = perfM*COSTOS.perforacionPorM.usd + COSTOS.bomba.usd + COSTOS.perforacionExtras.usd; aguaDesc = `perforacion ${perfM} m + bomba + extras`; }
  }
  let cLuz = 0, luzDesc = 'luz en el lote (sin costo)';
  if (!luzLote){ cLuz = posteM*COSTOS.tendidoPorM.usd + COSTOS.conexionLuz.usd; luzDesc = `tendido ${posteM} m + conexion`; }
  const cSuelo = COSTOS.sueloPlataformaM2 * (COSTOS.sueloPorM2[pend] || 0);
  const desarrollo = cSeptica + cAgua + cLuz + cSuelo;
  const total = adq + desarrollo;
  const efectivo = m2 ? total/m2 : 0;

  const b = bandaDe(nivel);
  let vd, vcls;
  if (efectivo <= b.max){ vd = `US$ ${Math.round(efectivo)}/m2 efectivo entra en la banda del nivel ${nivel} (${b.min} a ${b.max} USD/m2). Numero sano para ${b.titulo}.`; vcls='bg-cerro'; }
  else if (efectivo <= b.max*1.4){ vd = `US$ ${Math.round(efectivo)}/m2 efectivo quedo por encima de la banda del nivel ${nivel} (${b.min} a ${b.max}). El desarrollo se comio buena parte del descuento.`; vcls='bg-ocre'; }
  else { vd = `US$ ${Math.round(efectivo)}/m2 efectivo: muy por encima de la banda del nivel ${nivel} (${b.min} a ${b.max}). Carisimo para lo que es: el costo oculto domina.`; vcls='bg-terracota'; }

  const row = (l, v, strong) => `<div class="flex justify-between ${strong?'font-bold text-base':'text-sm text-hueso/85'} py-0.5"><span>${l}</span><span class="tabular-nums">${v}</span></div>`;
  document.getElementById('calc-output').innerHTML = `
    <div class="text-xs uppercase tracking-wide text-ocreLight font-semibold mb-2">Resultado</div>
    ${row('Adquisicion del lote', fUSD(adq), true)}
    <div class="border-t border-white/15 my-2"></div>
    ${row('Camara septica', conSeptica?fUSD(cSeptica):'no')}
    ${row('Agua ('+aguaDesc+')', fUSD(cAgua))}
    ${row('Luz ('+luzDesc+')', fUSD(cLuz))}
    ${row('Movimiento de suelo (plataforma '+COSTOS.sueloPlataformaM2+' m2, '+pend+')', fUSD(cSuelo))}
    ${row('Desarrollo total', fUSD(desarrollo), true)}
    <div class="border-t border-white/15 my-2"></div>
    ${row('Costo total', fUSD(total), true)}
    ${row('equivalente ARS', fARS(total*DOLAR))}
    <div class="mt-3 bg-white/10 rounded-lg p-3">
      <div class="text-xs text-hueso/70 mb-1">USD/m2 efectivo (todo incluido)</div>
      <div class="font-serif text-4xl font-black text-ocreLight">US$ ${m2?Math.round(efectivo):'s/d'}<span class="text-base font-sans text-hueso/60"> /m2</span></div>
    </div>
    <div class="mt-3 ${vcls} text-white rounded-lg p-3 text-sm font-medium">${vd}</div>
  `;
}
function calcPrefillOptions(){
  const sel = document.getElementById('calc-load');
  sel.innerHTML = '<option value="">elegir...</option>' + C.map(c =>
    `<option value="${c.id}">#${NUM[c.id]} [${c.nivel}] ${c.zona}${c.usd==null?' (a consultar)':''}</option>`).join('');
  sel.addEventListener('change', () => {
    const c = C.find(x => x.id===sel.value); if (!c) return;
    document.getElementById('calc-m2').value = c.m2;
    const um2 = usdM2(c);
    if (um2 != null){ document.getElementById('calc-precio').value = Math.round(um2); document.getElementById('calc-precio-modo').value = 'm2'; }
    else { document.getElementById('calc-precio').value = 0; document.getElementById('calc-precio-modo').value = 'total'; }
    document.getElementById('calc-agua-red').checked = (c.agua==='red');
    document.getElementById('calc-aljibe').checked = false;
    document.getElementById('calc-luz-lote').checked = (c.luz==='red');
    document.getElementById('calc-pend').value = c.pendiente || 'suave';
    document.getElementById('calc-nivel').value = (c.nivel==='X') ? 'C' : c.nivel;
    calcCompute();
  });
}
function wireCalc(){
  ['calc-m2','calc-precio','calc-precio-modo','calc-agua-red','calc-aljibe','calc-perf-m','calc-luz-lote','calc-poste-m','calc-pend','calc-septica','calc-nivel']
    .forEach(id => { const el=document.getElementById(id); el.addEventListener('input', calcCompute); el.addEventListener('change', calcCompute); });
  calcPrefillOptions();
  calcCompute();
}

/* ===========================  COMPARAR  =========================== */
function renderComparar(){
  const panel = document.getElementById('comparar-panel');
  const sel = C.filter(c => shortlist.has(c.id));
  if (sel.length < 2){
    panel.innerHTML = `<div class="bg-white border border-dashed border-hueso2 rounded-xl p-6 text-center text-tinta/50 text-sm">Tilda 2 o 3 lotes en la tabla para compararlos aca.</div>`;
    return;
  }
  const rowsDef = [
    ['Nivel', c => NIVELES[c.nivel].label],
    ['Zona', c => c.zona],
    ['m2', c => nf.format(c.m2)],
    ['USD total', c => c.usd==null?'a consultar':fUSD(c.usd)],
    ['USD/m2', c => { const u=usdM2(c); return u==null?'s/d':'US$ '+Math.round(u); }],
    ['ARS/m2 aprox', c => { const u=usdM2(c); return u==null?'s/d':fARS(u*DOLAR); }],
    ['Agua', c => lblAgua(c.agua)[0]],
    ['Luz', c => lblLuz(c.luz)[0]],
    ['Gas', c => lblGas(c.gas)[0]],
    ['Cloaca', c => lblCloaca(c.cloaca)[0]],
    ['Pendiente', c => lblPend(c.pendiente)[0]],
    ['Acceso', c => c.acceso || 's/d'],
    ['Titulo', c => c.titulo || 's/d'],
    ['Score', c => overallScore(c).score],
    ['Fuente', c => c.fuente + ' (' + c.fecha + ')'],
    ['Aviso', c => c.url?`<a href="${c.url}" target="_blank" rel="noopener" class="text-terracota underline">ver</a>`:'s/d'],
  ];
  let html = '<table class="w-full text-sm bg-white rounded-xl border border-hueso2 shadow-sm overflow-hidden"><thead><tr class="bg-hueso2/70">'
    + '<th class="text-left px-3 py-2 text-xs uppercase text-tinta/60">Atributo</th>'
    + sel.map(c => `<th class="text-left px-3 py-2 font-semibold ${c.objetivo?'text-terraDark':''}">#${NUM[c.id]} ${c.objetivo?'&#9733;':''}</th>`).join('') + '</tr></thead><tbody>';
  rowsDef.forEach(([label, fn], i) => {
    html += `<tr class="border-t border-hueso2 ${i%2?'bg-hueso/30':''}"><td class="px-3 py-2 font-medium text-tinta/70">${label}</td>`
      + sel.map(c => `<td class="px-3 py-2">${fn(c)}</td>`).join('') + '</tr>';
  });
  html += '</tbody></table>';
  panel.innerHTML = html;
}

/* ===========================  INIT  =========================== */
function init(){
  renderHero();
  renderKpis();
  renderBandas();
  renderGaleria();
  renderTabla();
  renderComparar();
  renderProsContras();
  renderListas();
  renderNormativa();
  renderCostoOculto();
  renderLegend();
  wireSort(); wireFiltros(); wirePesos(); wireChart(); wireCalc();
  renderChart();
  initMapa();
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
else init();
