import Link from "next/link";
import type { listDashboardProjectStatuses } from "@/lib/db/projects";

type DashboardProject = Awaited<ReturnType<typeof listDashboardProjectStatuses>>[number];
type WorkflowDepartment = {
  id: string;
  name: string;
  workflowKey: string;
  sortOrder: number;
  deadlineLabel: string | null;
};

type DepartmentBlockStatus = "complete" | "needs-effort" | "upcoming";

const handoffReadyStatuses = ["READY", "DONE", "CANCELED"];
const activeWorkStatuses = ["TODO", "IN_PROGRESS"];

function getCurrentWorkflowIndex(project: DashboardProject, departments: WorkflowDepartment[]) {
  return departments.findIndex((department) => department.workflowKey === project.currentDepartment?.workflowKey);
}

function getDepartmentTasks(project: DashboardProject, workflowKey: string) {
  return project.tasks.filter((task) => task.department?.workflowKey === workflowKey);
}

function getDepartmentLoggedMinutes(project: DashboardProject, workflowKey: string) {
  return project.timeLogs
    .filter((log) => log.department?.workflowKey === workflowKey)
    .reduce((total, log) => total + log.minutes, 0);
}

function formatLoggedHours(minutes: number) {
  if (minutes <= 0) {
    return "0h";
  }

  const hours = Math.round((minutes / 60) * 10) / 10;

  return `${hours}h`;
}

function hasBlockedTask(project: DashboardProject, workflowKey: string) {
  return getDepartmentTasks(project, workflowKey).some((task) => task.isBlocked || task.status === "BLOCKED");
}

function hasActiveWorkTask(project: DashboardProject, workflowKey: string) {
  return getDepartmentTasks(project, workflowKey).some((task) => activeWorkStatuses.includes(task.status));
}

function isDepartmentHandoffReady(project: DashboardProject, workflowKey: string) {
  const tasks = getDepartmentTasks(project, workflowKey);

  return tasks.length > 0 && tasks.every((task) => handoffReadyStatuses.includes(task.status));
}

function getNeedsEffortIndex(project: DashboardProject, departments: WorkflowDepartment[]) {
  const currentIndex = getCurrentWorkflowIndex(project, departments);

  if (currentIndex < 0) {
    return -1;
  }

  const earliestBlockedThroughCurrentIndex = departments.findIndex(
    (department, index) => index <= currentIndex && hasBlockedTask(project, department.workflowKey)
  );

  if (earliestBlockedThroughCurrentIndex >= 0) {
    return earliestBlockedThroughCurrentIndex;
  }

  const currentDepartment = departments[currentIndex];

  if (project.isBlocked || hasActiveWorkTask(project, currentDepartment.workflowKey)) {
    return currentIndex;
  }

  if (!isDepartmentHandoffReady(project, currentDepartment.workflowKey)) {
    return currentIndex;
  }

  const nextBlockedIndex = departments.findIndex(
    (department, index) => index > currentIndex && hasBlockedTask(project, department.workflowKey)
  );

  if (nextBlockedIndex >= 0) {
    return nextBlockedIndex;
  }

  const nextActiveWorkIndex = departments.findIndex(
    (department, index) => index > currentIndex && hasActiveWorkTask(project, department.workflowKey)
  );

  return nextActiveWorkIndex;
}

function getDepartmentBlockStatus(project: DashboardProject, workflowKey: string, departments: WorkflowDepartment[]): DepartmentBlockStatus {
  const currentIndex = departments.findIndex((department) => department.workflowKey === project.currentDepartment?.workflowKey);
  const stageIndex = departments.findIndex((department) => department.workflowKey === workflowKey);
  const needsEffortIndex = getNeedsEffortIndex(project, departments);

  if (project.status === "COMPLETE") {
    return "complete";
  }

  if (stageIndex < 0 || currentIndex < 0) {
    return "upcoming";
  }

  if (needsEffortIndex < 0) {
    return stageIndex <= currentIndex ? "complete" : "upcoming";
  }

  if (stageIndex < needsEffortIndex) {
    return "complete";
  }

  if (stageIndex === needsEffortIndex) {
    return "needs-effort";
  }

  return "upcoming";
}

function getProjectStatusLabel(project: DashboardProject) {
  if (project.isBlocked || project.status === "BLOCKED") {
    return "Needs attention";
  }

  if (project.status === "ON_HOLD") {
    return "On hold";
  }

  return project.currentDepartment?.name ?? "Unassigned";
}

function formatDueDate(value: Date | null) {
  if (!value) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric"
  }).format(value);
}

export function ProjectStatusChart({ projects, departments }: { projects: DashboardProject[]; departments: WorkflowDepartment[] }) {
  return (
    <section className="card project-status-card">
      <div className="section-heading-row">
        <div>
          <h2>Project status</h2>
          <p className="muted">Active jobs by department stage.</p>
        </div>
        <div className="status-legend" aria-label="Project status legend">
          <span>
            <i className="status-key complete" /> Complete
          </span>
          <span>
            <i className="status-key needs-effort" /> Needs effort
          </span>
          <span>
            <i className="status-key upcoming" /> Upcoming
          </span>
        </div>
      </div>

      {projects.length === 0 ? (
        <p className="muted empty-state">No active projects are in the shop right now.</p>
      ) : (
        <div className="project-status-list">
          {projects.map((project) => (
            <Link className="project-status-row" href={`/projects/${project.id}`} key={project.id}>
              <div className="project-status-summary">
                <strong>{project.name}</strong>
                <span className="muted">
                  {project.client.name} · Due {formatDueDate(project.dueDate)}
                </span>
              </div>
              <ol className="project-status-track" aria-label={`${project.name} department status`}>
                {departments.map((department) => {
                  const status = getDepartmentBlockStatus(project, department.workflowKey, departments);
                  const loggedMinutes = getDepartmentLoggedMinutes(project, department.workflowKey);

                  return (
                    <li
                      className={`project-flow-step ${status}`}
                      key={department.id}
                      title={`${department.name}: ${status.replace("-", " ")}`}
                    >
                      <span className="project-flow-node" />
                      <span className="project-flow-label">{department.name}</span>
                      <span className="project-flow-hours">{formatLoggedHours(loggedMinutes)}</span>
                    </li>
                  );
                })}
              </ol>
              <span
                className={
                  project.isBlocked || project.status === "BLOCKED" ? "status-pill blocked" : "status-pill ready"
                }
              >
                {getProjectStatusLabel(project)}
              </span>
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}
