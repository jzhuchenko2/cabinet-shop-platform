"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CreateAreaState } from "@/app/(app)/projects/[projectId]/areas/actions";

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Adding area..." : "Add area"}
    </button>
  );
}

export function AreaForm({
  action
}: {
  action: (state: CreateAreaState, formData: FormData) => Promise<CreateAreaState>;
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="card form">
      <div className="field">
        <label htmlFor="name">Area name</label>
        <input id="name" name="name" placeholder="Kitchen" required />
      </div>
      <div className="field">
        <label htmlFor="description">Description</label>
        <textarea id="description" name="description" placeholder="Main kitchen perimeter cabinets" rows={3} />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
