import { PageHeader } from "@/components/ui/page-header";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

export default async function ClientDetailPage({ params }: { params: { clientId: string } }) {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_clients")) {
    return <AccessDenied description="Client detail is limited to managers and admins." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Client"
        title="Client detail"
        description={`Contact, address, notes, and related projects for client ${params.clientId}.`}
      />
      <section className="grid grid-2">
        <div className="card">
          <h2>Contact</h2>
          <p>Jordan Anderson</p>
          <p className="muted">jordan@example.com</p>
          <p className="muted">555-0100</p>
        </div>
        <div className="card">
          <h2>Active projects</h2>
          <p>Anderson Kitchen</p>
          <p className="muted">Current department: Design</p>
        </div>
      </section>
    </>
  );
}
