"use client";

import { useFormStatus } from "react-dom";

function StopButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Saving..." : "Clock out"}
    </button>
  );
}

function DisabledStopButton() {
  return (
    <div>
      <button className="button" disabled type="button">
        Clock out
      </button>
      <small className="muted time-card-stop-hint">Choose a project and task, then save.</small>
    </div>
  );
}

export function TimeCardStopButton({
  action,
  canStop,
  entryId
}: {
  action: (formData: FormData) => Promise<void>;
  canStop: boolean;
  entryId: string;
}) {
  if (!canStop) {
    return <DisabledStopButton />;
  }

  return (
    <form action={action}>
      <input name="entryId" type="hidden" value={entryId} />
      <StopButton />
    </form>
  );
}
