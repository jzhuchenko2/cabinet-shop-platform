"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { CalendarEventActionState } from "@/app/(app)/calendar/actions";

export type CalendarEvent = {
  id: string;
  date: string;
  endDate?: string | null;
  title: string;
  subtitle: string;
  href?: string;
  projectId?: string | null;
  projectName?: string | null;
  kind: "COMPANY" | "PERSONAL" | "PROJECT_DUE" | "TASK_DUE";
  eventType: "APPROVAL" | "DEADLINE" | "DELIVERY" | "GENERAL" | "INSTALL" | "MEETING" | "PROJECT" | "TASK";
  color?: string | null;
  editable?: boolean;
  description?: string | null;
  startsAtInput?: string;
  endsAtInput?: string | null;
};

export type CalendarProjectOption = {
  id: string;
  name: string;
  client: string;
};

type CalendarMode = "month" | "week";
type CalendarLayer = "ALL" | "PERSONAL" | "COMPANY" | "PROJECT";

const projectColors = ["#f36f21", "#246732", "#2f6f9f", "#8c5b10", "#a33c2f", "#5f4b8b", "#0f766e", "#b46918"];
const eventTypeOptions = [
  { value: "GENERAL", label: "General" },
  { value: "MEETING", label: "Meeting" },
  { value: "DELIVERY", label: "Delivery" },
  { value: "INSTALL", label: "Install" },
  { value: "DEADLINE", label: "Deadline" }
];

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Saving..." : label}
    </button>
  );
}

function startOfDay(value: Date) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function addDays(value: Date, days: number) {
  const date = new Date(value);
  date.setDate(date.getDate() + days);
  return date;
}

function getWeekStart(value: Date) {
  const date = startOfDay(value);
  date.setDate(date.getDate() - date.getDay());
  return date;
}

function getMonthDays(value: Date) {
  const firstOfMonth = new Date(value.getFullYear(), value.getMonth(), 1);
  const start = getWeekStart(firstOfMonth);
  return Array.from({ length: 42 }, (_, index) => addDays(start, index));
}

function getProjectColor(projectId?: string | null) {
  if (!projectId) {
    return "#292a30";
  }

  const total = Array.from(projectId).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return projectColors[total % projectColors.length];
}

function formatRangeLabel(mode: CalendarMode, cursor: Date) {
  if (mode === "month") {
    return new Intl.DateTimeFormat("en-US", { month: "long", year: "numeric" }).format(cursor);
  }

  const start = getWeekStart(cursor);
  const end = addDays(start, 6);
  return `${new Intl.DateTimeFormat("en-US", { month: "short", day: "numeric" }).format(start)} - ${new Intl.DateTimeFormat(
    "en-US",
    { month: "short", day: "numeric", year: "numeric" }
  ).format(end)}`;
}

function eventMatchesLayer(event: CalendarEvent, layer: CalendarLayer) {
  if (layer === "ALL") {
    return true;
  }

  if (layer === "PROJECT") {
    return event.kind === "PROJECT_DUE" || event.kind === "TASK_DUE" || Boolean(event.projectId);
  }

  return event.kind === layer;
}

function isDueSoon(event: CalendarEvent) {
  if (event.kind !== "PROJECT_DUE" && event.kind !== "TASK_DUE") {
    return false;
  }

  const today = startOfDay(new Date());
  const eventDate = startOfDay(new Date(`${event.date}T12:00:00`));
  const diffDays = Math.round((eventDate.getTime() - today.getTime()) / 86400000);
  return diffDays >= 0 && diffDays <= 7;
}

function getEventClassName(event: CalendarEvent) {
  const classes = ["calendar-event", event.kind.toLowerCase().replace("_", "-")];

  if (isDueSoon(event)) {
    classes.push("due-soon");
  }

  return classes.join(" ");
}

export function CalendarView({
  events,
  projectOptions,
  canManageCompanyEvents,
  createAction,
  updateAction,
  deleteAction
}: {
  events: CalendarEvent[];
  projectOptions: CalendarProjectOption[];
  canManageCompanyEvents: boolean;
  createAction: (state: CalendarEventActionState, formData: FormData) => Promise<CalendarEventActionState>;
  updateAction: (state: CalendarEventActionState, formData: FormData) => Promise<CalendarEventActionState>;
  deleteAction: (formData: FormData) => Promise<void>;
}) {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [layer, setLayer] = useState<CalendarLayer>("ALL");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [createState, createFormAction] = useFormState(createAction, {});
  const [updateState, updateFormAction] = useFormState(updateAction, {});
  const now = new Date();
  now.setHours(9, 0, 0, 0);

  useEffect(() => {
    if (createState.message) {
      setIsCreateModalOpen(false);
    }
  }, [createState.message]);

  const filteredEvents = useMemo(() => events.filter((event) => eventMatchesLayer(event, layer)), [events, layer]);
  const eventsByDate = useMemo(() => {
    return filteredEvents.reduce<Record<string, CalendarEvent[]>>((grouped, event) => {
      grouped[event.date] = grouped[event.date] ?? [];
      grouped[event.date].push(event);
      return grouped;
    }, {});
  }, [filteredEvents]);

  const days = mode === "month" ? getMonthDays(cursor) : Array.from({ length: 7 }, (_, index) => addDays(getWeekStart(cursor), index));
  const upcomingEvents = useMemo(
    () =>
      [...events]
        .filter((event) => new Date(`${event.date}T12:00:00`) >= startOfDay(new Date()))
        .sort((first, second) => first.date.localeCompare(second.date))
        .slice(0, 8),
    [events]
  );

  function movePrevious() {
    setCursor((current) => (mode === "month" ? new Date(current.getFullYear(), current.getMonth() - 1, 1) : addDays(current, -7)));
  }

  function moveNext() {
    setCursor((current) => (mode === "month" ? new Date(current.getFullYear(), current.getMonth() + 1, 1) : addDays(current, 7)));
  }

  return (
    <div className="calendar-workspace">
      <section className="card calendar-shell">
        <div className="calendar-toolbar">
          <div>
            <p className="eyebrow">Calendar</p>
            <h2>{formatRangeLabel(mode, cursor)}</h2>
          </div>
          <div className="calendar-controls">
            <div className="segmented-control" aria-label="Calendar layer">
              {(["ALL", "PERSONAL", "COMPANY", "PROJECT"] as CalendarLayer[]).map((calendarLayer) => (
                <button className={layer === calendarLayer ? "active" : ""} key={calendarLayer} onClick={() => setLayer(calendarLayer)} type="button">
                  {calendarLayer === "PROJECT" ? "Project" : calendarLayer[0] + calendarLayer.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <div className="segmented-control" aria-label="Calendar view">
              <button className={mode === "week" ? "active" : ""} onClick={() => setMode("week")} type="button">
                Week
              </button>
              <button className={mode === "month" ? "active" : ""} onClick={() => setMode("month")} type="button">
                Month
              </button>
            </div>
            <button className="button secondary" onClick={movePrevious} type="button">
              Prev
            </button>
            <button className="button secondary" onClick={() => setCursor(startOfDay(new Date()))} type="button">
              Today
            </button>
            <button className="button secondary" onClick={moveNext} type="button">
              Next
            </button>
          </div>
        </div>

        <div className={mode === "month" ? "calendar-grid month" : "calendar-grid week"}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div className="calendar-weekday" key={day}>
              {day}
            </div>
          ))}
          {days.map((day) => {
            const key = toDateKey(day);
            const dayEvents = eventsByDate[key] ?? [];
            const isOutsideMonth = mode === "month" && day.getMonth() !== cursor.getMonth();

            return (
              <div className={isOutsideMonth ? "calendar-day muted-day" : "calendar-day"} key={key}>
                <div className="calendar-day-number">{day.getDate()}</div>
                <div className="calendar-events">
                  {dayEvents.length > 0 ? (
                    dayEvents.map((event) =>
                      event.href ? (
                        <Link
                          className={getEventClassName(event)}
                          href={event.href}
                          key={event.id}
                          style={{ borderLeftColor: event.color ?? getProjectColor(event.projectId) }}
                        >
                          <span>{event.title}</span>
                          <small>{event.subtitle}</small>
                        </Link>
                      ) : (
                        <button
                          className={getEventClassName(event)}
                          key={event.id}
                          onClick={() => setSelectedEvent(event)}
                          style={{ borderLeftColor: event.color ?? getProjectColor(event.projectId) }}
                          type="button"
                        >
                          <span>{event.title}</span>
                          <small>{event.subtitle}</small>
                        </button>
                      )
                    )
                  ) : (
                    <span className="calendar-empty">No scheduled work</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <aside className="calendar-legend">
          <span>
            <i className="calendar-key project" /> Project/task due
          </span>
          <span>
            <i className="calendar-key company" /> Company event
          </span>
          <span>
            <i className="calendar-key personal" /> Personal event
          </span>
        </aside>
      </section>

      <aside className="calendar-side-panel">
        <section className="card calendar-quick-action">
          <button className="button" onClick={() => setIsCreateModalOpen(true)} type="button">
            Add event
          </button>
        </section>

        <section className="card">
          <p className="eyebrow">Upcoming</p>
          <h2>Next dates</h2>
          <div className="calendar-upcoming-list">
            {upcomingEvents.length > 0 ? (
              upcomingEvents.map((event) =>
                event.href ? (
                  <Link className="calendar-upcoming-item" href={event.href} key={event.id}>
                    <i style={{ background: event.color ?? getProjectColor(event.projectId) }} />
                    <span>
                      <strong>{event.title}</strong>
                      <small>{event.date} - {event.subtitle}</small>
                    </span>
                  </Link>
                ) : (
                  <button className="calendar-upcoming-item" key={event.id} onClick={() => setSelectedEvent(event)} type="button">
                    <i style={{ background: event.color ?? getProjectColor(event.projectId) }} />
                    <span>
                      <strong>{event.title}</strong>
                      <small>{event.date} - {event.subtitle}</small>
                    </span>
                  </button>
                )
              )
            ) : (
              <p className="muted">No upcoming calendar items.</p>
            )}
          </div>
        </section>
      </aside>

      {isCreateModalOpen ? (
        <div className="modal-overlay" role="presentation">
          <div aria-labelledby="create-calendar-event-title" aria-modal="true" className="modal-panel" role="dialog">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">New event</p>
                <h2 id="create-calendar-event-title">{canManageCompanyEvents ? "Schedule shop work" : "Add personal event"}</h2>
              </div>
              <button aria-label="Close new event" className="icon-button" onClick={() => setIsCreateModalOpen(false)} type="button">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>
            <form action={createFormAction} className="form">
              <div className="field">
                <label htmlFor="calendar-title">Title</label>
                <input id="calendar-title" name="title" placeholder="Delivery, install, meeting..." required />
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label htmlFor="calendar-visibility">Calendar</label>
                  <select id="calendar-visibility" name="visibility" defaultValue="PERSONAL">
                    <option value="PERSONAL">Personal</option>
                    {canManageCompanyEvents ? <option value="COMPANY">Company</option> : null}
                  </select>
                </div>
                <div className="field">
                  <label htmlFor="calendar-event-type">Type</label>
                  <select id="calendar-event-type" name="eventType" defaultValue="GENERAL">
                    {eventTypeOptions.map((eventType) => (
                      <option key={eventType.value} value={eventType.value}>
                        {eventType.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="field">
                <label htmlFor="calendar-project">Project</label>
                <select id="calendar-project" name="projectId" defaultValue="">
                  <option value="">No project</option>
                  {projectOptions.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name} - {project.client}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-2">
                <div className="field">
                  <label htmlFor="calendar-starts-at">Starts</label>
                  <input id="calendar-starts-at" name="startsAt" required type="datetime-local" defaultValue={toDateTimeInputValue(now)} />
                </div>
                <div className="field">
                  <label htmlFor="calendar-ends-at">Ends</label>
                  <input id="calendar-ends-at" name="endsAt" type="datetime-local" />
                </div>
              </div>
              {canManageCompanyEvents ? (
                <div className="field">
                  <label htmlFor="calendar-color">Color</label>
                  <input id="calendar-color" name="color" type="color" defaultValue="#f36f21" />
                </div>
              ) : null}
              <div className="field">
                <label htmlFor="calendar-description">Notes</label>
                <textarea id="calendar-description" name="description" rows={3} placeholder="Crew notes, delivery window, meeting location..." />
              </div>
              {createState.error ? <p className="form-error">{createState.error}</p> : null}
              <div className="modal-actions">
                <button className="button secondary" onClick={() => setIsCreateModalOpen(false)} type="button">
                  Cancel
                </button>
                <SubmitButton label="Save event" />
              </div>
            </form>
          </div>
        </div>
      ) : null}

      {selectedEvent && !selectedEvent.href ? (
        <div className="modal-overlay" role="presentation">
          <div aria-labelledby="calendar-event-modal-title" aria-modal="true" className="modal-panel" role="dialog">
            <div className="section-heading-row">
              <div>
                <p className="eyebrow">{selectedEvent.kind === "COMPANY" ? "Company event" : "Personal event"}</p>
                <h2 id="calendar-event-modal-title">{selectedEvent.title}</h2>
                <p className="muted">{selectedEvent.subtitle}</p>
              </div>
              <button aria-label="Close event" className="icon-button" onClick={() => setSelectedEvent(null)} type="button">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="M6 6l12 12" />
                  <path d="M18 6L6 18" />
                </svg>
              </button>
            </div>
            {selectedEvent.description ? <p>{selectedEvent.description}</p> : null}
            {selectedEvent.editable ? (
              <form action={updateFormAction} className="form">
                <input name="eventId" type="hidden" value={selectedEvent.id.replace("event-", "")} />
                <div className="field">
                  <label htmlFor="edit-calendar-title">Title</label>
                  <input id="edit-calendar-title" name="title" required defaultValue={selectedEvent.title} />
                </div>
                <div className="grid grid-2">
                  <div className="field">
                    <label htmlFor="edit-calendar-visibility">Calendar</label>
                    <select id="edit-calendar-visibility" name="visibility" defaultValue={selectedEvent.kind}>
                      <option value="PERSONAL">Personal</option>
                      {canManageCompanyEvents ? <option value="COMPANY">Company</option> : null}
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="edit-calendar-event-type">Type</label>
                    <select id="edit-calendar-event-type" name="eventType" defaultValue={selectedEvent.eventType}>
                      {eventTypeOptions.map((eventType) => (
                        <option key={eventType.value} value={eventType.value}>
                          {eventType.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="edit-calendar-project">Project</label>
                  <select id="edit-calendar-project" name="projectId" defaultValue={selectedEvent.projectId ?? ""}>
                    <option value="">No project</option>
                    {projectOptions.map((project) => (
                      <option key={project.id} value={project.id}>
                        {project.name} - {project.client}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-2">
                  <div className="field">
                    <label htmlFor="edit-calendar-starts-at">Starts</label>
                    <input id="edit-calendar-starts-at" name="startsAt" required type="datetime-local" defaultValue={selectedEvent.startsAtInput ?? `${selectedEvent.date}T09:00`} />
                  </div>
                  <div className="field">
                    <label htmlFor="edit-calendar-ends-at">Ends</label>
                    <input id="edit-calendar-ends-at" name="endsAt" type="datetime-local" defaultValue={selectedEvent.endsAtInput ?? ""} />
                  </div>
                </div>
                {canManageCompanyEvents ? (
                  <div className="field">
                    <label htmlFor="edit-calendar-color">Color</label>
                    <input id="edit-calendar-color" name="color" type="color" defaultValue={selectedEvent.color ?? "#f36f21"} />
                  </div>
                ) : (
                  <input name="color" type="hidden" value={selectedEvent.color ?? ""} />
                )}
                <div className="field">
                  <label htmlFor="edit-calendar-description">Notes</label>
                  <textarea id="edit-calendar-description" name="description" rows={3} defaultValue={selectedEvent.description ?? ""} />
                </div>
                {updateState.error ? <p className="form-error">{updateState.error}</p> : null}
                {updateState.message ? <p className="form-success">{updateState.message}</p> : null}
                <div className="modal-actions">
                  <SubmitButton label="Save event" />
                </div>
              </form>
            ) : null}
            {selectedEvent.editable ? (
              <form action={deleteAction} className="calendar-delete-form">
                <input name="eventId" type="hidden" value={selectedEvent.id.replace("event-", "")} />
                <button className="button danger" type="submit">
                  Delete event
                </button>
              </form>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
