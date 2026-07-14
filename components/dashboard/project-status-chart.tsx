import Link from "next/link";
import { departmentWorkflow } from "@/lib/constants/workflow";
import type { listDashboardProjectStatuses } from "@/lib/db/projects";

type DashboardProject = Awaited<ReturnType<typeof listDashboardProjectStatuses>>[number];

type DepartmentBlockStatus = "complete" | "needs-effort" | "upcoming";

const handoffReadyStatuses = ["READY", "DONE", "CANCELED"];
const activeWorkStatuses = ["TODO", "IN_PROGRESS"];

function getCurrentWorkflowIndex(project: DashboardProject) {
  return departmentWorkflow.findIndex((department) => department.key === project.currentDepartment?.workflowKey);
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

function getNeedsEffortIndex(project: DashboardProject) {
  const currentIndex = getCurrentWorkflowIndex(project);

  if (currentIndex < 0) {
    return -1;
  }

  const earliestBlockedThroughCurrentIndex = departmentWorkflow.findIndex(
    (department, index) => index <= currentIndex && hasBlockedTask(project, department.key)
  );

  if (earliestBlockedThroughCurrentIndex >= 0) {
    return earliestBlockedThroughCurrentIndex;
  }

  const currentDepartment = departmentWorkflow[currentIndex];

  if (project.isBlocked || hasActiveWorkTask(project, currentDepartment.key)) {
    return currentIndex;
  }

  if (!isDepartmentHandoffReady(project, currentDepartment.key)) {
    return currentIndex;
  }

  const nextBlockedIndex = departmentWorkflow.findIndex(
    (department, index) => index > currentIndex && hasBlockedTask(project, department.key)
  );

  if (nextBlockedIndex >= 0) {
    return nextBlockedIndex;
  }

  const nextActiveWorkIndex = departmentWorkflow.findIndex(
    (department, index) => index > currentIndex && hasActiveWorkTask(project, department.key)
  );

  return nextActiveWorkIndex;
}

function getDepartmentBlockStatus(project: DashboardProject, workflowKey: string): DepartmentBlockStatus {
  const currentIndex = departmentWorkflow.findIndex((department) => department.key === project.currentDepartment?.workflowKey);
  const stageIndex = departmentWorkflow.findIndex((department) => department.key === workflowKey);
  const needsEffortIndex = getNeedsEffortIndex(project);

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

export function ProjectStatusChart({ projects }: { projects: DashboardProject[] }) {
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
                {departmentWorkflow.map((department) => {
                  const status = getDepartmentBlockStatus(project, department.key);
                  const loggedMinutes = getDepartmentLoggedMinutes(project, department.key);

                  return (
                    <li
                      className={`project-flow-step ${status}`}
                      key={department.key}
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
