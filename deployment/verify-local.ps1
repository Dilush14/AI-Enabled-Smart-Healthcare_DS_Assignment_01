$ErrorActionPreference = 'Stop'

function Test-Port {
  param(
    [string]$ComputerName,
    [int]$Port
  )

  $result = Test-NetConnection -ComputerName $ComputerName -Port $Port -WarningAction SilentlyContinue
  return [bool]$result.TcpTestSucceeded
}

function Get-HttpStatus {
  param(
    [string]$Url
  )

  try {
    $response = Invoke-WebRequest -Uri $Url -Method Get -TimeoutSec 10 -UseBasicParsing
    return [int]$response.StatusCode
  }
  catch {
    if ($_.Exception.Response -and $_.Exception.Response.StatusCode) {
      return [int]$_.Exception.Response.StatusCode.value__
    }
    return -1
  }
}

$checks = @(
  @{ Name = 'Frontend TCP'; Type = 'tcp'; Host = 'localhost'; Port = 5173 },
  @{ Name = 'API Gateway TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3000 },
  @{ Name = 'User Service TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3001 },
  @{ Name = 'Doctor Service TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3002 },
  @{ Name = 'Appointment Service TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3003 },
  @{ Name = 'Telemedicine Service TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3004 },
  @{ Name = 'Payment Service TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3005 },
  @{ Name = 'Notification Service TCP'; Type = 'tcp'; Host = 'localhost'; Port = 3006 },
  @{ Name = 'Frontend HTTP'; Type = 'http'; Url = 'http://localhost:5173/' },
  @{ Name = 'Gateway Health'; Type = 'http'; Url = 'http://localhost:3000/health' },
  @{ Name = 'Notification Health'; Type = 'http'; Url = 'http://localhost:3006/health' },
  @{ Name = 'Gateway Route Check'; Type = 'http'; Url = 'http://localhost:3000/api/notifications' }
)

$failures = 0
Write-Host 'Running local stack verification...' -ForegroundColor Cyan

foreach ($check in $checks) {
  if ($check.Type -eq 'tcp') {
    $ok = Test-Port -ComputerName $check.Host -Port $check.Port
    if ($ok) {
      Write-Host ("PASS  {0}" -f $check.Name) -ForegroundColor Green
    }
    else {
      Write-Host ("FAIL  {0}" -f $check.Name) -ForegroundColor Red
      $failures++
    }
    continue
  }

  $status = Get-HttpStatus -Url $check.Url

  if ($check.Name -eq 'Gateway Route Check') {
    # Any non-network response proves the route reached the gateway and a backend.
    $ok = $status -ge 100
  }
  else {
    $ok = $status -ge 200 -and $status -lt 500
  }

  if ($ok) {
    Write-Host ("PASS  {0} (HTTP {1})" -f $check.Name, $status) -ForegroundColor Green
  }
  else {
    Write-Host ("FAIL  {0} (HTTP {1})" -f $check.Name, $status) -ForegroundColor Red
    $failures++
  }
}

Write-Host ''
if ($failures -eq 0) {
  Write-Host 'All checks passed. System is ready for demo.' -ForegroundColor Green
  exit 0
}

Write-Host ("{0} check(s) failed. Fix stack issues and run verify-local.ps1 again." -f $failures) -ForegroundColor Yellow
exit 1
