param(
  [string]$Namespace = 'healthcare'
)

$ErrorActionPreference = 'Stop'

$k8s = Join-Path $PSScriptRoot 'k8s'

if (-not (Get-Command kubectl -ErrorAction SilentlyContinue)) {
  throw 'kubectl not found. Install kubectl and configure your cluster context.'
}

Write-Host 'Applying Kubernetes manifests...' -ForegroundColor Cyan

kubectl apply -f "$k8s/config/namespace.yaml"
kubectl apply -f "$k8s/config/configmap.yaml"
kubectl apply -f "$k8s/config/secret.yaml"
kubectl apply -f "$k8s/mongodb/mongodb.yaml"
kubectl apply -f "$k8s/user-service/user-service.yaml"
kubectl apply -f "$k8s/doctor-service/doctor-service.yaml"
kubectl apply -f "$k8s/appointment-service/appointment-service.yaml"
kubectl apply -f "$k8s/telemedicine-service/telemedicine-service.yaml"
kubectl apply -f "$k8s/payment-service/payment-service.yaml"
kubectl apply -f "$k8s/notification-service/notification-service.yaml"
kubectl apply -f "$k8s/api-gateway/api-gateway.yaml"
kubectl apply -f "$k8s/frontend/frontend.yaml"
kubectl apply -f "$k8s/ingress/ingress.yaml"

Write-Host "Deployment submitted to namespace '$Namespace'." -ForegroundColor Green
Write-Host 'Check pods: kubectl get pods -n healthcare'
