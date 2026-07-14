import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { isDepartmentLead, isFullAccess } from "@/lib/rbac";

export function listCalendarItems(user: CurrentUser) {
  const projectWhere = isFullAccess(user)
    ? { organizationId: user.organizationId, status: { not: "CANCELED" as const } }
    : isDepartmentLead(user)
      ? {
          organizationId: user.organizationId,
          status: { not: "CANCELED" as const },
          OR: [
            { currentDepartmentId: user.departmentId ?? "__missing-department__" },
            { tasks: { some: { departmentId: user.departmentId ?? "__missing-department__" } } }
          ]
        }
      : {
          organizationId: user.organizationId,
          status: { not: "CANCELED" as const },
          tasks: { some: { assigneeId: user.id } }
        };

  const taskWhere = isFullAccess(user)
    ? { dueDate: { not: null } }
    : isDepartmentLead(user)
      ? {
          dueDate: { not: null },
          departmentId: user.departmentId ?? "__missing-department__"
        }
      : {
          dueDate: { not: null },
          assigneeId: user.id
        };

  return prisma.project.findMany({
    where: projectWhere,
    include: {
      client: true,
      currentDepartment: true,
      tasks: {
        where: taskWhere,
        include: {
          department: true,
          assignee: true
        },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }]
      }
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
  });
}
