import Link from "next/link";
import { DashboardAutoRefresh } from "@/components/dashboard/dashboard-auto-refresh";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { ProjectStatusChart } from "@/components/dashboard/project-status-chart";
import { ShopOverviewChart } from "@/components/dashboard/shop-overview-chart";
import { LiveTimeClockPanel } from "@/components/time-logs/live-time-clock-panel";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getCurrentUser } from "@/lib/auth";
import { listDashboardProjectStatuses } from "@/lib/db/projects";
import { listActiveTimeClockEntries } from "@/lib/db/time-logs";
import { isFullAccess } from "@/lib/rbac";

function isDueThisWeek(value: Date | null) {
  if (!value) {
    return false;
  }

  const now = new Date();
  const weekFromNow = new Date(now);
  weekFromNow.setDate(now.getDate() + 7);

  return value >= now && value <= weekFromNow;
}

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!isFullAccess(currentUser) && currentUser) {
    return <EmployeeDashboard user={currentUser} />;
  }

  const [activeTimeEntries, projectStatuses] = currentUser
    ? await Promise.all([
        listActiveTimeClockEntries(currentUser),
        listDashboardProjectStatuses(currentUser.organizationId)
      ])
    : [[], []];

  const blockedProjectCount = projectStatuses.filter((project) => project.isBlocked || project.status === "BLOCKED").length;
  const dueThisWeekCount = projectStatuses.filter((project) => isDueThisWeek(project.dueDate)).length;

  return (
    <>
      <DashboardAutoRefresh />
      <PageHeader
        eyebrow="Shop overview"
        title="Dashboard"
        description="A desktop-first command view for active jobs, blockers, department handoffs, and due work."
        action={
          <div className="header-actions">
            <DashboardNotifications />
            <Link
              aria-label="Open client archive"
              className="icon-button"
              href="/clients"
              title="Client archive"
            >
              <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                <path d="M3 7h18" />
                <path d="M5 7v12h14V7" />
                <path d="M8 7V5h8v2" />
                <path d="M10 11h4" />
              </svg>
            </Link>
            <Link className="button" href="/projects/new">
              New project
            </Link>
          </div>
        }
      />

      <section className="grid grid-3">
        <StatCard label="Active projects" value={projectStatuses.length} detail="Across sales, design, shop, and install" />
        <StatCard label="Blocked work" value={blockedProjectCount} detail="Needs manager attention" />
        <StatCard label="Due this week" value={dueThisWeekCount} detail="Project due dates" />
      </section>

      <LiveTimeClockPanel
        entries={activeTimeEntries.map((entry) => ({
          id: entry.id,
          worker: entry.user.name,
          department: entry.user.department?.name ?? "Unassigned",
          project: entry.project?.name ?? "General shop time",
          task: entry.task?.title ?? "No task selected",
          startedAt: entry.startedAt.toISOString(),
          verification: entry.source === "MANUAL" ? "Manual clock-in" : entry.source
        }))}
      />

      <ShopOverviewChart projects={projectStatuses} />

      <ProjectStatusChart projects={projectStatuses} />
    </>
  );
}
