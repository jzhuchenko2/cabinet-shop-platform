"use client";

import type { CSSProperties } from "react";
import { useMemo, useState } from "react";

export type DepartmentSummary = {
  id: string;
  name: string;
  workflowKey: string;
  completePercent: number;
  completeCount: number;
  dominantHealth: "complete" | "needs-effort" | "upcoming";
  loggedMinutes: number;
  loggedHours: string;
  needsEffortCount: number;
  upcomingCount: number;
};

type ShopHealthView = "pulse" | "bottlenecks" | "flow";

function formatHours(minutes: number) {
  if (minutes <= 0) {
    return "0h";
  }

  return `${Math.round((minutes / 60) * 10) / 10}h`;
}

function getHealthLabel(healthScore: number, activePressure: number) {
  if (activePressure > 0) {
    return "Needs attention";
  }

  if (healthScore >= 70) {
    return "Moving well";
  }

  if (healthScore >= 35) {
    return "In motion";
  }

  return "Early stage";
}

function getBarWidth(value: number, max: number) {
  if (max <= 0) {
    return "0%";
  }

  return `${Math.max(8, Math.round((value / max) * 100))}%`;
}

export function ShopHealthSwitcher({
  departments,
  healthScore,
  activePressure,
  projectCount
}: {
  departments: DepartmentSummary[];
  healthScore: number;
  activePressure: number;
  projectCount: number;
}) {
  const [view, setView] = useState<ShopHealthView>("pulse");
  const totalLoggedMinutes = departments.reduce((total, department) => total + department.loggedMinutes, 0);
  const bottlenecks = useMemo(
    () =>
      [...departments]
        .sort((first, second) => second.needsEffortCount - first.needsEffortCount || second.loggedMinutes - first.loggedMinutes)
        .slice(0, 4),
    [departments]
  );
  const maxBottleneckPressure = Math.max(...bottlenecks.map((department) => department.needsEffortCount), 0);
  const maxLoggedMinutes = Math.max(...departments.map((department) => department.loggedMinutes), 0);
  const completedDepartments = departments.filter((department) => department.dominantHealth === "complete").length;

  return (
    <section className="card shop-health-card">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Shop health</p>
          <h2>Overall project flow</h2>
        </div>
        <div className="segmented-control" aria-label="Shop health view">
          {(["pulse", "bottlenecks", "flow"] as ShopHealthView[]).map((option) => (
            <button className={view === option ? "active" : ""} key={option} onClick={() => setView(option)} type="button">
              {option === "pulse" ? "Pulse" : option === "bottlenecks" ? "Bottlenecks" : "Flow"}
            </button>
          ))}
        </div>
      </div>

      {view === "pulse" ? (
        <div className="shop-health-pulse">
          <div className="shop-health-gauge">
            <span style={{ "--score": `${healthScore * 3.6}deg` } as CSSProperties}>
              <strong>{healthScore}%</strong>
              <small>{getHealthLabel(healthScore, activePressure)}</small>
            </span>
          </div>
          <div className="shop-health-metrics">
            <article>
              <strong>{projectCount}</strong>
              <span>Active projects</span>
            </article>
            <article className={activePressure > 0 ? "needs-effort" : ""}>
              <strong>{activePressure}</strong>
              <span>Need effort</span>
            </article>
            <article>
              <strong>{completedDepartments}/{departments.length}</strong>
              <span>Stages healthy</span>
            </article>
            <article>
              <strong>{formatHours(totalLoggedMinutes)}</strong>
              <span>Logged time</span>
            </article>
          </div>
        </div>
      ) : null}

      {view === "bottlenecks" ? (
        <div className="shop-bottleneck-list">
          {bottlenecks.map((department) => (
            <article className={department.needsEffortCount > 0 ? "shop-bottleneck-row needs-effort" : "shop-bottleneck-row"} key={department.id}>
              <div>
                <strong>{department.name}</strong>
                <span>{department.loggedHours} logged</span>
              </div>
              <div className="shop-bottleneck-bar" aria-label={`${department.needsEffortCount} active checkpoints`}>
                <i style={{ width: getBarWidth(department.needsEffortCount, maxBottleneckPressure) }} />
              </div>
              <span>{department.needsEffortCount} active</span>
            </article>
          ))}
        </div>
      ) : null}

      {view === "flow" ? (
        <>
          <div className="shop-overview-meta">
            <span>{projectCount} active projects</span>
            <span>{activePressure} department checkpoints need effort</span>
          </div>

          <ol className="shop-overview-flow" aria-label="Combined project health by department">
            {departments.map((department, index) => {
              const previousDepartment = departments[index - 1];
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
        </>
      ) : null}

      {view !== "bottlenecks" ? (
        <div className="shop-health-load">
          {departments.map((department) => (
            <article className={`shop-health-load-row ${department.dominantHealth}`} key={department.id}>
              <div>
                <strong>{department.name}</strong>
                <span>{department.needsEffortCount} active</span>
              </div>
              <div className="shop-health-load-bar">
                <i style={{ width: `${department.completePercent}%` }} />
              </div>
              <small>{department.loggedHours}</small>
            </article>
          ))}
        </div>
      ) : (
        <div className="shop-health-load compact">
          {departments.map((department) => (
            <article className={`shop-health-load-row ${department.dominantHealth}`} key={department.id}>
              <div>
                <strong>{department.name}</strong>
                <span>{department.completePercent}% complete</span>
              </div>
              <div className="shop-health-load-bar">
                <i style={{ width: getBarWidth(department.loggedMinutes, maxLoggedMinutes) }} />
              </div>
              <small>{department.loggedHours}</small>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
