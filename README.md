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

## Run the full project with Docker

From the repository root:

```bash
docker compose up --build
```

The frontend is available at `http://localhost:3000`, the API at `http://localhost:5000`, and PostgreSQL at `localhost:5432`.

For development with hot reload, use:

```bash
docker compose -f docker-compose.dev.yml up
```

Source folders are mounted into the containers, so edits to `crms-client/src` and `crms-server/src` are watched automatically.

The backend generates Prisma Client on startup. Run migrations separately when migration files are available.
