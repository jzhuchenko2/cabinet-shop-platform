"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type LiveTimeClockRow = {
  id: string;
  worker: string;
  department: string;
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
    <section className="card work-section">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Live time clock</p>
          <h2>{entries.length} workers clocked in</h2>
          <p className="muted">Updates automatically while this dashboard is open.</p>
        </div>
        <button className="button secondary" onClick={() => router.refresh()} type="button">
          Refresh
        </button>
      </div>
      {activeEntries.length > 0 ? (
        <table className="table responsive-table">
          <thead>
            <tr>
              <th>Worker</th>
              <th>Department</th>
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
    </section>
  );
}
