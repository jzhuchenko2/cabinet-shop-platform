import type { ProjectSummary } from "@/components/projects/project-summary-card";
import { departmentWorkflow, type DepartmentWorkflowKey } from "@/lib/constants/workflow";

export const demoProjectsStorageKey = "cabinet-shop-platform.projects";

export type StoredProject = ProjectSummary & {
  departmentKey: DepartmentWorkflowKey;
  createdAt: string;
};

export const sampleProjects: ProjectSummary[] = [
  {
    id: "sample-kitchen",
    name: "Anderson Kitchen",
    client: "Anderson Residence",
    department: "Design",
    dueDate: "May 10",
    status: "In progress"
  },
  {
    id: "sample-library",
    name: "Maple Library Built-Ins",
    client: "Harlow Homes",
    department: "Engineering",
    dueDate: "May 14",
    status: "Blocked"
  },
  {
    id: "sample-vanity",
    name: "Oak Vanity Package",
    client: "Ridgeline Remodel",
    department: "Milling",
    dueDate: "May 18",
    status: "Ready"
  }
];

export function getDepartmentName(key: string) {
  return departmentWorkflow.find((department) => department.key === key)?.name ?? "Sales";
}

export function formatProjectDate(value: string) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(`${value}T12:00:00`));
}

export function createProjectId(name: string) {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

  return `${slug || "project"}-${Date.now()}`;
}
