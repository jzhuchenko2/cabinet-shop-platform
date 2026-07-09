"use client";

import { useFormStatus } from "react-dom";

type TimeClockControlsProps = {
  activeEntry: {
    id: string;
    startedAt: string;
  } | null;
  lastClockedOutAt: string | null;
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
          <form action={clockInAction}>
            <ClockSubmitButton clockedIn={false} />
          </form>
        )}
      </div>
      <p className="muted">Clocked in: {formatTime(activeEntry?.startedAt ?? null)}</p>
      <p className="muted">Last clock out: {formatTime(lastClockedOutAt)}</p>
    </section>
  );
}
