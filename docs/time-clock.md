# Time Clock

The live time clock uses `TimeClockEntry` records.

- An entry with `endedAt = null` means the worker is currently clocked in.
- Clock-in and clock-out actions run on the server and validate the current user.
- Managers and owners can view active entries on the dashboard.
- Completed historical labor entries remain in `TimeLog`.

Future proximity verification should attach to the clock entry instead of collecting background location. Good candidates are shop Wi-Fi validation, a QR/NFC station, or a coarse geofence confirmation.
