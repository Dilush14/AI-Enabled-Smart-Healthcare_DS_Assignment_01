param(
  [string]$Namespace = 'healthcare'
)

$ErrorActionPreference = 'Stop'

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  throw 'kubectl not found. Install kubectl and configure your cluster context.'
}

Write-Host "Checking Kubernetes resources in namespace '$Namespace'..." -ForegroundColor Cyan
kubectl get pods -n $Namespace
Write-Host ''
kubectl get svc -n $Namespace
Write-Host ''
kubectl get ingress -n $Namespace
Write-Host ''
Write-Host 'If pods are not Ready, inspect with:' -ForegroundColor Yellow
Write-Host "kubectl describe pod <pod-name> -n $Namespace"
Write-Host "kubectl logs <pod-name> -n $Namespace"
