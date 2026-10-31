// Interfaz de la calculadora del ITP.
(function () {
  "use strict";
  const D = window.ITP_DATA;
  const { calcularITP, moneda } = window.ITP;
  const $ = id => document.getElementById(id);

  const el = {
    municipio: $("municipio"), valor: $("valor"), especial: $("especial"), especialCond: $("especialCond"),
    campoM2: $("campoM2"), m2: $("m2"), porcentaje: $("porcentaje"), pctNota: $("pctNota"), masOpciones: $("masOpciones"),
    resMunicipio: $("resMunicipio"), resImpuesto: $("resImpuesto"), resForma: $("resForma"),
    resFormaConcepto: $("resFormaConcepto"), resFormaArt: $("resFormaArt"), resTotal: $("resTotal"),
    operacion: $("operacion"), advertencias: $("advertencias"), fundamento: $("fundamento"), notaBase: $("notaBase"),
    error: $("error"), copiar: $("copiar"), tabla: $("tabla").querySelector("tbody"), tablaNombre: $("tablaNombre")
  };

  const pctTxt = t => (t * 100).toLocaleString("es-MX", { maximumFractionDigits: 2 }) + "%";
  const num = s => {
    const n = Number(String(s).replace(/[$,\s]/g, ""));
    return Number.isFinite(n) ? n : NaN;
  };
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

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
    el.pctNota.textContent = m.porcentajeNota ||
      "Úsalo cuando se transmite solo una parte (copropiedad, derechos parciales). El impuesto se calcula al 100% y se aplica el porcentaje.";
  }

  function actualizarCondiciones() {
    const m = municipioActual();
    const e = m.especiales.find(x => x.id === el.especial.value);
    el.especialCond.textContent = e ? e.condiciones : (m.notaEspeciales || "");
    el.campoM2.hidden = !(e && (e.tipo === "cuotaPorSuperficie" || e.tipo === "factorPorSuperficie"));
  }

  function pintarTabla(resultado) {
    const m = municipioActual();
    el.tablaNombre.textContent = m.nombre + " (" + m.articulo + ")";
    const activa = resultado && resultado.calculo.tipo !== "tablaSustituta" ? resultado.calculo.fila : null;
    el.tabla.innerHTML = m.tarifa.map(f => `
      <tr class="${f === activa ? "activa" : ""}">
        <td>${moneda(f.li)}</td><td>${f.ls == null ? "En adelante" : moneda(f.ls)}</td>
        <td>${moneda(f.cf)}</td><td>${pctTxt(f.t)}</td>
      </tr>`).join("");
  }

  function lineasOperacion(r) {
    const c = r.calculo;
    const L = [];
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

  let ultimo = null;

  function calcular() {
    const m = municipioActual();
    el.resMunicipio.textContent = m.nombre;
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
      el.resImpuesto.textContent = moneda(r.impuesto);
      el.resForma.textContent = moneda(r.forma) + (m.forma.verificar ? " ⚠️" : "");
      el.resFormaConcepto.textContent = r.formaConcepto;
      el.resFormaArt.textContent = r.formaArticulo + (m.forma.nota && !m.forma.verificar ? " · " + m.forma.nota : "");
      el.resTotal.textContent = moneda(r.total);
      el.operacion.innerHTML = lineasOperacion(r).map(l => `<div class="op-line">${esc(l)}</div>`).join("");
      el.advertencias.innerHTML = r.advertencias.map(a => `<li>⚠️ ${esc(a)}</li>`).join("");
      el.fundamento.innerHTML = r.fundamento.map(f => `<li>${esc(f)}</li>`).join("") +
        `<li>Forma: ${esc(r.formaArticulo)}</li>`;
      el.notaBase.textContent = "Base: " + r.notaBase;
      pintarTabla(r);
    } catch (e) {
      ultimo = null;
      el.error.textContent = e.message;
      el.error.hidden = false;
      ["resImpuesto", "resForma", "resTotal"].forEach(k => (el[k].textContent = "—"));
      el.operacion.innerHTML = "";
      el.advertencias.innerHTML = "";
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
    const listo = () => { el.copiar.textContent = "Copiado"; setTimeout(() => (el.copiar.textContent = "Copiar desglose"), 1500); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(txt).then(listo, () => alternativo(txt, listo));
    } else alternativo(txt, listo);
  });
  function alternativo(txt, listo) {
    const ta = document.createElement("textarea");
    ta.value = txt; document.body.appendChild(ta); ta.select();
    try { document.execCommand("copy"); listo(); } catch (_) { /* el texto queda seleccionado */ }
    ta.remove();
  }

  el.valor.addEventListener("blur", () => {
    const n = num(el.valor.value);
    if (n > 0) el.valor.value = n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  });

  el.municipio.addEventListener("change", () => { llenarEspeciales(); actualizarCondiciones(); calcular(); });
  el.especial.addEventListener("change", () => { actualizarCondiciones(); calcular(); });
  ["valor", "m2", "porcentaje"].forEach(k => el[k].addEventListener("input", calcular));
  document.getElementById("form").addEventListener("submit", e => { e.preventDefault(); calcular(); });

  $("linkListado").href = D.listado;
  $("actualizado").textContent = D.actualizado;
  llenarMunicipios();
  llenarEspeciales();
  actualizarCondiciones();
  calcular();
})();
