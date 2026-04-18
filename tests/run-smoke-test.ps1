$ErrorActionPreference = 'Stop'

$repoRoot = Split-Path -Parent $PSScriptRoot
$cacheRoot = Join-Path $env:TEMP 'speedrechner-playwright-cache'
$playwrightModulePath = Join-Path $cacheRoot 'node_modules\playwright'

if (-not (Test-Path $playwrightModulePath)) {
  New-Item -ItemType Directory -Path $cacheRoot -Force | Out-Null
  npm install --prefix $cacheRoot playwright | Out-Null
}

$env:NODE_PATH = Join-Path $cacheRoot 'node_modules'
Push-Location $repoRoot

try {
  node tests/playwright-smoke.cjs
}
finally {
  Pop-Location
}