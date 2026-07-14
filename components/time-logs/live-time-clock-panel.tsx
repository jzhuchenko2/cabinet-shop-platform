"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type LiveTimeClockRow = {
  id: string;
  worker: string;
  department: string;
  project: string;
  task: string;
  startedAt: string;
  verification: string;
};

function formatStartedAt(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

function formatElapsed(startedAt: string, now: number) {
  const elapsedMinutes = Math.max(0, Math.floor((now - new Date(startedAt).getTime()) / 60000));
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;

  if (hours === 0) {
    return `${minutes}m`;
  }

  return `${hours}h ${minutes}m`;
}

export function LiveTimeClockPanel({ entries }: { entries: LiveTimeClockRow[] }) {
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);
    const refreshTimer = window.setInterval(() => router.refresh(), 30000);

    return () => {
      window.clearInterval(timer);
      window.clearInterval(refreshTimer);
    };
  }, [router]);

  const activeEntries = useMemo(
    () =>
      entries.map((entry) => ({
        ...entry,
        elapsed: formatElapsed(entry.startedAt, now),
        startedAtLabel: formatStartedAt(entry.startedAt)
      })),
    [entries, now]
  );

  return (
    <section
      className="card live-clock-compact"
      onClick={() => setIsOpen(true)}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          setIsOpen(true);
        }
      }}
      role="button"
      tabIndex={0}
    >
      <div className="live-clock-compact-main">
        <div>
          <p className="eyebrow">Live time clock</p>
          <h2>{entries.length} workers clocked in</h2>
        </div>
        <span className={entries.length > 0 ? "live-clock-pulse active" : "live-clock-pulse"} />
      </div>
      {activeEntries.length > 0 ? (
        <div className="live-clock-worker-strip">
          {activeEntries.slice(0, 6).map((entry) => (
            <span key={entry.id}>
              <strong>{entry.worker}</strong>
              <small>{entry.elapsed}</small>
            </span>
          ))}
          {activeEntries.length > 6 ? <span>+{activeEntries.length - 6} more</span> : null}
        </div>
      ) : (
        <p className="muted">No workers are clocked in right now.</p>
      )}
      <p className="muted">Click for details.</p>

      {isOpen ? (
        <div
          className="modal-overlay"
          onClick={(event) => {
            event.stopPropagation();
            setIsOpen(false);
          }}
          role="presentation"
        >
          <div
            aria-labelledby="live-clock-details-title"
            aria-modal="true"
            className="modal-panel wide"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
          >
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Live time clock</p>
                <h2 id="live-clock-details-title">{entries.length} workers clocked in</h2>
                <p className="muted">Updates automatically while this dashboard is open.</p>
              </div>
              <div className="header-actions">
                <button className="button secondary" onClick={() => router.refresh()} type="button">
                  Refresh
                </button>
                <button
                  aria-label="Close live time clock details"
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
            </div>
            {activeEntries.length > 0 ? (
              <table className="table responsive-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Department</th>
                    <th>Project</th>
                    <th>Task</th>
                    <th>Clocked in</th>
                    <th>Elapsed</th>
                    <th>Verification</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEntries.map((entry) => (
                    <tr key={entry.id}>
                      <td data-label="Worker">{entry.worker}</td>
                      <td data-label="Department">{entry.department}</td>
                      <td data-label="Project">{entry.project}</td>
                      <td data-label="Task">{entry.task}</td>
                      <td data-label="Clocked in">{entry.startedAtLabel}</td>
                      <td data-label="Elapsed">{entry.elapsed}</td>
                      <td data-label="Verification">{entry.verification}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p className="muted">No workers are clocked in right now.</p>
            )}
          </div>
        </div>
      ) : null}
    </section>
  );
}
