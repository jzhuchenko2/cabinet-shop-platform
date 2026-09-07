"use client";

import { useMemo, useState } from "react";
import { TimeCardScopeForm } from "@/components/time-logs/time-card-scope-form";
import { TimeCardStopButton } from "@/components/time-logs/time-card-stop-button";
import type { TimeCardProjectOption, TimeCardTaskOption } from "@/components/time-logs/time-clock-controls";

export type ActiveTimeCardRow = {
  id: string;
  userId: string;
  employee: string;
  startedAt: string;
  elapsed: string;
  projectId: string;
  taskId: string;
  notes: string;
};

export type CompletedTimeCardRow = {
  id: string;
  employee: string;
  project: string;
  task: string;
  startedAt: string;
  endedAt: string;
  total: string;
};

export type ProjectTimeLogRow = {
  id: string;
  employee: string;
  project: string;
  task: string;
  total: string;
  totalMinutes: number;
  workDate: string;
  notes: string;
};

type TabKey = "live" | "completed" | "logs";

const tabs: { key: TabKey; label: string }[] = [
  { key: "live", label: "Clocked in" },
  { key: "completed", label: "Recent shifts" },
  { key: "logs", label: "Project time" }
];

export function TimeCardWorkspaceModal({
  activeEntries,
  canManageTimeCards,
  completedEntries,
  projectOptions,
  stopAction,
  taskOptions,
  timeLogs,
  updateScopeAction
}: {
  activeEntries: ActiveTimeCardRow[];
  canManageTimeCards: boolean;
  completedEntries: CompletedTimeCardRow[];
  projectOptions: TimeCardProjectOption[];
  stopAction: (formData: FormData) => Promise<void>;
  taskOptions: TimeCardTaskOption[];
  timeLogs: ProjectTimeLogRow[];
  updateScopeAction: (formData: FormData) => Promise<void>;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("live");

  const loggedTotal = useMemo(
    () => timeLogs.reduce((total, log) => total + log.totalMinutes, 0),
    [timeLogs]
  );

  return (
    <section className="card time-card-hub">
      <div className="section-heading-row">
        <div>
          <h2>Time summary</h2>
        </div>
        <button className="button" onClick={() => setIsOpen(true)} type="button">
          View details
        </button>
      </div>

      <div className="time-card-hub-grid">
        <div>
          <span className="muted">Clocked in</span>
          <strong>{activeEntries.length}</strong>
        </div>
        <div>
          <span className="muted">Recent shifts</span>
          <strong>{completedEntries.length}</strong>
        </div>
        <div>
          <span className="muted">Project entries</span>
          <strong>{timeLogs.length}</strong>
          <small>{Math.round((loggedTotal / 60) * 10) / 10}h</small>
        </div>
      </div>

      {isOpen ? (
        <div className="modal-overlay" role="presentation">
          <div aria-labelledby="time-card-details-title" aria-modal="true" className="modal-panel wide" role="dialog">
            <div className="section-heading-row">
              <div>
                <h2 id="time-card-details-title">Time cards</h2>
              </div>
              <button
                aria-label="Close time card details"
                className="icon-button"
                onClick={() => setIsOpen(false)}
                type="button"
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="tab-list" role="tablist" aria-label="Time card sections">
              {tabs.map((tab) => (
                <button
                  aria-selected={activeTab === tab.key}
                  className={activeTab === tab.key ? "tab-button active" : "tab-button"}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  role="tab"
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "live" ? (
              <div className="tab-panel" role="tabpanel">
                {activeEntries.length > 0 ? (
                  <table className="table responsive-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Started</th>
                        <th>Time worked</th>
                        <th>Project &amp; task</th>
                        {canManageTimeCards ? <th>Actions</th> : null}
                      </tr>
                    </thead>
                    <tbody>
                      {activeEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td data-label="Employee">{entry.employee}</td>
                          <td data-label="Started">{entry.startedAt}</td>
                          <td data-label="Time worked">{entry.elapsed}</td>
                          <td data-label="Project & task">
                            <TimeCardScopeForm
                              action={updateScopeAction}
                              entryId={entry.id}
                              notes={entry.notes}
                              projectId={entry.projectId}
                              projectOptions={projectOptions}
                              taskId={entry.taskId}
                              taskOptions={taskOptions}
                            />
                          </td>
                          {canManageTimeCards ? (
                            <td data-label="Actions">
                              <TimeCardStopButton action={stopAction} canStop={Boolean(entry.projectId && entry.taskId)} entryId={entry.id} />
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted empty-state">{canManageTimeCards ? "No one is clocked in." : "You're clocked out."}</p>
                )}
              </div>
            ) : null}

            {activeTab === "completed" ? (
              <div className="tab-panel" role="tabpanel">
                {completedEntries.length > 0 ? (
                  <table className="table responsive-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Project</th>
                        <th>Task</th>
                        <th>Started</th>
                        <th>Ended</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {completedEntries.map((entry) => (
                        <tr key={entry.id}>
                          <td data-label="Employee">{entry.employee}</td>
                          <td data-label="Project">{entry.project}</td>
                          <td data-label="Task">{entry.task}</td>
                          <td data-label="Started">{entry.startedAt}</td>
                          <td data-label="Ended">{entry.endedAt}</td>
                          <td data-label="Total">{entry.total}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted empty-state">No finished shifts yet.</p>
                )}
              </div>
            ) : null}

            {activeTab === "logs" ? (
              <div className="tab-panel" role="tabpanel">
                {timeLogs.length > 0 ? (
                  <table className="table responsive-table">
                    <thead>
                      <tr>
                        <th>Employee</th>
                        <th>Project</th>
                        <th>Task</th>
                        <th>Total</th>
                        <th>Date</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {timeLogs.map((log) => (
                        <tr key={log.id}>
                          <td data-label="Employee">{log.employee}</td>
                          <td data-label="Project">{log.project}</td>
                          <td data-label="Task">{log.task}</td>
                          <td data-label="Total">{log.total}</td>
                          <td data-label="Date">{log.workDate}</td>
                          <td data-label="Notes">{log.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="muted empty-state">No project time recorded yet.</p>
                )}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}
    </section>
  );
}
