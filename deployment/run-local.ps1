param(
  [switch]$Detach
)

$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$composeDir = Join-Path $PSScriptRoot 'docker'
$envFile = Join-Path $PSScriptRoot 'config/.env.docker'

if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
  throw 'Docker CLI not found. Install Docker Desktop and retry.'
}

Set-Location $composeDir

Write-Host 'Validating docker-compose configuration...' -ForegroundColor Cyan
docker compose --env-file ../config/.env.docker config | Out-Null

Write-Host 'Building and starting services...' -ForegroundColor Cyan
if ($Detach) {
  docker compose --env-file ../config/.env.docker up --build -d
} else {
  docker compose --env-file ../config/.env.docker up --build
}

Write-Host ''
Write-Host 'URLs:' -ForegroundColor Green
Write-Host 'Frontend:    http://localhost:5173'
Write-Host 'API Gateway: http://localhost:3000'
Write-Host 'MongoDB:     mongodb://localhost:27017'
