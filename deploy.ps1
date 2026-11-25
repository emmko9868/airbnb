$ErrorActionPreference = 'Stop'
Set-Location $PSScriptRoot
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
  throw 'Node.js was not found. Run setup-local.ps1 first to set up your computer.'
}
& node (Join-Path $PSScriptRoot 'scripts\deploy.mjs') @args
exit $LASTEXITCODE
