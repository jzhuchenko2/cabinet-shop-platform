"use server";

import { revalidatePath } from "next/cache";
import type { DepartmentKey } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";
import { getCurrentUser } from "@/lib/auth";
import {
  moveWorkflowDepartment,
  setWorkflowDepartmentActive,
  updateWorkflowDepartment,
  upsertWorkflowDepartment
} from "@/lib/db/departments";
import { isFullAccess } from "@/lib/rbac";
import { requiredString } from "@/lib/validations/common";

export type SettingsActionState = {
  error?: string;
  message?: string;
};

const departmentKeys: DepartmentKey[] = [
  "SALES",
  "DESIGN",
  "APPROVAL",
  "SCHEDULING",
  "PURCHASING",
  "CUT_MILL",
  "FACE_FRAME",
  "ASSEMBLY",
  "SAND_PREP",
  "FINISH",
  "FINAL_ASSEMBLY",
  "QC",
  "DELIVERY",
  "INSTALL",
  "CLOSEOUT"
];

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseDepartmentKey(value: FormDataEntryValue | null) {
  const key = String(value ?? "") as DepartmentKey;

  if (!departmentKeys.includes(key)) {
    throw new Error("Choose a valid workflow stage.");
  }

  return key;
}

async function requireManager(): Promise<CurrentUser> {
  const currentUser = await getCurrentUser();

  if (!currentUser || !isFullAccess(currentUser)) {
    throw new Error("Only managers can update settings.");
  }

  return currentUser;
}

function revalidateWorkflowPaths() {
  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/projects");
  revalidatePath("/projects/new");
}

export async function addWorkflowDepartmentAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const currentUser = await requireManager();
    await upsertWorkflowDepartment({
      organizationId: currentUser.organizationId,
      workflowKey: parseDepartmentKey(formData.get("workflowKey")),
      name: requiredString(formData.get("name"), "Department name"),
      deadlineLabel: optionalString(formData.get("deadlineLabel"))
    });
    revalidateWorkflowPaths();
    return { message: "Workflow stage added." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Workflow stage could not be added." };
  }
}

export async function updateWorkflowDepartmentAction(
  _previousState: SettingsActionState,
  formData: FormData
): Promise<SettingsActionState> {
  try {
    const currentUser = await requireManager();
    await updateWorkflowDepartment({
      organizationId: currentUser.organizationId,
      departmentId: requiredString(formData.get("departmentId"), "Department"),
      name: requiredString(formData.get("name"), "Department name"),
      deadlineLabel: optionalString(formData.get("deadlineLabel"))
    });
    revalidateWorkflowPaths();
    return { message: "Workflow stage updated." };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Workflow stage could not be updated." };
  }
}

export async function moveWorkflowDepartmentAction(formData: FormData) {
  const currentUser = await requireManager();
  const direction = String(formData.get("direction"));

  if (direction !== "up" && direction !== "down") {
    return;
  }

  await moveWorkflowDepartment({
    organizationId: currentUser.organizationId,
    departmentId: requiredString(formData.get("departmentId"), "Department"),
    direction
  });
  revalidateWorkflowPaths();
}

export async function setWorkflowDepartmentActiveAction(formData: FormData) {
  const currentUser = await requireManager();

  await setWorkflowDepartmentActive({
    organizationId: currentUser.organizationId,
    departmentId: requiredString(formData.get("departmentId"), "Department"),
    isActive: String(formData.get("isActive")) === "true"
  });
  revalidateWorkflowPaths();
}
