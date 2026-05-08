$ErrorActionPreference = "Stop"

$projectRoot = Split-Path -Parent $PSScriptRoot
$jbrHome = "D:\Android Studio\jbr"
$javaExe = Join-Path $jbrHome "bin\java.exe"

if (!(Test-Path $javaExe)) {
  throw "Android Studio JBR was not found at $javaExe"
}

$env:JAVA_HOME = $jbrHome
$env:Path = "$jbrHome\bin;$env:Path"

Set-Location $projectRoot
Write-Host "Using JAVA_HOME=$env:JAVA_HOME"
& java -version
& npx expo run:android --port 8083
