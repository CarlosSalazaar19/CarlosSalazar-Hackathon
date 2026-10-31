// Demo guiado: Junior narra con su voz (ElevenLabs, audios pregrabados en demo/) mientras la página se maneja sola.
(function () {
  "use strict";
  const $ = id => document.getElementById(id);
  const espera = ms => new Promise(r => setTimeout(r, ms));

  // Textos = demo/guion.json (subtítulos). Cada escena: audio, elemento a resaltar y acción.
  const ESCENAS = [
    { audio: "01", foco: ".top", texto: "Buen día, licenciado. Soy Junior, su agente operativo legal. Le presento la Calculadora del Impuesto sobre Transmisiones Patrimoniales para el Estado de Jalisco, construida con las Leyes de Ingresos municipales dos mil veintiséis.",
      accion: async () => { restablecer(); } },
    { audio: "02", foco: "#municipio", texto: "Primero se selecciona el municipio. Hoy tenemos Guadalajara, Zapopan, Tonalá, San Pedro Tlaquepaque y Tlajomulco de Zúñiga. Al elegir uno, cambian su escudo y la silueta de su territorio, y se carga la tarifa de su ley.",
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
  function enfocar(sel, padre) {
    if (focoActual) focoActual.classList.remove("demo-foco");
    let e = document.querySelector(sel);
    if (e && padre) e = e.closest(padre) || e;
    if (!e) return;
    focoActual = e;
    e.classList.add("demo-foco");
    // Deja el elemento justo debajo de la barra superior, lejos de los subtítulos de abajo.
    const barraAlto = (document.querySelector(".barra-sup")?.offsetHeight || 60) + 24;
    const y = e.getBoundingClientRect().top + window.scrollY - barraAlto;
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
    for (let i = 0; i < ESCENAS.length && !s.cancelado; i++) {
      const esc = ESCENAS[i];
      sub.textContent = esc.texto;
      progreso.style.setProperty("--avance", ((i + 1) / ESCENAS.length * 100) + "%");
      enfocar(esc.foco, esc.focoPadre);
      await Promise.all([reproducir(`demo/${esc.audio}.mp3`, s), esc.accion(s)]);
      if (!s.cancelado) await espera(450);
    }
    if (!s.cancelado) { sub.textContent = "Fin del demo. Puede usar la calculadora libremente."; await espera(2500); }
    if (sesion === s) detener();
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

  boton.addEventListener("click", iniciar);
  cerrar.addEventListener("click", detener);
  document.addEventListener("keydown", e => { if (e.key === "Escape") detener(); });
})();
