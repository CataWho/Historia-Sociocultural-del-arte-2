const CLASES = [];

/* =========================================================
   RENDER
   ========================================================= */
const $ = (s, r=document) => r.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const slug = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-");
const cajaFoto = g => g.img
  ? `<img src="${esc(g.img)}" alt="${esc(g.n)}" loading="lazy" decoding="async" onerror="this.outerHTML='<div class=&quot;sin-foto&quot;>${esc(g.n[0])}</div>'">`
  : `<div class="sin-foto">${esc(g.n[0])}</div>`;

function renderTabs(actual){
  const tabs = $("#tabs");
  tabs.querySelectorAll(".tab").forEach(t => t.remove());
  CLASES.forEach(c => {
    const b = document.createElement("button");
    b.className = "tab" + (c.pendiente ? " pendiente" : "");
    b.innerHTML = `${esc(c.corto)}<small>${esc(c.tema)}</small>`;
    b.setAttribute("aria-current", c.id === actual ? "true" : "false");
    b.onclick = () => { location.hash = c.id; };
    tabs.appendChild(b);
  });
}

function renderPendiente(c){
  return `<div class="wrap pend">
    <p class="fecha" style="font-family:var(--sans);color:var(--tinta-suave)">Jueves ${esc(c.corto)}</p>
    <h1 style="font-family:var(--gotica);font-weight:400;font-size:clamp(2.6rem,7vw,4.6rem);margin:0">${esc(c.tema)}</h1>
    <p class="intro" style="margin-top:14px">Todavía no hay resumen de esta clase. Cuando subas el material, se completa con su línea de tiempo y su galería.</p>
    <h2 style="font-size:1.3rem">Lecturas del cronograma</h2>
    <ul>${c.lecturas.map(l => `<li>${esc(l)}</li>`).join("")}</ul>
  </div>`;
}

function renderClase(c){
  const gal = Object.fromEntries(c.galeria.map(g => [g.id, g]));
  const maxEv = Math.max(...c.siglos.map(s => s.eventos.length));
  const torres = c.siglos.map(s => {
    const h = 30 + 62 * (s.eventos.length / maxEv);
    return `<button class="torre" data-siglo="${s.n}" aria-label="Ir al siglo ${s.n}: ${s.eventos.length} hechos">
      <span class="cuerpo" style="height:${h}%"></span>
      <span class="num">${s.n}</span><span class="cant">${s.eventos.length} ${s.eventos.length===1?"hecho":"hechos"}</span>
    </button>`;
  }).join("");

  const secciones = c.secciones.map(s => `<li><h3>${esc(s.t)}</h3><span class="pp">${esc(s.pp)}</span><p>${esc(s.d)}</p></li>`).join("");

  const timeline = c.siglos.map(s => `
    <div class="siglo" id="siglo-${s.n}">
      <div class="siglo-cab"><span class="num" aria-hidden="true">${s.n}</span><h3>${esc(s.nombre)}</h3></div>
      ${s.eventos.map(e => `
        <article class="evento">
          <div class="cuando">${e.ref ? `<span class="ref-fecha" title="Fecha de referencia: no figura en el texto">${esc(e.cuando)}</span>` : esc(e.cuando)}</div>
          <div class="cuerpo">
            <h4>${esc(e.t)}</h4>
            <p>${esc(e.d)}</p>
            <div class="meta"><span class="pag">${esc(e.pag)}</span><span>${esc(e.sec)}</span></div>
            ${e.img && e.img.length ? `<div class="miniaturas">${e.img.filter(id => gal[id]).map(id => `
              <button class="mini" data-pieza="${id}"><div class="foto">${cajaFoto(gal[id])}</div><span>${esc(gal[id].n)}</span></button>`).join("")}</div>` : ""}
          </div>
        </article>`).join("")}
    </div>`).join("");

  const tipos = [...new Set(c.galeria.map(g => g.tipo))];
  const filtros = `<button aria-pressed="true" data-tipo="">Todo (${c.galeria.length})</button>` +
    tipos.map(t => `<button aria-pressed="false" data-tipo="${esc(t)}">${esc(t)} (${c.galeria.filter(g=>g.tipo===t).length})</button>`).join("") +
    `<input type="search" id="buscar" placeholder="Buscar un lugar u obra" aria-label="Buscar en la galería">`;

  const grilla = c.galeria.map(g => `
    <figure class="pieza" data-tipo="${esc(g.tipo)}" data-texto="${esc(slug(g.n + " " + g.nota))}">
      <button data-pieza="${g.id}" aria-label="Ver ${esc(g.n)}"><div class="foto">${cajaFoto(g)}</div></button>
      <figcaption><span class="nombre">${esc(g.n)}</span><span class="tipo">${esc(g.tipo)}, ${esc(g.p)}</span><p class="nota">${esc(g.nota)}</p></figcaption>
    </figure>`).join("");

  const conceptos = c.conceptos.map(k => `<div><dt>${esc(k.t)}</dt><dd>${esc(k.d)}</dd></div>`).join("");

  return `
  <header class="hero"><div class="wrap">
    <p class="fecha">${esc(c.fechaLarga)}</p>
    <h1>${esc(c.titulo)}</h1>
    <p class="ref">${c.referencia}</p>
    ${c.tambien ? `<p class="tambien">${c.tambien}</p>` : ""}
    <div class="skyline">
      <p>Cada torre es un siglo; su altura, la cantidad de hechos que Romero ubica ahí. Tocá una para ir a esa parte de la línea de tiempo.</p>
      <div class="torres">${torres}</div>
    </div>
  </div></header>

  <nav class="subnav" aria-label="Secciones de la clase"><div class="wrap">
    <a href="#ideas">Idea central</a><a href="#linea">Línea de tiempo</a><a href="#galeria">Lugares y obras</a><a href="#conceptos">Conceptos</a>
  </div></nav>

  <div class="wrap">
    <section class="bloque" id="ideas">
      <h2>Idea central</h2>
      <p class="tesis">${esc(c.tesis)}</p>
      <ol class="capitulo">${secciones}</ol>
    </section>

    <section class="bloque" id="linea">
      <h2>Línea de tiempo</h2>
      <p class="intro">Romero no escribe en orden cronológico: salta entre siglos para mostrar cómo nace y madura la mentalidad burguesa. Acá sus hechos están ordenados por época.</p>
      <p class="leyenda">Las fechas <span class="ref-fecha">subrayadas con puntos</span> no aparecen en el texto: se agregan como referencia para ubicar el hecho. Las demás siguen lo que dice Romero.</p>
      ${timeline}
    </section>

    <section class="bloque" id="galeria">
      <h2>Lugares y obras</h2>
      <p class="intro">Todo lo que el texto nombra, con la página donde aparece. Tocá una imagen para verla grande.</p>
      <div class="filtros" role="group" aria-label="Filtrar galería">${filtros}</div>
      <div class="grilla" id="grilla">${grilla}</div>
    </section>

    <section class="bloque" id="conceptos">
      <h2>Conceptos para repasar</h2>
      <dl class="conceptos">${conceptos}</dl>
    </section>
  </div>`;
}

function montar(){
  const id = decodeURIComponent(location.hash.slice(1));
  const primeraConMaterial = [...CLASES].reverse().find(c => !c.pendiente);
  const c = CLASES.find(x => x.id === id) || primeraConMaterial;
  renderTabs(c.id);
  const app = $("#app");
  if (c.pendiente){ app.innerHTML = renderPendiente(c); window.scrollTo(0,0); return; }
  app.innerHTML = renderClase(c);
  document.title = `HSA II · ${c.corto} · ${c.titulo}`;

  app.querySelectorAll(".torre").forEach(t => t.onclick = () =>
    document.getElementById("siglo-" + t.dataset.siglo).scrollIntoView());

  // filtros
  let tipoActivo = "";
  const aplicar = () => {
    const q = slug($("#buscar").value.trim());
    app.querySelectorAll(".pieza").forEach(p => {
      const ok = (!tipoActivo || p.dataset.tipo === tipoActivo) && (!q || p.dataset.texto.includes(q));
      p.hidden = !ok;
    });
  };
  app.querySelectorAll(".filtros button").forEach(b => b.onclick = () => {
    tipoActivo = b.dataset.tipo;
    app.querySelectorAll(".filtros button").forEach(x => x.setAttribute("aria-pressed", x === b ? "true" : "false"));
    aplicar();
  });
  $("#buscar").oninput = aplicar;

  // visor
  const gal = Object.fromEntries(c.galeria.map(g => [g.id, g]));
  app.querySelectorAll("[data-pieza]").forEach(b => b.onclick = () => abrirVisor(gal[b.dataset.pieza]));
}

function abrirVisor(g){
  const v = $("#visor");
  const img = $("#visor-img");
  if (g.img){ img.src = g.img; img.alt = g.n; img.hidden = false; } else { img.hidden = true; }
  $("#visor-titulo").textContent = g.n;
  $("#visor-nota").textContent = `${g.nota} (${g.p})`;
  const link = $("#visor-link");
  link.href = g.url || `https://es.wikipedia.org/w/index.php?search=${encodeURIComponent(g.n)}`;
  link.textContent = g.url ? "Abrir en Wikipedia" : "Buscar en Wikipedia";
  v.showModal();
}
$("#visor-cerrar").onclick = () => $("#visor").close();
$("#visor").addEventListener("click", e => { if (e.target.id === "visor") e.target.close(); });

window.addEventListener("hashchange", montar);
