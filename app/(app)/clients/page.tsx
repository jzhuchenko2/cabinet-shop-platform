import Link from "next/link";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";

const clients = [
  {
    id: "anderson",
    name: "Anderson Residence",
    contact: "Jordan Anderson",
    projects: 1,
    activeProject: "Anderson Kitchen",
    lastActivity: "Design review scheduled"
  },
  {
    id: "harlow",
    name: "Harlow Homes",
    contact: "Mia Harlow",
    projects: 2,
    activeProject: "Harlow Lot 18",
    lastActivity: "Engineering hardware details"
  },
  {
    id: "ridgeline",
    name: "Ridgeline Remodel",
    contact: "Chris Blake",
    projects: 1,
    activeProject: "Ridgeline Primary Suite",
    lastActivity: "Install date pending"
  }
];

const archivedClientFiles = [
  {
    id: "mercado-built-in",
    client: "Mercado Residence",
    project: "Mercado Built-In",
    completed: "May 2026",
    closeout: "Delivered and installed",
    fileStatus: "Drawings, photos, notes"
  },
  {
    id: "lot-42-mudroom",
    client: "Lot 42 Homes",
    project: "Lot 42 Mudroom",
    completed: "Apr 2026",
    closeout: "QC complete",
    fileStatus: "Approvals, punch list, photos"
  },
  {
    id: "nolan-vanity",
    client: "Nolan Residence",
    project: "Nolan Vanity",
    completed: "Mar 2026",
    closeout: "Closed",
    fileStatus: "Invoice packet, finish notes"
  }
];

export default async function ClientsPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_clients")) {
    return <AccessDenied description="Client records are limited to managers and admins." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Clients"
        description="Customer records tied to cabinet projects, contacts, notes, and job history."
      />
      <section className="card">
        <h2>Active client files</h2>
        <table className="table responsive-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Contact</th>
              <th>Active project</th>
              <th>Last activity</th>
              <th>Projects</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id}>
                <td data-label="Client">
                  <Link className="button secondary" href={`/clients/${client.id}`}>
                    {client.name}
                  </Link>
                </td>
                <td data-label="Contact">{client.contact}</td>
                <td data-label="Active project">{client.activeProject}</td>
                <td data-label="Last activity">{client.lastActivity}</td>
                <td data-label="Projects">{client.projects}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className="card" style={{ marginTop: 16 }}>
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">History</p>
            <h2>Archived client and project files</h2>
          </div>
          <span className="status-pill done">{archivedClientFiles.length} archived</span>
        </div>
        <table className="table responsive-table">
          <thead>
            <tr>
              <th>Client</th>
              <th>Project</th>
              <th>Completed</th>
              <th>Closeout</th>
              <th>File history</th>
            </tr>
          </thead>
          <tbody>
            {archivedClientFiles.map((file) => (
              <tr key={file.id}>
                <td data-label="Client">{file.client}</td>
                <td data-label="Project">{file.project}</td>
                <td data-label="Completed">{file.completed}</td>
                <td data-label="Closeout">{file.closeout}</td>
                <td data-label="File history">{file.fileStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
