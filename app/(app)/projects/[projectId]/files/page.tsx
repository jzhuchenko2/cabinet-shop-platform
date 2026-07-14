import { ProjectFileManager, type ProjectFileTypeOption } from "@/components/files/project-file-manager";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listProjectFiles } from "@/lib/db/files";
import { canAccessProject } from "@/lib/db/projects";
import { hasPermission } from "@/lib/rbac";
import { deleteProjectFileAction, updateProjectFileAction, uploadProjectFileAction } from "./actions";

export const dynamic = "force-dynamic";

const fileTypes: ProjectFileTypeOption[] = [
  { value: "DOCUMENT", label: "DOCUMENT" },
  { value: "DRAWING", label: "DRAWING" },
  { value: "APPROVAL", label: "APPROVAL" },
  { value: "CUT_LIST", label: "CUT_LIST" },
  { value: "HARDWARE", label: "HARDWARE" },
  { value: "OTHER", label: "OTHER" }
];

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

function formatFileSize(value: number | null) {
  if (!value) {
    return "Unknown";
  }

  if (value < 1024 * 1024) {
    return `${Math.round(value / 1024)} KB`;
  }

  return `${Math.round((value / (1024 * 1024)) * 10) / 10} MB`;
}

export default async function ProjectFilesPage({ params }: { params: { projectId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !(await canAccessProject(params.projectId, currentUser))) {
    return <AccessDenied description="Files are limited to assigned project access." />;
  }

  const [projectFiles] = await Promise.all([listProjectFiles(params.projectId)]);
  const canManageFiles = hasPermission(currentUser, "manage_project_files");
  const uploadAction = uploadProjectFileAction.bind(null, params.projectId);
  const updateAction = updateProjectFileAction.bind(null, params.projectId);
  const deleteAction = deleteProjectFileAction.bind(null, params.projectId);

  return (
    <>
      <PageHeader
        eyebrow="Files"
        title="Project PDFs"
        description={
          canManageFiles
            ? "Upload, update, download, and remove project PDF documents."
            : "View and download project PDF documents."
        }
      />
      <ProjectFileManager
        canManageFiles={canManageFiles}
        deleteAction={deleteAction}
        files={projectFiles.map((file) => ({
          id: file.id,
          name: file.name,
          type: file.fileType,
          uploadedBy: file.uploadedBy.name,
          uploadedAt: formatDate(file.createdAt),
          size: formatFileSize(file.sizeBytes),
          previewHref: `/projects/${params.projectId}/files/${file.id}/preview`,
          downloadHref: `/projects/${params.projectId}/files/${file.id}/download`
        }))}
        fileTypes={fileTypes}
        updateAction={updateAction}
        uploadAction={uploadAction}
      />
    </>
  );
}
