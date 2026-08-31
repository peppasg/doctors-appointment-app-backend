# Doctor Appointment Backend

This repository contains the backend service for the doctor appointment booking platform. It is a Node.js + TypeScript API built with Express, MongoDB, JWT authentication, and Swagger-based API documentation.

## Overview

The backend is responsible for:

- user registration and login
- JWT-based authentication and authorization
- role-based access checks
- appointment booking, listing, and deletion
- health checks and API documentation
- MongoDB persistence for users and appointments

The application is designed as a modular Express API with a clear separation between routes, controllers, services, validators, and database models.

## Tech Stack

- Node.js
- TypeScript
- Express 5
- MongoDB + Mongoose
- JWT authentication
- bcrypt password hashing
- Zod validation
- Swagger UI + swagger-jsdoc
- Jest + Supertest for integration testing
- Docker + Docker Compose for local deployment

## Project Structure

```bash
src/
  app.ts                  # Express app configuration and route registration
  server.ts               # Startup bootstrapping and DB connection
  swagger.ts              # Swagger/OpenAPI setup
  controller/             # Request handlers and response logic
  routes/                 # API route definitions
  services/               # Auth and business logic
  middlewares/            # Auth validation and role guards
  validators/             # Zod request validation
  models/                 # Mongoose schemas
  dto/                    # Data transfer objects
  utils/                  # Database connection helpers
  tests/                  # Integration tests
```

## Core Features

### Authentication

The API exposes:

- `POST /auth/signup`
- `POST /auth/login`

User accounts are stored in MongoDB, passwords are hashed with bcrypt, and a JWT is returned to clients for authenticated access.

### User Management

- `GET /users`
- `GET /users/email/:email`
- `POST /users`
- `PUT /users/:username`

Access to some user routes is protected by middleware and role checks.

### Appointment Booking

- `GET /appointments`
- `POST /appointments`
- `DELETE /appointments/:id`

Appointments are tied to a username and date/slot combination, with duplication checks to prevent double booking.

### API Docs

Swagger is configured at:

```text
http://localhost:3001/docs
```

The OpenAPI definition includes schemas for user, appointment, login, and booking payloads.

## Environment Configuration

Create environment variables from the example file:

```bash
cp .env.example .env
```

Example values:

```env
PORT=3001
JWT_SECRET=changeme
MONGO_URI=mongodb://mongo:27017/doctors_appointment
MONGO_DB_NAME=doctors_appointment
NODE_ENV=production
```

Important notes:

- `PORT` is the HTTP port the Express server listens on
- `JWT_SECRET` is used to sign user tokens
- `MONGO_URI` points to the MongoDB instance
- `NODE_ENV` affects runtime and deployment behavior

## Local Development

Install dependencies:

```bash
npm install
```

Start the local API in development mode:

```bash
npm run dev
```

This uses `ts-node-dev` to run TypeScript directly while watching files. The app listens on port 3001 by default.

Check the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{ "status": "ok" }
```

## Build Process

The project is built with TypeScript and compiled to the `dist` directory.

```bash
npm run build
```

This command runs the TypeScript compiler and outputs compiled JavaScript for runtime execution.

To start the compiled service:

```bash
npm start
```

This runs:

```bash
node dist/server.js
```

## Deployment Model

This backend is built to run in a lightweight containerized environment. The deployment setup is split into two services:

### 1. MongoDB service

Defined in `docker-compose.yaml` as the `mongo` container. It uses the official `mongo:7` image and exposes port 27017.

### 2. Backend service

The `backend` service is built from the project Dockerfile and exposes port 3001. It depends on the MongoDB container and shares the same environment configuration.

## Docker Build and Deployment

### Build the Docker image manually

```bash
docker build -t doctors-backend .
```

### Run the full stack with Docker Compose

From the backend project root:

```bash
docker compose up --build
```

This starts:

- the MongoDB database container
- the API container running the compiled app

The configuration also includes a health check for MongoDB and a restart policy for the services.

## Dockerfile Breakdown

The Dockerfile uses a multi-stage build:

1. Build stage
   - installs dependencies
   - compiles the TypeScript project
   - generates the production output in `dist`

2. Production stage
   - installs only production dependencies
   - copies the compiled output
   - starts the app with `node dist/server.js`

This reduces the final runtime image size and keeps the deployment lean.

## Docker Compose Configuration

The compose file defines:

```yaml
services:
  mongo:
    image: mongo:7
    ports:
      - "27017:27017"

  backend:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3001:3001"
    depends_on:
      mongo:
        condition: service_healthy
```

This arrangement ensures the API waits for MongoDB to be healthy before starting.

## Runtime Behavior

On startup, the server:

1. loads environment variables
2. connects to MongoDB with `connectDB()`
3. initializes Express and Swagger
4. registers routes for auth, users, and appointments
5. listens on the configured port

The app uses `server.ts` as the process entry point and `app.ts` for application wiring.

## Testing

Run the test suite:

```bash
npm test
```

The project includes integration tests built with Jest and Supertest, and uses `mongodb-memory-server` for database-backed test flows.

## Production Notes

Before deployment to a real environment, ensure:

- `JWT_SECRET` is strong and unique
- MongoDB is reachable from the target environment
- `NODE_ENV` is set appropriately
- the API is fronted by secure HTTPS or an ingress/proxy if exposed publicly

## Common Commands

```bash
npm install
npm run dev
npm run build
npm start
npm test
docker compose up --build
```

## Summary

This backend is a production-oriented TypeScript service that compiles to JavaScript, runs as a Node app, persists data in MongoDB, and is deployed via Docker Compose for local development and containerized hosting. The project is structured so that authentication, business logic, validation, and database operations remain separated and maintainable.
