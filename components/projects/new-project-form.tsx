"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CreateProjectState } from "@/app/(app)/projects/new/actions";

type DepartmentOption = {
  id: string;
  name: string;
  workflowKey: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Creating project..." : "Create project"}
    </button>
  );
}

export function NewProjectForm({
  action,
  departments
}: {
  action: (state: CreateProjectState, formData: FormData) => Promise<CreateProjectState>;
  departments: DepartmentOption[];
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="card form">
      <div className="field">
        <label htmlFor="name">Project name</label>
        <input id="name" name="name" placeholder="Anderson Kitchen" required />
      </div>
      <div className="field">
        <label htmlFor="client">Client</label>
        <input id="client" name="client" placeholder="Anderson Residence" required />
      </div>
      <div className="field">
        <label htmlFor="department">Current department</label>
        <select id="department" name="department">
          {departments.map((department) => (
            <option key={department.id} value={department.workflowKey}>
              {department.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dueDate">Due date</label>
        <input id="dueDate" name="dueDate" type="date" />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
