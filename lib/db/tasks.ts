import { prisma } from "@/lib/prisma";
import type { Priority, TaskStatus } from "@prisma/client";

export function listProjectTasks(projectId: string) {
  return prisma.task.findMany({
    where: { projectId },
    include: {
      area: true,
      cabinetItem: true,
      department: true,
      assignee: true,
      createdBy: true
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
  });
}

export function listDepartmentTasks(departmentId: string) {
  return prisma.task.findMany({
    where: { departmentId },
    include: {
      project: true,
      area: true,
      cabinetItem: true,
      assignee: true
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }]
  });
}

export function createTask({
  projectId,
  areaId,
  cabinetItemId,
  departmentId,
  assigneeId,
  createdById,
  title,
  description,
  status,
  priority,
  dueDate,
  isBlocked,
  blockedReason
}: {
  projectId: string;
  areaId: string | null;
  cabinetItemId: string | null;
  departmentId: string | null;
  assigneeId: string | null;
  createdById: string | null;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: Date | null;
  isBlocked: boolean;
  blockedReason: string | null;
}) {
  return prisma.task.create({
    data: {
      projectId,
      areaId,
      cabinetItemId,
      departmentId,
      assigneeId,
      createdById,
      title,
      description,
      status,
      priority,
      dueDate,
      isBlocked,
      blockedReason
    }
  });
}

export function updateTaskStatus({
  taskId,
  status
}: {
  taskId: string;
  status: TaskStatus;
}) {
  return prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === "DONE" ? new Date() : null,
      isBlocked: status === "BLOCKED",
      blockedReason: status === "BLOCKED" ? undefined : null
    }
  });
}
