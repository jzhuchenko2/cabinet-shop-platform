import { prisma } from "@/lib/prisma";

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

