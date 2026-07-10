"use client";

import { useFormStatus } from "react-dom";
import type { TimeCardProjectOption, TimeCardTaskOption } from "@/components/time-logs/time-clock-controls";

function SaveScopeButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button secondary" disabled={pending} type="submit">
      {pending ? "Saving..." : "Save scope"}
    </button>
  );
}

export function TimeCardScopeForm({
  action,
  entryId,
  notes,
  projectId,
  projectOptions,
  taskId,
  taskOptions
}: {
  action: (formData: FormData) => Promise<void>;
  entryId: string;
  notes: string;
  projectId: string;
  projectOptions: TimeCardProjectOption[];
  taskId: string;
  taskOptions: TimeCardTaskOption[];
}) {
  return (
    <form action={action} className="time-card-scope-form">
      <input name="entryId" type="hidden" value={entryId} />
      <select aria-label="Project worked on" name="projectId" defaultValue={projectId}>
        <option value="">General shop time</option>
        {projectOptions.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name} - {project.client}
          </option>
        ))}
      </select>
      <select aria-label="Task worked on" name="taskId" defaultValue={taskId}>
        <option value="">No task selected</option>
        {taskOptions.map((task) => (
          <option key={task.id} value={task.id}>
            {task.projectName} - {task.title}
          </option>
        ))}
      </select>
      <input name="notes" placeholder="Notes" defaultValue={notes} />
      <SaveScopeButton />
    </form>
  );
}
