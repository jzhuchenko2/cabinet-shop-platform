"use server";

import { revalidatePath } from "next/cache";
import type { Priority, TaskStatus } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/db/projects";
import { canUpdateTaskStatus, createTask, updateTaskStatus } from "@/lib/db/tasks";
import { hasPermission } from "@/lib/rbac";
import { requiredString } from "@/lib/validations/common";

export type CreateTaskState = {
  error?: string;
};

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

export async function createTaskAction(
  projectId: string,
  _previousState: CreateTaskState,
  formData: FormData
): Promise<CreateTaskState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "You must be signed in to create a task." };
  }

  if (!hasPermission(currentUser, "manage_tasks")) {
    return { error: "Your role cannot create tasks." };
  }

  if (!(await canAccessProject(projectId, currentUser))) {
    return { error: "You cannot create tasks for this project." };
  }

  try {
    const title = requiredString(formData.get("title"), "Task title");
    const description = optionalString(formData.get("description"));
    const status = String(formData.get("status") ?? "TODO") as TaskStatus;
    const priority = String(formData.get("priority") ?? "NORMAL") as Priority;
    const dueDateValue = optionalString(formData.get("dueDate"));
    const blockedReason = optionalString(formData.get("blockedReason"));
    const isBlocked = status === "BLOCKED" || Boolean(blockedReason);

    await createTask({
      projectId,
      areaId: optionalString(formData.get("areaId")),
      cabinetItemId: optionalString(formData.get("cabinetItemId")),
      departmentId: optionalString(formData.get("departmentId")),
      assigneeId: optionalString(formData.get("assigneeId")),
      createdById: currentUser.id,
      title,
      description,
      status,
      priority,
      dueDate: dueDateValue ? new Date(`${dueDateValue}T12:00:00`) : null,
      isBlocked,
      blockedReason
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Task could not be created."
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath("/dashboard");
  revalidatePath("/shop-floor");
  return {};
}

export async function updateTaskStatusAction(projectId: string, formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return;
  }

  const taskId = requiredString(formData.get("taskId"), "Task");
  const status = String(formData.get("status") ?? "TODO") as TaskStatus;

  if (!(await canUpdateTaskStatus(taskId, currentUser))) {
    return;
  }

  await updateTaskStatus({
    taskId,
    status
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/tasks`);
  revalidatePath("/dashboard");
  revalidatePath("/shop-floor");
}
