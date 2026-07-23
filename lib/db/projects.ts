import { prisma } from "@/lib/prisma";
import type { DepartmentKey } from "@prisma/client";
import type { CurrentUser } from "@/lib/auth";
import { isDepartmentLead, isFullAccess } from "@/lib/rbac";

export function listProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: {
      client: true,
      currentDepartment: true
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
  });
}

export function listAccessibleProjects(user: CurrentUser) {
  const where = isFullAccess(user)
    ? { organizationId: user.organizationId }
    : isDepartmentLead(user)
      ? {
          organizationId: user.organizationId,
          OR: [
            { currentDepartmentId: user.departmentId ?? "__missing-department__" },
            { tasks: { some: { departmentId: user.departmentId ?? "__missing-department__" } } }
          ]
        }
      : {
          organizationId: user.organizationId,
          tasks: { some: { assigneeId: user.id } }
        };

  return prisma.project.findMany({
    where,
    include: {
      client: true,
      currentDepartment: true
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
  });
}

export function listDashboardProjectStatuses(organizationId: string) {
  return prisma.project.findMany({
    where: {
      organizationId,
      status: { in: ["LEAD", "ACTIVE", "ON_HOLD", "BLOCKED"] }
    },
    include: {
      client: true,
      currentDepartment: true,
      tasks: {
        include: {
          department: true
        }
      },
      timeLogs: {
        include: {
          department: true
        }
      }
    },
    orderBy: [{ isBlocked: "desc" }, { dueDate: "asc" }, { updatedAt: "desc" }]
  });
}

export async function canAccessProject(projectId: string, user: CurrentUser) {
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

  return Boolean(project);
}

export function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      currentDepartment: true,
      areas: {
        include: { cabinetItems: true },
        orderBy: { sortOrder: "asc" }
      },
      tasks: {
        include: {
          assignee: true,
          department: true
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }]
      },
      notes: {
        include: { author: true },
        orderBy: { createdAt: "desc" }
      },
      files: {
        include: { uploadedBy: true },
        orderBy: { createdAt: "desc" }
      },
      photos: {
        include: { uploadedBy: true },
        orderBy: { createdAt: "desc" }
      },
      timeLogs: {
        include: {
          user: true,
          department: true
        },
        orderBy: { workDate: "desc" }
      },
      _count: {
        select: {
          areas: true,
          cabinetItems: true,
          tasks: true,
          files: true,
          photos: true
        }
      }
    }
  });
}

export async function createProject({
  organizationId,
  name,
  clientName,
  departmentKey,
  dueDate
}: {
  organizationId: string;
  name: string;
  clientName: string;
  departmentKey: DepartmentKey;
  dueDate: Date | null;
}) {
  const [client, department] = await Promise.all([
    prisma.client.findFirst({
      where: {
        organizationId,
        name: clientName
      }
    }),
    prisma.department.findFirst({
      where: {
        organizationId,
        workflowKey: departmentKey,
        isActive: true
      }
    })
  ]);

  const projectClient =
    client ??
    (await prisma.client.create({
      data: {
        organizationId,
        name: clientName
      }
    }));

  return prisma.project.create({
    data: {
      organizationId,
      clientId: projectClient.id,
      currentDepartmentId: department?.id,
      name,
      dueDate
    }
  });
}
