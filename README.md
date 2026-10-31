# Calculadora del Impuesto sobre Transmisiones Patrimoniales · Jalisco 2026

Captura el **municipio** y el **valor** del inmueble y obtén el desglose:

| Concepto | |
|---|---|
| Impuesto sobre transmisiones patrimoniales (ITP) | según la tarifa de la Ley de Ingresos municipal |
| Forma del aviso | según la misma Ley de Ingresos |
| **Total** | suma de ambos |

Municipios incluidos: **Guadalajara, Zapopan, Tonalá, San Pedro Tlaquepaque y Tlajomulco de Zúñiga**.

## Uso

- **Web:** abre `index.html` en el navegador (funciona sin servidor) o publícalo con GitHub Pages.
- **Excel:** `excel/Calculadora-ITP-Jalisco-2026.xlsx`. Captura las celdas amarillas de la hoja *Calculadora*.

## Fórmula

Las Leyes de Ingresos aplican una tarifa progresiva:

```
ITP = ((BI − LI) × T) + CF
```

BI = base del impuesto · LI = límite inferior del renglón · T = tasa marginal sobre el excedente · CF = cuota fija.

- El renglón es el de mayor límite inferior que no excede la base.
- Las cuotas fijas se usan tal como se publicaron, incluidas tres erratas de $0.01 (Guadalajara y Tlaquepaque, renglón 3; Tlajomulco, renglones 4 y 8).
- El resultado se redondea a centavos.
- **Base:** el valor que captura el usuario. La regla legal (art. 114 de la Ley de Hacienda Municipal) es el mayor entre el avalúo autorizado por Catastro y el valor de operación; Zapopan agrega el valor catastral (art. 49).
- **Porcentaje que se transmite:** el impuesto se calcula al 100% y se aplica la proporción transmitida (Tonalá, art. 44).

## Fuentes

Leyes de Ingresos municipales para el ejercicio fiscal 2026, Biblioteca Virtual del Congreso del Estado de Jalisco: <https://congresoweb.congresojal.gob.mx/BibliotecaVirtual/busquedasleyes/Listado%272.cfm#Ingresos>

| Municipio | Decreto | Tarifa ITP | Forma | Monto forma |
|---|---|---|---|---|
| Guadalajara | 30031/LXIV/25 | Art. 28, Tabla 1 | No prevista ⚠️ | $0.00 |
| Zapopan | 30111/LXIV/25 | Art. 49 | Folio de revisión y captura del aviso, art. 94-VIII | $87.00 |
| Tonalá | 30093/LXIV/25 | Art. 44, Tabla 1 | Demás formas oficiales, art. 91-I-u ⚠️ | $48.00 |
| San Pedro Tlaquepaque | 30071/LXIV/25 | Art. 35, Tabla 1 | Forma o folio para aviso, art. 72-II-g | $23.00 |
| Tlajomulco de Zúñiga | 30090/LXIV/25 (reforma 30157/LXIV/26) | Art. 42 | Formato para el aviso, art. 144-I-j | $104.00 |

⚠️ Guadalajara no tiene un concepto de forma de aviso en su Ley de Ingresos 2026, y Tonalá solo tiene el genérico de "demás formas oficiales". Confirmar en ventanilla.

### Regímenes especiales incluidos (app web)

| Municipio | Regímenes |
|---|---|
| Guadalajara | Vivienda económica (art. 29, factor 0.50) · herencia (art. 28-IV, exentos $1.7 M) · patrimonio cultural (art. 28-I, factor 0.60) · alta densidad (art. 30, factor 0.10) · regularización por superficie (art. 28-III) |
| Zapopan | Vivienda (art. 50, tabla hasta $400 mil) · herencia (art. 52, exentos $2 M) · donación (art. 52, factor 0.50) · regularización RAN/INSUS (art. 49-I) y COMUR (art. 51) por superficie |
| Tonalá | Vivienda (art. 45, tabla hasta $600 mil) · herencia/donación (art. 44, exento $1 M) · regularización por superficie (art. 44, Tabla 2) · alta densidad (art. 46, factor 0.10) |
| San Pedro Tlaquepaque | Vivienda (art. 36, tabla hasta $300 mil) · herencia (art. 35, exentos $1.5 M) · regularización por superficie (art. 36-II) · alta densidad (art. 36-I, factor 0.10) · adjudicación laboral (art. 36-III, factor 0.03) |
| Tlajomulco de Zúñiga | Alta densidad (art. 42-I, factor 0.10) · regularización por superficie (art. 42-II) · predios rústicos (art. 42-III, 1%) |

En exenciones por herencia, la tarifa se aplica sobre el excedente del monto exento. El Excel cubre la tarifa general, la vivienda y la herencia; los demás regímenes están solo en la web.

No se incluyen los incentivos por inversión o empleo ni la reducción ejidal de Tlajomulco (art. 42-IV), porque requieren dictamen o convenio.

## Estructura

```
index.html                 calculadora web
css/estilos.css
js/calculo.js              motor de cálculo (funciones puras)
js/app.js                  interfaz
data/itp-2026.js           tarifas, formas y regímenes: única fuente de datos
pruebas/index.html         pruebas del motor (abrir en el navegador)
excel/                     libro de Excel generado
herramientas/generar-excel.ps1
```

## Pruebas

Abre `pruebas/index.html` a través de un servidor local. Verifica casos calculados a mano y la continuidad de cada tabla: el impuesto en el límite superior de un renglón debe igualar la cuota fija del siguiente (±$0.02). Resultado actual: 78 pruebas, 0 fallidas.

## Actualización anual

1. Descarga la Ley de Ingresos del nuevo ejercicio de cada municipio desde el listado del Congreso.
2. Actualiza `data/itp-2026.js` (o crea `itp-AAAA.js`): tarifa, forma, regímenes, decreto y URL.
3. Corre `pruebas/index.html`; la prueba de continuidad detecta errores de captura.
4. Regenera el Excel:

   ```powershell
   powershell -ExecutionPolicy Bypass -File herramientas\generar-excel.ps1
   ```

## Diseño

Paleta "espresso y crema" (#2B1B14, #5A3B2E, #8B6A55, #C9B19C, #F3E7D6), con modo claro y oscuro.

- **Fondo:** la silueta difuminada del municipio seleccionado (`img/municipios/<id>.svg`). La genera `herramientas/generar-siluetas.ps1` a partir del Marco Geoestadístico del INEGI, tomado de [mexico-geojson](https://github.com/PhantomInsights/mexico-geojson) (`2022/states/Jalisco.json`). Antes de que cargue el script se muestra la silueta del estado (`img/jalisco.svg`), que viene de [click_that_hood](https://github.com/codeforgermany/click_that_hood).
- **Escudo:** el del municipio seleccionado va en la esquina superior izquierda (`img/escudos/<id>.svg`). Los cinco son de dominio público y vienen de Wikimedia Commons:
  - [Guadalajara](https://commons.wikimedia.org/wiki/File:Escudo_de_Armas_de_Guadalajara_(Jalisco).svg)
  - [Zapopan](https://commons.wikimedia.org/wiki/File:Escudo_de_Zapopan.svg)
  - [Tonalá](https://commons.wikimedia.org/wiki/File:Escudo_de_Tonala.svg)
  - [San Pedro Tlaquepaque](https://commons.wikimedia.org/wiki/File:Escudo_Tlaquepaque_Jalisco.svg)
  - [Tlajomulco de Zúñiga](https://commons.wikimedia.org/wiki/File:Coat_of_arms_of_Tlajomulco.svg)

## Aviso

Herramienta de apoyo para el cálculo. El monto oficial lo determina la Tesorería municipal correspondiente.
