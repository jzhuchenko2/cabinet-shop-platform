import { notFound } from "next/navigation";
import { TaskForm } from "@/components/tasks/task-form";
import { TaskTable } from "@/components/tasks/task-table";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listProjectAreas, listUnassignedProjectCabinetItems } from "@/lib/db/areas";
import { listDepartmentOptions } from "@/lib/db/departments";
import { getProject } from "@/lib/db/projects";
import { listProjectTasks } from "@/lib/db/tasks";
import { listOrganizationUsers } from "@/lib/db/users";
import { createTaskAction, updateTaskStatusAction } from "./actions";

export const dynamic = "force-dynamic";

function formatDueDate(dueDate: Date | null) {
  if (!dueDate) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(dueDate);
}

export default async function ProjectTasksPage({ params }: { params: { projectId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    notFound();
  }

  const [project, tasks, areas, unassignedItems, departments, users] = await Promise.all([
    getProject(params.projectId),
    listProjectTasks(params.projectId),
    listProjectAreas(params.projectId),
    listUnassignedProjectCabinetItems(params.projectId),
    listDepartmentOptions(currentUser.organizationId),
    listOrganizationUsers(currentUser.organizationId)
  ]);

  if (!project) {
    notFound();
  }

  const cabinetItemOptions = [
    ...areas.flatMap((area) =>
      area.cabinetItems.map((item) => ({
        id: item.id,
        areaId: area.id,
        itemNumber: item.itemNumber,
        name: item.name
      }))
    ),
    ...unassignedItems.map((item) => ({
      id: item.id,
      areaId: null,
      itemNumber: item.itemNumber,
      name: item.name
    }))
  ];

  const taskRows = tasks.map((task) => ({
    id: task.id,
    title: task.title,
    department: task.department?.name ?? "Unassigned",
    assignee: task.assignee?.name ?? "Unassigned",
    dueDate: formatDueDate(task.dueDate),
    status: task.status,
    priority: task.priority,
    scope: task.cabinetItem
      ? `${task.cabinetItem.itemNumber ? `${task.cabinetItem.itemNumber} - ` : ""}${task.cabinetItem.name}`
      : task.area?.name ?? "Project"
  }));

  const createTaskForProject = createTaskAction.bind(null, params.projectId);
  const updateStatusForProject = updateTaskStatusAction.bind(null, params.projectId);

  return (
    <>
      <PageHeader
        eyebrow="Tasks"
        title="Project tasks"
        description={`${project.name}: department work, assignments, blockers, and due dates.`}
      />
      <section className="grid project-workspace">
        <div className="card">
          <TaskTable tasks={taskRows} updateStatusAction={updateStatusForProject} />
        </div>
        <TaskForm
          action={createTaskForProject}
          areas={areas.map((area) => ({ id: area.id, name: area.name }))}
          cabinetItems={cabinetItemOptions}
          departments={departments.map((department) => ({ id: department.id, name: department.name }))}
          users={users.map((user) => ({ id: user.id, name: user.name }))}
        />
      </section>
    </>
  );
}
