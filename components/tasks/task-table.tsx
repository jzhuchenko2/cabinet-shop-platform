export type TaskRow = {
  id?: string;
  title: string;
  department: string;
  assignee: string;
  dueDate: string;
  status: "TODO" | "READY" | "IN_PROGRESS" | "BLOCKED" | "DONE" | "CANCELED";
  priority?: string;
  scope?: string;
  projectId?: string;
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
  updateStatusAction,
  showProjectIdInputs = false
}: {
  tasks: TaskRow[];
  updateStatusAction?: UpdateStatusAction;
  showProjectIdInputs?: boolean;
}) {
  if (tasks.length === 0) {
    return <p className="muted">No tasks have been added to this project yet.</p>;
  }

  return (
    <table className="table responsive-table task-table">
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
            <td data-label="Task">{task.title}</td>
            <td data-label="Department">{task.department}</td>
            <td data-label="Assignee">{task.assignee}</td>
            <td data-label="Scope">{task.scope ?? "Project"}</td>
            <td data-label="Priority">{task.priority ?? "NORMAL"}</td>
            <td data-label="Due">{task.dueDate}</td>
            <td data-label="Status">
              {updateStatusAction && task.id ? (
                <form action={updateStatusAction} className="task-status-control">
                  <input name="taskId" type="hidden" value={task.id} />
                  {showProjectIdInputs && task.projectId ? (
                    <input name="projectId" type="hidden" value={task.projectId} />
                  ) : null}
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
