"use client";

import { useEffect, useMemo, useState } from "react";
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
  const [selectedProjectId, setSelectedProjectId] = useState(projectId);
  const [selectedTaskId, setSelectedTaskId] = useState(taskId);
  const filteredTaskOptions = useMemo(
    () => taskOptions.filter((task) => selectedProjectId && task.projectId === selectedProjectId),
    [selectedProjectId, taskOptions]
  );

  useEffect(() => {
    if (selectedTaskId && !filteredTaskOptions.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId("");
    }
  }, [filteredTaskOptions, selectedTaskId]);

  return (
    <form action={action} className="time-card-scope-form">
      <input name="entryId" type="hidden" value={entryId} />
      <select
        aria-label="Project worked on"
        name="projectId"
        onChange={(event) => setSelectedProjectId(event.target.value)}
        required
        value={selectedProjectId}
      >
        <option value="">Select project</option>
        {projectOptions.map((project) => (
          <option key={project.id} value={project.id}>
            {project.name} - {project.client}
          </option>
        ))}
      </select>
      <select
        aria-label="Task worked on"
        name="taskId"
        onChange={(event) => setSelectedTaskId(event.target.value)}
        required
        value={selectedTaskId}
      >
        <option value="">{selectedProjectId ? "Select task" : "Select project first"}</option>
        {filteredTaskOptions.map((task) => (
          <option key={task.id} value={task.id}>
            {task.title}
          </option>
        ))}
      </select>
      <input name="notes" placeholder="Work notes" defaultValue={notes} />
      <SaveScopeButton />
    </form>
  );
}
