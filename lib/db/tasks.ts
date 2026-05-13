import { prisma } from "@/lib/prisma";

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

