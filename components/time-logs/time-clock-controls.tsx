"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
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
    projectId: string;
    projectName: string | null;
    taskId: string;
    taskTitle: string | null;
    notes: string;
  } | null;
  lastClockedOutAt: string | null;
  projectOptions: TimeCardProjectOption[];
  taskOptions: TimeCardTaskOption[];
  todayLoggedMinutes: number;
  userName: string;
  weekLoggedMinutes: number;
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

function ConfirmClockOutButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Submitting..." : "Save time sheet and clock out"}
    </button>
  );
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder}m`;
  }

  if (remainder === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${remainder}m`;
}

function getElapsedMinutes(startedAt: string, now: number) {
  return Math.max(1, Math.round((now - new Date(startedAt).getTime()) / 60000));
}

export function TimeClockControls({
  activeEntry,
  lastClockedOutAt,
  projectOptions,
  taskOptions,
  todayLoggedMinutes,
  userName,
  weekLoggedMinutes,
  clockInAction,
  clockOutAction
}: TimeClockControlsProps) {
  const [isReviewOpen, setIsReviewOpen] = useState(false);
  const [now, setNow] = useState(() => Date.now());
  const [selectedProjectId, setSelectedProjectId] = useState(activeEntry?.projectId ?? "");
  const [selectedTaskId, setSelectedTaskId] = useState(activeEntry?.taskId ?? "");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 60000);

    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    setSelectedProjectId(activeEntry?.projectId ?? "");
    setSelectedTaskId(activeEntry?.taskId ?? "");
    setIsReviewOpen(false);
  }, [activeEntry?.id, activeEntry?.projectId, activeEntry?.taskId]);

  function formatTime(value: string | null) {
    if (!value) {
      return "Not recorded";
    }

    return new Intl.DateTimeFormat("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    }).format(new Date(value));
  }

  const currentShiftMinutes = activeEntry ? getElapsedMinutes(activeEntry.startedAt, now) : 0;
  const filteredTaskOptions = useMemo(
    () => taskOptions.filter((task) => selectedProjectId && task.projectId === selectedProjectId),
    [selectedProjectId, taskOptions]
  );

  useEffect(() => {
    if (selectedTaskId && !filteredTaskOptions.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId("");
    }
  }, [filteredTaskOptions, selectedTaskId]);

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
          <button className="button" onClick={() => setIsReviewOpen(true)} type="button">
            Clock out
          </button>
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
      {activeEntry && isReviewOpen ? (
        <div className="modal-overlay" role="presentation">
          <div aria-labelledby="clock-out-review-title" aria-modal="true" className="modal-panel" role="dialog">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">Review time sheet</p>
                <h2 id="clock-out-review-title">Confirm clock out</h2>
              </div>
              <button
                aria-label="Close clock out review"
                className="icon-button"
                onClick={() => setIsReviewOpen(false)}
                type="button"
              >
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>

            <div className="timecard-review-grid">
              <div>
                <span className="muted">Name</span>
                <strong>{userName}</strong>
              </div>
              <div>
                <span className="muted">This shift</span>
                <strong>{formatMinutes(currentShiftMinutes)}</strong>
              </div>
              <div>
                <span className="muted">Today</span>
                <strong>{formatMinutes(todayLoggedMinutes + currentShiftMinutes)}</strong>
              </div>
              <div>
                <span className="muted">This week</span>
                <strong>{formatMinutes(weekLoggedMinutes + currentShiftMinutes)}</strong>
              </div>
            </div>

            <form action={clockOutAction} className="form timecard-review-form">
              <input name="entryId" type="hidden" value={activeEntry.id} />
              <div className="field">
                <label htmlFor="clock-out-project">Project worked on *</label>
                <select
                  id="clock-out-project"
                  name="projectId"
                  onChange={(event) => setSelectedProjectId(event.target.value)}
                  required
                  value={selectedProjectId}
                >
                  <option value="">Select a project</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="clock-out-task">Task worked on *</label>
                <select
                  id="clock-out-task"
                  name="taskId"
                  onChange={(event) => setSelectedTaskId(event.target.value)}
                  required
                  value={selectedTaskId}
                >
                  <option value="">{selectedProjectId ? "Select a task" : "Select a project first"}</option>
                  {filteredTaskOptions.map((task) => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label htmlFor="clock-out-notes">Work notes</label>
                <textarea
                  defaultValue={activeEntry.notes}
                  id="clock-out-notes"
                  name="notes"
                  placeholder="Optional notes about what was completed, blockers, or handoff details"
                  rows={4}
                />
              </div>
              <div className="modal-actions">
                <button className="button secondary" onClick={() => setIsReviewOpen(false)} type="button">
                  Cancel
                </button>
                <ConfirmClockOutButton />
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </section>
  );
}
