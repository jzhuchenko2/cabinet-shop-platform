import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";

const clients = [
  { id: "anderson", name: "Anderson Residence", contact: "Jordan Anderson", projects: 1 },
  { id: "harlow", name: "Harlow Homes", contact: "Mia Harlow", projects: 2 },
  { id: "ridgeline", name: "Ridgeline Remodel", contact: "Chris Blake", projects: 1 }
];

export default function ClientsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Customers"
        title="Clients"
        description="Customer records tied to cabinet projects, contacts, notes, and job history."
      />
      <table className="table">
        <thead>
          <tr>
            <th>Client</th>
            <th>Contact</th>
            <th>Projects</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id}>
              <td>
                <Link href={`/clients/${client.id}`}>{client.name}</Link>
              </td>
              <td>{client.contact}</td>
              <td>{client.projects}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

