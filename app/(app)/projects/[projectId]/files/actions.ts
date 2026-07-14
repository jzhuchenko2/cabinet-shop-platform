"use server";

import { revalidatePath } from "next/cache";
import type { FileType } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { createProjectFile, deleteProjectFile, getProjectFile, updateProjectFile } from "@/lib/db/files";
import { canAccessProject } from "@/lib/db/projects";
import { hasPermission } from "@/lib/rbac";
import { getSupabaseAdminClient, projectFilesBucket } from "@/lib/supabase-admin";
import { requiredString } from "@/lib/validations/common";

export type ProjectFileActionState = {
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

  const supabase = getSupabaseAdminClient();
  const { error: removeError } = await supabase.storage.from(projectFilesBucket).remove([file.storagePath]);

  if (removeError) {
    throw new Error(removeError.message);
  }

  await deleteProjectFile(fileId);

  revalidatePath(`/projects/${projectId}`);
  revalidatePath(`/projects/${projectId}/files`);
}
