import { prisma } from "@/lib/prisma";

export function listProjectFiles(projectId: string) {
  return prisma.file.findMany({
    where: { projectId },
    include: {
      area: true,
      cabinetItem: true,
      task: true,
      uploadedBy: true
    },
    orderBy: { createdAt: "desc" }
  });
}

export function listProjectPhotos(projectId: string) {
  return prisma.photo.findMany({
    where: { projectId },
    include: {
      area: true,
      cabinetItem: true,
      task: true,
      uploadedBy: true
    },
    orderBy: { createdAt: "desc" }
  });
}

