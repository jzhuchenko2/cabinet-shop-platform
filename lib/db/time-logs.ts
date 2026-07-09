import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { isDepartmentLead, isFullAccess } from "@/lib/rbac";

export function listProjectTimeLogs(projectId: string) {
  return prisma.timeLog.findMany({
    where: { projectId },
    include: {
      user: true,
      department: true,
      area: true,
      cabinetItem: true,
      task: true
    },
    orderBy: { workDate: "desc" }
  });
}

export function listUserTimeLogs(userId: string) {
  return prisma.timeLog.findMany({
    where: { userId },
    include: {
      project: true,
      department: true,
      task: true
    },
    orderBy: { workDate: "desc" }
  });
}

export function listAccessibleTimeLogs(user: CurrentUser) {
  const where = isFullAccess(user)
    ? { project: { organizationId: user.organizationId } }
    : isDepartmentLead(user)
      ? { project: { organizationId: user.organizationId }, departmentId: user.departmentId ?? "__missing-department__" }
      : { userId: user.id };

  return prisma.timeLog.findMany({
    where,
    include: {
      user: true,
      project: true,
      department: true,
      task: true
    },
    orderBy: { workDate: "desc" }
  });
}

export async function getUserTimeClockState(user: CurrentUser) {
  const [activeEntry, lastEntry] = await Promise.all([
    prisma.timeClockEntry.findFirst({
      where: {
        userId: user.id,
        endedAt: null
      },
      orderBy: { startedAt: "desc" }
    }),
    prisma.timeClockEntry.findFirst({
      where: {
        userId: user.id,
        endedAt: { not: null }
      },
      orderBy: { endedAt: "desc" }
    })
  ]);

  return { activeEntry, lastEntry };
}

export function listActiveTimeClockEntries(user: CurrentUser) {
  const where = isFullAccess(user)
    ? { organizationId: user.organizationId, endedAt: null }
    : isDepartmentLead(user)
      ? {
          organizationId: user.organizationId,
          endedAt: null,
          user: { departmentId: user.departmentId ?? "__missing-department__" }
        }
      : { userId: user.id, endedAt: null };

  return prisma.timeClockEntry.findMany({
    where,
    include: {
      user: {
        include: {
          department: true
        }
      }
    },
    orderBy: { startedAt: "asc" }
  });
}
