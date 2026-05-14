"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CreateTaskState } from "@/app/(app)/projects/[projectId]/tasks/actions";

const statuses = ["TODO", "READY", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELED"] as const;
const priorities = ["LOW", "NORMAL", "HIGH", "URGENT"] as const;

type Option = {
  id: string;
  name: string;
};

type CabinetItemOption = Option & {
  areaId: string | null;
  itemNumber: string | null;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Adding task..." : "Add task"}
    </button>
  );
}

export function TaskForm({
  action,
  areas,
  cabinetItems,
  departments,
  users
}: {
  action: (state: CreateTaskState, formData: FormData) => Promise<CreateTaskState>;
  areas: Option[];
  cabinetItems: CabinetItemOption[];
  departments: Option[];
  users: Option[];
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="card form">
      <h2>New task</h2>
      <div className="field">
        <label htmlFor="task-title">Task title</label>
        <input id="task-title" name="title" placeholder="Order drawer slides" required />
      </div>
      <div className="field">
        <label htmlFor="task-description">Description</label>
        <textarea id="task-description" name="description" placeholder="Notes, constraints, or handoff details" rows={3} />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="task-department">Department</label>
          <select id="task-department" name="departmentId">
            <option value="">Unassigned</option>
            {departments.map((department) => (
              <option key={department.id} value={department.id}>
                {department.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-assignee">Assignee</label>
          <select id="task-assignee" name="assigneeId">
            <option value="">Unassigned</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="task-area">Area</label>
          <select id="task-area" name="areaId">
            <option value="">Project level</option>
            {areas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-cabinet-item">Cabinet item</label>
          <select id="task-cabinet-item" name="cabinetItemId">
            <option value="">None</option>
            {cabinetItems.map((item) => (
              <option key={item.id} value={item.id}>
                {item.itemNumber ? `${item.itemNumber} - ` : ""}
                {item.name}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-3">
        <div className="field">
          <label htmlFor="task-status">Status</label>
          <select id="task-status" name="status" defaultValue="TODO">
            {statuses.map((status) => (
              <option key={status} value={status}>
                {status.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-priority">Priority</label>
          <select id="task-priority" name="priority" defaultValue="NORMAL">
            {priorities.map((priority) => (
              <option key={priority} value={priority}>
                {priority}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="task-due-date">Due date</label>
          <input id="task-due-date" name="dueDate" type="date" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="task-blocked-reason">Blocked reason</label>
        <input id="task-blocked-reason" name="blockedReason" placeholder="Waiting on customer approval" />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
