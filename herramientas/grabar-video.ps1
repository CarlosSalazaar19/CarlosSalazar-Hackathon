# Graba el demo general de la calculadora como MP4 (1280x720) con la voz de Junior.
# 1) Abre Microsoft Edge sin ventana (headless) y captura la página con el protocolo DevTools (Page.startScreencast).
# 2) La página, con ?grabar, corre el demo con tiempos fijos y publica en window.__grabacion el instante de cada escena.
# 3) FFmpeg arma el video con la duración real de cada cuadro y coloca cada audio de demo/general/ en su instante exacto.
# Uso:
#   powershell -ExecutionPolicy Bypass -File herramientas\grabar-video.ps1 -Url "http://localhost:8770/?grabar" -Salida "demo\video.mp4"
param(
  [Parameter(Mandatory = $true)][string]$Url,
  [Parameter(Mandatory = $true)][string]$Salida,
  [int]$Ancho = 1280,
  [int]$Alto = 720,
  [int]$Puerto = 9333,
  [int]$LimiteSeg = 150,
  [switch]$Depurar
)
$ErrorActionPreference = "Stop"
$inv = [Globalization.CultureInfo]::InvariantCulture
$raiz = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$ffmpeg = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Links\ffmpeg.exe"
if (-not (Test-Path $ffmpeg)) { $ffmpeg = "ffmpeg" }
$edge = @("${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe", "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe") | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $edge) { throw "No se encontró Microsoft Edge." }

$trabajo = Join-Path $env:TEMP ("grabacion-itp-" + [guid]::NewGuid().ToString("N").Substring(0, 8))
$cuadros = Join-Path $trabajo "cuadros"
New-Item -ItemType Directory -Force $cuadros | Out-Null

# --- Edge sin ventana ---
$perfil = Join-Path $trabajo "perfil"
$proc = Start-Process $edge -PassThru -ArgumentList @(
  "--headless=new", "--disable-gpu", "--hide-scrollbars", "--mute-audio", "--no-first-run", "--no-default-browser-check",
  "--remote-debugging-port=$Puerto", "--window-size=$Ancho,$Alto", "--user-data-dir=`"$perfil`"", "about:blank")
try {
  $ws = $null
  for ($i = 0; $i -lt 40 -and -not $ws; $i++) {
    Start-Sleep -Milliseconds 250
    try {
      $paginas = Invoke-RestMethod "http://127.0.0.1:$Puerto/json/list"
      $ws = @($paginas | ForEach-Object { $_ } | Where-Object { $_.type -eq "page" })[0].webSocketDebuggerUrl   # PS 5.1 no desenrolla arreglos JSON
    } catch {}
  }
  if (-not $ws) { throw "Edge no abrió el puerto de depuración." }

  $sock = New-Object System.Net.WebSockets.ClientWebSocket
  $sock.Options.KeepAliveInterval = [TimeSpan]::FromSeconds(20)
  [void]$sock.ConnectAsync([Uri]$ws, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
  $script:id = 0
  function Enviar($metodo, $params) {
    $script:id++
    $json = @{ id = $script:id; method = $metodo; params = $(if ($params) { $params } else { @{} }) } | ConvertTo-Json -Depth 10 -Compress
    $bytes = [Text.Encoding]::UTF8.GetBytes($json)
    [void]$sock.SendAsync([ArraySegment[byte]]::new($bytes), [Net.WebSockets.WebSocketMessageType]::Text, $true, [Threading.CancellationToken]::None).GetAwaiter().GetResult()
    return $script:id
  }
  $bufer = New-Object byte[] 1048576
  $script:idEval = 0
  $script:ultimoEval = [datetime]::MinValue
  # Consulta el estado del demo sin frenar la captura: a lo sumo una consulta en curso, cada 500 ms.
  function Consultar {
    if ($script:idEval -eq 0 -and ((Get-Date) - $script:ultimoEval).TotalMilliseconds -ge 500) {
      $script:idEval = Enviar "Runtime.evaluate" @{ expression = "JSON.stringify(window.__grabacion || null)"; returnByValue = $true }
      $script:ultimoEval = Get-Date
    }
  }
  function Recibir([switch]$ConConsulta) {
    $ms = New-Object IO.MemoryStream
    do {
      $tarea = $sock.ReceiveAsync([ArraySegment[byte]]::new($bufer), [Threading.CancellationToken]::None)
      while (-not $tarea.Wait(100)) { if ($ConConsulta) { Consultar } }
      $r = $tarea.Result
      $ms.Write($bufer, 0, $r.Count)
    } while (-not $r.EndOfMessage)
    $txt = [Text.Encoding]::UTF8.GetString($ms.ToArray())
    return ($txt | ConvertFrom-Json)
  }

  [void](Enviar "Emulation.setDeviceMetricsOverride" @{ width = $Ancho; height = $Alto; deviceScaleFactor = 1; mobile = $false })
  [void](Enviar "Emulation.setEmulatedMedia" @{ features = @(@{ name = "prefers-reduced-motion"; value = "no-preference" }) })
  [void](Enviar "Page.enable" $null)
  [void](Enviar "Page.navigate" @{ url = $Url })
  do { $m = Recibir } while ($m.method -ne "Page.loadEventFired")
  [void](Enviar "Page.startScreencast" @{ format = "jpeg"; quality = 88; maxWidth = $Ancho; maxHeight = $Alto; everyNthFrame = 1 })

  $lista = New-Object Collections.Generic.List[object]
  $grab = $null
  $limite = (Get-Date).AddSeconds($LimiteSeg)
  while ((Get-Date) -lt $limite) {
    Consultar
    $m = Recibir -ConConsulta
    if ($m.method -eq "Page.screencastFrame") {
      [void](Enviar "Page.screencastFrameAck" @{ sessionId = $m.params.sessionId })   # confirmar primero para no frenar el flujo
      $n = $lista.Count
      $ruta = Join-Path $cuadros ("{0:D5}.jpg" -f $n)
      [IO.File]::WriteAllBytes($ruta, [Convert]::FromBase64String($m.params.data))
      $lista.Add([pscustomobject]@{ ruta = $ruta; ts = [double]$m.params.metadata.timestamp })
    } elseif ($m.id -and $m.id -eq $script:idEval) {
      $script:idEval = 0
      $valor = $m.result.result.value
      if ($Depurar) { Write-Host ("[{0:HH:mm:ss}] cuadros={1} grabacion={2}" -f (Get-Date), $lista.Count, $valor) }
      if ($valor -and $valor -ne "null") { $grab = $valor | ConvertFrom-Json }
      if ($grab -and $grab.fin) { break }
    }
  }
  if (-not ($grab -and $grab.fin)) { throw "El demo no terminó dentro de $LimiteSeg s." }
  [void](Enviar "Page.stopScreencast" $null)
  Write-Host ("Cuadros capturados: {0}" -f $lista.Count)
}
finally {
  try { if ($sock) { $sock.Dispose() } } catch {}
  try { Stop-Process -Id $proc.Id -Force -ErrorAction SilentlyContinue } catch {}
  Get-CimInstance Win32_Process -Filter "Name='msedge.exe'" | Where-Object { $_.CommandLine -like "*$perfil*" } | ForEach-Object { Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue }
}

# --- Línea de tiempo: desde el primer cuadro hasta el fin del demo ---
$t0 = $lista[0].ts
$fin = [double]$grab.fin / 1000
$concat = New-Object Text.StringBuilder
for ($i = 0; $i -lt $lista.Count; $i++) {
  $sig = $(if ($i + 1 -lt $lista.Count) { $lista[$i + 1].ts } else { $fin })
  $dur = [Math]::Max(0.001, $sig - $lista[$i].ts)
  [void]$concat.AppendLine("file '" + $lista[$i].ruta.Replace("\", "/") + "'")
  [void]$concat.AppendLine("duration " + $dur.ToString("0.000000", $inv))
}
[void]$concat.AppendLine("file '" + $lista[$lista.Count - 1].ruta.Replace("\", "/") + "'")
$archivoLista = Join-Path $trabajo "cuadros.txt"
[IO.File]::WriteAllText($archivoLista, $concat.ToString())
$total = $fin - $t0

# --- Voz: cada audio en el instante en que arrancó su escena ---
$entradas = @("-f", "concat", "-safe", "0", "-i", $archivoLista)
$filtros = New-Object Collections.Generic.List[string]
$etiquetas = ""
for ($i = 0; $i -lt $grab.escenas.Count; $i++) {
  $audio = Join-Path $raiz ("demo\general\{0:D2}.mp3" -f ($i + 1))
  $entradas += @("-i", $audio)
  $ms = [Math]::Max(0, [Math]::Round(([double]$grab.escenas[$i] / 1000 - $t0) * 1000))
  $filtros.Add("[$($i + 1):a]adelay=$ms|$ms[a$i]")
  $etiquetas += "[a$i]"
}
$filtros.Add("$($etiquetas)amix=inputs=$($grab.escenas.Count):normalize=0:duration=longest,apad[voz]")
$filtros.Add("[0:v]fps=30,scale=${Ancho}:${Alto}:flags=lanczos,format=yuv420p[v]")
$salidaFull = [IO.Path]::GetFullPath((Join-Path (Get-Location) $Salida))
New-Item -ItemType Directory -Force (Split-Path $salidaFull) | Out-Null
$args2 = $entradas + @("-filter_complex", ($filtros -join ";"), "-map", "[v]", "-map", "[voz]",
  "-t", $total.ToString("0.000", $inv), "-c:v", "libx264", "-preset", "medium", "-crf", "20",
  "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", "-y", $salidaFull)
& $ffmpeg -hide_banner -loglevel error @args2
if ($LASTEXITCODE -ne 0) { throw "FFmpeg falló ($LASTEXITCODE)." }
Write-Host ("Video: {0}  ({1:N1} s)" -f $salidaFull, $total)
Remove-Item $trabajo -Recurse -Force -ErrorAction SilentlyContinue
