# Smart Healthcare Appointment & Telemedicine Platform Backend

This is a microservices-based backend for a healthcare platform using Node.js, Express, MongoDB, and Docker.

## Architecture

- **API Gateway**: Routes requests to appropriate microservices.
- **User Service**: Handles user registration, authentication, and profiles.
- **Doctor Service**: Manages doctor profiles, specializations, and availability.
- **Appointment Service**: Handles booking, cancelling, and searching appointments.
- **Telemedicine Service**: Creates video consultation sessions using Jitsi Meet.
- **Payment Service**: Processes payments via PayHere sandbox.
- **Notification Service**: Stores in-app notifications and supports internal event emission.

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- Docker for containerization

## Setup

1. Ensure Node.js and Docker are installed.
2. Clone the repository.
3. For each service directory, run `npm install`.
4. Copy `.env.example` to `.env` and fill in the required values.
5. Start MongoDB (locally or via Docker).
6. Run services individually with `npm start` or use `docker-compose up` for all services.

## API Endpoints

### User Service

- POST /api/auth/register
- POST /api/auth/login
- GET /api/users/profile
- PUT /api/users/update

### Doctor Service

- GET /api/doctors
- GET /api/doctors/:id
- GET /api/doctors/availability
- PUT /api/doctors/verify

### Appointment Service

- GET /api/appointments
- POST /api/appointments/book
- PUT /api/appointments/cancel
- GET /api/appointments/search

### Telemedicine Service

- POST /api/telemedicine/create-session
- GET /api/telemedicine/session/:id

### Payment Service

- POST /api/payments/create
- PUT /api/payments/verify
- GET /api/payments/history

## Security

- JWT authentication
- Role-based authorization (patient, doctor, admin)
- Input validation with Joi
- CORS, Helmet for security

## Running with Docker

```bash
docker-compose up --build
```

This will start all services and MongoDB.
