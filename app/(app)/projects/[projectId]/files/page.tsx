import { AttachmentList } from "@/components/files/attachment-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ProjectFilesPage({ params }: { params: { projectId: string } }) {
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

