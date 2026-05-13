"use server";

import { redirect } from "next/navigation";
import type { DepartmentKey } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { createProject } from "@/lib/db/projects";
import { requiredString } from "@/lib/validations/common";

export type CreateProjectState = {
  error?: string;
};

export async function createProjectAction(
  _previousState: CreateProjectState,
  formData: FormData
): Promise<CreateProjectState> {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return { error: "You must be signed in to create a project." };
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
