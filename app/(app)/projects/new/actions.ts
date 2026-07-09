"use server";

import { redirect } from "next/navigation";
import type { DepartmentKey } from "@prisma/client";
import { requiredString } from "@/lib/validations/common";

export type CreateProjectState = {
  error?: string;
};

export async function createProjectAction(
  _previousState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const [{ getCurrentUser }, { createProject }] = await Promise.all([
    import("@/lib/auth"),
    import("@/lib/db/projects")
  ]);

  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "You must be signed in to create a project." };
  }

  const { hasPermission } = await import("@/lib/rbac");

  if (!hasPermission(currentUser, "manage_projects")) {
    return { error: "Your role cannot create projects." };
  }

  let projectId: string;

  try {
    const name = requiredString(formData.get("name"), "Project name");
    const clientName = requiredString(formData.get("client"), "Client");
    const departmentKey = String(formData.get("department") ?? "SALES") as DepartmentKey;
    const dueDateValue = String(formData.get("dueDate") ?? "");

    const project = await createProject({
      organizationId: currentUser.organizationId,
      name,
      clientName,
      departmentKey,
      dueDate: dueDateValue ? new Date(`${dueDateValue}T12:00:00`) : null
    });

    projectId = project.id;
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Project could not be created."
    };
  }

  redirect(`/projects/${projectId}`);
}
