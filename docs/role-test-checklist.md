# Role Test Checklist

Use this checklist before pushing RBAC-related changes or before validating a Vercel deployment.

## Local Setup

1. Start the cabinet app:

```bash
npm run dev -- -p 3100
```

2. Open:

```text
http://localhost:3100/sign-in
```

3. Test at least these demo users:

- Manager: `Manager - Morgan Manager`
- Employee: `Employee - Casey Worker`

## Manager Access

Sign in as `Manager - Morgan Manager`.

Expected dashboard:

- Full dashboard appears at `/dashboard`.
- Dashboard title is `Dashboard`.
- Project status chart is visible.
- Stat cards are visible.
- Notification bell, client archive icon, and `New project` button are visible.
- Calendar, Time Cards, and Settings utility icons are visible.

Expected sidebar:

- Dashboard
- Projects
- Shop Floor
- Sales
- Design
- Engineering

Routes that should load:

- `/dashboard`
- `/projects`
- `/projects/new`
- `/clients`
- `/shop-floor`
- `/sales`
- `/design`
- `/engineering`
- `/calendar`
- `/settings`

Project workflow checks:

- `/projects/new` shows the new project form.
- `/projects` shows project cards.
- Project task pages show the task creation form.
- Project areas pages show area and cabinet item forms.
- Project time-log pages are accessible.

## Employee Access

Sign in as `Employee - Casey Worker`.

Expected dashboard:

- Employee task-focused dashboard appears at `/dashboard`.
- Page title says `Welcome, Casey Worker`.
- `My task queue` is visible.
- Time clock card is visible.
- Full manager dashboard, project status chart, and company-wide stats are not shown.

Expected sidebar:

- Dashboard only, unless the user has assigned project access that makes limited project navigation available.
- Calendar and Time Cards utility icons are visible.
- Settings utility icon is not visible.
- No Clients link.
- No Sales link.
- No Design link.
- No Engineering link.
- No Shop Floor link.

Routes that should show access denied:

- `/projects/new`
- `/clients`
- `/sales`
- `/design`
- `/engineering`
- `/shop-floor`
- `/settings`

Limited access routes:

- `/projects` should show only projects tied to the employee's assigned tasks.
- `/calendar` should show only projects and tasks tied to the employee's accessible work.
- A project detail route should only work if the employee has an assigned task on that project.
- A project task page should only show tasks assigned to that employee.

Task checks:

- Employee can update status on their assigned task.
- Employee cannot create new tasks.
- Employee cannot create project areas.
- Employee cannot create cabinet items.
- Employee cannot view all clients.
- Employee cannot view manager time-log pages.

## Direct URL Protection

While signed in as Employee, manually type these URLs:

```text
http://localhost:3100/clients
http://localhost:3100/projects/new
http://localhost:3100/sales
http://localhost:3100/design
http://localhost:3100/engineering
http://localhost:3100/shop-floor
```

Expected result:

- Each page should show `Access denied`.
- The app should not expose manager-only lists, controls, clients, or forms.

## Backend / Server Action Checks

These checks verify that access is not only hidden in the UI.

While signed in as Employee:

- Open an assigned project task page and update one of the employee's task statuses. It should update.
- Try to access `/projects/new`. The create project form should not render.
- Try to access a project areas page. Edit forms should not render unless the user has manager permissions.

While signed in as Manager:

- Create project form should render.
- Task creation form should render.
- Area and cabinet item forms should render.
- Time logs should render.

## Seed Data

If demo users or assigned tasks are missing, reseed:

```bash
npm run prisma:seed
```

Seeded users:

- `admin@example.com`: Owner/Admin
- `manager@example.com`: Manager
- `sam@example.com`: Department Lead
- `casey@example.com`: Employee

## Deployment Check

After pushing, verify Vercel Preview and Production:

- Latest deployment is green.
- `DATABASE_URL` and `DIRECT_URL` exist for the deployed environment.
- Preview env vars are configured if validating PR/dev deployments.
