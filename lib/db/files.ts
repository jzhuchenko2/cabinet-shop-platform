import { prisma } from "@/lib/prisma";
import type { FileType } from "@prisma/client";
import type { PdfDeletedPages, PdfMarkupDocument, PdfPageRotations } from "@/lib/pdf-markup";

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
  fileType,
  sourceFileId,
  markupJson,
  pageRotations,
  deletedPages
}: {
  projectId: string;
  uploadedById: string;
  name: string;
  storagePath: string;
  mimeType: string;
  sizeBytes: number;
  fileType: FileType;
  sourceFileId?: string | null;
  markupJson?: PdfMarkupDocument | null;
  pageRotations?: PdfPageRotations | null;
  deletedPages?: PdfDeletedPages | null;
}) {
  return prisma.file.create({
    data: {
      projectId,
      uploadedById,
      name,
      storagePath,
      mimeType,
      sizeBytes,
      fileType,
      sourceFileId,
      markupJson: markupJson ?? undefined,
      pageRotations: pageRotations ?? undefined,
      deletedPages: deletedPages ?? undefined
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

export function updateProjectFileMarkup({
  fileId,
  markupJson,
  pageRotations,
  deletedPages,
  userId
}: {
  fileId: string;
  markupJson: PdfMarkupDocument;
  pageRotations: PdfPageRotations;
  deletedPages: PdfDeletedPages;
  userId: string;
}) {
  return prisma.file.update({
    where: { id: fileId },
    data: {
      markupJson,
      pageRotations,
      deletedPages,
      lastMarkedUpById: userId,
      lastMarkedUpAt: new Date()
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
