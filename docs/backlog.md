# Backlog

## First Tasks

1. Scaffold app - initial structure complete
2. Auth - placeholder screen and helper in place
3. Project model - Prisma schema and first Prisma-backed create/list/detail flow in place
4. Areas and cabinet items - Prisma-backed list/create flow in place
5. Tasks - Prisma-backed project task list/create/status update flow in place
6. Work-area navigation - Dashboard, Projects, Shop Floor, Sales, Design, and Engineering in place
7. File upload - project PDF upload/download with manager-only create/update/delete and employee view/download access in place
8. Notifications - dashboard bell/panel in place with local read/unread persistence; next step is wiring to the Notification schema
9. Time logging - initial page/component and schema in place
10. Project task and area views - responsive layout polish added for narrower screens
11. Clients - moved to dashboard shortcut with active files and archived project history mockup
12. Dashboard workflow - aggregate shop flow chart, compact live-clock summary, and project status row chart added for active jobs
13. Project cards - compact four-column grid added for desktop project scanning
14. Work-area pages - Shop Floor, Sales, Design, and Engineering expanded with working local MVP controls, queues, uploads, and checklists
15. RBAC foundation - owner/admin and manager full access, shop lead department access, employee task-focused dashboard and scoped task updates
16. RBAC test checklist - local manager vs employee access verification added in docs
17. Calendar - shared week/month project and task due-date calendar added with personal, company, and project layers; managers can customize company events

## Notes

The first implementation pass should focus on getting a simple vertical slice working:

- Sign in
- Create a project with Prisma persistence
- Add areas and cabinet items
- Add tasks
- Move the project through the Sales, Design, Engineering, Milling, Construction, Finish, Delivery, and Install workflow
- Upload files
- See current status on the dashboard workflow and work-area views
- Review personal events, company events, project install dates, project due dates, and task due dates on the shared shop calendar

## Future Specs

- Add clock-in and clock-out for cabinet-shop workers.
- Track project revenue and profitability in dollars.
- Support role-specific app access, including full manager access and restricted worker views without dashboard access.
