# Cabinet Shop Platform Functional Specifications

## Product Purpose

Cabinet Shop Platform is a desktop-first operating system for custom cabinet shops. It gives owners, managers, designers, purchasers, shop leads, installers, and office staff one place to track jobs from first sales conversation through install and closeout.

The MVP focuses on visibility, ownership, department handoffs, job files, notes, and time logs. It is not intended to replace accounting, payroll, estimating, or a full ERP system in the first release.

## User Roles

- Owner/Admin: manages the shop, users, projects, departments, and overall workflow visibility.
- Manager: oversees active jobs, blockers, overdue work, department handoffs, and assignments.
- Sales: starts projects and captures client/job basics.
- Designer: owns drawings, revisions, approvals, and design-related tasks.
- Purchaser: tracks purchasing tasks, materials, hardware, and readiness for production.
- Shop Lead: coordinates production work across shop departments.
- Department User: completes assigned department work and logs progress/time.
- Installer: tracks delivery, install, punch work, and closeout updates.

## Core Workflow

Every project moves through the cabinet-shop department flow:

1. Sales
2. Design
3. Approval
4. Scheduling
5. Purchasing
6. Cut/Mill
7. Face Frame
8. Assembly
9. Sand/Prep
10. Finish
11. Final Assembly
12. QC
13. Delivery
14. Install
15. Closeout

Each project has one current department stage. Departments can own tasks, blockers, notes, files, due dates, and time logs.

## Visual Identity

- The app should feel connected to AZ Custom Cabinetry's public brand while staying useful as an internal operations tool.
- Primary colors are matte charcoal/deep black, warm orange, muted gold, light gray, and white work surfaces.
- Orange is used for brand marks, primary actions, focus states, and important workflow accents.
- Charcoal is used for the app shell and high-contrast navigation.
- Large marketing-style hero layouts should be avoided inside the product; the interface should stay dense, clear, and desktop-first.

## MVP Functional Requirements

### Authentication

- Users can sign in.
- Each user has a role and may belong to a department.
- Supabase Auth is the intended production authentication provider.
- The local app profile stores user name, email, role, department, and organization/shop.

### Positions And Permissions

- Each customer/shop should be able to create and manage custom positions within departments.
- A department can have multiple positions, such as Paint Lead, Painter, Shop Manager, Designer, Installer, Purchaser, or Office Admin.
- Users should be assigned to a position, and that position should determine what the user can view and what actions they can take.
- There should be one true account owner/admin per shop who can control everything.
- Shop managers may be allowed to see most operational data and create/assign work, but pricing/cost visibility should be controlled by a separate permission.
- Department-specific users, such as Paint Department users, should be able to see only the plans, timelines, tasks, files, and notes that are relevant to their scope of work unless granted broader access.
- Permissions should support both view access and action access.
- Permissions should support scopes such as own work, assigned projects, department, or all shop data.

Example permission categories:

- View projects
- View plans/drawings
- View timelines
- View tasks
- View files/photos
- View notes
- View pricing/costs
- View all departments
- Create projects
- Edit projects
- Create tasks
- Assign tasks
- Complete tasks
- Upload files/photos
- Add notes
- Approve work
- Change project stage
- Manage users
- Manage departments
- Manage positions
- Manage permissions
- Delete records

Recommended future data model additions:

- `Position`: custom position within an organization and optional department.
- `Permission`: system-defined permission key and label.
- `PositionPermission`: enabled permission plus scope for a position.
- `UserPosition`: assignment of users to positions, if users may eventually hold more than one position.
- `AuditLog`: records important admin/security changes such as permission edits, user role changes, and deleted records.

### Dashboard

- Shows high-level active project counts, blocked work, and due work.
- Shows the shop workflow in order.
- Gives managers a quick path to create a new project.

### Projects

- Users can view a project list.
- Users can create a new project with project name, client, current department, and due date.
- A new project should appear on the project list after creation.
- Opening a project shows client, current stage, project links, basic metrics, and recent notes.
- Production persistence target: projects are stored in PostgreSQL through Prisma.
- Current MVP behavior: new projects are saved to PostgreSQL through Prisma and appear on the project list/detail pages.

### Clients

- Clients represent customers, builders, remodelers, or homeowners.
- A client can have contact name, email, phone, address, notes, and related projects.
- Creating a project should associate it with a client.

### Areas And Cabinet Items

- Projects can be broken into areas or rooms, such as kitchen, island, pantry, mudroom, or vanity.
- Areas can contain cabinet items.
- Cabinet items can track item number, type, quantity, dimensions, material, finish, hardware, and status.
- Current MVP behavior: project areas and cabinet items are listed from PostgreSQL, and users can add basic areas and cabinet items from the project areas page.

### Tasks

- Tasks belong to a project.
- Tasks may optionally belong to an area, cabinet item, and department.
- Tasks can be assigned to a user.
- Tasks track title, description, status, priority, due date, completion date, blocked state, and blocked reason.
- Task statuses are TODO, READY, IN_PROGRESS, BLOCKED, DONE, and CANCELED.
- Current MVP behavior: project tasks are listed from PostgreSQL, users can add basic tasks from the project tasks page, and task statuses can be updated from the task table.

### Department Board

- Departments are shown in the standard workflow order.
- Department views show active jobs, active tasks, and blockers.
- Managers should be able to see what is ready for handoff and what needs attention.

### Notes

- Notes can be attached to projects, areas, cabinet items, and tasks.
- Notes preserve job history, approvals, changes, issues, QC comments, and install updates.
- Notes show author and timestamp.

### Files And Photos

- Files can represent documents, drawings, approvals, cut lists, hardware lists, and other job documents.
- Photos can represent jobsite references, finish samples, production progress, delivery, install, and punch work.
- Files and photos store metadata in PostgreSQL and object paths in Supabase Storage.

### Notifications

- Users receive notifications for assigned tasks, due tasks, blocked tasks, stage changes, file uploads, and new notes.
- Notifications can be read or unread.
- Notifications may optionally link to a project.

### Time Logs

- Users can log time against projects.
- Time logs may optionally attach to a department, area, cabinet item, or task.
- Time logs track user, minutes, work date, and notes.

## Data Model Summary

The MVP data model includes:

- Organizations
- Users
- Departments
- Clients
- Projects
- Areas
- Cabinet items
- Tasks
- Notes
- Files
- Photos
- Notifications
- Time logs

Organizations are the tenant boundary for the SaaS product. Departments are configurable records per organization but use the fixed workflow keys listed above.

## Current Local MVP Behavior

- The app is scaffolded with Next.js, TypeScript, Prisma, and Supabase client setup.
- The project creation form uses a server action and Prisma-backed persistence.
- Project list and project detail pages read from PostgreSQL through Prisma.
- The project areas page reads areas/cabinet items from PostgreSQL and supports basic creation.
- The project tasks page reads tasks from PostgreSQL and supports basic task creation and status updates.
- Static sample data is still used for most dashboard, client, department detail, file, photo, notification, and time-log subviews.
- Prisma schema and seed data are available for the backend persistence layer.

## Acceptance Criteria For The First Vertical Slice

- A user can open the dashboard.
- A user can create a new Prisma-backed project from `/projects/new`.
- The created project redirects to its project detail page.
- The created project appears on `/projects`.
- The project detail page links to areas, tasks, files, photos, and time logs.
- Prisma schema validates successfully when `DATABASE_URL` is configured.
- Production build completes successfully.
- Seed data can create one sample shop, departments, users, client, project, areas, cabinet items, tasks, notes, files/photos metadata, notifications, and time logs.

## Future Implementation Priorities

1. Add real Supabase Auth sign-in and session handling.
2. Expand area and cabinet item editing beyond basic creation.
3. Expand task editing beyond creation/status updates.
4. Add CRUD flows for notes, files/photos, and time logs.
5. Add department board filtering and blocker/due-date views.
6. Add Supabase Storage upload handling.
7. Add notification creation for key workflow events.
8. Add role-based access controls.
9. Add customizable department positions and scoped permissions.
10. Add admin settings screens for users, departments, positions, and permissions.
11. Add a pricing/cost visibility permission separate from general project visibility.
12. Add audit logging for permission, position, user, and destructive record changes.

## Permissions Module To-Dos

- Define the first list of system permission keys.
- Decide whether users can have one position or multiple positions.
- Add Prisma models for positions, permissions, position permissions, and audit logs.
- Seed default positions for common cabinet shop workflows.
- Build admin-only settings pages for managing departments, positions, users, and permissions.
- Add server-side permission checks before sensitive reads and writes.
- Add UI-level guards so users only see navigation items, buttons, and actions they can use.
- Add special protection so only the account owner can transfer ownership, grant full admin access, or change pricing visibility.
