"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type CalendarEvent = {
  id: string;
  date: string;
  title: string;
  subtitle: string;
  href: string;
  projectId: string;
  projectName: string;
  type: "PROJECT" | "TASK";
};

type CalendarMode = "month" | "week";

const projectColors = ["#f36f21", "#246732", "#2f6f9f", "#8c5b10", "#a33c2f", "#5f4b8b", "#0f766e", "#b46918"];

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

function getProjectColor(projectId: string) {
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

export function CalendarView({ events }: { events: CalendarEvent[] }) {
  const [mode, setMode] = useState<CalendarMode>("month");
  const [cursor, setCursor] = useState(() => startOfDay(new Date()));

  const eventsByDate = useMemo(() => {
    return events.reduce<Record<string, CalendarEvent[]>>((grouped, event) => {
      grouped[event.date] = grouped[event.date] ?? [];
      grouped[event.date].push(event);
      return grouped;
    }, {});
  }, [events]);

  const days = mode === "month" ? getMonthDays(cursor) : Array.from({ length: 7 }, (_, index) => addDays(getWeekStart(cursor), index));

  function movePrevious() {
    setCursor((current) => (mode === "month" ? new Date(current.getFullYear(), current.getMonth() - 1, 1) : addDays(current, -7)));
  }

  function moveNext() {
    setCursor((current) => (mode === "month" ? new Date(current.getFullYear(), current.getMonth() + 1, 1) : addDays(current, 7)));
  }

  return (
    <section className="card calendar-shell">
      <div className="calendar-toolbar">
        <div>
          <p className="eyebrow">Calendar</p>
          <h2>{formatRangeLabel(mode, cursor)}</h2>
        </div>
        <div className="calendar-controls">
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
                  dayEvents.map((event) => (
                    <Link
                      className={event.type === "PROJECT" ? "calendar-event project" : "calendar-event task"}
                      href={event.href}
                      key={event.id}
                      style={{ borderLeftColor: getProjectColor(event.projectId) }}
                    >
                      <span>{event.title}</span>
                      <small>{event.subtitle}</small>
                    </Link>
                  ))
                ) : (
                  <span className="calendar-empty">No due work</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <aside className="calendar-legend">
        <span>
          <i className="calendar-key project" /> Project due date
        </span>
        <span>
          <i className="calendar-key task" /> Task due date
        </span>
      </aside>
    </section>
  );
}
