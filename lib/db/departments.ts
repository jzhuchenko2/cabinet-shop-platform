import { prisma } from "@/lib/prisma";

export function listDepartments(organizationId: string) {
  return prisma.department.findMany({
    where: { organizationId },
    include: {
      users: true,
      tasks: {
        where: {
          status: { in: ["TODO", "READY", "IN_PROGRESS", "BLOCKED"] }
        },
        include: {
          project: true,
          assignee: true
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }]
      },
      projects: true
    },
    orderBy: { sortOrder: "asc" }
  });
}

export function getDepartment(departmentId: string) {
  return prisma.department.findUnique({
    where: { id: departmentId },
    include: {
      users: true,
      projects: {
        include: { client: true },
        orderBy: { dueDate: "asc" }
      },
      tasks: {
        include: {
          project: true,
          assignee: true
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }]
      }
    }
  });
}

