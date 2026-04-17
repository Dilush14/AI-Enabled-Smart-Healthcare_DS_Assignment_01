# AI-Enabled-Smart-Healthcare_DS_Assignment_01

## Deployment Setup (Docker + Kubernetes)

This repository now includes a complete deployment scaffold under `deployment/`.

### 1) Deployment folder structure

```
deployment/
	config/
		.env.docker
		.env.k8s.example
	docker/
		docker-compose.yml
		frontend/
		api-gateway/
		user-service/
		doctor-service/
		appointment-service/
		telemedicine-service/
		payment-service/
		notification-service/
		mongodb/
	k8s/
		config/
		ingress/
		frontend/
		api-gateway/
		user-service/
		doctor-service/
		appointment-service/
		telemedicine-service/
		payment-service/
		notification-service/
		mongodb/
```

### 2) Run with Docker (single service examples)

Build any service image from project root:

```bash
docker build -f deployment/docker/api-gateway/Dockerfile -t smart-healthcare/api-gateway:latest .
docker build -f deployment/docker/user-service/Dockerfile -t smart-healthcare/user-service:latest .
docker build -f deployment/docker/frontend/Dockerfile -t smart-healthcare/frontend:latest .
```

Run one container:

```bash
docker run --rm -p 3000:3000 --env-file deployment/config/.env.docker smart-healthcare/api-gateway:latest
```

### 3) Run full system with docker-compose

Use the compose file in `deployment/docker/docker-compose.yml`:

```bash
cd deployment/docker
docker compose --env-file ../config/.env.docker up --build
```

One-command PowerShell option from project root:

```powershell
./deployment/run-local.ps1
./deployment/run-local.ps1 -Detach
```

Verify local stack health:

```powershell
./deployment/verify-local.ps1
```

Useful endpoints:

- Frontend: `http://localhost:5173`
- API Gateway: `http://localhost:3000`
- MongoDB: `mongodb://localhost:27017`

Stop all services:

```bash
docker compose down
```

PowerShell shortcut:

```powershell
./deployment/stop-local.ps1
```

### 4) Deploy to Kubernetes

#### Build and push images (replace registry/user)

```bash
docker build -f deployment/docker/api-gateway/Dockerfile -t <registry>/smart-healthcare/api-gateway:latest .
docker build -f deployment/docker/user-service/Dockerfile -t <registry>/smart-healthcare/user-service:latest .
docker build -f deployment/docker/doctor-service/Dockerfile -t <registry>/smart-healthcare/doctor-service:latest .
docker build -f deployment/docker/appointment-service/Dockerfile -t <registry>/smart-healthcare/appointment-service:latest .
docker build -f deployment/docker/telemedicine-service/Dockerfile -t <registry>/smart-healthcare/telemedicine-service:latest .
docker build -f deployment/docker/payment-service/Dockerfile -t <registry>/smart-healthcare/payment-service:latest .
docker build -f deployment/docker/notification-service/Dockerfile -t <registry>/smart-healthcare/notification-service:latest .
docker build -f deployment/docker/frontend/Dockerfile -t <registry>/smart-healthcare/frontend:latest .

docker push <registry>/smart-healthcare/api-gateway:latest
docker push <registry>/smart-healthcare/user-service:latest
docker push <registry>/smart-healthcare/doctor-service:latest
docker push <registry>/smart-healthcare/appointment-service:latest
docker push <registry>/smart-healthcare/telemedicine-service:latest
docker push <registry>/smart-healthcare/payment-service:latest
docker push <registry>/smart-healthcare/notification-service:latest
docker push <registry>/smart-healthcare/frontend:latest
```

Update image names in files under `deployment/k8s/*/*.yaml`, then apply:

```bash
kubectl apply -f deployment/k8s/config/namespace.yaml
kubectl apply -f deployment/k8s/config/configmap.yaml
kubectl apply -f deployment/k8s/config/secret.yaml
kubectl apply -f deployment/k8s/mongodb/mongodb.yaml
kubectl apply -f deployment/k8s/user-service/user-service.yaml
kubectl apply -f deployment/k8s/doctor-service/doctor-service.yaml
kubectl apply -f deployment/k8s/appointment-service/appointment-service.yaml
kubectl apply -f deployment/k8s/telemedicine-service/telemedicine-service.yaml
kubectl apply -f deployment/k8s/payment-service/payment-service.yaml
kubectl apply -f deployment/k8s/notification-service/notification-service.yaml
kubectl apply -f deployment/k8s/api-gateway/api-gateway.yaml
kubectl apply -f deployment/k8s/frontend/frontend.yaml
kubectl apply -f deployment/k8s/ingress/ingress.yaml
```

For local ingress testing, map host:

```text
127.0.0.1 healthcare.local
```

Then access:

- `http://healthcare.local` -> frontend
- `http://healthcare.local/api/...` -> API Gateway -> microservices

PowerShell one-command apply:

```powershell
./deployment/deploy-k8s.ps1
```

Quick Kubernetes status check:

```powershell
./deployment/verify-k8s.ps1
```

### 5) Service communication model

- Browser calls frontend only.
- Frontend sends all backend traffic to API Gateway (`/api` and `/uploads`).
- API Gateway routes requests to internal services.
- Services use MongoDB through `MONGO_URI`.
- Appointment and Payment services send internal notifications to Notification service.

This keeps a clean architecture that is easy to explain in a viva:

Frontend -> API Gateway -> Microservices -> MongoDB

### 6) Environment variables

- Docker sample env: `deployment/config/.env.docker`
- Kubernetes sample env: `deployment/config/.env.k8s.example`

These include:

- MongoDB connection settings
- JWT and internal tokens
- Service ports and internal URLs
- OpenAI model/API key
- Jitsi placeholders
- Stripe and PayHere placeholders
- Nodemailer placeholders
