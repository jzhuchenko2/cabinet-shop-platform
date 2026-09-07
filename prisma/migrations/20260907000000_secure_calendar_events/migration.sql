BEGIN;

-- Calendar events are accessed through server-side Prisma. Organization and
-- visibility permissions are enforced in lib/db/calendar.ts, not the Data API.
ALTER TABLE public."CalendarEvent" ENABLE ROW LEVEL SECURITY;

-- Keep client roles from accessing this server-only table, including operations
-- such as TRUNCATE that are not governed by RLS. No client policies are needed.
REVOKE ALL PRIVILEGES ON TABLE public."CalendarEvent" FROM PUBLIC;

-- Supabase defines these roles; plain local PostgreSQL installations may not.
DO $$
DECLARE
    client_role TEXT;
BEGIN
    FOR client_role IN
        SELECT rolname FROM pg_roles WHERE rolname IN ('anon', 'authenticated')
    LOOP
        EXECUTE format(
            'REVOKE ALL PRIVILEGES ON TABLE public."CalendarEvent" FROM %I',
            client_role
        );
    END LOOP;
END;
$$;

COMMIT;
