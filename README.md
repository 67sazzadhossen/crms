# Conference Room Reservation System

The project is split into two applications:

- `crms-client`: Next.js + React + TypeScript client with Redux Toolkit state management.
- `crms-server`: Express + TypeScript API using a modular feature structure.

## Run locally

```bash
cd crms-client && npm install && npm run dev
cd crms-server && npm install && cp .env.example .env && npm run dev
```

The API health check is available at `GET /api/health`.

## Local development

Create a local PostgreSQL database named `crms`, copy `crms-server/.env.example` to `crms-server/.env`, and set `DATABASE_URL` to your local connection string. Then run `npm run prisma:generate`, `npm run prisma:db-push`, and `npm run prisma:seed` from `crms-server`.
