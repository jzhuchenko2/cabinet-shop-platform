"use server";

import { revalidatePath } from "next/cache";
import type { FileType } from "@prisma/client";
import { degrees, PDFDocument, type PDFPage, rgb, StandardFonts } from "pdf-lib";
import { getCurrentUser } from "@/lib/auth";
import { createProjectFile, deleteProjectFile, getProjectFile, updateProjectFile, updateProjectFileMarkup } from "@/lib/db/files";
import { canAccessProject } from "@/lib/db/projects";
import {
  parsePdfDeletedPagesJson,
  parsePdfMarkupJson,
  parsePdfPageRotationsJson,
  type PdfDeletedPages,
  type PdfMarkup,
  type PdfMarkupDocument,
  type PdfPageRotations
} from "@/lib/pdf-markup";
import { hasPermission } from "@/lib/rbac";
import { ensureProjectFilesBucket, getSupabaseAdminClient, projectFilesBucket } from "@/lib/supabase-admin";
import { requiredString } from "@/lib/validations/common";

export type ProjectFileActionState = {
  error?: string;
  message?: string;
};

export type ProjectFileMarkupActionState = {
  error?: string;
  message?: string;
};

const fileTypes: FileType[] = ["DOCUMENT", "DRAWING", "APPROVAL", "CUT_LIST", "HARDWARE", "OTHER"];

function parseFileType(value: FormDataEntryValue | null) {
  const fileType = String(value ?? "DOCUMENT") as FileType;

  if (!fileTypes.includes(fileType)) {
    throw new Error("Choose a valid file type.");
  }

  return fileType;
}

function cleanFileName(value: string) {
  return value.trim().replace(/[\\/:*?"<>|]+/g, "-").replace(/\s+/g, " ");
}

function requirePdfName(value: string) {
  const name = cleanFileName(value);

  if (!name.toLowerCase().endsWith(".pdf")) {
    throw new Error("PDF file names must end in .pdf.");
  }

  return name;
}

async function requireProjectFileManager(projectId: string) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    throw new Error("You must be signed in to manage project files.");
  }

  if (!hasPermission(currentUser, "manage_project_files")) {
    throw new Error("Your role can view and download files, but cannot manage PDFs.");
  }

  if (!(await canAccessProject(projectId, currentUser))) {
    throw new Error("You cannot manage files for this project.");
  }

  return currentUser;
}

async function requireManagedFile(projectId: string, fileId: string) {
  const file = await getProjectFile(fileId);

  if (!file || file.projectId !== projectId) {
    throw new Error("File not found for this project.");
  }

  return file;
}

function hexToRgb(value: string) {
  const normalized = value.replace("#", "");
  const red = parseInt(normalized.slice(0, 2), 16) / 255;
  const green = parseInt(normalized.slice(2, 4), 16) / 255;
  const blue = parseInt(normalized.slice(4, 6), 16) / 255;

  return rgb(red, green, blue);
}

function getPdfPoint(pageWidth: number, pageHeight: number, annotation: PdfMarkup) {
  return {
    x: (annotation.x ?? 0) * pageWidth,
    y: pageHeight - (annotation.y ?? 0) * pageHeight
  };
}

function scaledPoint(pageWidth: number, pageHeight: number, point: { x: number; y: number }) {
  return {
    x: point.x * pageWidth,
    y: pageHeight - point.y * pageHeight
  };
}

function drawArrowHead(page: PDFPage, options: { start: { x: number; y: number }; end: { x: number; y: number }; color: ReturnType<typeof rgb>; thickness: number }) {
  const angle = Math.atan2(options.end.y - options.start.y, options.end.x - options.start.x);
  const length = Math.max(12, options.thickness * 5);
  const left = angle + Math.PI * 0.82;
  const right = angle - Math.PI * 0.82;

  page.drawLine({
    start: options.end,
    end: {
      x: options.end.x + Math.cos(left) * length,
      y: options.end.y + Math.sin(left) * length
    },
    color: options.color,
    thickness: options.thickness
  });
  page.drawLine({
    start: options.end,
    end: {
      x: options.end.x + Math.cos(right) * length,
      y: options.end.y + Math.sin(right) * length
    },
    color: options.color,
    thickness: options.thickness
  });
}

async function applyMarkupToPdf(bytes: Buffer, markupJson: PdfMarkupDocument, pageRotations: PdfPageRotations, deletedPages: PdfDeletedPages) {
  const pdfDoc = await PDFDocument.load(bytes);
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const pages = pdfDoc.getPages();

  pages.forEach((page, index) => {
    const pageNumber = index + 1;
    const rotation = pageRotations[String(pageNumber)];

    if (rotation !== undefined) {
      page.setRotation(degrees(rotation));
    }
  });

  markupJson.annotations.forEach((annotation) => {
    const page = pages[annotation.page - 1];

    if (!page) {
      return;
    }

    const { width, height } = page.getSize();
    const color = hexToRgb(annotation.color);
    const thickness = annotation.lineWidth;
    const opacity = annotation.opacity;

    if ((annotation.type === "pen" || annotation.type === "arrow") && annotation.points && annotation.points.length >= 2) {
      const points = annotation.points.map((point) => scaledPoint(width, height, point));

      points.slice(1).forEach((point, pointIndex) => {
        page.drawLine({
          start: points[pointIndex],
          end: point,
          color,
          thickness,
          opacity
        });
      });

      if (annotation.type === "arrow") {
        drawArrowHead(page, {
          start: points[points.length - 2],
          end: points[points.length - 1],
          color,
          thickness
        });
      }
    }

    if (annotation.type === "rect" || annotation.type === "highlight") {
      const x = (annotation.x ?? 0) * width;
      const boxWidth = (annotation.width ?? 0) * width;
      const boxHeight = (annotation.height ?? 0) * height;
      const y = height - (annotation.y ?? 0) * height - boxHeight;

      page.drawRectangle({
        x,
        y,
        width: boxWidth,
        height: boxHeight,
        borderColor: annotation.type === "rect" ? color : undefined,
        borderWidth: annotation.type === "rect" ? thickness : 0,
        color: annotation.type === "highlight" ? color : undefined,
        opacity: annotation.type === "highlight" ? opacity : undefined
      });
    }

    if (annotation.type === "text" && annotation.text) {
      const point = getPdfPoint(width, height, annotation);
      page.drawText(annotation.text, {
        x: point.x,
        y: point.y,
        color,
        font,
        size: Math.max(10, thickness * 5),
        lineHeight: Math.max(12, thickness * 6),
        maxWidth: width * 0.42,
        opacity
      });
    }
  });

  [...deletedPages]
    .sort((a, b) => b - a)
    .forEach((pageNumber) => {
      if (pageNumber >= 1 && pageNumber <= pdfDoc.getPageCount()) {
        pdfDoc.removePage(pageNumber - 1);
      }
    });

  return Buffer.from(await pdfDoc.save());
}

export async function saveProjectFileMarkupAction(
  projectId: string,
  _previousState: ProjectFileMarkupActionState,
  formData: FormData
): Promise<ProjectFileMarkupActionState> {
  try {
    const currentUser = await requireProjectFileManager(projectId);
    const fileId = requiredString(formData.get("fileId"), "File");
    await requireManagedFile(projectId, fileId);
    const { markupJson, pageRotations, deletedPages } = parseMarkupForm(formData);

    await updateProjectFileMarkup({
      fileId,
      markupJson,
      pageRotations,
      deletedPages,
      userId: currentUser.id
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Markup could not be saved."
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/files`);
  return { message: "Markup saved." };
}

export async function exportProjectFileMarkupAction(
  projectId: string,
  _previousState: ProjectFileMarkupActionState,
  formData: FormData
): Promise<ProjectFileMarkupActionState> {
  let uploadedPath: string | null = null;
  let shouldCleanupUpload = false;

  try {
    const currentUser = await requireProjectFileManager(projectId);
    const fileId = requiredString(formData.get("fileId"), "File");
    const file = await requireManagedFile(projectId, fileId);
    const { markupJson, pageRotations, deletedPages } = parseMarkupForm(formData);

    if (file.project.organizationId !== currentUser.organizationId) {
      throw new Error("You cannot export files outside your organization.");
    }

    await ensureProjectFilesBucket();
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase.storage.from(projectFilesBucket).download(file.storagePath);

    if (error || !data) {
      throw new Error(error?.message ?? "Original PDF could not be loaded.");
    }

    const originalBytes = Buffer.from(await data.arrayBuffer());
    const revisedBytes = await applyMarkupToPdf(originalBytes, markupJson, pageRotations, deletedPages);
    const baseName = file.name.replace(/\.pdf$/i, "");
    const revisionName = requirePdfName(`${baseName} - marked up.pdf`);
    uploadedPath = `organizations/${currentUser.organizationId}/projects/${projectId}/files/${crypto.randomUUID()}-marked-up.pdf`;

    const { error: uploadError } = await supabase.storage.from(projectFilesBucket).upload(uploadedPath, revisedBytes, {
      contentType: "application/pdf",
      upsert: false
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    shouldCleanupUpload = true;

    await updateProjectFileMarkup({
      fileId,
      markupJson,
      pageRotations,
      deletedPages,
      userId: currentUser.id
    });

    await createProjectFile({
      projectId,
      uploadedById: currentUser.id,
      name: revisionName,
      storagePath: uploadedPath,
      mimeType: "application/pdf",
      sizeBytes: revisedBytes.length,
      fileType: file.fileType,
      sourceFileId: file.id,
      markupJson,
      pageRotations,
      deletedPages
    });
  } catch (error) {
    if (uploadedPath && shouldCleanupUpload) {
      try {
        await getSupabaseAdminClient().storage.from(projectFilesBucket).remove([uploadedPath]);
      } catch {
        // The export already failed from the user's perspective; do not hide the original error.
      }
    }

    return {
      error: error instanceof Error ? error.message : "Marked-up PDF could not be exported."
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/files`);
  return { message: "Marked-up PDF saved as a new revision." };
}

function parseMarkupForm(formData: FormData) {
  return {
    markupJson: parsePdfMarkupJson(requiredString(formData.get("markupJson"), "Markup data")),
    pageRotations: parsePdfPageRotationsJson(String(formData.get("pageRotations") ?? "{}")),
    deletedPages: parsePdfDeletedPagesJson(String(formData.get("deletedPages") ?? "[]"))
  };
}

export async function uploadProjectFileAction(
  projectId: string,
  _previousState: ProjectFileActionState,
  formData: FormData
): Promise<ProjectFileActionState> {
  let uploadedPath: string | null = null;
  let shouldCleanupUpload = false;

  try {
    const currentUser = await requireProjectFileManager(projectId);
    const fileEntry = formData.get("file");

    if (!(fileEntry instanceof File) || fileEntry.size === 0) {
      throw new Error("Choose a PDF to upload.");
    }

    const fallbackName = fileEntry.name || "project-file.pdf";
    const displayName = requirePdfName(String(formData.get("name") || fallbackName));
    const fileType = parseFileType(formData.get("fileType"));
    const buffer = Buffer.from(await fileEntry.arrayBuffer());

    if (buffer.subarray(0, 4).toString("utf8") !== "%PDF") {
      throw new Error("Only valid PDF files can be uploaded.");
    }

    const storageName = cleanFileName(fallbackName.toLowerCase().endsWith(".pdf") ? fallbackName : displayName);
    uploadedPath = `organizations/${currentUser.organizationId}/projects/${projectId}/files/${crypto.randomUUID()}-${storageName}`;

    await ensureProjectFilesBucket();
    const supabase = getSupabaseAdminClient();
    const { error: uploadError } = await supabase.storage.from(projectFilesBucket).upload(uploadedPath, buffer, {
      contentType: "application/pdf",
      upsert: false
    });

    if (uploadError) {
      throw new Error(uploadError.message);
    }

    shouldCleanupUpload = true;

    await createProjectFile({
      projectId,
      uploadedById: currentUser.id,
      name: displayName,
      storagePath: uploadedPath,
      mimeType: "application/pdf",
      sizeBytes: fileEntry.size,
      fileType
    });
  } catch (error) {
    if (uploadedPath && shouldCleanupUpload) {
      try {
        await getSupabaseAdminClient().storage.from(projectFilesBucket).remove([uploadedPath]);
      } catch {
        // The upload already failed from the user's perspective; do not hide the original error.
      }
    }

    return {
      error: error instanceof Error ? error.message : "PDF could not be uploaded."
    };
  }

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/files`);
  return { message: "PDF uploaded." };
}

export async function updateProjectFileAction(projectId: string, formData: FormData) {
  const currentUser = await requireProjectFileManager(projectId);
  const fileId = requiredString(formData.get("fileId"), "File");
  await requireManagedFile(projectId, fileId);

  await updateProjectFile({
    fileId,
    name: requirePdfName(requiredString(formData.get("name"), "File name")),
    fileType: parseFileType(formData.get("fileType"))
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/files`);
}

export async function deleteProjectFileAction(projectId: string, formData: FormData) {
  const currentUser = await requireProjectFileManager(projectId);
  const fileId = requiredString(formData.get("fileId"), "File");
  const file = await requireManagedFile(projectId, fileId);

  if (file.project.organizationId !== currentUser.organizationId) {
    throw new Error("You cannot delete files outside your organization.");
  }

  await ensureProjectFilesBucket();
  const supabase = getSupabaseAdminClient();
  const { error: removeError } = await supabase.storage.from(projectFilesBucket).remove([file.storagePath]);

  if (removeError) {
    throw new Error(removeError.message);
  }

  await deleteProjectFile(fileId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/files`);
}
