export type TimeLogRow = {
  id: string;
  user: string;
  department: string;
  minutes: number;
  task: string;
  workDate: string;
  notes: string;
};

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder}m`;
  }

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

export function TimeLogList({ timeLogs }: { timeLogs: TimeLogRow[] }) {
  if (timeLogs.length === 0) {
    return <p className="muted">No time logs have been recorded for this project yet.</p>;
  }

  const totalMinutes = timeLogs.reduce((total, log) => total + log.minutes, 0);

  return (
    <div className="grid">
      <div className="time-log-summary">
        <div>
          <span className="muted">Total project time</span>
          <strong>{formatMinutes(totalMinutes)}</strong>
        </div>
        <div>
          <span className="muted">Entries</span>
          <strong>{timeLogs.length}</strong>
        </div>
      </div>
      <table className="table responsive-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Department</th>
            <th>Task</th>
            <th>Total</th>
            <th>Date</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          {timeLogs.map((log) => (
            <tr key={log.id}>
              <td data-label="User">{log.user}</td>
              <td data-label="Department">{log.department}</td>
              <td data-label="Task">{log.task}</td>
              <td data-label="Total">{formatMinutes(log.minutes)}</td>
              <td data-label="Date">{log.workDate}</td>
              <td data-label="Notes">{log.notes}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
