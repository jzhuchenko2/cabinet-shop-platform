import Link from "next/link";
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
          <Link className="button" href="/projects/new">
            New project
          </Link>
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
              <span>{stage.name}</span>
              <span className={index === 2 || index === 11 ? "status-pill blocked" : "status-pill ready"}>
                {index === 2 || index === 11 ? "Needs review" : "Ready"}
              </span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

