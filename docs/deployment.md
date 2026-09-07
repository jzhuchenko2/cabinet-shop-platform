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

### CalendarEvent RLS warning

Migration `20260907000000_secure_calendar_events` fixes Supabase's **RLS Disabled
in Public** warning for `public."CalendarEvent"`. It enables row-level security
and revokes table privileges from `PUBLIC`, `anon`, and `authenticated`. It does
not change or delete calendar records. Supabase client roles are checked before
revoking privileges so the migration also works on plain local PostgreSQL.

Calendar data is accessed through server-side Prisma, with organization and
visibility checks in `lib/db/calendar.ts`. There are intentionally no client RLS
policies on this table. The `DATABASE_URL` role must own the table (without
`FORCE ROW LEVEL SECURITY`) or have `BYPASSRLS`, plus the necessary table
privileges. The current Supabase connection uses `postgres`, which has
`BYPASSRLS`. Enabling RLS does not replace the application's authentication or
authorization checks. See [Supabase's RLS documentation](https://supabase.com/docs/guides/database/postgres/row-level-security).

The current `lib/auth.ts` still selects a user from a demo email cookie and
defaults to an administrator. Production authentication and trusted user/role
mapping remain separate work before using real shop data.

After running `npm run prisma:deploy`, rerun Supabase's Security Advisor and
check the table in the SQL Editor:

```sql
SELECT relrowsecurity AS rls_enabled
FROM pg_class
WHERE oid = 'public."CalendarEvent"'::regclass;

SELECT role_name,
       has_table_privilege(role_name, 'public."CalendarEvent"', 'SELECT') AS can_select,
       has_table_privilege(role_name, 'public."CalendarEvent"', 'INSERT') AS can_insert,
       has_table_privilege(role_name, 'public."CalendarEvent"', 'UPDATE') AS can_update,
       has_table_privilege(role_name, 'public."CalendarEvent"', 'DELETE') AS can_delete,
       has_table_privilege(role_name, 'public."CalendarEvent"', 'TRUNCATE') AS can_truncate
FROM (VALUES ('anon'), ('authenticated')) AS client_roles(role_name);
```

Expect `rls_enabled = true` and every client privilege above to be `false`. Open
the app's calendar to confirm server access still works. An **RLS Enabled No
Policy** informational finding is expected for this server-only table; do not
add an allow-all policy to silence it.

For future server-only tables in `public`, include RLS and client grant
restrictions in the same migration that creates the table. Prisma-generated
table migrations do not enable RLS automatically. A Vercel app build does not
apply database migrations; run the migration command separately.

### Seed data

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
