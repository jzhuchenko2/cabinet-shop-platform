# AGENTS.md

## Project
This repository is for a cabinetry-specific project planning and shop management SaaS platform.

## Product goal
Build a desktop-first MVP for cabinet shops to manage:
- projects
- areas/rooms
- cabinet items
- department tasks
- due dates
- assignments
- files/photos
- notes
- time logs

## Target users
- owners
- project managers
- designers
- purchasing/material staff
- shop foremen
- department leads
- installers

## Default workflow
Sales -> Design -> Approval -> Scheduling -> Purchasing -> Cut/Mill -> Face Frame -> Assembly -> Sand/Prep -> Finish -> Final Assembly -> QC -> Delivery -> Install -> Closeout

## Technical direction
Use:
- Next.js
- TypeScript
- PostgreSQL
- Prisma
- Supabase
- Vercel

## Engineering rules
- Keep the codebase simple and MVP-focused.
- Prefer clear folder structure and typed interfaces.
- Do not add unnecessary dependencies.
- Ask before introducing major architectural changes.
- When implementing features, also update relevant docs in `docs/`.
- Favor reusable UI components.
- Create database models that match cabinet-shop workflow.
- Keep UI desktop-first.
- Validate changes by running lint/build/tests where available.

## MVP priorities
1. Auth
2. Projects
3. Areas
4. Cabinet items
5. Tasks
6. Departments
7. Assignments
8. Statuses
9. Files/photos/notes
10. Dashboard
11. Time logs