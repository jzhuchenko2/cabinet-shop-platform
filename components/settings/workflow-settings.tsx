"use client";

import { useMemo } from "react";
import { useFormState, useFormStatus } from "react-dom";
import type { SettingsActionState } from "@/app/(app)/settings/actions";

type DepartmentSetting = {
  id: string;
  name: string;
  workflowKey: string;
  sortOrder: number;
  deadlineLabel: string | null;
  isActive: boolean;
  _count: {
    users: number;
    projects: number;
    tasks: number;
    timeLogs: number;
  };
};

type WorkflowOption = {
  key: string;
  name: string;
  deadline: string;
};

type WorkflowSettingsProps = {
  departments: DepartmentSetting[];
  workflowOptions: WorkflowOption[];
  addAction: (state: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  updateAction: (state: SettingsActionState, formData: FormData) => Promise<SettingsActionState>;
  moveAction: (formData: FormData) => Promise<void>;
  activeAction: (formData: FormData) => Promise<void>;
};

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <button className="button secondary" disabled={pending} type="submit">
      {pending ? "Saving..." : label}
    </button>
  );
}

function WorkflowRow({
  department,
  canMoveUp,
  canMoveDown,
  updateAction,
  moveAction,
  activeAction
}: {
  department: DepartmentSetting;
  canMoveUp: boolean;
  canMoveDown: boolean;
  updateAction: WorkflowSettingsProps["updateAction"];
  moveAction: WorkflowSettingsProps["moveAction"];
  activeAction: WorkflowSettingsProps["activeAction"];
}) {
  const [state, formAction] = useFormState(updateAction, {});
  const relatedCount = department._count.projects + department._count.tasks + department._count.timeLogs + department._count.users;

  return (
    <article className={department.isActive ? "settings-workflow-row" : "settings-workflow-row inactive"}>
      <form action={formAction} className="settings-workflow-form">
        <input name="departmentId" type="hidden" value={department.id} />
        <div className="settings-workflow-index">
          <strong>{department.isActive ? department.sortOrder : "-"}</strong>
          <span>{department.workflowKey.replaceAll("_", " ")}</span>
        </div>
        <div className="field">
          <label htmlFor={`department-name-${department.id}`}>Name</label>
          <input id={`department-name-${department.id}`} name="name" required defaultValue={department.name} />
        </div>
        <div className="field">
          <label htmlFor={`department-deadline-${department.id}`}>Due target</label>
          <input id={`department-deadline-${department.id}`} name="deadlineLabel" placeholder="2 business days" defaultValue={department.deadlineLabel ?? ""} />
        </div>
        <div className="settings-workflow-usage">
          <span>{department._count.projects} projects</span>
          <span>{department._count.tasks} tasks</span>
          <span>{department._count.users} users</span>
        </div>
        <div className="settings-workflow-actions">
          <SubmitButton label="Save" />
          {state.error ? <span className="form-error">{state.error}</span> : null}
          {state.message ? <span className="form-success">{state.message}</span> : null}
        </div>
      </form>
      <div className="settings-workflow-controls">
        {department.isActive ? (
          <>
            <form action={moveAction}>
              <input name="departmentId" type="hidden" value={department.id} />
              <input name="direction" type="hidden" value="up" />
              <button className="icon-button" disabled={!canMoveUp} title="Move up" type="submit">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="m18 15-6-6-6 6" />
                </svg>
              </button>
            </form>
            <form action={moveAction}>
              <input name="departmentId" type="hidden" value={department.id} />
              <input name="direction" type="hidden" value="down" />
              <button className="icon-button" disabled={!canMoveDown} title="Move down" type="submit">
                <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24">
                  <path d="m6 9 6 6 6-6" />
                </svg>
              </button>
            </form>
          </>
        ) : null}
        <form action={activeAction}>
          <input name="departmentId" type="hidden" value={department.id} />
          <input name="isActive" type="hidden" value={department.isActive ? "false" : "true"} />
          <button className={department.isActive ? "button danger" : "button"} title={relatedCount > 0 ? "Keeps history attached" : undefined} type="submit">
            {department.isActive ? "Hide" : "Restore"}
          </button>
        </form>
      </div>
    </article>
  );
}

export function WorkflowSettings({
  departments,
  workflowOptions,
  addAction,
  updateAction,
  moveAction,
  activeAction
}: WorkflowSettingsProps) {
  const [addState, addFormAction] = useFormState(addAction, {});
  const activeDepartments = departments.filter((department) => department.isActive);
  const inactiveDepartments = departments.filter((department) => !department.isActive);
  const existingKeys = useMemo(() => new Set(departments.map((department) => department.workflowKey)), [departments]);
  const addOptions = workflowOptions.filter((option) => !existingKeys.has(option.key) || inactiveDepartments.some((department) => department.workflowKey === option.key));

  return (
    <section className="settings-workspace">
      <div className="card settings-panel">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Workflow</p>
            <h2>Project flow</h2>
          </div>
          <span className="status-pill ready">{activeDepartments.length} active</span>
        </div>

        <div className="settings-workflow-list">
          {activeDepartments.map((department, index) => (
            <WorkflowRow
              activeAction={activeAction}
              canMoveDown={index < activeDepartments.length - 1}
              canMoveUp={index > 0}
              department={department}
              key={department.id}
              moveAction={moveAction}
              updateAction={updateAction}
            />
          ))}
        </div>
      </div>

      <aside className="settings-side-panel">
        <section className="card">
          <p className="eyebrow">Add stage</p>
          <h2>Workflow stage</h2>
          <form action={addFormAction} className="form">
            <div className="field">
              <label htmlFor="workflow-key">Stage type</label>
              <select id="workflow-key" name="workflowKey" required>
                {addOptions.map((option) => (
                  <option key={option.key} value={option.key}>
                    {option.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="workflow-name">Display name</label>
              <input id="workflow-name" name="name" placeholder="Assembly" required />
            </div>
            <div className="field">
              <label htmlFor="workflow-deadline">Due target</label>
              <input id="workflow-deadline" name="deadlineLabel" placeholder="3 business days" />
            </div>
            {addState.error ? <p className="form-error">{addState.error}</p> : null}
            {addState.message ? <p className="form-success">{addState.message}</p> : null}
            <button className="button" disabled={addOptions.length === 0} type="submit">
              Add stage
            </button>
          </form>
        </section>

        {inactiveDepartments.length > 0 ? (
          <section className="card">
            <p className="eyebrow">Hidden</p>
            <h2>Inactive stages</h2>
            <div className="settings-hidden-list">
              {inactiveDepartments.map((department) => (
                <WorkflowRow
                  activeAction={activeAction}
                  canMoveDown={false}
                  canMoveUp={false}
                  department={department}
                  key={department.id}
                  moveAction={moveAction}
                  updateAction={updateAction}
                />
              ))}
            </div>
          </section>
        ) : null}
      </aside>
    </section>
  );
}
