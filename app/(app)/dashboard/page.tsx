import Link from "next/link";
import { EmployeeDashboard } from "@/components/dashboard/employee-dashboard";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { LiveTimeClockPanel } from "@/components/time-logs/live-time-clock-panel";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { departmentWorkflow } from "@/lib/constants/workflow";
import { getCurrentUser } from "@/lib/auth";
import { listActiveTimeClockEntries } from "@/lib/db/time-logs";
import { isFullAccess } from "@/lib/rbac";

export default async function DashboardPage() {
  const currentUser = await getCurrentUser();

  if (!isFullAccess(currentUser) && currentUser) {
    return <EmployeeDashboard user={currentUser} />;
  }

  const activeTimeEntries = currentUser ? await listActiveTimeClockEntries(currentUser) : [];

  return (
    <>
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
        <StatCard label="Active projects" value="12" detail="Across sales, design, shop, and install" />
        <StatCard label="Blocked work" value="3" detail="Needs manager attention" />
        <StatCard label="Due this week" value="18" detail="Tasks and handoffs" />
      </section>

      <LiveTimeClockPanel
        entries={activeTimeEntries.map((entry) => ({
          id: entry.id,
          worker: entry.user.name,
          department: entry.user.department?.name ?? "Unassigned",
          startedAt: entry.startedAt.toISOString(),
          verification: entry.source === "MANUAL" ? "Manual clock-in" : entry.source
        }))}
      />

      <section className="card" style={{ marginTop: 16 }}>
        <h2>Department flow</h2>
        <div className="stage-list">
          {departmentWorkflow.map((stage, index) => (
            <div className="stage-row" key={stage.key}>
              <strong>{index + 1}</strong>
              <div className="stage-main">
                <span>{stage.name}</span>
                <span className="stage-deadline">Deadline {stage.deadline}</span>
              </div>
              <span className={index === 2 || index === 5 ? "status-pill blocked" : "status-pill ready"}>
                {index === 2 || index === 5 ? "Needs review" : "Ready"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
