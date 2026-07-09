import { AttachmentList } from "@/components/files/attachment-list";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/db/projects";

export default async function ProjectFilesPage({ params }: { params: { projectId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !(await canAccessProject(params.projectId, currentUser))) {
    return <AccessDenied description="Files are limited to assigned project access." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Files"
        title="Files and approvals"
        description={`Drawings, approvals, cut lists, and job documents for project ${params.projectId}.`}
      />
      <section className="card">
        <AttachmentList
          attachments={[
            { name: "anderson-kitchen-drawings.pdf", type: "DRAWING", uploadedBy: "Taylor", uploadedAt: "Apr 28" },
            { name: "signed-approval.pdf", type: "APPROVAL", uploadedBy: "Morgan", uploadedAt: "Apr 29" },
            { name: "hardware-list.xlsx", type: "HARDWARE", uploadedBy: "Riley", uploadedAt: "Apr 30" }
          ]}
        />
      </section>
    </>
  );
}
