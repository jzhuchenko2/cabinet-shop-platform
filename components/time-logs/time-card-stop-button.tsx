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

export function TimeCardStopButton({
  action,
  entryId
}: {
  action: (formData: FormData) => Promise<void>;
  entryId: string;
}) {
  return (
    <form action={action}>
      <input name="entryId" type="hidden" value={entryId} />
      <StopButton />
    </form>
  );
}
