# Backlog

## First Tasks

1. Scaffold app - initial structure complete
2. Auth - placeholder screen and helper in place
3. Project model - Prisma schema and first Prisma-backed create/list/detail flow in place
4. Areas and cabinet items - Prisma-backed list/create flow in place
5. Tasks - Prisma-backed project task list/create/status update flow in place
6. Work-area navigation - Dashboard, Projects, Shop Floor, Sales, Design, and Engineering in place
7. File upload - placeholder route and schema metadata in place
8. Notifications - dashboard bell/panel in place with local read/unread persistence; next step is wiring to the Notification schema
9. Time logging - initial page/component and schema in place
10. Project task and area views - responsive layout polish added for narrower screens
11. Clients - moved to dashboard shortcut with active files and archived project history mockup
12. Dashboard workflow - updated to Sales, Design, Engineering, Milling, Construction, Finish, Delivery, and Install with department deadlines
13. Project cards - compact four-column grid added for desktop project scanning
14. Work-area pages - Shop Floor, Sales, Design, and Engineering expanded with working local MVP controls, queues, uploads, and checklists

## Notes

The first implementation pass should focus on getting a simple vertical slice working:

- Sign in
- Create a project with Prisma persistence
- Add areas and cabinet items
- Add tasks
- Move the project through the Sales, Design, Engineering, Milling, Construction, Finish, Delivery, and Install workflow
- Upload files
- See current status on the dashboard workflow and work-area views

## Future Specs

- Add clock-in and clock-out for cabinet-shop workers.
- Track project revenue and profitability in dollars.
- Support role-specific app access, including full manager access and restricted worker views without dashboard access.
