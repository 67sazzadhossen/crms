# CRMS Implementation Status

## Project

Coworking Space Conference Room Reservation and Client Usage Tracking System.

The project contains:

- `crms-client`: Next.js frontend with Redux Toolkit and Redux Persist
- `crms-server`: Express, TypeScript and Prisma PostgreSQL backend
- Modular backend structure with controllers, services, routes and validation

## Completed Features

### Authentication and access control

- Email and phone based login
- JWT access token authentication
- Redux Persist for session persistence after browser reload
- Logout support
- Admin and member role-based access control
- Admin-only room, maintenance and audit operations
- Global error handler and `catchAsync`
- Helmet security headers, CORS and request rate limiting

### Conference rooms

- Room list table
- Admin room creation
- Admin room edit
- Admin room soft delete
- Capacity, equipment and hourly rate fields
- Room discovery filters:
  - Minimum capacity
  - Equipment/amenity
  - Date-based availability

### Reservations

- Advance reservation from 2 hours up to 60 days
- Reservation form in a modal
- Date-wise room availability table
- Room name, user, start time, end time and status table
- Booked time chips for each room
- Available slot count
- `Book now` action
- Admin booking for self or another user using user ID
- Admin can view all reservations
- Member can view own reservations
- Reservation conflict prevention with 10-minute buffer
- User-friendly success and error toast notifications
- Reservation cancellation
- Check-in and check-out
- Instant booking for 15, 30, 45 or 60 minutes
- Active session extension by 15 or 30 minutes
- No-show automatic cancellation after 15 minutes

### Interactive timeline

- Date-based room timeline
- 30-minute free/booked slots
- Free slots are clickable and open the booking modal
- Booked slots are disabled and visually marked

### Usage tracking and quota

- Usage logs generated from check-out
- Actual consumed minutes and billable minutes
- User usage summary for admins
- Meeting count per user
- Used hours and remaining hours
- Name/email filtering
- Company-specific monthly quota support
- CSV export
- JSON export

### Dashboard and UI

- Dynamic overview dashboard
- Dynamic room count, usage and upcoming reservation stats
- Upcoming reservations table
- Admin room analytics and occupancy summary
- Full-width profile page
- Route-based active sidebar navigation
- Sign-out button fixed at the bottom of the sidebar
- Responsive tables and modal layouts
- Prettier formatting applied to client and server code

### Maintenance

- Admin maintenance schedule creation
- Maintenance list table
- Maintenance deletion
- Room maintenance conflict validation
- New reservations are blocked during maintenance windows

### Audit and security

- Audit records for reservation and room actions
- Admin audit log table
- Global rate limiting
- JSON request body limit
- Proxy-aware Express configuration
- Prisma PostgreSQL integration
- Local database and Prisma Studio support

## Skipped Requirements

The following two SRS requirements were intentionally skipped:

### 1. Email/SMS reminders

Automated reminders 15 minutes before a booking, including one-click check-in links, were skipped because no SMTP or SMS provider credentials/configuration were supplied.

### 2. SSO login

Google Workspace and Microsoft Entra ID login were skipped because OAuth application credentials, tenant configuration and callback URLs were not supplied.

The current authentication remains email/phone plus password based.

## Important API Areas

```text
POST   /api/v1/auth/login
GET    /api/v1/auth/users              # Admin only

GET    /api/v1/rooms
POST   /api/v1/rooms                    # Admin only
PATCH  /api/v1/rooms/:id                # Admin only
DELETE /api/v1/rooms/:id                # Admin only

GET    /api/v1/reservations
POST   /api/v1/reservations
POST   /api/v1/reservations/instant
POST   /api/v1/reservations/:id/cancel
POST   /api/v1/reservations/:id/check-in
POST   /api/v1/reservations/:id/check-out
POST   /api/v1/reservations/:id/extend

GET    /api/v1/usage
GET    /api/v1/maintenance
POST   /api/v1/maintenance                # Admin only
DELETE /api/v1/maintenance/:id             # Admin only
GET    /api/v1/audit                       # Admin only
```

## Local Development

### Backend

```bash
cd crms-server
npm install
npm run prisma:generate
npm run prisma:db-push
npm run prisma:seed
npm run start:dev
```

### Frontend

```bash
cd crms-client
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:3000
```

Backend URL:

```text
http://localhost:5000
```

## Seed Credentials

```text
Admin email: admin@crms.local
Admin phone: 01700000001
Admin password: Admin@12345

User email: user@crms.local
User phone: 01700000002
User password: User@12345
```

## Validation Completed

- Client Prettier formatting
- Server Prettier formatting
- Client TypeScript check: `npx tsc --noEmit`
- Server TypeScript check: `npx tsc --noEmit`
- Prisma database synchronization
- Prisma Studio database verification

## Production Checklist

- Set production `DATABASE_URL`
- Replace development `JWT_SECRET`
- Set production frontend URL in CORS configuration
- Enable secure cookies in production
- Run Prisma migrations/deploy
- Run client and server production builds
- Configure HTTPS and reverse proxy
- Perform final end-to-end testing
