import { notFound } from "next/navigation";
import { AreaForm } from "@/components/projects/area-form";
import { CabinetItemForm } from "@/components/projects/cabinet-item-form";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listProjectAreas, listUnassignedProjectCabinetItems } from "@/lib/db/areas";
import { canAccessProject, getProject } from "@/lib/db/projects";
import { hasPermission } from "@/lib/rbac";
import { createAreaAction, createCabinetItemAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDimensions(item: {
  width: { toString(): string } | null;
  height: { toString(): string } | null;
  depth: { toString(): string } | null;
}) {
  if (!item.width && !item.height && !item.depth) {
    return "Not set";
  }

  return [item.width, item.height, item.depth].map((value) => value?.toString() ?? "-").join(" x ");
}

function CabinetItemsTable({
  items
}: {
  items: Array<{
    id: string;
    itemNumber: string | null;
    name: string;
    itemType: string;
    quantity: number;
    width: { toString(): string } | null;
    height: { toString(): string } | null;
    depth: { toString(): string } | null;
    status: string;
  }>;
}) {
  return (
    <table className="table responsive-table cabinet-items-table">
      <thead>
        <tr>
          <th>Item</th>
          <th>Type</th>
          <th>Qty</th>
          <th>Dimensions</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td data-label="Item">
              {item.itemNumber ? `${item.itemNumber} - ` : ""}
              {item.name}
            </td>
            <td data-label="Type">{item.itemType.replace("_", " ")}</td>
            <td data-label="Qty">{item.quantity}</td>
            <td data-label="Dimensions">{formatDimensions(item)}</td>
            <td data-label="Status">{item.status.replace("_", " ")}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default async function ProjectAreasPage({ params }: { params: { projectId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !(await canAccessProject(params.projectId, currentUser))) {
    return <AccessDenied description="This project area list is outside your assigned work scope." />;
  }

  const [project, areas, unassignedItems] = await Promise.all([
    getProject(params.projectId),
    listProjectAreas(params.projectId),
    listUnassignedProjectCabinetItems(params.projectId)
  ]);

  if (!project) {
    notFound();
  }

  const createAreaForProject = createAreaAction.bind(null, params.projectId);
  const createCabinetItemForProject = createCabinetItemAction.bind(null, params.projectId);
  const areaOptions = areas.map((area) => ({ id: area.id, name: area.name }));
  const canManageProject = hasPermission(currentUser, "manage_projects");

  return (
    <>
      <PageHeader
        eyebrow="Areas"
        title="Areas and cabinet items"
        description={`${project.name}: rooms, spaces, and cabinet packages in scope.`}
      />
      <section className="grid project-workspace">
        <div className="grid">
          {areas.length > 0 ? (
            areas.map((area) => (
              <article className="card" key={area.id}>
                <h2>{area.name}</h2>
                {area.description ? <p className="muted">{area.description}</p> : null}
                <p>
                  <strong>{area.cabinetItems.length}</strong>{" "}
                  {area.cabinetItems.length === 1 ? "cabinet item" : "cabinet items"}
                </p>
                {area.cabinetItems.length > 0 ? (
                  <CabinetItemsTable items={area.cabinetItems} />
                ) : (
                  <p className="muted">No cabinet items have been added to this area yet.</p>
                )}
              </article>
            ))
          ) : (
            <section className="card">
              <h2>No areas yet</h2>
              <p className="muted">Add the first room or space for this cabinet project.</p>
            </section>
          )}
          {unassignedItems.length > 0 ? (
            <article className="card">
              <h2>Unassigned</h2>
              <p className="muted">Cabinet items that are not tied to a room or space yet.</p>
              <CabinetItemsTable items={unassignedItems} />
            </article>
          ) : null}
        </div>
        {canManageProject ? (
          <div className="grid">
            <AreaForm action={createAreaForProject} />
            <CabinetItemForm action={createCabinetItemForProject} areas={areaOptions} />
          </div>
        ) : (
          <section className="card">
            <h2>Read-only scope</h2>
            <p className="muted">Your role can review assigned project scope but cannot edit areas or cabinet items.</p>
          </section>
        )}
      </section>
    </>
  );
}
