$ErrorActionPreference = 'Stop'

$composeDir = Join-Path $PSScriptRoot 'docker'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker CLI not found. Install Docker Desktop and retry.'
}

Set-Location $composeDir

docker compose --env-file ../config/.env.docker down
Write-Host 'Local stack stopped.' -ForegroundColor Green
