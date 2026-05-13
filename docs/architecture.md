# Architecture

## Stack Decision

The target stack is:

- Next.js for the web application
- TypeScript for application code
- PostgreSQL for the primary database
- Prisma for database schema and queries
- Supabase for hosted Postgres, auth, storage, and realtime capabilities where useful
- Vercel for deployment

## Initial App Shape

- `app/` will contain the Next.js app router pages, layouts, and route handlers.
- `components/` will contain shared UI components.
- `lib/` will contain shared utilities, data access helpers, auth helpers, and configuration.
- `prisma/` will contain the Prisma schema and migrations.

The initial scaffold now includes route groups for auth and the main app, reusable layout/UI components, workflow constants, database helper modules, a Prisma schema, and a seed script for the first MVP vertical slice.

## Early Data Model Direction

The first schema includes:

- Users
- Organizations or shops
- Departments
- Clients
- Projects
- Areas
- Cabinet items
- Tasks
- Notes
- Files and photos
- Time entries
- Notifications

## Deployment Direction

The first production path should be a Vercel-hosted Next.js app connected to Supabase Postgres, with environment variables managed per deployment environment.
