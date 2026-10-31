// Motor de cálculo del ITP. Funciones puras: no tocan el DOM.
// Fórmula de las Leyes de Ingresos: ITP = ((BI − LI) × T) + CF
(function (global) {
  "use strict";

  function redondear(x) {
    // Redondeo a centavos, mitad hacia arriba, tolerante al error de punto flotante.
    return Math.round((x + Math.sign(x) * 1e-9) * 100) / 100;
  }

  function buscarFila(tabla, base) {
    let fila = tabla[0];
    for (const f of tabla) {
      if (f.li <= base + 1e-9) fila = f;
    }
    return fila;
  }

  function aplicarTarifa(tabla, base) {
    const fila = buscarFila(tabla, base);
    const excedente = base - fila.li;
    const monto = excedente * fila.t + fila.cf;
    return { fila, excedente, monto };
  }

  function buscarRango(rangos, m2) {
    return rangos.find(r => m2 <= r.hasta) || null;
  }

  function obtenerMunicipio(datos, id) {
    const m = datos.municipios.find(x => x.id === id);
    if (!m) throw new Error("Municipio no encontrado: " + id);
    return m;
  }

  /**
   * @param {{municipio:string, valor:number, porcentaje?:number, especial?:string|null, m2?:number|null}} entrada
   * @param {object} [datos] por defecto window.ITP_DATA
   */
  function calcularITP(entrada, datos) {
    datos = datos || global.ITP_DATA;
    const mun = obtenerMunicipio(datos, entrada.municipio);
    const valor = Number(entrada.valor);
    const porcentaje = entrada.porcentaje == null || entrada.porcentaje === "" ? 100 : Number(entrada.porcentaje);
    const m2 = entrada.m2 == null || entrada.m2 === "" ? null : Number(entrada.m2);

    if (!(valor > 0)) throw new Error("Captura un valor mayor a cero.");
    if (!(porcentaje > 0 && porcentaje <= 100)) throw new Error("El porcentaje que se transmite debe estar entre 0 y 100.");

    const advertencias = [];
    const fundamento = [mun.articulo + " · " + mun.ley];

    const general = aplicarTarifa(mun.tarifa, valor);
    let calculo = {
      tipo: "general",
      tabla: "Tarifa general",
      baseGravable: valor,
      fila: general.fila,
      excedente: general.excedente,
      factor: null,
      cuota: null,
      monto: general.monto
    };

    const esp = entrada.especial ? mun.especiales.find(e => e.id === entrada.especial) : null;
    if (entrada.especial && !esp) throw new Error("Régimen especial no disponible en " + mun.nombre + ".");

    if (esp) {
      fundamento.push(esp.articulo + " · " + esp.nombre);
      switch (esp.tipo) {
        case "factor":
          if (esp.tope != null && valor > esp.tope) {
            advertencias.push(`${esp.nombre}: la base rebasa el tope de ${moneda(esp.tope)}; se aplica la tarifa general.`);
          } else {
            calculo = { ...calculo, tipo: "factor", factor: esp.factor, monto: general.monto * esp.factor };
          }
          break;
        case "tablaSustituta":
          if (valor > esp.tope) {
            advertencias.push(`${esp.nombre}: la base rebasa el tope de ${moneda(esp.tope)}; se aplica la tarifa general.`);
          } else {
            const r = aplicarTarifa(esp.tabla, valor);
            calculo = { ...calculo, tipo: "tablaSustituta", tabla: esp.nombre + " (" + esp.articulo + ")", fila: r.fila, excedente: r.excedente, monto: r.monto };
          }
          break;
        case "exencion": {
          const gravable = Math.max(0, valor - esp.monto);
          if (gravable === 0) {
            calculo = { ...calculo, tipo: "exencion", baseGravable: 0, fila: null, excedente: 0, monto: 0 };
          } else {
            const r = aplicarTarifa(mun.tarifa, gravable);
            calculo = { ...calculo, tipo: "exencion", baseGravable: gravable, fila: r.fila, excedente: r.excedente, monto: r.monto };
          }
          calculo.exento = Math.min(valor, esp.monto);
          break;
        }
        case "cuotaPorSuperficie":
        case "factorPorSuperficie": {
          if (m2 == null || !(m2 > 0)) throw new Error("Este régimen requiere la superficie en m².");
          const rango = buscarRango(esp.rangos, m2);
          if (!rango) {
            advertencias.push(`${esp.nombre}: la superficie rebasa el último rango; se aplica la tarifa general.`);
          } else if (esp.tipo === "cuotaPorSuperficie") {
            calculo = { ...calculo, tipo: "cuota", cuota: rango.cuota, fila: null, excedente: 0, monto: rango.cuota };
          } else {
            calculo = { ...calculo, tipo: "factor", factor: rango.factor, monto: general.monto * rango.factor };
          }
          break;
        }
        case "tasaFija":
          calculo = { ...calculo, tipo: "tasaFija", fila: null, excedente: 0, factor: esp.tasa, monto: valor * esp.tasa };
          break;
        default:
          throw new Error("Tipo de régimen desconocido: " + esp.tipo);
      }
    }

    // El porcentaje que se transmite se aplica al impuesto calculado al 100%; no a cuotas fijas por superficie.
    let impuestoAntesPct = calculo.monto;
    let impuesto = calculo.tipo === "cuota" ? impuestoAntesPct : impuestoAntesPct * porcentaje / 100;
    if (porcentaje !== 100 && calculo.tipo === "cuota") {
      advertencias.push("La cuota fija por superficie no se prorratea por el porcentaje transmitido.");
    }

    impuesto = redondear(impuesto);
    const forma = redondear(mun.forma.monto);
    if (mun.forma.verificar) advertencias.push("Forma: " + mun.forma.nota);

    return {
      municipio: mun.nombre,
      valor,
      porcentaje,
      especial: esp ? esp.nombre : null,
      calculo,
      impuestoGeneral: redondear(general.monto * porcentaje / 100),
      impuesto,
      forma,
      formaConcepto: mun.forma.concepto,
      formaArticulo: mun.forma.articulo,
      total: redondear(impuesto + forma),
      fundamento,
      notaBase: mun.notaBase,
      advertencias
    };
  }

  function moneda(x) {
    return "$" + Number(x).toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  global.ITP = { calcularITP, redondear, buscarFila, aplicarTarifa, moneda };
})(typeof window !== "undefined" ? window : globalThis);
