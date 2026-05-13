import { prisma } from "@/lib/prisma";

export function listProjectNotes(projectId: string) {
  return prisma.note.findMany({
    where: { projectId },
    include: {
      area: true,
      cabinetItem: true,
      task: true,
      author: true
    },
    orderBy: { createdAt: "desc" }
  });
}

