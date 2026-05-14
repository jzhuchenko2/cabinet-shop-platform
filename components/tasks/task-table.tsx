export type TaskRow = {
  id?: string;
  title: string;
  department: string;
  assignee: string;
  dueDate: string;
  status: "TODO" | "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELED";
  priority?: string;
  scope?: string;
};

const taskStatuses = ["TODO", "READY", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELED"] as const;

type UpdateStatusAction = (formData: FormData) => void | Promise<void>;

function StatusBadge({ status }: { status: TaskRow["status"] }) {
  return (
    <span
      className={
        status === "BLOCKED"
          ? "status-pill blocked"
          : status === "DONE"
            ? "status-pill done"
            : "status-pill ready"
      }
    >
      {status.replace("_", " ")}
    </span>
  );
}

export function TaskTable({
  tasks,
  updateStatusAction
}: {
  tasks: TaskRow[];
  updateStatusAction?: UpdateStatusAction;
}) {
  if (tasks.length === 0) {
    return <p className="muted">No tasks have been added to this project yet.</p>;
  }

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Task</th>
          <th>Department</th>
          <th>Assignee</th>
          <th>Scope</th>
          <th>Priority</th>
          <th>Due</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {tasks.map((task) => (
          <tr key={task.id ?? `${task.title}-${task.department}-${task.dueDate}`}>
            <td>{task.title}</td>
            <td>{task.department}</td>
            <td>{task.assignee}</td>
            <td>{task.scope ?? "Project"}</td>
            <td>{task.priority ?? "NORMAL"}</td>
            <td>{task.dueDate}</td>
            <td>
              {updateStatusAction && task.id ? (
                <form action={updateStatusAction} className="task-status-control">
                  <input name="taskId" type="hidden" value={task.id} />
                  <StatusBadge status={task.status} />
                  <select aria-label={`Change status for ${task.title}`} name="status" defaultValue={task.status}>
                    {taskStatuses.map((status) => (
                      <option key={status} value={status}>
                        {status.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                  <button className="button secondary" type="submit">
                    Update
                  </button>
                </form>
              ) : (
                <StatusBadge status={task.status} />
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
