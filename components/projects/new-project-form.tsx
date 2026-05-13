"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { departmentWorkflow, type DepartmentWorkflowKey } from "@/lib/constants/workflow";
import {
  createProjectId,
  demoProjectsStorageKey,
  formatProjectDate,
  getDepartmentName,
  type StoredProject
} from "@/lib/demo-projects";

function readStoredProjects() {
  const rawProjects = window.localStorage.getItem(demoProjectsStorageKey);

  if (!rawProjects) {
    return [];
  }

  try {
    return JSON.parse(rawProjects) as StoredProject[];
  } catch {
    return [];
  }
}

export function NewProjectForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const client = String(formData.get("client") ?? "").trim();
    const departmentKey = String(formData.get("department") ?? "SALES") as DepartmentWorkflowKey;
    const dueDate = String(formData.get("dueDate") ?? "");

    if (!name || !client) {
      setError("Project name and client are required.");
      setIsSubmitting(false);
      return;
    }

    const project: StoredProject = {
      id: createProjectId(name),
      name,
      client,
      departmentKey,
      department: getDepartmentName(departmentKey),
      dueDate: formatProjectDate(dueDate),
      status: "Ready",
      createdAt: new Date().toISOString()
    };

    const projects = readStoredProjects();
    window.localStorage.setItem(demoProjectsStorageKey, JSON.stringify([project, ...projects]));

    router.push(`/projects/${project.id}`);
  }

  return (
    <form className="card form" onSubmit={handleSubmit}>
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
          {departmentWorkflow.map((department) => (
            <option key={department.key} value={department.key}>
              {department.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="dueDate">Due date</label>
        <input id="dueDate" name="dueDate" type="date" />
      </div>
      {error ? <p className="form-error">{error}</p> : null}
      <button className="button" disabled={isSubmitting} type="submit">
        {isSubmitting ? "Creating project..." : "Create project"}
      </button>
    </form>
  );
}

