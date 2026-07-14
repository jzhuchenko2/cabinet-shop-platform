import { departmentWorkflow } from "@/lib/constants/workflow";
import type { listDashboardProjectStatuses } from "@/lib/db/projects";

type DashboardProject = Awaited<ReturnType<typeof listDashboardProjectStatuses>>[number];
type DepartmentHealth = "complete" | "needs-effort" | "upcoming";

const handoffReadyStatuses = ["READY", "DONE", "CANCELED"];
const activeWorkStatuses = ["TODO", "IN_PROGRESS"];

function getDepartmentTasks(project: DashboardProject, workflowKey: string) {
  return project.tasks.filter((task) => task.department?.workflowKey === workflowKey);
}

function getCurrentWorkflowIndex(project: DashboardProject) {
  return departmentWorkflow.findIndex((department) => department.key === project.currentDepartment?.workflowKey);
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

  return departmentWorkflow.findIndex(
    (department, index) => index > currentIndex && hasActiveWorkTask(project, department.key)
  );
}

function getProjectDepartmentHealth(project: DashboardProject, workflowKey: string): DepartmentHealth {
  const currentIndex = getCurrentWorkflowIndex(project);
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

function formatHours(minutes: number) {
  if (minutes <= 0) {
    return "0h";
  }

  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export function ShopOverviewChart({ projects }: { projects: DashboardProject[] }) {
  const departmentSummaries = departmentWorkflow.map((department) => {
    const healthCounts = projects.reduce(
      (counts, project) => {
        const health = getProjectDepartmentHealth(project, department.key);
        counts[health] += 1;
        return counts;
      },
      { complete: 0, "needs-effort": 0, upcoming: 0 } as Record<DepartmentHealth, number>
    );
    const loggedMinutes = projects.reduce(
      (total, project) =>
        total +
        project.timeLogs
          .filter((log) => log.department?.workflowKey === department.key)
          .reduce((departmentTotal, log) => departmentTotal + log.minutes, 0),
      0
    );
    const dominantHealth: DepartmentHealth =
      healthCounts["needs-effort"] > 0 ? "needs-effort" : healthCounts.complete > 0 ? "complete" : "upcoming";
    const total = Math.max(projects.length, 1);

    return {
      ...department,
      completePercent: Math.round((healthCounts.complete / total) * 100),
      dominantHealth,
      loggedHours: formatHours(loggedMinutes),
      needsEffortCount: healthCounts["needs-effort"],
      upcomingCount: healthCounts.upcoming
    };
  });

  const healthScore =
    projects.length === 0
      ? 0
      : Math.round(
          (departmentSummaries.reduce((total, department) => total + department.completePercent, 0) /
            departmentSummaries.length) *
            10
        ) / 10;
  const activePressure = departmentSummaries.reduce((total, department) => total + department.needsEffortCount, 0);

  return (
    <section className="card shop-overview-card">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Shop health</p>
          <h2>Overall project flow</h2>
          <p className="muted">A combined view of how all active cabinet jobs are moving through the shop.</p>
        </div>
        <div className="shop-health-score">
          <span className="muted">Flow score</span>
          <strong>{healthScore}%</strong>
        </div>
      </div>

      <div className="shop-overview-meta">
        <span>{projects.length} active projects</span>
        <span>{activePressure} department checkpoints need effort</span>
      </div>

      <ol className="shop-overview-flow" aria-label="Combined project health by department">
        {departmentSummaries.map((department, index) => {
          const previousDepartment = departmentSummaries[index - 1];
          const connectorClass = previousDepartment?.dominantHealth === "complete" ? "from-complete" : "";

          return (
            <li className={`shop-overview-step ${department.dominantHealth} ${connectorClass}`} key={department.key}>
              <div className="shop-overview-node">
                <span>{department.completePercent}%</span>
              </div>
              <strong>{department.name}</strong>
              <small>{department.loggedHours}</small>
              <small>{department.needsEffortCount} active</small>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
