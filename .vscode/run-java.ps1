$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
Push-Location $projectRoot

New-Item -ItemType Directory -Force -Path "bin" | Out-Null

Write-Host "Compiling Embedded Dev Tracker (Java)..." -ForegroundColor Cyan
& javac -d bin -sourcepath src src\com\embedded\Main.java
if ($LASTEXITCODE -ne 0) {
    Write-Host "Compilation failed with exit code $LASTEXITCODE" -ForegroundColor Red
    Pop-Location
    exit $LASTEXITCODE
}

Write-Host "Starting Embedded Dev Tracker CLI..." -ForegroundColor Green
& java -cp bin com.embedded.Main
$exitCode = $LASTEXITCODE
Pop-Location
exit $exitCode

