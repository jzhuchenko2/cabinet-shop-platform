import Link from "next/link";
import { DashboardNotifications } from "@/components/dashboard/dashboard-notifications";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { departmentWorkflow } from "@/lib/constants/workflow";

export default function DashboardPage() {
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
