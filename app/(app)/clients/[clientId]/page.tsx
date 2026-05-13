import { PageHeader } from "@/components/ui/page-header";

export default function ClientDetailPage({ params }: { params: { clientId: string } }) {
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

