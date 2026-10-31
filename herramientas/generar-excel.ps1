# Genera excel/Calculadora-ITP-Jalisco-2026.xlsx a partir de data/itp-2026.js usando Excel (COM).
# Uso:  powershell -ExecutionPolicy Bypass -File herramientas\generar-excel.ps1
param(
  [string]$ArchivoDatos = (Join-Path $PSScriptRoot "..\data\itp-2026.js"),
  [string]$Salida = (Join-Path $PSScriptRoot "..\excel\Calculadora-ITP-Jalisco-2026.xlsx")
)
$ErrorActionPreference = "Stop"

# Leer el archivo de datos: quitar comentarios, la asignación y el punto y coma final.
$texto = [IO.File]::ReadAllText((Resolve-Path $ArchivoDatos), [Text.Encoding]::UTF8)
$json = ($texto -split "`n" | Where-Object { $_ -notmatch '^\s*//' }) -join "`n"
$json = $json -replace '^\s*window\.ITP_DATA\s*=\s*', '' -replace ';\s*$', ''
$D = $json | ConvertFrom-Json

$codigos = @{ guadalajara = "GDL"; zapopan = "ZAP"; tonala = "TON"; tlaquepaque = "TLQ"; tlajomulco = "TLJ" }
$REG_GENERAL = "General"
$REG_VIVIENDA = "Vivienda (tarifa preferencial)"
$REG_HERENCIA = "Herencia (exención)"

$salidaFull = [IO.Path]::GetFullPath($Salida)
New-Item -ItemType Directory -Force (Split-Path $salidaFull) | Out-Null
if (Test-Path $salidaFull) { Remove-Item $salidaFull -Force }

# Escribe un valor en una celda. Los números se pasan como fórmula con cultura invariante:
# asignar Double directamente a Value2 vía COM falla de forma intermitente en Windows PowerShell.
function Set-Celda($celda, $valor) {
  if ($valor -is [double] -or $valor -is [int] -or $valor -is [decimal]) {
    $celda.Formula = ([double]$valor).ToString("R", [Globalization.CultureInfo]::InvariantCulture)
  } else {
    $celda.Value2 = [string]$valor
  }
}

$xl = New-Object -ComObject Excel.Application
$xl.Visible = $false
$xl.DisplayAlerts = $false
try {
  $wb = $xl.Workbooks.Add()
  while ($wb.Worksheets.Count -gt 1) { $wb.Worksheets.Item($wb.Worksheets.Count).Delete() }
  $calc = $wb.Worksheets.Item(1)
  $calc.Name = "Calculadora"
  $datos = $wb.Worksheets.Add()
  $datos.Name = "Datos"

  # --- Hoja Datos: un renglón por municipio ---
  $enc = "Municipio","Código","Forma","Concepto de la forma","Exención herencia","Vivienda: tipo","Vivienda: tope","Vivienda: factor","Ley","Artículo ITP","Fuente"
  for ($c = 0; $c -lt $enc.Count; $c++) { $datos.Cells.Item(1, $c + 1).Value2 = $enc[$c] }
  $fila = 2
  foreach ($m in $D.municipios) {
    $cod = $codigos[$m.id]
    $her = $m.especiales | Where-Object { $_.id -eq "herencia" }
    $viv = $m.especiales | Where-Object { $_.id -eq "vivienda" }
    Set-Celda $datos.Cells.Item($fila, 1) ($m.nombre)
    Set-Celda $datos.Cells.Item($fila, 2) ($cod)
    Set-Celda $datos.Cells.Item($fila, 3) ([double]$m.forma.monto)
    Set-Celda $datos.Cells.Item($fila, 4) ("$($m.forma.concepto) ($($m.forma.articulo))")
    $vHer = 0.0; if ($her) { $vHer = [double]$her.monto }
    Set-Celda $datos.Cells.Item($fila, 5) ($vHer)
    $vTipo = "factor"; if (-not $viv) { $vTipo = "ninguno" } elseif ($viv.tipo -eq "tablaSustituta") { $vTipo = "tabla" }
    Set-Celda $datos.Cells.Item($fila, 6) ($vTipo)
    $vTope = 0.0; if ($viv) { $vTope = [double]$viv.tope }
    Set-Celda $datos.Cells.Item($fila, 7) ($vTope)
    $vFac = 1.0; if ($viv -and $viv.factor) { $vFac = [double]$viv.factor }
    Set-Celda $datos.Cells.Item($fila, 8) ($vFac)
    Set-Celda $datos.Cells.Item($fila, 9) ($m.ley)
    Set-Celda $datos.Cells.Item($fila, 10) ($m.articulo)
    Set-Celda $datos.Cells.Item($fila, 11) ($m.url)
    $fila++
  }
  $ultimaDatos = $fila - 1
  $datos.Range("C2:C$ultimaDatos").NumberFormat = '$#,##0.00'
  $datos.Range("E2:E$ultimaDatos").NumberFormat = '$#,##0.00'
  $datos.Range("G2:G$ultimaDatos").NumberFormat = '$#,##0.00'
  $datos.Range("A1:K1").Font.Bold = $true
  $wb.Names.Add("Municipios", "=Datos!`$A`$2:`$A`$$ultimaDatos") | Out-Null
  $wb.Names.Add("TablaDatos", "=Datos!`$A`$2:`$K`$$ultimaDatos") | Out-Null
  $datos.Range("A$($ultimaDatos + 2)").Value2 = "Regímenes"
  $datos.Range("A$($ultimaDatos + 2)").Font.Bold = $true
  $datos.Range("A$($ultimaDatos + 3)").Value2 = $REG_GENERAL
  $datos.Range("A$($ultimaDatos + 4)").Value2 = $REG_VIVIENDA
  $datos.Range("A$($ultimaDatos + 5)").Value2 = $REG_HERENCIA
  $wb.Names.Add("Regimenes", "=Datos!`$A`$$($ultimaDatos + 3):`$A`$$($ultimaDatos + 5)") | Out-Null
  $datos.Columns.AutoFit() | Out-Null

  # --- Una hoja por municipio con su tarifa general y, si existe, la tabla de vivienda ---
  # Worksheets.Add() inserta antes de la hoja activa: se recorren al revés para que queden en orden.
  $municipiosInv = @($D.municipios); [Array]::Reverse($municipiosInv)
  foreach ($m in $municipiosInv) {
    $cod = $codigos[$m.id]
    $ws = $wb.Worksheets.Add()
    $ws.Name = $cod
    $ws.Range("A1").Value2 = "$($m.nombre) · $($m.articulo)"
    $ws.Range("A1").Font.Bold = $true
    $ws.Range("A1").Font.Size = 13
    $ws.Range("A2").Value2 = "$($m.ley) · Decreto $($m.decreto)"
    $ws.Range("A3").Value2 = "Forma: $($m.forma.concepto) ($($m.forma.articulo)): $('{0:N2}' -f [double]$m.forma.monto)"
    $ws.Range("A4").Value2 = "Base: $($m.notaBase)"
    $hdr = "Límite inferior","Límite superior","Cuota fija","Tasa marginal"
    for ($c = 0; $c -lt 4; $c++) { $ws.Cells.Item(6, $c + 1).Value2 = $hdr[$c] }
    $r = 7
    foreach ($t in $m.tarifa) {
      Set-Celda $ws.Cells.Item($r, 1) ([double]$t.li)
      $vLs = "En adelante"; if ($null -ne $t.ls) { $vLs = [double]$t.ls }
      Set-Celda $ws.Cells.Item($r, 2) ($vLs)
      Set-Celda $ws.Cells.Item($r, 3) ([double]$t.cf)
      Set-Celda $ws.Cells.Item($r, 4) ([double]$t.t)
      $r++
    }
    $wb.Names.Add("T_$cod", "='$cod'!`$A`$7:`$D`$$($r - 1)") | Out-Null
    $ws.Range("A7:C$($r - 1)").NumberFormat = '$#,##0.00'
    $ws.Range("D7:D$($r - 1)").NumberFormat = '0.00%'
    $ws.Range("A6:D6").Font.Bold = $true

    $viv = $m.especiales | Where-Object { $_.id -eq "vivienda" -and $_.tipo -eq "tablaSustituta" }
    if ($viv) {
      Set-Celda $ws.Cells.Item(5, 6) ("$($viv.nombre) ($($viv.articulo)) · tope $('{0:N2}' -f [double]$viv.tope)")
      $ws.Cells.Item(5, 6).Font.Bold = $true
      for ($c = 0; $c -lt 4; $c++) { $ws.Cells.Item(6, $c + 6).Value2 = $hdr[$c] }
      $r2 = 7
      foreach ($t in $viv.tabla) {
        Set-Celda $ws.Cells.Item($r2, 6) ([double]$t.li)
        Set-Celda $ws.Cells.Item($r2, 7) ([double]$t.ls)
        Set-Celda $ws.Cells.Item($r2, 8) ([double]$t.cf)
        Set-Celda $ws.Cells.Item($r2, 9) ([double]$t.t)
        $r2++
      }
      $wb.Names.Add("V_$cod", "='$cod'!`$F`$7:`$I`$$($r2 - 1)") | Out-Null
      $ws.Range("F7:H$($r2 - 1)").NumberFormat = '$#,##0.00'
      $ws.Range("I7:I$($r2 - 1)").NumberFormat = '0.00%'
      $ws.Range("F6:I6").Font.Bold = $true
    }

    # Regímenes especiales (referencia; el cálculo de factores y superficies está en la app web)
    $rr = [Math]::Max($r, 12) + 1
    Set-Celda $ws.Cells.Item($rr, 1) ("Regímenes especiales (referencia)")
    $ws.Cells.Item($rr, 1).Font.Bold = $true
    $rr++
    foreach ($e in $m.especiales) {
      Set-Celda $ws.Cells.Item($rr, 1) ("$($e.nombre) · $($e.articulo)")
      Set-Celda $ws.Cells.Item($rr, 2) ($e.condiciones)
      $rr++
    }
    Set-Celda $ws.Cells.Item($rr + 1, 1) ("Fuente: $($m.url)")
    $ws.Columns("A:I").ColumnWidth = 18
    $ws.Range("A1:A4").WrapText = $false
  }

  # --- Hoja Calculadora ---
  $c = $calc
  $c.Range("A1").Value2 = "Impuesto sobre Transmisiones Patrimoniales · Jalisco $($D.ejercicio)"
  $c.Range("A1").Font.Bold = $true
  $c.Range("A1").Font.Size = 15
  $c.Range("A2").Value2 = "Captura las celdas amarillas. Tarifas de las Leyes de Ingresos municipales $($D.ejercicio) (Congreso del Estado de Jalisco)."

  $etiquetas = @{
    4 = "Municipio"; 5 = "Valor del inmueble"; 6 = "Porcentaje que se transmite"; 7 = "Régimen"
    9 = "Base gravable"; 10 = "Tabla aplicada"; 11 = "Límite inferior"; 12 = "Cuota fija"; 13 = "Tasa marginal"
    14 = "Impuesto al 100%"; 15 = "Factor"
    17 = "Impuesto sobre transmisiones patrimoniales"; 18 = "Forma"; 19 = "TOTAL"
    21 = "Concepto de la forma"; 22 = "Nota"
  }
  foreach ($k in $etiquetas.Keys) { $c.Cells.Item($k, 1).Value2 = $etiquetas[$k] }

  # Entradas
  $c.Range("B4").Value2 = "Guadalajara"
  $c.Range("B5").Value2 = 1000000
  $c.Range("B6").Value2 = 1
  $c.Range("B7").Value2 = $REG_GENERAL
  $c.Range("B4:B7").Interior.Color = 0x9EF5FF   # amarillo claro (BGR)
  $v = $c.Range("B4").Validation; $v.Delete(); $v.Add(3, 1, 1, "=Municipios") | Out-Null
  $v = $c.Range("B7").Validation; $v.Delete(); $v.Add(3, 1, 1, "=Regimenes") | Out-Null
  $c.Range("B5").NumberFormat = '$#,##0.00'
  $c.Range("B6").NumberFormat = '0%'

  # Auxiliares (columna D, ocultas al final)
  $c.Range("D4").Formula = '=VLOOKUP($B$4,TablaDatos,2,FALSE)'          # código
  $c.Range("D5").Formula = '=VLOOKUP($B$4,TablaDatos,5,FALSE)'          # exención herencia
  $c.Range("D6").Formula = '=VLOOKUP($B$4,TablaDatos,6,FALSE)'          # tipo vivienda
  $c.Range("D7").Formula = '=VLOOKUP($B$4,TablaDatos,7,FALSE)'          # tope vivienda
  $c.Range("D8").Formula = '=VLOOKUP($B$4,TablaDatos,8,FALSE)'          # factor vivienda
  $c.Range("D9").Formula = '=AND($B$7="' + $REG_VIVIENDA + '",$D$6<>"ninguno",$B$5<=$D$7)'   # aplica vivienda
  $c.Range("D10").Formula = '=AND($B$7="' + $REG_HERENCIA + '",$D$5>0)'                      # aplica herencia

  # Cálculo
  $c.Range("B9").Formula  = '=IF($D$10,MAX(0,$B$5-$D$5),$B$5)'
  $c.Range("B10").Formula = '=IF(AND($D$9,$D$6="tabla"),"V_"&$D$4,"T_"&$D$4)'
  $c.Range("B11").Formula = '=IF($B$9<=0,0,VLOOKUP($B$9,INDIRECT($B$10),1,TRUE))'
  $c.Range("B12").Formula = '=IF($B$9<=0,0,VLOOKUP($B$9,INDIRECT($B$10),3,TRUE))'
  $c.Range("B13").Formula = '=IF($B$9<=0,0,VLOOKUP($B$9,INDIRECT($B$10),4,TRUE))'
  $c.Range("B14").Formula = '=IF($B$9<=0,0,($B$9-$B$11)*$B$13+$B$12)'
  $c.Range("B15").Formula = '=IF(AND($D$9,$D$6="factor"),$D$8,1)'
  $c.Range("B17").Formula = '=ROUND($B$14*$B$15*$B$6,2)'
  $c.Range("B18").Formula = '=VLOOKUP($B$4,TablaDatos,3,FALSE)'
  $c.Range("B19").Formula = '=ROUND($B$17+$B$18,2)'
  $c.Range("B21").Formula = '=VLOOKUP($B$4,TablaDatos,4,FALSE)'
  $c.Range("B22").Formula = '=IF(AND($B$7="' + $REG_VIVIENDA + '",NOT($D$9)),"El régimen de vivienda no aplica (sin tabla preferencial o base mayor al tope): se usa la tarifa general.",IF(AND($B$7="' + $REG_HERENCIA + '",$D$5=0),"Este municipio no tiene exención de herencia en su Ley de Ingresos: se usa la tarifa general.",IF($B$18=0,"La Ley de Ingresos no prevé forma de aviso; confirmar en ventanilla.","")))'

  $c.Range("B9,B11,B12,B14,B17,B18,B19").NumberFormat = '$#,##0.00'
  $c.Range("B13").NumberFormat = '0.00%'
  $c.Range("B15").NumberFormat = '0.00'
  $c.Range("A17:B19").Font.Bold = $true
  $c.Range("A19:B19").Font.Size = 13
  $c.Range("A19:B19").Borders.Item(8).LineStyle = 1     # borde superior
  $c.Columns("A").ColumnWidth = 44
  $c.Columns("B").ColumnWidth = 34
  $c.Range("B21:B22").WrapText = $true
  $c.Range("A24").Value2 = "Regímenes por factor o superficie (patrimonio cultural, alta densidad, regularizaciones, donación, rústicos): usar la calculadora web."
  $c.Range("A25").Value2 = "Herramienta de apoyo. El monto oficial lo determina la Tesorería municipal."
  $c.Range("A24:A25").Font.Italic = $true
  $c.Columns("D").Hidden = $true
  # Orden final: Calculadora, Datos, municipios.
  $c.Move($wb.Worksheets.Item(1))
  $datos.Move($wb.Worksheets.Item(2))
  $c.Activate()
  $c.Range("B5").Select() | Out-Null

  $wb.SaveAs($salidaFull, 51)   # 51 = xlOpenXMLWorkbook
  $wb.Close($false)
  Write-Host "Generado: $salidaFull"
}
finally {
  $xl.Quit()
  [Runtime.InteropServices.Marshal]::ReleaseComObject($xl) | Out-Null
}
