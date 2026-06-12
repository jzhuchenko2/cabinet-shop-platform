# Supabase and Vercel Deployment

## Recommended Setup

Use one Supabase project for production data and one Vercel project for this GitHub repository. If there are duplicate Vercel projects connected to the same repo, keep the one with the intended production domain and disconnect or ignore the duplicate to avoid deploying the wrong project.

## Supabase

Create a Supabase project and copy these values:

- Project URL
- Public publishable key, or anon key if publishable key is not shown
- Database pooled connection string
- Database direct connection string
- Service role key, kept server-only

For Prisma, use the pooled/runtime connection string as `DATABASE_URL` and the direct/session connection string as `DIRECT_URL`.

## Vercel Environment Variables

Add these variables in the Vercel project for Production, Preview, and Development:

```bash
DATABASE_URL="Supabase pooled/runtime connection string"
DIRECT_URL="Supabase direct/session connection string"
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your public publishable key"
NEXT_PUBLIC_SUPABASE_ANON_KEY="optional legacy anon key"
SUPABASE_SERVICE_ROLE_KEY="server-only service role key"
```

After saving environment variables, redeploy. Existing deployments do not automatically receive newly added environment variables.

If Vercel fails during `Collecting page data` with a Prisma stack trace, verify the failed environment has these variables set. Preview and Production each need their own values unless the variables are shared across all environments.

## Database Migration

Run migrations against Supabase before relying on the deployed app:

```bash
npm run prisma:deploy
```

Seed production only when demo data is wanted:

```bash
npm run prisma:seed
```

## Build

The app build script runs:

```bash
prisma generate && next build
```

This ensures Prisma Client is generated on Vercel before Next.js compiles the app.
