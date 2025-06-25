# Betski Backend Application

## Overview
This is the backend service for Betski, built with NestJS and Prisma ORM. The application provides a RESTful API with Swagger documentation and connects to a PostgreSQL database.

## Tech Stack
- **Framework**: NestJS v11
- **Database**: PostgreSQL 15
- **ORM**: Prisma v6.10
- **API Documentation**: Swagger
- **Testing**: Jest

## Prerequisites
- Node.js (LTS version recommended)
- Docker and Docker Compose
- PostgreSQL client (optional, for direct DB access)

## Getting Started

### Installation
```bash
npm install
```

### Database Setup
Start the PostgreSQL database using Docker:
```bash
npm run postgres-up
```

Generate the Prisma client:
```bash
npm run prisma:generate
```

### Running the Application

#### Development Mode
```bash
npm run start:dev
```
This will start the application in watch mode, automatically restarting when files change.

#### Debug Mode
```bash
npm run start:debug
```
Starts the application with debugging enabled.

#### Production Mode
```bash
npm run build
npm run start:prod
```

### API Documentation
Once the application is running, you can access the Swagger API documentation at:
```
http://localhost:3344/api
```

## Database Management

### Prisma Studio
To explore and modify your database with a visual interface:
```bash
npm run prisma:studio
```

### Database Migrations

#### Create and Apply Migrations
```bash
npm run prisma:migrate
```

#### Apply Migrations in Production
```bash
npm run prisma:migrate:prod
```

#### Reset Database
```bash
npm run prisma:migrate:reset
```

#### Push Schema Changes Without Migrations
```bash
npm run prisma:push
```

### Database Management

#### Start PostgreSQL
```bash
npm run postgres-up
```

#### Stop PostgreSQL and Remove Volumes
```bash
npm run postgres-down
```

## Testing

### Run All Tests
```bash
npm test
```

### Watch Mode Testing
```bash
npm run test:watch
```

### Test Coverage
```bash
npm run test:cov
```

### End-to-End Tests
```bash
npm run test:e2e
```

## Code Quality

### Linting
```bash
npm run lint
```

### Formatting
```bash
npm run format
```

## Project Structure
```
├── prisma/                # Prisma schema and database configuration
│   ├── schema.prisma      # Database schema definition
│   └── src/               # Prisma-related services
├── src/                   # Application source code
│   ├── app.controller.ts  # Main application controller
│   ├── app.module.ts      # Main application module
│   ├── app.service.ts     # Main application service
│   └── main.ts            # Application entry point
└── test/                  # Test files
```

## Environment Variables
The application requires the following environment variables:

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Application port (default: 3344)
- `HOST`: Host address (default: localhost)

## License
This project is licensed under the UNLICENSED license.