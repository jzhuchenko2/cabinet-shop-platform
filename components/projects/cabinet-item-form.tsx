"use client";

import { useFormState, useFormStatus } from "react-dom";
import type { CreateCabinetItemState } from "@/app/(app)/projects/[projectId]/areas/actions";

const itemTypes = [
  "BASE",
  "WALL",
  "TALL",
  "VANITY",
  "PANEL",
  "ISLAND",
  "TRIM",
  "OTHER"
] as const;

type AreaOption = {
  id: string;
  name: string;
};

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <button className="button" disabled={pending} type="submit">
      {pending ? "Adding item..." : "Add cabinet item"}
    </button>
  );
}

export function CabinetItemForm({
  action,
  areas
}: {
  action: (state: CreateCabinetItemState, formData: FormData) => Promise<CreateCabinetItemState>;
  areas: AreaOption[];
}) {
  const [state, formAction] = useFormState(action, {});

  return (
    <form action={formAction} className="card form">
      <h2>New cabinet item</h2>
      <div className="field">
        <label htmlFor="item-area">Area</label>
        <select id="item-area" name="areaId">
          <option value="">Unassigned</option>
          {areas.map((area) => (
            <option key={area.id} value={area.id}>
              {area.name}
            </option>
          ))}
        </select>
      </div>
      <div className="field">
        <label htmlFor="item-name">Item name</label>
        <input id="item-name" name="name" placeholder="Sink base" required />
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="item-number">Item number</label>
          <input id="item-number" name="itemNumber" placeholder="K-101" />
        </div>
        <div className="field">
          <label htmlFor="item-type">Type</label>
          <select id="item-type" name="itemType">
            {itemTypes.map((type) => (
              <option key={type} value={type}>
                {type.replace("_", " ")}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="grid grid-2">
        <div className="field">
          <label htmlFor="quantity">Quantity</label>
          <input id="quantity" min="1" name="quantity" type="number" defaultValue="1" />
        </div>
        <div className="field">
          <label htmlFor="material">Material</label>
          <input id="material" name="material" placeholder="Maple plywood" />
        </div>
      </div>
      <div className="grid grid-3">
        <div className="field">
          <label htmlFor="width">Width</label>
          <input id="width" name="width" placeholder="36" />
        </div>
        <div className="field">
          <label htmlFor="height">Height</label>
          <input id="height" name="height" placeholder="34.5" />
        </div>
        <div className="field">
          <label htmlFor="depth">Depth</label>
          <input id="depth" name="depth" placeholder="24" />
        </div>
      </div>
      <div className="field">
        <label htmlFor="finish">Finish</label>
        <input id="finish" name="finish" placeholder="Painted white" />
      </div>
      <div className="field">
        <label htmlFor="hardware">Hardware</label>
        <input id="hardware" name="hardware" placeholder="Soft-close hinges and slides" />
      </div>
      {state.error ? <p className="form-error">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
