export type TaskRow = {
  title: string;
  department: string;
  assignee: string;
  dueDate: string;
  status: "TODO" | "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE";
};

export function TaskTable({ tasks }: { tasks: TaskRow[] }) {
  return (
    <table className="table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Department</th>
          <th>Assignee</th>
          <th>Due</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={`${task.title}-${task.department}`}>
            <td>{task.title}</td>
            <td>{task.department}</td>
            <td>{task.assignee}</td>
            <td>{task.dueDate}</td>
            <td>
              <span className={task.status === "BLOCKED" ? "status-pill blocked" : "status-pill ready"}>
                {task.status.replace("_", " ")}
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

