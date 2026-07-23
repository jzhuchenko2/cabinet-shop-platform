# Workflow

The platform should model the real department flow of a cabinet shop. Each project should be able to move through these stages, with clear ownership, status, files, notes, and blockers.

## Department Flow

1. Sales
2. Design
3. Engineering
4. Milling
5. Construction
6. Finish
7. Delivery
8. Install

Managers can customize the active workflow from Settings. The seeded flow gives each shop a practical starting point, but active stages can be renamed, reordered, hidden, restored, and expanded with any unused built-in stage type. Hidden stages stay in the database so historical projects, tasks, users, and time logs remain intact.

## Default Department Deadlines

- Sales: 2 business days
- Design: 5 business days
- Engineering: 3 business days
- Milling: 2 business days
- Construction: 6 business days
- Finish: 4 business days
- Delivery: 1 business day
- Install: 2 business days

## Workflow Principles

- Every project has a current stage.
- Every stage can have tasks, notes, files, dates, deadlines, and blockers.
- Handoffs should be visible to the next department.
- Engineering and finish review steps should preserve history.
- The system should make it easy to see what is ready, waiting, blocked, or complete.
- The dashboard should show each active project as a status row, with department blocks indicating completed work, work needing effort, and upcoming stages.
- The manager dashboard should show a combined shop-flow chart above individual project rows so managers can scan overall shop health first.
- Dashboard flow charts and new-project department choices read from the manager-configured active workflow.
- The live time clock should start as a compact dashboard summary and expand into details only when clicked.
- Task status changes revalidate the dashboard project chart, and the manager dashboard refreshes while open so department flow rows stay current during shop updates.
- Department steps show logged hours from project time logs grouped by department.
