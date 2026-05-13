export type TimeLogRow = {
  user: string;
  department: string;
  minutes: number;
  workDate: string;
  notes: string;
};

export function TimeLogList({ timeLogs }: { timeLogs: TimeLogRow[] }) {
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
          <tr key={`${log.user}-${log.workDate}-${log.department}`}>
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

