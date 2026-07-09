export type TimeLogRow = {
  id: string;
  user: string;
  department: string;
  minutes: number;
  workDate: string;
  notes: string;
};

export function TimeLogList({ timeLogs }: { timeLogs: TimeLogRow[] }) {
  if (timeLogs.length === 0) {
    return <p className="muted">No time logs have been recorded for this project yet.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>User</th>
          <th>Department</th>
          <th>Minutes</th>
          <th>Date</th>
          <th>Notes</th>
        </tr>
      </thead>
      <tbody>
        {timeLogs.map((log) => (
          <tr key={log.id}>
            <td>{log.user}</td>
            <td>{log.department}</td>
            <td>{log.minutes}</td>
            <td>{log.workDate}</td>
            <td>{log.notes}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
