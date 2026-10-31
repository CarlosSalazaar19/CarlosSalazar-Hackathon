// Impuesto sobre Transmisiones Patrimoniales (ITP) — tarifas de las Leyes de Ingresos municipales 2026, Jalisco.
// Única fuente de datos de la calculadora web y del generador de Excel.
// Montos tal como se publicaron (incluidas erratas de centavos en cuotas fijas).
// tarifa: li = límite inferior, ls = límite superior (null = en adelante), cf = cuota fija, t = tasa marginal sobre el excedente de li.
window.ITP_DATA = {
  "ejercicio": 2026,
  "actualizado": "2026-10-31",
  "listado": "https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/busquedasleyes/Listado%272.cfm#Ingresos",
  "notaGeneral": "Base conforme al art. 114 de la Ley de Hacienda Municipal del Estado de Jalisco: el mayor entre el avalúo de perito autorizado y aprobado por Catastro y el valor de operación; en casa habitación o lote para vivienda unifamiliar, el avalúo autorizado por Catastro. Plazo de pago: dos meses siguientes a la fecha del documento (art. 116 LHM).",
  "municipios": [
    {
      "id": "guadalajara",
      "nombre": "Guadalajara",
      "ley": "Ley de Ingresos del Municipio de Guadalajara, Jalisco para el ejercicio fiscal 2026",
      "decreto": "30031/LXIV/25",
      "articulo": "Art. 28, Tabla 1",
      "url": "https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/legislacion/Ingresos/Ley%20de%20Ingresos%20del%20Municipio%20de%20Guadalajara,%20Jalisco%20para%20el%20ejercicio%20fiscal%202026-300126.doc",
      "notaBase": "Art. 28: el mayor entre el avalúo de perito autorizado y aprobado por Catastro de Guadalajara y el valor de operación. Casa habitación o lote para vivienda: avalúo autorizado por Catastro.",
      "porcentajeNota": null,
      "forma": {
        "concepto": "Forma de aviso de transmisión patrimonial",
        "articulo": "No prevista en la Ley de Ingresos 2026",
        "monto": 0,
        "nota": "La Ley de Ingresos 2026 de Guadalajara no contiene un concepto de forma de aviso de transmisión patrimonial (revisado art. 74-I, formas impresas). Confirmar en ventanilla. La primera revisión web de avalúo cuesta $449.00 (art. 62-VII-a) y no se suma aquí.",
        "verificar": true
      },
      "tarifa": [
        { "li": 0.01, "ls": 337050.00, "cf": 0.00, "t": 0.025 },
        { "li": 337050.01, "ls": 776142.90, "cf": 8426.25, "t": 0.026 },
        { "li": 776142.91, "ls": 1053400.41, "cf": 19842.66, "t": 0.027 },
        { "li": 1053400.42, "ls": 1325856.37, "cf": 27328.62, "t": 0.028 },
        { "li": 1325856.38, "ls": 1668739.75, "cf": 34957.38, "t": 0.029 },
        { "li": 1668739.76, "ls": 2188818.99, "cf": 44901.00, "t": 0.030 },
        { "li": 2188819.00, "ls": 3146685.51, "cf": 60503.38, "t": 0.031 },
        { "li": 3146685.52, "ls": 4944269.46, "cf": 90197.24, "t": 0.032 },
        { "li": 4944269.47, "ls": 9858156.01, "cf": 147719.93, "t": 0.033 },
        { "li": 9858156.02, "ls": 42976151.21, "cf": 309878.18, "t": 0.034 },
        { "li": 42976151.22, "ls": null, "cf": 1435890.02, "t": 0.035 }
      ],
      "especiales": [
        { "id": "vivienda", "nombre": "Vivienda económica", "articulo": "Art. 29", "tipo": "factor", "factor": 0.50, "tope": 337050.00,
          "condiciones": "Base fiscal de hasta $337,050.00 y el adquirente no tiene otro inmueble en el Estado de Jalisco. Requiere constancia de búsqueda del RPP, certificados catastrales y predial del año anterior." },
        { "id": "herencia", "nombre": "Herencia o cláusula de beneficiario", "articulo": "Art. 28, fr. IV", "tipo": "exencion", "monto": 1700000.00,
          "condiciones": "Sucesión o cláusula de beneficiario entre cónyuges o parientes en línea recta hasta segundo grado. Factor 0.00 hasta $1,700,000.00 por adquirente, siempre que la masa hereditaria en Guadalajara no exceda $5,000,000.00; si la excede, no hay beneficio." },
        { "id": "patrimonio", "nombre": "Patrimonio cultural urbano", "articulo": "Art. 28, fr. I", "tipo": "factor", "factor": 0.60,
          "condiciones": "Inmueble catalogado dentro de los perímetros de Protección del Patrimonio Cultural Urbano, con dictamen favorable de Ordenamiento del Territorio; solicitud dentro de los 15 días hábiles siguientes a la escritura." },
        { "id": "altadensidad", "nombre": "Titulación en zona de alta densidad", "articulo": "Art. 30", "tipo": "factor", "factor": 0.10,
          "condiciones": "Lote de hasta 100 m² en zona de alta densidad sujeta a regularización; el adquirente no tiene otro inmueble en Guadalajara." },
        { "id": "regularizacion", "nombre": "Regularización INSUS, PROCEDE, FANAR, COMUR, PASPRAH", "articulo": "Art. 28, fr. III, Tabla 2", "tipo": "cuotaPorSuperficie",
          "rangos": [ { "hasta": 300, "cuota": 395.00 }, { "hasta": 450, "cuota": 526.00 }, { "hasta": 600, "cuota": 789.00 } ],
          "condiciones": "Solo se paga cuota fija según superficie. Más de 600 m²: tarifa general (Tabla 1)." }
      ],
      "notaEspeciales": "Si concurren varios beneficios, solo se aplica el mayor y para un solo inmueble."
    },
    {
      "id": "zapopan",
      "nombre": "Zapopan",
      "ley": "Ley de Ingresos del Municipio de Zapopan, Jalisco para el ejercicio fiscal 2026",
      "decreto": "30111/LXIV/25",
      "articulo": "Art. 49",
      "url": "https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/legislacion/Ingresos/Ley%20de%20Ingresos%20del%20Municipio%20de%20Zapopan,%20Jalisco%20para%20el%20ejercicio%20Fiscal%202026-300126.doc",
      "notaBase": "Art. 49: el valor fiscal mayor entre el avalúo, el valor de operación y el valor catastral. Casa habitación o lote para vivienda unifamiliar: avalúo autorizado por Catastro.",
      "porcentajeNota": null,
      "forma": {
        "concepto": "Asignación de folio para revisión y captura del aviso de transmisiones patrimoniales",
        "articulo": "Art. 94, fr. VIII",
        "monto": 87.00,
        "nota": "La forma adquirida en ventanilla cuesta $81.00 (art. 119, fr. I) y no se suma aquí.",
        "verificar": false
      },
      "tarifa": [
        { "li": 0.01, "ls": 300000.00, "cf": 0.00, "t": 0.025 },
        { "li": 300000.01, "ls": 500000.00, "cf": 7500.00, "t": 0.026 },
        { "li": 500000.01, "ls": 1000000.00, "cf": 12700.00, "t": 0.027 },
        { "li": 1000000.01, "ls": 1500000.00, "cf": 26200.00, "t": 0.028 },
        { "li": 1500000.01, "ls": 2000000.00, "cf": 40200.00, "t": 0.029 },
        { "li": 2000000.01, "ls": 2500000.00, "cf": 54700.00, "t": 0.030 },
        { "li": 2500000.01, "ls": 3000000.00, "cf": 69700.00, "t": 0.031 },
        { "li": 3000000.01, "ls": 5000000.00, "cf": 85200.00, "t": 0.032 },
        { "li": 5000000.01, "ls": 10000000.00, "cf": 149200.00, "t": 0.033 },
        { "li": 10000000.01, "ls": 45000000.00, "cf": 314200.00, "t": 0.034 },
        { "li": 45000000.01, "ls": null, "cf": 1504200.00, "t": 0.035 }
      ],
      "especiales": [
        { "id": "vivienda", "nombre": "Vivienda (tabla preferencial)", "articulo": "Art. 50", "tipo": "tablaSustituta", "tope": 400000.00,
          "tabla": [
            { "li": 0.01, "ls": 100000.00, "cf": 0.00, "t": 0.002 },
            { "li": 100000.01, "ls": 150000.00, "cf": 200.00, "t": 0.0163 },
            { "li": 150000.01, "ls": 400000.00, "cf": 1015.00, "t": 0.02 }
          ],
          "condiciones": "Departamentos, viviendas o casas habitación con base fiscal de hasta $400,000.00; el adquirente no tiene otros inmuebles en el municipio." },
        { "id": "herencia", "nombre": "Herencia o cláusula de beneficiario", "articulo": "Art. 52", "tipo": "exencion", "monto": 2000000.00,
          "condiciones": "Sucesión o cláusula de beneficiario entre cónyuges o en línea recta hasta segundo grado. Exentos los primeros $2,000,000.00 del valor fiscal, solo si el acervo es un único inmueble en Zapopan." },
        { "id": "donacion", "nombre": "Donación en línea recta o entre cónyuges", "articulo": "Art. 52", "tipo": "factor", "factor": 0.50,
          "condiciones": "Donación en línea recta hasta segundo grado o entre cónyuges (entre cónyuges, tope en los primeros $2,000,000.00). Un inmueble por donatario; requiere copia certificada de la escritura." },
        { "id": "ran", "nombre": "Regularización ejidal RAN o INSUS", "articulo": "Art. 49, fr. I", "tipo": "factorPorSuperficie",
          "rangos": [ { "hasta": 500, "factor": 0.00 }, { "hasta": 1000, "factor": 0.10 }, { "hasta": 1500, "factor": 0.20 } ],
          "condiciones": "Una sola parcela, sin otro inmueble en el municipio y sin enajenar en 12 meses. Más de 1,500 m²: tarifa completa." },
        { "id": "comur", "nombre": "Regularización COMUR / Decreto 20920", "articulo": "Art. 51", "tipo": "factorPorSuperficie",
          "rangos": [ { "hasta": 500, "factor": 0.00 }, { "hasta": 1000, "factor": 0.30 } ],
          "condiciones": "Mismas condiciones de 12 meses. Más de 1,000 m²: tarifa completa." }
      ],
      "notaEspeciales": null
    },
    {
      "id": "tonala",
      "nombre": "Tonalá",
      "ley": "Ley de Ingresos del Municipio de Tonalá, Jalisco para el ejercicio fiscal 2026",
      "decreto": "30093/LXIV/25 (el listado del Congreso indica 30092)",
      "articulo": "Art. 44, Tabla 1",
      "url": "https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/legislacion/Ingresos/Ley%20de%20Ingresos%20del%20Municipio%20de%20Tonal%C3%A1,%20Jalisco%20para%20el%20ejercicio%20fiscal%202026-300126.doc",
      "notaBase": "Remite a la Ley de Hacienda Municipal (art. 114). El cálculo se realiza al 100% del valor fiscal y al resultado se aplica el porcentaje que se transmite.",
      "porcentajeNota": "Art. 44: el cálculo se realiza al 100% del valor fiscal y al resultado se aplica el porcentaje que se transmite.",
      "forma": {
        "concepto": "Demás formas oficiales no especificadas",
        "articulo": "Art. 91, fr. I, inciso u)",
        "monto": 48.00,
        "nota": "La ley no tiene un concepto específico de forma de aviso de transmisión patrimonial; se usa el genérico \"demás formas oficiales\", cuyo texto dice \"de: $48.00\". Confirmar en ventanilla.",
        "verificar": true
      },
      "tarifa": [
        { "li": 0.01, "ls": 357530.00, "cf": 0.00, "t": 0.025 },
        { "li": 357530.01, "ls": 564000.00, "cf": 8938.25, "t": 0.0255 },
        { "li": 564000.01, "ls": 906775.00, "cf": 14203.23, "t": 0.026 },
        { "li": 906775.01, "ls": 1519621.00, "cf": 23115.38, "t": 0.0265 },
        { "li": 1519621.01, "ls": 2946168.00, "cf": 39355.80, "t": 0.027 },
        { "li": 2946168.01, "ls": 7080715.00, "cf": 77872.57, "t": 0.0275 },
        { "li": 7080715.01, "ls": 19478169.00, "cf": 191572.61, "t": 0.028 },
        { "li": 19478169.01, "ls": 64278169.00, "cf": 538701.33, "t": 0.0285 },
        { "li": 64278169.01, "ls": 284788228.00, "cf": 1815501.33, "t": 0.029 },
        { "li": 284788228.00, "ls": null, "cf": 8210293.04, "t": 0.0295 }
      ],
      "especiales": [
        { "id": "vivienda", "nombre": "Vivienda (tabla preferencial)", "articulo": "Art. 45", "tipo": "tablaSustituta", "tope": 600000.00,
          "tabla": [
            { "li": 0.01, "ls": 300000.00, "cf": 0.00, "t": 0.002 },
            { "li": 300000.01, "ls": 400000.00, "cf": 600.00, "t": 0.0163 },
            { "li": 400000.01, "ls": 600000.00, "cf": 2230.00, "t": 0.03 }
          ],
          "condiciones": "Departamentos, viviendas y casas habitación con base fiscal de hasta $600,000.00; el adquirente no tiene otros inmuebles en el municipio." },
        { "id": "herencia", "nombre": "Herencia, donación o cláusula de beneficiario", "articulo": "Art. 44", "tipo": "exencion", "monto": 1000000.00,
          "condiciones": "Entre ascendientes o descendientes hasta segundo grado o entre cónyuges. Factor 0 hasta $1,000,000.00 por adquirente; sobre el excedente se paga. Si son dos o más inmuebles, los avisos se presentan juntos." },
        { "id": "regularizacion", "nombre": "Regularización INSUS, FANAR o Decreto 20920", "articulo": "Art. 44, Tabla 2", "tipo": "cuotaPorSuperficie",
          "rangos": [ { "hasta": 300, "cuota": 350.00 }, { "hasta": 450, "cuota": 600.00 }, { "hasta": 600, "cuota": 900.00 }, { "hasta": 1000, "cuota": 1200.00 } ],
          "condiciones": "Cuota fija según superficie. De 601 a 1,000 m² ($1,200.00) solo lotes del Decreto 20920; predios INSUS o FANAR de más de 601 m² se calculan con la Tabla 1 al 50%." },
        { "id": "altadensidad", "nombre": "Titulación en zona de alta densidad", "articulo": "Art. 46", "tipo": "factor", "factor": 0.10,
          "condiciones": "Convenio con la Dirección General de Planeación; lote de hasta 100 m² y el adquirente no tiene otro inmueble." }
      ],
      "notaEspeciales": null
    },
    {
      "id": "tlaquepaque",
      "nombre": "San Pedro Tlaquepaque",
      "ley": "Ley de Ingresos del Municipio de San Pedro Tlaquepaque, Jalisco para el ejercicio fiscal 2026",
      "decreto": "30071/LXIV/25",
      "articulo": "Art. 35, Tabla 1",
      "url": "https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/legislacion/Ingresos/Ley%20de%20Ingresos%20del%20Municipio%20de%20San%20Pedro%20Tlaquepaque,%20Jalisco%20para%20el%20ejercicio%20fiscal%202026-300126.doc",
      "notaBase": "Art. 35: el valor declarado por el contribuyente con avalúo de perito autorizado; si no se declara o no se presenta avalúo, se presume el valor de las Tablas de Valores 2026.",
      "porcentajeNota": null,
      "forma": {
        "concepto": "Forma o folio para aviso de transmisión patrimonial",
        "articulo": "Art. 72, fr. II, inciso g)",
        "monto": 23.00,
        "nota": null,
        "verificar": false
      },
      "tarifa": [
        { "li": 0.01, "ls": 337050.00, "cf": 0.00, "t": 0.025 },
        { "li": 337050.01, "ls": 776142.90, "cf": 8426.25, "t": 0.026 },
        { "li": 776142.91, "ls": 1053400.41, "cf": 19842.66, "t": 0.027 },
        { "li": 1053400.42, "ls": 1325856.37, "cf": 27328.62, "t": 0.028 },
        { "li": 1325856.38, "ls": 1668739.75, "cf": 34957.38, "t": 0.029 },
        { "li": 1668739.76, "ls": 2188818.99, "cf": 44901.00, "t": 0.030 },
        { "li": 2188819.00, "ls": 3146685.51, "cf": 60503.38, "t": 0.031 },
        { "li": 3146685.52, "ls": 4944269.46, "cf": 90197.24, "t": 0.032 },
        { "li": 4944269.47, "ls": 9858156.01, "cf": 147719.93, "t": 0.033 },
        { "li": 9858156.02, "ls": 42976151.21, "cf": 309878.18, "t": 0.034 },
        { "li": 42976151.22, "ls": null, "cf": 1435890.02, "t": 0.035 }
      ],
      "especiales": [
        { "id": "vivienda", "nombre": "Vivienda (tabla preferencial)", "articulo": "Art. 36", "tipo": "tablaSustituta", "tope": 300000.00,
          "tabla": [
            { "li": 0.01, "ls": 130778.00, "cf": 0.00, "t": 0.002 },
            { "li": 130778.01, "ls": 196172.00, "cf": 261.56, "t": 0.0163 },
            { "li": 196172.01, "ls": 315000.00, "cf": 1327.48, "t": 0.02 }
          ],
          "condiciones": "Base fiscal que no exceda $300,000.00 y sin otros inmuebles en el municipio. Requiere certificado de no propiedad (máx. 60 días), no adeudo predial y no adeudo de agua. La tabla publicada llega a $315,000.00, pero se respeta el tope del texto." },
        { "id": "herencia", "nombre": "Herencia o cláusula de beneficiario", "articulo": "Art. 35", "tipo": "exencion", "monto": 1500000.00,
          "condiciones": "Sucesión testamentaria o intestamentaria, o cláusula de beneficiario, entre cónyuges o ascendientes y descendientes hasta segundo grado. Exentos los primeros $1,500,000.00, solo si la herencia es un solo inmueble en el municipio. No incluye donaciones." },
        { "id": "regularizacion", "nombre": "Regularización CORETT/INSUS, PROCEDE, FANAR, COMUR, PASPRAH, RAN", "articulo": "Art. 36, fr. II, Tabla 2", "tipo": "cuotaPorSuperficie",
          "rangos": [ { "hasta": 300, "cuota": 503.00 }, { "hasta": 450, "cuota": 740.00 }, { "hasta": 600, "cuota": 1109.00 } ],
          "condiciones": "Cuota fija según superficie. Más de 600 m²: Tabla 1 del art. 35 más el dictamen de valor." },
        { "id": "altadensidad", "nombre": "Titulación en zona de alta densidad", "articulo": "Art. 36, fr. I", "tipo": "factor", "factor": 0.10,
          "condiciones": "Convenio con Obras Públicas; lote de hasta 100 m² y el adquirente no tiene otro inmueble." },
        { "id": "laboral", "nombre": "Adjudicación al trabajador en juicio laboral", "articulo": "Art. 36, fr. III", "tipo": "factor", "factor": 0.03,
          "condiciones": "Adjudicación al trabajador derivada de juicio laboral." }
      ],
      "notaEspeciales": null
    },
    {
      "id": "tlajomulco",
      "nombre": "Tlajomulco de Zúñiga",
      "ley": "Ley de Ingresos del Municipio de Tlajomulco de Zúñiga, Jalisco para el ejercicio fiscal 2026",
      "decreto": "30090/LXIV/25 (reforma 30157/LXIV/26 del 7 de mayo de 2026, no modifica el art. 42)",
      "articulo": "Art. 42",
      "url": "https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/legislacion/Ingresos/Ley%20de%20Ingresos%20del%20Municipio%20de%20Tlajomulco%20de%20Z%C3%BA%C3%B1iga,%20Jalisco%20para%20el%20ejercicio%20fiscal%202026-160626.doc",
      "notaBase": "Remite al art. 114 de la Ley de Hacienda Municipal. Casa habitación o lote para vivienda unifamiliar: avalúo autorizado por la Dirección de Catastro.",
      "porcentajeNota": null,
      "forma": {
        "concepto": "Formato para el aviso de transmisión patrimonial",
        "articulo": "Art. 144, fr. I, inciso j)",
        "monto": 104.00,
        "nota": null,
        "verificar": false
      },
      "tarifa": [
        { "li": 0.01, "ls": 357530.00, "cf": 10.00, "t": 0.025 },
        { "li": 357530.01, "ls": 564000.00, "cf": 8948.25, "t": 0.026 },
        { "li": 564000.01, "ls": 906775.00, "cf": 14316.47, "t": 0.027 },
        { "li": 906775.01, "ls": 1519621.00, "cf": 23571.39, "t": 0.028 },
        { "li": 1519621.01, "ls": 2946168.00, "cf": 40731.08, "t": 0.029 },
        { "li": 2946168.01, "ls": 7080715.00, "cf": 82100.94, "t": 0.030 },
        { "li": 7080715.01, "ls": 19478169.00, "cf": 206137.35, "t": 0.031 },
        { "li": 19478169.01, "ls": 64278346.00, "cf": 590458.43, "t": 0.032 },
        { "li": 64278346.01, "ls": 284788228.00, "cf": 2024064.09, "t": 0.033 },
        { "li": 284788228.01, "ls": null, "cf": 9300890.20, "t": 0.034 }
      ],
      "especiales": [
        { "id": "altadensidad", "nombre": "Regularización en zona de alta densidad", "articulo": "Art. 42, fr. I", "tipo": "factor", "factor": 0.10,
          "condiciones": "Convenio con Obras Públicas; lote de hasta 100 m² y el adquirente acredita no tener otro inmueble." },
        { "id": "regularizacion", "nombre": "Regularización INSUS, PROCEDE o COMUR", "articulo": "Art. 42, fr. II", "tipo": "cuotaPorSuperficie",
          "rangos": [ { "hasta": 300, "cuota": 150.00 }, { "hasta": 450, "cuota": 208.00 }, { "hasta": 600, "cuota": 346.00 }, { "hasta": 750, "cuota": 532.00 }, { "hasta": 1000, "cuota": 810.00 } ],
          "condiciones": "Cuota fija según superficie. Más de 1,000 m²: tarifa general." },
        { "id": "rusticos", "nombre": "Regularización de predios rústicos", "articulo": "Art. 42, fr. III", "tipo": "tasaFija", "tasa": 0.01,
          "condiciones": "Regularización de predios rústicos de pequeña propiedad: 1% sobre el valor." }
      ],
      "notaEspeciales": "No hay tabla preferencial de vivienda. La reducción ejidal de hasta 90% (fr. IV) y los incentivos a la inversión requieren dictamen o convenio y no se calculan aquí."
    }
  ]
};
