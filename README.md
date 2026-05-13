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

Copy `.env.example` to `.env`, set `DATABASE_URL` to a PostgreSQL database, then run:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run prisma:seed
```

The seed creates one sample organization, the default cabinet-shop departments, users, a client, a project, areas, cabinet items, tasks, notes, files/photos metadata, notifications, and time logs.
