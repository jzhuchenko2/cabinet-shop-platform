import type { listDashboardProjectStatuses } from "@/lib/db/projects";

type DashboardProject = Awaited<ReturnType<typeof listDashboardProjectStatuses>>[number];
type WorkflowDepartment = {
  id: string;
  name: string;
  workflowKey: string;
  sortOrder: number;
  deadlineLabel: string | null;
};
type DepartmentHealth = "complete" | "needs-effort" | "upcoming";

const handoffReadyStatuses = ["READY", "DONE", "CANCELED"];
const activeWorkStatuses = ["TODO", "IN_PROGRESS"];

function getDepartmentTasks(project: DashboardProject, workflowKey: string) {
  return project.tasks.filter((task) => task.department?.workflowKey === workflowKey);
}

function getCurrentWorkflowIndex(project: DashboardProject, departments: WorkflowDepartment[]) {
  return departments.findIndex((department) => department.workflowKey === project.currentDepartment?.workflowKey);
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

  return departments.findIndex(
    (department, index) => index > currentIndex && hasActiveWorkTask(project, department.workflowKey)
  );
}

function getProjectDepartmentHealth(project: DashboardProject, workflowKey: string, departments: WorkflowDepartment[]): DepartmentHealth {
  const currentIndex = getCurrentWorkflowIndex(project, departments);
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

function formatHours(minutes: number) {
  if (minutes <= 0) {
    return "0h";
  }

  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

export function ShopOverviewChart({ projects, departments }: { projects: DashboardProject[]; departments: WorkflowDepartment[] }) {
  const departmentSummaries = departments.map((department) => {
    const healthCounts = projects.reduce(
      (counts, project) => {
        const health = getProjectDepartmentHealth(project, department.workflowKey, departments);
        counts[health] += 1;
        return counts;
      },
      { complete: 0, "needs-effort": 0, upcoming: 0 } as Record<DepartmentHealth, number>
    );
    const loggedMinutes = projects.reduce(
      (total, project) =>
        total +
        project.timeLogs
          .filter((log) => log.department?.workflowKey === department.workflowKey)
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
    projects.length === 0 || departmentSummaries.length === 0
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
            <li className={`shop-overview-step ${department.dominantHealth} ${connectorClass}`} key={department.id}>
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
