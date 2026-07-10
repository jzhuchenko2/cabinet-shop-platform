"use server";

import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hasPermission, isDepartmentLead, isFullAccess } from "@/lib/rbac";

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

async function resolveAllowedWorkScope(user: NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>, formData: FormData) {
  let projectId = optionalString(formData.get("projectId"));
  const taskId = optionalString(formData.get("taskId"));

  if (taskId) {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: { organizationId: user.organizationId },
        ...(isFullAccess(user)
          ? {}
          : isDepartmentLead(user)
            ? { departmentId: user.departmentId ?? "__missing-department__" }
            : { assigneeId: user.id })
      },
      select: { projectId: true }
    });

    if (!task) {
      throw new Error("You cannot assign time to that task.");
    }

    projectId = task.projectId;
  }

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId,
        ...(isFullAccess(user)
          ? {}
          : isDepartmentLead(user)
            ? {
                OR: [
                  { currentDepartmentId: user.departmentId ?? "__missing-department__" },
                  { tasks: { some: { departmentId: user.departmentId ?? "__missing-department__" } } }
                ]
              }
            : { tasks: { some: { assigneeId: user.id } } })
      },
      select: { id: true }
    });

    if (!project) {
      throw new Error("You cannot assign time to that project.");
    }
  }

  return {
    projectId,
    taskId,
    notes: optionalString(formData.get("notes"))
  };
}

async function createTimeLogFromEntry(entryId: string) {
  const entry = await prisma.timeClockEntry.findUnique({
    where: { id: entryId },
    include: {
      project: true,
      task: true
    }
  });

  if (!entry?.endedAt || !entry.projectId) {
    return;
  }

  const minutes = Math.max(1, Math.round((entry.endedAt.getTime() - entry.startedAt.getTime()) / 60000));

  await prisma.timeLog.create({
    data: {
      userId: entry.userId,
      projectId: entry.projectId,
      departmentId: entry.task?.departmentId ?? entry.project?.currentDepartmentId ?? null,
      areaId: entry.task?.areaId ?? null,
      cabinetItemId: entry.task?.cabinetItemId ?? null,
      taskId: entry.taskId,
      minutes,
      workDate: entry.startedAt,
      notes: entry.notes
    }
  });
}

export async function clockInAction(_formData?: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to clock in.");
  }

  const formData = _formData ?? new FormData();
  const scope = await resolveAllowedWorkScope(user, formData);
  const activeEntry = await prisma.timeClockEntry.findFirst({
    where: {
      userId: user.id,
      endedAt: null
    }
  });

  if (!activeEntry) {
    await prisma.timeClockEntry.create({
      data: {
        organizationId: user.organizationId,
        userId: user.id,
        projectId: scope.projectId,
        taskId: scope.taskId,
        notes: scope.notes,
        source: "MANUAL",
        verificationNote: "Future verification: shop Wi-Fi, QR/NFC, or geofence proximity."
      }
    });
  }

  revalidatePath("/dashboard");
  revalidatePath("/time-cards");
}

export async function clockOutAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to clock out.");
  }

  const entryId = String(formData.get("entryId") ?? "");
  const activeEntry = await prisma.timeClockEntry.findFirst({
    where: {
      ...(entryId ? { id: entryId } : {}),
      userId: user.id,
      endedAt: null
    }
  });

  if (activeEntry) {
    await prisma.timeClockEntry.update({
      where: { id: activeEntry.id },
      data: { endedAt: new Date() }
    });
    await createTimeLogFromEntry(activeEntry.id);
  }

  revalidatePath("/dashboard");
  revalidatePath("/time-cards");
}

export async function updateTimeCardScopeAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to update a time card.");
  }

  const entryId = String(formData.get("entryId") ?? "");
  const scope = await resolveAllowedWorkScope(user, formData);
  const entry = await prisma.timeClockEntry.findFirst({
    where: {
      id: entryId,
      organizationId: user.organizationId,
      endedAt: null,
      ...(hasPermission(user, "manage_time_clock") ? {} : { userId: user.id })
    }
  });

  if (!entry) {
    throw new Error("You cannot update that time card.");
  }

  await prisma.timeClockEntry.update({
    where: { id: entry.id },
    data: scope
  });

  revalidatePath("/dashboard");
  revalidatePath("/time-cards");
}

export async function stopTimeCardAction(formData: FormData) {
  const user = await getCurrentUser();

  if (!user) {
    throw new Error("You must be signed in to stop a time card.");
  }

  const entryId = String(formData.get("entryId") ?? "");
  const entry = await prisma.timeClockEntry.findFirst({
    where: {
      id: entryId,
      organizationId: user.organizationId,
      endedAt: null,
      ...(hasPermission(user, "manage_time_clock") ? {} : { userId: user.id })
    }
  });

  if (!entry) {
    throw new Error("You cannot stop that time card.");
  }

  await prisma.timeClockEntry.update({
    where: { id: entry.id },
    data: { endedAt: new Date() }
  });
  await createTimeLogFromEntry(entry.id);

  revalidatePath("/dashboard");
  revalidatePath("/time-cards");
}
