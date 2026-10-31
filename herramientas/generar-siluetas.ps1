# Genera img/municipios/<id>.svg (silueta de cada municipio) a partir de un GeoJSON de municipios de Jalisco.
# Fuente usada: https://github.com/PhantomInsights/mexico-geojson (2022/states/Jalisco.json, Marco Geoestadístico INEGI).
# Uso:  powershell -ExecutionPolicy Bypass -File herramientas\generar-siluetas.ps1 -GeoJson <ruta a Jalisco.json>
param(
  [Parameter(Mandatory = $true)][string]$GeoJson,
  [string]$Salida = ""
)
$ErrorActionPreference = "Stop"
if (-not $Salida) { $Salida = Join-Path (Split-Path -Parent $MyInvocation.MyCommand.Path) "..\img\municipios" }
$claves = [ordered]@{ guadalajara = "14039"; zapopan = "14120"; tonala = "14101"; tlaquepaque = "14098"; tlajomulco = "14097" }

$geo = [IO.File]::ReadAllText((Resolve-Path $GeoJson), [Text.Encoding]::UTF8) | ConvertFrom-Json
New-Item -ItemType Directory -Force $Salida | Out-Null
$inv = [Globalization.CultureInfo]::InvariantCulture

foreach ($id in $claves.Keys) {
  $f = $geo.features | Where-Object { $_.properties.CVEGEO -eq $claves[$id] }
  if (-not $f) { throw "No se encontró CVEGEO $($claves[$id])" }
  # Normalizar a lista de polígonos (cada uno = lista de anillos)
  $polys = New-Object Collections.ArrayList
  if ($f.geometry.type -eq "Polygon") { [void]$polys.Add($f.geometry.coordinates) }
  else { foreach ($pp in $f.geometry.coordinates) { [void]$polys.Add($pp) } }

  $xs = New-Object Collections.Generic.List[double]; $ys = New-Object Collections.Generic.List[double]
  foreach ($p in $polys) { foreach ($pt in $p[0]) { $xs.Add([double]$pt[0]); $ys.Add([double]$pt[1]) } }
  $minX = ($xs | Measure-Object -Minimum).Minimum; $maxX = ($xs | Measure-Object -Maximum).Maximum
  $minY = ($ys | Measure-Object -Minimum).Minimum; $maxY = ($ys | Measure-Object -Maximum).Maximum
  $k = [Math]::Cos((($minY + $maxY) / 2) * [Math]::PI / 180)   # corrección de longitud (equirectangular)
  $W = 1000
  $s = $W / (($maxX - $minX) * $k)
  $H = [Math]::Round(($maxY - $minY) * $s)

  $d = New-Object Text.StringBuilder
  foreach ($p in $polys) {
    $ring = $p[0]
    if ($ring.Count -lt 4) { continue }
    $primero = $true; $lx = -99; $ly = -99
    foreach ($pt in $ring) {
      $x = [Math]::Round((([double]$pt[0] - $minX) * $k) * $s, 1)
      $y = [Math]::Round(($maxY - [double]$pt[1]) * $s, 1)
      if (-not $primero -and [Math]::Abs($x - $lx) -lt 2 -and [Math]::Abs($y - $ly) -lt 2) { continue }
      [void]$d.Append($(if ($primero) { "M" } else { "L" })).Append($x.ToString($inv)).Append(",").Append($y.ToString($inv))
      $primero = $false; $lx = $x; $ly = $y
    }
    [void]$d.Append("Z")
  }
  $svg = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 $W $H'><path d='$($d.ToString())'/></svg>"
  [IO.File]::WriteAllText((Join-Path $Salida "$id.svg"), $svg, (New-Object Text.UTF8Encoding($false)))
  Write-Host ("{0,-12} viewBox 0 0 {1} {2}  ({3:N0} bytes)" -f $id, $W, $H, $svg.Length)
}
