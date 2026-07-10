"use client";

import Link from "next/link";
import { useFormStatus } from "react-dom";

export type TimeCardProjectOption = {
  id: string;
  name: string;
  client: string;
};

export type TimeCardTaskOption = {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
};

type TimeClockControlsProps = {
  activeEntry: {
    id: string;
    startedAt: string;
    projectName: string | null;
    taskTitle: string | null;
  } | null;
  lastClockedOutAt: string | null;
  projectOptions: TimeCardProjectOption[];
  taskOptions: TimeCardTaskOption[];
  clockInAction: (formData: FormData) => Promise<void>;
  clockOutAction: (formData: FormData) => Promise<void>;
};

function ClockSubmitButton({ clockedIn }: { clockedIn: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Saving..." : clockedIn ? "Clock out" : "Clock in"}
    </button>
  );
}

export function TimeClockControls({
  activeEntry,
  lastClockedOutAt,
  projectOptions,
  taskOptions,
  clockInAction,
  clockOutAction
}: TimeClockControlsProps) {
  function formatTime(value: string | null) {
    if (!value) {
      return "Not recorded";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  return (
    <section className="card">
      <div className="section-heading-row">
        <div>
          <p className="eyebrow">Time clock</p>
          <h2>{activeEntry ? "Clocked in" : "Ready to clock in"}</h2>
          <p className="muted">
            Future foundation: shop Wi-Fi, QR/NFC, or geofence verification can validate proximity before clock-in.
          </p>
        </div>
        {activeEntry ? (
          <form action={clockOutAction}>
            <input name="entryId" type="hidden" value={activeEntry.id} />
            <ClockSubmitButton clockedIn />
          </form>
        ) : (
          <form action={clockInAction} className="time-clock-start-form">
            <select aria-label="Project worked on" name="projectId" defaultValue="">
              <option value="">General shop time</option>
              {projectOptions.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.client}
                </option>
              ))}
            </select>
            <select aria-label="Task worked on" name="taskId" defaultValue="">
              <option value="">No task selected</option>
              {taskOptions.map((task) => (
                <option key={task.id} value={task.id}>
                  {task.projectName} - {task.title}
                </option>
              ))}
            </select>
            <ClockSubmitButton clockedIn={false} />
          </form>
        )}
      </div>
      <p className="muted">Clocked in: {formatTime(activeEntry?.startedAt ?? null)}</p>
      {activeEntry ? (
        <p className="muted">
          Work scope: {activeEntry.projectName ?? "General shop time"}
          {activeEntry.taskTitle ? ` / ${activeEntry.taskTitle}` : ""}
        </p>
      ) : null}
      <p className="muted">Last clock out: {formatTime(lastClockedOutAt)}</p>
      <Link className="button secondary" href="/time-cards">
        Open time cards
      </Link>
    </section>
  );
}
