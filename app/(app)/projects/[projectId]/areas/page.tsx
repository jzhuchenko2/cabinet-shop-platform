import { PageHeader } from "@/components/ui/page-header";

const areas = [
  { name: "Kitchen", items: 14, status: "Approved" },
  { name: "Island", items: 4, status: "In production" },
  { name: "Pantry", items: 3, status: "Planned" },
  { name: "Mudroom", items: 2, status: "Planned" }
];

export default function ProjectAreasPage({ params }: { params: { projectId: string } }) {
  return (
    <>
      <PageHeader
        eyebrow="Areas"
        title="Areas and cabinet items"
        description={`Rooms and cabinet packages for project ${params.projectId}.`}
      />
      <table className="table">
        <thead>
          <tr>
            <th>Area</th>
            <th>Cabinet items</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {areas.map((area) => (
            <tr key={area.name}>
              <td>{area.name}</td>
              <td>{area.items}</td>
              <td>{area.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}

