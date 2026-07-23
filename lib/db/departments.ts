import { prisma } from "@/lib/prisma";
import type { DepartmentKey } from "@prisma/client";

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

export function listDepartmentOptions(organizationId: string) {
  return prisma.department.findMany({
    where: { organizationId, isActive: true },
    orderBy: { sortOrder: "asc" }
  });
}

export function listWorkflowDepartments(organizationId: string) {
  return prisma.department.findMany({
    where: {
      organizationId,
      isActive: true
    },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: {
      id: true,
      name: true,
      workflowKey: true,
      sortOrder: true,
      deadlineLabel: true
    }
  });
}

export function listDepartmentSettings(organizationId: string) {
  return prisma.department.findMany({
    where: {
      organizationId
    },
    orderBy: [{ isActive: "desc" }, { sortOrder: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      workflowKey: true,
      sortOrder: true,
      deadlineLabel: true,
      isActive: true,
      _count: {
        select: {
          users: true,
          projects: true,
          tasks: true,
          timeLogs: true
        }
      }
    }
  });
}

async function normalizeDepartmentSortOrder(organizationId: string) {
  const departments = await prisma.department.findMany({
    where: { organizationId, isActive: true },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
    select: { id: true }
  });

  if (departments.length === 0) {
    return;
  }

  await prisma.$transaction(
    departments.map((department, index) =>
      prisma.department.update({
        where: { id: department.id },
        data: { sortOrder: index + 1 }
      })
    )
  );
}

export async function upsertWorkflowDepartment({
  organizationId,
  workflowKey,
  name,
  deadlineLabel
}: {
  organizationId: string;
  workflowKey: DepartmentKey;
  name: string;
  deadlineLabel: string | null;
}) {
  const activeCount = await prisma.department.count({
    where: {
      organizationId,
      isActive: true
    }
  });

  const department = await prisma.department.upsert({
    where: {
      organizationId_workflowKey: {
        organizationId,
        workflowKey
      }
    },
    update: {
      name,
      deadlineLabel,
      isActive: true,
      sortOrder: activeCount + 1
    },
    create: {
      organizationId,
      workflowKey,
      name,
      deadlineLabel,
      isActive: true,
      sortOrder: activeCount + 1
    }
  });

  await normalizeDepartmentSortOrder(organizationId);
  return department;
}

export async function updateWorkflowDepartment({
  organizationId,
  departmentId,
  name,
  deadlineLabel
}: {
  organizationId: string;
  departmentId: string;
  name: string;
  deadlineLabel: string | null;
}) {
  return prisma.department.updateMany({
    where: {
      id: departmentId,
      organizationId
    },
    data: {
      name,
      deadlineLabel
    }
  });
}

export async function setWorkflowDepartmentActive({
  organizationId,
  departmentId,
  isActive
}: {
  organizationId: string;
  departmentId: string;
  isActive: boolean;
}) {
  const sortOrder = isActive
    ? (await prisma.department.count({
        where: {
          organizationId,
          isActive: true
        }
      })) + 1
    : undefined;

  await prisma.department.updateMany({
    where: {
      id: departmentId,
      organizationId
    },
    data: {
      isActive,
      ...(sortOrder ? { sortOrder } : {})
    }
  });

  await normalizeDepartmentSortOrder(organizationId);
}

export async function moveWorkflowDepartment({
  organizationId,
  departmentId,
  direction
}: {
  organizationId: string;
  departmentId: string;
  direction: "up" | "down";
}) {
  const departments = await prisma.department.findMany({
    where: {
      organizationId,
      isActive: true
    },
    orderBy: [{ sortOrder: "asc" }, { updatedAt: "asc" }],
    select: {
      id: true,
      sortOrder: true
    }
  });
  const currentIndex = departments.findIndex((department) => department.id === departmentId);
  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (currentIndex < 0 || targetIndex < 0 || targetIndex >= departments.length) {
    return;
  }

  const current = departments[currentIndex];
  const target = departments[targetIndex];

  await prisma.$transaction([
    prisma.department.update({
      where: { id: current.id },
      data: { sortOrder: target.sortOrder }
    }),
    prisma.department.update({
      where: { id: target.id },
      data: { sortOrder: current.sortOrder }
    })
  ]);

  await normalizeDepartmentSortOrder(organizationId);
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
