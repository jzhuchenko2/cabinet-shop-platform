"use server";

import { revalidatePath } from "next/cache";
import type { CabinetItemType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { createArea, createCabinetItem } from "@/lib/db/areas";
import { canAccessProject } from "@/lib/db/projects";
import { hasPermission } from "@/lib/rbac";
import { requiredString } from "@/lib/validations/common";

export type CreateAreaState = {
  error?: string;
};

export async function createAreaAction(
  projectId: string,
  _previousState: CreateAreaState,
  formData: FormData
): Promise<CreateAreaState> {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "manage_projects")) {
    return { error: "Your role cannot create project areas." };
  }

  if (!currentUser || !(await canAccessProject(projectId, currentUser))) {
    return { error: "You cannot create areas for this project." };
  }

  try {
    const name = requiredString(formData.get("name"), "Area name");
    const descriptionValue = String(formData.get("description") ?? "").trim();

    await createArea({
      projectId,
      name,
      description: descriptionValue || null
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Area could not be created."
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/areas`);
  return {};
}

export type CreateCabinetItemState = {
  error?: string;
};

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseQuantity(value: FormDataEntryValue | null) {
  const quantity = Number(value ?? 1);

  if (!Number.isInteger(quantity) || quantity < 1) {
    throw new Error("Quantity must be a whole number of 1 or more.");
  }

  return quantity;
}

export async function createCabinetItemAction(
  projectId: string,
  _previousState: CreateCabinetItemState,
  formData: FormData
): Promise<CreateCabinetItemState> {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "manage_projects")) {
    return { error: "Your role cannot create cabinet items." };
  }

  if (!currentUser || !(await canAccessProject(projectId, currentUser))) {
    return { error: "You cannot create cabinet items for this project." };
  }

  try {
    const name = requiredString(formData.get("name"), "Cabinet item name");
    const itemType = String(formData.get("itemType") ?? "OTHER") as CabinetItemType;

    await createCabinetItem({
      projectId,
      areaId: optionalString(formData.get("areaId")),
      name,
      itemNumber: optionalString(formData.get("itemNumber")),
      itemType,
      quantity: parseQuantity(formData.get("quantity")),
      width: optionalString(formData.get("width")),
      height: optionalString(formData.get("height")),
      depth: optionalString(formData.get("depth")),
      material: optionalString(formData.get("material")),
      finish: optionalString(formData.get("finish")),
      hardware: optionalString(formData.get("hardware"))
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Cabinet item could not be created."
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/areas`);
  return {};
}
