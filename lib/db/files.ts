import { prisma } from "@/lib/prisma";
import type { FileType } from "@prisma/client";

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

export function getProjectFile(fileId: string) {
  return prisma.file.findUnique({
    where: { id: fileId },
    include: {
      project: true,
      uploadedBy: true
    }
  });
}

export function createProjectFile({
  projectId,
  uploadedById,
  name,
  storagePath,
  mimeType,
  sizeBytes,
  fileType
}: {
  projectId: string;
  uploadedById: string;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  fileType: FileType;
}) {
  return prisma.file.create({
    data: {
      projectId,
      uploadedById,
      name,
      storagePath,
      mimeType,
      sizeBytes,
      fileType
    }
  });
}

export function updateProjectFile({
  fileId,
  name,
  fileType
}: {
  fileId: string;
  name: string;
  fileType: FileType;
}) {
  return prisma.file.update({
    where: { id: fileId },
    data: {
      name,
      fileType
    }
  });
}

export function deleteProjectFile(fileId: string) {
  return prisma.file.delete({
    where: { id: fileId }
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
