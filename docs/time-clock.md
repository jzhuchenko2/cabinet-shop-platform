# Time Clock

The live time clock uses `TimeClockEntry` records.

- An entry with `endedAt = null` means the worker is currently clocked in.
- Active entries can be assigned to a project and task before or during the shift.
- Clock-in and clock-out actions run on the server and validate the current user.
- Managers and owners can view active entries on the dashboard.
- Managers and owners can manage all active time cards from `/time-cards`.
- Employees can view and manage only their own time card from `/time-cards`.
- Employee clock-out opens a review modal before submission so the worker can confirm shift/day/week hours, project, task, and optional notes.
- Project and task are required at clock-out for every user. Managers cannot stop another user's live card until the card has both values.
- The `/time-cards` page keeps detailed live, completed, and project-log tables in one tabbed modal to keep the employee view focused.
- When the worker clocks out, a completed labor entry is written to `TimeLog` with project, task, department, minutes, work date, and notes.
- Project time pages summarize total logged time and show each entry's task and notes so managers can see how much time was spent and what work was done.

Future proximity verification should attach to the clock entry instead of collecting background location. Good candidates are shop Wi-Fi validation, a QR/NFC station, or a coarse geofence confirmation.
