# Cabinet Shop Platform

A cabinet shop operating system for managing custom cabinet projects from first sales conversation through install and closeout.

## What It Is

Cabinet Shop Platform is a purpose-built workflow and operations app for cabinet shops. It is intended to help teams track projects, departments, files, approvals, schedules, purchasing, production tasks, installation, and closeout in one place.

## Who It Serves

This product is for cabinet shop owners, managers, sales teams, designers, shop leads, finish teams, installers, and office staff who need a shared source of truth for custom cabinet jobs.

## Core Problem

Many cabinet shops run on a mix of whiteboards, spreadsheets, text messages, paper folders, and general construction software that does not match the way cabinet work actually moves through a shop. That creates missed details, unclear ownership, duplicate communication, schedule surprises, and expensive rework.

## Target Tech Stack

- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Supabase
- Vercel

## Running The App

The application is scaffolded as a Next.js App Router project. Install dependencies, configure environment variables, and start the dev server:

```bash
npm install
npm run dev
```

Then open the local development URL printed by Next.js.

## Database Setup

Copy `.env.example` to `.env`. For local Docker-based development, start the included Postgres service first:

```bash
docker compose up -d
```

The default local `DATABASE_URL` uses port `5433` so it does not conflict with an existing PostgreSQL install on `5432`.

Then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The seed creates one sample organization, the default cabinet-shop departments, users, a client, a project, areas, cabinet items, tasks, notes, files/photos metadata, notifications, and time logs.

## Vercel Deployment

Use Supabase Postgres for the production database. In Vercel, keep one project connected to the GitHub repo, set the production branch to `main`, and add these environment variables for Production, Preview, and Development:

```bash
DATABASE_URL="Supabase pooled/runtime connection string"
DIRECT_URL="Supabase direct/session connection string for Prisma migrations"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your public publishable key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="legacy public anon key, optional if publishable key is set"
SUPABASE_SERVICE_ROLE_KEY="your server-only service role key"
```

Apply committed migrations to production with:

```bash
npm run prisma:deploy
```

The production build runs `prisma generate && next build` so Vercel has a generated Prisma client before compiling the Next.js app. Run migrations from your machine or a trusted CI step before redeploying; do not rely on `next build` to change the production database schema.

Use `npm run prisma:seed` against production only when you intentionally want the demo organization and sample cabinet-shop records in that database.

## Current MVP Persistence

Project creation, project list, project detail, project areas/cabinet items, and project tasks are wired to Prisma/PostgreSQL. Configure `DATABASE_URL`, run the Prisma setup commands above, and seed the database before using the project flow locally.
