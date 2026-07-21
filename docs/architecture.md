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

Project PDF files are stored in Supabase Storage using the `SUPABASE_PROJECT_FILES_BUCKET` bucket. File metadata stays in Prisma, managers and owner/admins can create/update/delete PDFs, and project-scoped users receive short-lived signed preview and download links after server-side access checks. The server ensures the private bucket exists before upload, export, preview, download, or delete operations, so production only needs valid Supabase URL/service-role environment variables. Clicking a project file name or thumbnail opens an in-platform PDF viewer by default; Download remains a separate explicit action. Managers can edit file display name/type from the viewer and use the PDF markup layer for pen, highlight, box, arrow, text notes, page rotation, page deletion, editable annotation saves, and exported marked-up PDF revisions. Employees can view saved markups and download files, but cannot save annotations or create revisions.

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
