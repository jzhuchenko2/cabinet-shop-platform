# Time Clock

The live time clock uses `TimeClockEntry` records.

- An entry with `endedAt = null` means the worker is currently clocked in.
- Active entries can be assigned to a project and task before or during the shift.
- Clock-in and clock-out actions run on the server and validate the current user.
- Managers and owners can view active entries on the dashboard.
- Managers and owners can manage all active time cards from `/time-cards`.
- Employees can view and manage only their own time card from `/time-cards`.
- Employee clock-out opens a review modal before submission so the worker can confirm shift/day/week hours, project, task, and optional notes.
- The `/time-cards` page keeps detailed live, completed, and project-log tables in one tabbed modal to keep the employee view focused.
- When a project is selected and the worker clocks out, a completed labor entry is written to `TimeLog`.

Future proximity verification should attach to the clock entry instead of collecting background location. Good candidates are shop Wi-Fi validation, a QR/NFC station, or a coarse geofence confirmation.
