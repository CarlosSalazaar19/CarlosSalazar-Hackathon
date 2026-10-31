// Demo guiado: Junior narra con su voz (ElevenLabs, audios pregrabados en demo/) mientras la página se maneja sola.
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const espera = ms => new Promise(r => setTimeout(r, ms));

  // Textos = demo/guion.json (subtítulos). Cada escena: audio, elemento a resaltar y acción.
  const ESCENAS = [
    { audio: "01", foco: ".top", texto: "Buen día, licenciado. Soy Junior, su agente operativo legal. Le presento la Calculadora del Impuesto sobre Transmisiones Patrimoniales para el Estado de Jalisco, construida con las Leyes de Ingresos municipales dos mil veintiséis.",
      accion: async () => { restablecer(); } },
    { audio: "02", foco: "#municipio", arriba: true, texto: "Primero se selecciona el municipio. Hoy tenemos Guadalajara, Zapopan, Tonalá, San Pedro Tlaquepaque y Tlajomulco de Zúñiga. Al elegir uno, cambian su escudo y la silueta de su territorio, y se carga la tarifa de su ley.",
      accion: async (s) => { for (const m of ["zapopan", "tonala", "tlaquepaque", "tlajomulco", "zapopan"]) { if (s.cancelado) return; await espera(2400); elegir("municipio", m); } } },
    { audio: "03", foco: "#valor", focoPadre: ".campo", texto: "Después se captura el valor del inmueble, escribiéndolo o con el deslizador. El cálculo se actualiza al instante.",
      accion: async (s) => { await espera(1200); await animarValor(1000000, 2500000, 2600, s); } },
    { audio: "04", foco: ".hero", texto: "Aquí está el resultado: el total a pagar, la tasa efectiva y el renglón de la tarifa que se aplicó. El desglose separa el impuesto del costo de la forma del aviso, con el artículo que lo fundamenta.",
      accion: async (s) => { await espera(6500); if (!s.cancelado) enfocar(".resumen"); } },
    { audio: "05", foco: "#especial", focoPadre: ".campo", texto: "La calculadora también aplica los beneficios de ley, como la tarifa preferencial de vivienda, las exenciones por herencia o las regularizaciones. Si algo requiere confirmarse en ventanilla, se lo marco con una alerta.",
      accion: async (s) => {
        elegir("municipio", "tonala"); await espera(900);
        await animarValor(2500000, 450000, 1500, s); await espera(700);
        if (s.cancelado) return; elegir("especial", "vivienda");
        await espera(5200); if (!s.cancelado) enfocar("#estado");
      } },
    { audio: "06", foco: ".detalle", texto: "Para total transparencia, puede ver la operación paso a paso y la tabla completa del municipio, con el renglón aplicado resaltado. Todas las tarifas se verificaron contra el texto oficial publicado por el Congreso del Estado.",
      accion: async (s) => { document.querySelector(".detalle").open = true; await espera(5200); if (!s.cancelado) enfocar(".tabla-card"); } },
    { audio: "07", foco: "#copiar", texto: "Y si necesita el cálculo para un correo o un expediente, con un clic copia el desglose completo. Quedo a sus órdenes, licenciado.",
      accion: async () => {} }
  ];

  // Versión general (sin dirigirse a una persona), usada en el video: textos de demo/general/guion.json,
  // audios demo/general/NN.mp3 y duraciones medidas con ffprobe (segundos).
  const GENERAL = [
    { t: "Esta es la Calculadora del Impuesto sobre Transmisiones Patrimoniales de Jalisco, construida con las Leyes de Ingresos municipales dos mil veintiséis.", d: 9.613 },
    { t: "Primero se elige el municipio: Guadalajara, Zapopan, Tonalá, San Pedro Tlaquepaque o Tlajomulco de Zúñiga. Cambian el escudo, la silueta del territorio y la tarifa de su ley.", d: 13.607 },
    { t: "Luego se captura el valor del inmueble, escribiéndolo o con el deslizador. El cálculo se actualiza al instante.", d: 7.059 },
    { t: "El resultado muestra el total a pagar, la tasa efectiva y el renglón de la tarifa aplicado, con el desglose entre impuesto y forma del aviso, y su fundamento legal.", d: 10.403 },
    { t: "También aplica los beneficios de ley, como la tarifa de vivienda, las exenciones por herencia o las regularizaciones, y marca con una alerta lo que debe confirmarse en ventanilla.", d: 11.192 },
    { t: "Se puede ver la operación paso a paso y la tabla completa del municipio. Todas las tarifas se verificaron contra el texto oficial del Congreso del Estado.", d: 8.638 },
    { t: "Y con un clic se copia el desglose para un correo o un expediente. Calculadora ITP Jalisco: rápida, transparente y fundamentada.", d: 8.870 }
  ];
  const parametros = new URLSearchParams(location.search);
  const GRABAR = parametros.has("grabar");                       // sin audio, tiempos fijos, arranque automático
  const USAR_GENERAL = GRABAR || parametros.get("demo") === "general";
  const PAUSA = 500;

  // --- utilidades sobre la interfaz existente (sólo dispara los mismos eventos que el usuario) ---
  function elegir(id, valor) { const e = $(id); e.value = valor; e.dispatchEvent(new Event("change")); }
  function restablecer() { $("restablecer").click(); document.querySelector(".detalle").open = false; }
  async function animarValor(desde, hasta, ms, s) {
    const pasos = Math.max(12, Math.round(ms / 50));
    for (let i = 1; i <= pasos; i++) {
      if (s.cancelado) return;
      const t = i / pasos, suave = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      const v = Math.round((desde + (hasta - desde) * suave) / 1000) * 1000;
      const e = $("valor"); e.value = v.toLocaleString("es-MX", { minimumFractionDigits: 2 }); e.dispatchEvent(new Event("input"));
      await espera(ms / pasos);
    }
  }
  let focoActual = null;
  function enfocar(sel, padre, arriba) {
    if (focoActual) focoActual.classList.remove("demo-foco");
    let e = document.querySelector(sel);
    if (e && padre) e = e.closest(padre) || e;
    if (!e) return;
    focoActual = e;
    e.classList.add("demo-foco");
    // Deja el elemento justo debajo de la barra superior, lejos de los subtítulos de abajo.
    const barraAlto = (document.querySelector(".barra-sup")?.offsetHeight || 60) + 24;
    const y = arriba ? 0 : e.getBoundingClientRect().top + window.scrollY - barraAlto;   // arriba: mantiene a la vista el escudo
    window.scrollTo({ top: Math.max(0, y), behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  }

  // --- reproductor ---
  const boton = $("demoBtn"), barra = $("demoBarra"), sub = $("demoTexto"), progreso = $("demoProgreso"), cerrar = $("demoCerrar");
  let sesion = null;

  function reproducir(src, s) {
    return new Promise(resolve => {
      const a = new Audio(src);
      s.audio = a;
      const fin = () => resolve();
      a.addEventListener("ended", fin, { once: true });
      a.addEventListener("error", () => setTimeout(fin, 6000), { once: true });   // sin audio: avanza con subtítulos
      a.play().catch(() => setTimeout(fin, 6000));
    });
  }

  async function iniciar() {
    if (sesion) return detener();
    const s = sesion = { cancelado: false, audio: null };
    document.body.classList.add("en-demo");
    barra.hidden = false;
    boton.querySelector("span").textContent = "Detener demo";
    // Modo grabación: cada escena arranca en un instante fijo para que la voz se pueda montar después con precisión.
    const registro = GRABAR ? (window.__grabacion = { inicio: Date.now(), escenas: [], fin: null }) : null;
    let programado = registro ? registro.inicio : 0;
    for (let i = 0; i < ESCENAS.length && !s.cancelado; i++) {
      const esc = ESCENAS[i];
      const gen = GENERAL[i];
      if (registro) { await espera(Math.max(0, programado - Date.now())); registro.escenas.push(Date.now()); }
      sub.textContent = USAR_GENERAL ? gen.t : esc.texto;
      progreso.style.setProperty("--avance", ((i + 1) / ESCENAS.length * 100) + "%");
      enfocar(esc.foco, esc.focoPadre, esc.arriba);
      const voz = GRABAR ? espera(gen.d * 1000) : reproducir(USAR_GENERAL ? `demo/general/${esc.audio}.mp3` : `demo/${esc.audio}.mp3`, s);
      await Promise.all([voz, esc.accion(s)]);
      programado += gen.d * 1000 + PAUSA;
      if (!s.cancelado && !GRABAR) await espera(450);
    }
    if (!s.cancelado) {
      if (registro) await espera(Math.max(0, programado - Date.now()));
      sub.textContent = USAR_GENERAL
        ? "Calculadora ITP Jalisco · Leyes de Ingresos municipales 2026 · carlossalazaar19.github.io/CarlosSalazar-Hackathon"
        : "Fin del demo. Puede usar la calculadora libremente.";
      if (focoActual) focoActual.classList.remove("demo-foco");
      window.scrollTo({ top: 0, behavior: "smooth" });
      await espera(GRABAR ? 3500 : 2500);
    }
    if (registro) registro.fin = Date.now();
    if (sesion === s) detener();
  }

  if (GRABAR) {
    document.body.classList.add("grabando");   // oculta controles que no deben salir en el video
    const quien = document.querySelector(".demo-quien");
    if (quien) quien.textContent = "Demo narrado";   // el video no presenta a Junior
    window.addEventListener("load", () => setTimeout(iniciar, 1200));
  }

  function detener() {
    if (!sesion) return;
    sesion.cancelado = true;
    if (sesion.audio) { sesion.audio.pause(); }
    sesion = null;
    document.body.classList.remove("en-demo");
    if (focoActual) focoActual.classList.remove("demo-foco");
    focoActual = null;
    barra.hidden = true;
    boton.querySelector("span").textContent = "Ver demo con Junior";
  }

  // Video del demo en ventana emergente
  const dialogo = $("videoDialogo"), video = $("videoDemo");
  $("videoBtn").addEventListener("click", () => {
    detener();
    if (typeof dialogo.showModal === "function") dialogo.showModal(); else dialogo.setAttribute("open", "");
    video.currentTime = 0;
    video.play().catch(() => {});
  });
  const cerrarVideo = () => { video.pause(); if (dialogo.open) dialogo.close(); };
  $("videoCerrar").addEventListener("click", cerrarVideo);
  dialogo.addEventListener("click", e => { if (e.target === dialogo) cerrarVideo(); });   // clic fuera del video
  dialogo.addEventListener("close", () => video.pause());

  boton.addEventListener("click", iniciar);
  cerrar.addEventListener("click", detener);
  document.addEventListener("keydown", e => { if (e.key === "Escape") detener(); });
})();
