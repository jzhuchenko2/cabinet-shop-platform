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

export function listTimeCardProjectOptions(user: CurrentUser) {
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
    select: {
      id: true,
      name: true,
      client: {
        select: { name: true }
      }
    },
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });
}

export function listTimeCardTaskOptions(user: CurrentUser) {
  const where = isFullAccess(user)
    ? { project: { organizationId: user.organizationId } }
    : isDepartmentLead(user)
      ? {
          project: { organizationId: user.organizationId },
          departmentId: user.departmentId ?? "__missing-department__"
        }
      : {
          project: { organizationId: user.organizationId },
          assigneeId: user.id
        };

  return prisma.task.findMany({
    where,
    select: {
      id: true,
      title: true,
      projectId: true,
      project: {
        select: { name: true }
      }
    },
    orderBy: [{ project: { name: "asc" } }, { status: "asc" }, { dueDate: "asc" }]
  });
}

export async function getUserTimeClockState(user: CurrentUser) {
  const now = new Date();
  const startOfToday = new Date(now);
  startOfToday.setHours(0, 0, 0, 0);

  const startOfWeek = new Date(startOfToday);
  const day = startOfWeek.getDay();
  const daysSinceMonday = day === 0 ? 6 : day - 1;
  startOfWeek.setDate(startOfWeek.getDate() - daysSinceMonday);

  const [activeEntry, lastEntry, todayTimeLogs, weekTimeLogs] = await Promise.all([
    prisma.timeClockEntry.findFirst({
      where: {
        userId: user.id,
        endedAt: null
      },
      include: {
        project: true,
        task: true
      },
      orderBy: { startedAt: "desc" }
    }),
    prisma.timeClockEntry.findFirst({
      where: {
        userId: user.id,
        endedAt: { not: null }
      },
      orderBy: { endedAt: "desc" }
    }),
    prisma.timeLog.findMany({
      where: {
        userId: user.id,
        workDate: { gte: startOfToday }
      },
      select: { minutes: true }
    }),
    prisma.timeLog.findMany({
      where: {
        userId: user.id,
        workDate: { gte: startOfWeek }
      },
      select: { minutes: true }
    })
  ]);

  return {
    activeEntry,
    lastEntry,
    todayLoggedMinutes: todayTimeLogs.reduce((total, log) => total + log.minutes, 0),
    weekLoggedMinutes: weekTimeLogs.reduce((total, log) => total + log.minutes, 0)
  };
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
      },
      project: true,
      task: true
    },
    orderBy: { startedAt: "asc" }
  });
}

export function listCompletedTimeClockEntries(user: CurrentUser) {
  const where = isFullAccess(user)
    ? { organizationId: user.organizationId, endedAt: { not: null } }
    : isDepartmentLead(user)
      ? {
          organizationId: user.organizationId,
          endedAt: { not: null },
          user: { departmentId: user.departmentId ?? "__missing-department__" }
        }
      : { userId: user.id, endedAt: { not: null } };

  return prisma.timeClockEntry.findMany({
    where,
    include: {
      user: {
        include: {
          department: true
        }
      },
      project: true,
      task: true
    },
    orderBy: { startedAt: "desc" },
    take: 50
  });
}
