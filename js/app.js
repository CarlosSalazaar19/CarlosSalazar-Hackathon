// Interfaz de la calculadora del ITP.
(function () {
  "use strict";
  const D = window.ITP_DATA;
  const { calcularITP, moneda } = window.ITP;
  const $ = id => document.getElementById(id);

  const el = {
    municipio: $("municipio"), valor: $("valor"), valorRango: $("valorRango"),
    porcentaje: $("porcentaje"), pctRango: $("pctRango"), pctNota: $("pctNota"),
    especial: $("especial"), especialCond: $("especialCond"), campoM2: $("campoM2"), m2: $("m2"),
    notaBase: $("notaBase"), resMunicipio: $("resMunicipio"),
    resTotal: $("resTotal"), tasaEfectiva: $("tasaEfectiva"), renglon: $("renglon"),
    tBase: $("tBase"), resImpuesto: $("resImpuesto"), resForma: $("resForma"), tTasa: $("tTasa"),
    dImpuesto: $("dImpuesto"), dForma: $("dForma"), dTotal: $("dTotal"),
    resFormaConcepto: $("resFormaConcepto"), resFormaArt: $("resFormaArt"),
    estado: $("estado"), estadoTit: $("estadoTit"), estadoTxt: $("estadoTxt"), advertencias: $("advertencias"),
    operacion: $("operacion"), fundamento: $("fundamento"), error: $("error"),
    copiar: $("copiar"), restablecer: $("restablecer"),
    tabla: $("tabla").querySelector("tbody"), tablaNombre: $("tablaNombre"),
    escudoImg: $("escudo"), escudoNombre: $("escudoNombre")
  };
  const silueta = document.querySelector(".silueta");
  const escudoFig = document.querySelector(".escudo");
  const brillo = escudoFig.querySelector(".brillo");
  const barraMunicipio = $("barraMunicipio");

  const INICIAL = { municipio: "guadalajara", valor: 1000000, porcentaje: 100 };
  const V_MIN = 100000, V_MAX = 50000000, PASOS = 1000;

  const pctTxt = t => (t * 100).toLocaleString("es-MX", { maximumFractionDigits: 2 }) + "%";
  const num = s => { const n = Number(String(s).replace(/[$,\s%]/g, "")); return Number.isFinite(n) ? n : NaN; };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const fmtValor = n => n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  // Escala logarítmica del deslizador de valor ($100 mil a $50 millones)
  const valorDesdeRango = p => {
    const v = V_MIN * Math.pow(V_MAX / V_MIN, p / PASOS);
    const paso = v < 1e6 ? 5000 : v < 1e7 ? 25000 : 100000;
    return Math.round(v / paso) * paso;
  };
  const rangoDesdeValor = v => {
    const c = Math.min(Math.max(v, V_MIN), V_MAX);
    return Math.round(PASOS * Math.log(c / V_MIN) / Math.log(V_MAX / V_MIN));
  };
  function pintarRango(r) {
    const p = (r.value - r.min) / (r.max - r.min) * 100;
    r.style.setProperty("--pct", p + "%");
  }

  function municipioActual() { return D.municipios.find(m => m.id === el.municipio.value); }

  function llenarMunicipios() {
    el.municipio.innerHTML = D.municipios.map(m => `<option value="${m.id}">${esc(m.nombre)}</option>`).join("");
  }

  function llenarEspeciales() {
    const m = municipioActual();
    const previo = el.especial.value;
    el.especial.innerHTML = `<option value="">Tarifa general</option>` +
      m.especiales.map(e => `<option value="${e.id}">${esc(e.nombre)} (${esc(e.articulo)})</option>`).join("");
    if (m.especiales.some(e => e.id === previo)) el.especial.value = previo;
    el.pctNota.textContent = m.porcentajeNota || "El impuesto se calcula al 100% y se aplica la proporción.";
  }

  function actualizarCondiciones() {
    const m = municipioActual();
    const e = m.especiales.find(x => x.id === el.especial.value);
    el.especialCond.textContent = e ? e.condiciones : (m.notaEspeciales || "");
    el.campoM2.hidden = !(e && (e.tipo === "cuotaPorSuperficie" || e.tipo === "factorPorSuperficie"));
  }

  // Silueta de fondo y escudo del municipio, con desvanecido
  let temporizador = null;
  function pintarIdentidad(inmediato) {
    const m = municipioActual();
    const aplicar = () => {
      const url = `url("img/municipios/${m.id}.svg")`;
      silueta.style.webkitMaskImage = url;
      silueta.style.maskImage = url;
      el.escudoImg.src = `img/escudos/${m.id}.svg`;
      const forma = `url("img/escudos/${m.id}.svg")`;
      brillo.style.webkitMaskImage = forma;
      brillo.style.maskImage = forma;
      el.escudoImg.alt = "Escudo de " + m.nombre;
      el.escudoNombre.textContent = m.nombre;
      barraMunicipio.textContent = m.nombre;
      silueta.classList.remove("cambiando");
      escudoFig.classList.remove("cambiando");
    };
    clearTimeout(temporizador);
    if (inmediato) return aplicar();
    silueta.classList.add("cambiando");
    escudoFig.classList.add("cambiando");
    temporizador = setTimeout(aplicar, 300);
  }

  function pintarTabla(r) {
    const m = municipioActual();
    el.tablaNombre.textContent = `${m.nombre} · ${m.articulo} · ${m.ley}`;
    const activa = r && r.calculo.tipo !== "tablaSustituta" ? r.calculo.fila : null;
    el.tabla.innerHTML = m.tarifa.map(f => `
      <tr class="${f === activa ? "activa" : ""}">
        <td>${moneda(f.li)}</td><td>${f.ls == null ? "En adelante" : moneda(f.ls)}</td>
        <td>${moneda(f.cf)}</td><td>${pctTxt(f.t)}</td>
      </tr>`).join("");
  }

  function lineasOperacion(r) {
    const c = r.calculo, L = [];
    if (c.tipo === "cuota") {
      L.push(`Cuota fija por superficie = ${moneda(c.cuota)}`);
    } else if (c.tipo === "tasaFija") {
      L.push(`${moneda(r.valor)} × ${pctTxt(c.factor)} = ${moneda(c.monto)}`);
    } else if (c.tipo === "exencion" && c.baseGravable === 0) {
      L.push(`Valor ${moneda(r.valor)} ≤ exención ${moneda(c.exento)} → impuesto $0.00`);
    } else {
      if (c.tipo === "exencion") L.push(`Base gravable = ${moneda(r.valor)} − exención ${moneda(c.exento)} = ${moneda(c.baseGravable)}`);
      if (c.tipo === "tablaSustituta") L.push(`Tabla: ${c.tabla}`);
      const f = c.fila;
      L.push(`((${moneda(c.baseGravable)} − ${moneda(f.li)}) × ${pctTxt(f.t)}) + ${moneda(f.cf)}`);
      L.push(`= (${moneda(c.excedente)} × ${pctTxt(f.t)}) + ${moneda(f.cf)} = ${moneda(c.excedente * f.t + f.cf)}`);
      if (c.tipo === "factor") L.push(`× factor ${c.factor.toFixed(2)} = ${moneda(c.monto)}`);
    }
    if (r.porcentaje !== 100 && c.tipo !== "cuota") L.push(`× ${r.porcentaje}% que se transmite = ${moneda(c.monto * r.porcentaje / 100)}`);
    L.push(`Impuesto redondeado a centavos: ${moneda(r.impuesto)}`);
    return L;
  }

  function textoRenglon(r) {
    const c = r.calculo, m = municipioActual();
    if (c.tipo === "cuota") return "Cuota fija por superficie";
    if (c.tipo === "tasaFija") return "Tasa fija sobre el valor";
    if (!c.fila) return "Valor dentro de la exención";
    const tabla = c.tipo === "tablaSustituta" ? m.especiales.find(e => e.tipo === "tablaSustituta").tabla : m.tarifa;
    const n = tabla.indexOf(c.fila) + 1;
    return `Renglón ${n} de ${tabla.length} · desde ${moneda(c.fila.li)}`;
  }

  let ultimo = null;

  function calcular() {
    const m = municipioActual();
    el.resMunicipio.textContent = `${m.nombre} · ${m.articulo}`;
    el.notaBase.textContent = "Base: " + m.notaBase;
    try {
      const r = calcularITP({
        municipio: m.id,
        valor: num(el.valor.value),
        porcentaje: num(el.porcentaje.value),
        especial: el.especial.value || null,
        m2: el.m2.value === "" ? null : num(el.m2.value)
      });
      ultimo = r;
      el.error.hidden = true;
      const c = r.calculo;
      el.resTotal.textContent = moneda(r.total);
      el.tasaEfectiva.textContent = "Tasa efectiva " + (r.valor > 0 ? pctTxt(r.impuesto / r.valor) : "—");
      el.renglon.textContent = textoRenglon(r);
      el.tBase.textContent = moneda(c.baseGravable != null ? c.baseGravable : r.valor);
      el.resImpuesto.textContent = moneda(r.impuesto);
      el.resForma.textContent = moneda(r.forma) + (m.forma.verificar ? " ⚠️" : "");
      el.tTasa.textContent = c.fila ? pctTxt(c.fila.t) + (c.factor != null && c.tipo === "factor" ? ` × ${c.factor.toFixed(2)}` : "") : (c.tipo === "tasaFija" ? pctTxt(c.factor) : "—");
      el.dImpuesto.textContent = moneda(r.impuesto);
      el.dForma.textContent = moneda(r.forma);
      el.dTotal.textContent = moneda(r.total);
      el.resFormaConcepto.textContent = r.formaConcepto;
      el.resFormaArt.textContent = r.formaArticulo + (m.forma.nota && !m.forma.verificar ? " · " + m.forma.nota : "");

      const hayAvisos = r.advertencias.length > 0;
      el.estado.classList.toggle("warn", hayAvisos);
      el.estado.querySelector("use").setAttribute("href", hayAvisos ? "#i-alert" : "#i-check");
      el.estadoTit.textContent = hayAvisos ? "Revisa antes de usar este monto" : "Cálculo conforme a la tarifa";
      el.estadoTxt.textContent = hayAvisos
        ? (r.advertencias.length === 1 ? "Hay una observación." : `Hay ${r.advertencias.length} observaciones.`)
        : `${r.especial ? r.especial + ". " : ""}Sin observaciones para este cálculo.`;
      el.advertencias.innerHTML = r.advertencias.map(a => `<li>⚠️ ${esc(a)}</li>`).join("");
      el.operacion.innerHTML = lineasOperacion(r).map(l => `<div class="op-line">${esc(l)}</div>`).join("");
      el.fundamento.innerHTML = r.fundamento.map(f => `<li>${esc(f)}</li>`).join("") + `<li>Forma: ${esc(r.formaArticulo)}</li>`;
      pintarTabla(r);
    } catch (e) {
      ultimo = null;
      el.error.textContent = e.message;
      el.error.hidden = false;
      ["resTotal", "tBase", "resImpuesto", "resForma", "tTasa", "dImpuesto", "dForma", "dTotal"].forEach(k => (el[k].textContent = "—"));
      el.tasaEfectiva.textContent = "—";
      el.renglon.textContent = "";
      el.advertencias.innerHTML = "";
      el.operacion.innerHTML = "";
      pintarTabla(null);
    }
  }

  function textoDesglose(r) {
    return [
      `ITP · ${r.municipio}${r.especial ? " · " + r.especial : ""}`,
      `Valor: ${moneda(r.valor)}${r.porcentaje !== 100 ? " (" + r.porcentaje + "% transmitido)" : ""}`,
      `Impuesto sobre transmisiones patrimoniales: ${moneda(r.impuesto)}`,
      `${r.formaConcepto} (${r.formaArticulo}): ${moneda(r.forma)}`,
      `Total: ${moneda(r.total)}`,
      `Fundamento: ${r.fundamento.join("; ")}`
    ].join("\n");
  }

  el.copiar.addEventListener("click", () => {
    if (!ultimo) return;
    const txt = textoDesglose(ultimo);
    const span = el.copiar.querySelector("span");
    const listo = () => { span.textContent = "Copiado"; setTimeout(() => (span.textContent = "Copiar desglose"), 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(listo, () => alternativo(txt, listo));
    else alternativo(txt, listo);
  });
  function alternativo(txt, listo) {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); listo(); } catch (_) { /* el texto queda seleccionado */ }
    ta.remove();
  }

  // Sincronía entre cajas de texto y deslizadores
  el.valorRango.addEventListener("input", () => {
    el.valor.value = fmtValor(valorDesdeRango(+el.valorRango.value));
    pintarRango(el.valorRango); calcular();
  });
  el.valor.addEventListener("input", () => {
    const n = num(el.valor.value);
    if (n > 0) { el.valorRango.value = rangoDesdeValor(n); pintarRango(el.valorRango); }
    calcular();
  });
  el.valor.addEventListener("blur", () => { const n = num(el.valor.value); if (n > 0) el.valor.value = fmtValor(n); });
  el.pctRango.addEventListener("input", () => { el.porcentaje.value = el.pctRango.value; pintarRango(el.pctRango); calcular(); });
  el.porcentaje.addEventListener("input", () => {
    const n = num(el.porcentaje.value);
    if (n >= 1 && n <= 100) { el.pctRango.value = Math.round(n); pintarRango(el.pctRango); }
    calcular();
  });
  el.m2.addEventListener("input", calcular);

  el.municipio.addEventListener("change", () => { llenarEspeciales(); actualizarCondiciones(); pintarIdentidad(false); calcular(); });
  el.especial.addEventListener("change", () => { actualizarCondiciones(); calcular(); });
  $("form").addEventListener("submit", e => { e.preventDefault(); calcular(); });

  function restablecer(inmediato) {
    el.municipio.value = INICIAL.municipio;
    llenarEspeciales();
    el.especial.value = "";
    el.m2.value = "";
    el.valor.value = fmtValor(INICIAL.valor);
    el.valorRango.value = rangoDesdeValor(INICIAL.valor);
    el.porcentaje.value = INICIAL.porcentaje;
    el.pctRango.value = INICIAL.porcentaje;
    pintarRango(el.valorRango); pintarRango(el.pctRango);
    actualizarCondiciones();
    pintarIdentidad(inmediato);
    calcular();
  }
  el.restablecer.addEventListener("click", () => restablecer(false));

  $("linkListado").href = D.listado;
  $("actualizado").textContent = D.actualizado;
  llenarMunicipios();
  restablecer(true);
})();
