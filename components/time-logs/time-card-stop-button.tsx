"use client";

import { useFormStatus } from "react-dom";

function StopButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Stopping..." : "Clock out"}
    </button>
  );
}

function DisabledStopButton() {
  return (
    <button className="button" disabled title="Select a project and task before clocking out." type="button">
      Add scope first
    </button>
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
