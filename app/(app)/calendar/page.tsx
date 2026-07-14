import { CalendarView, type CalendarEvent } from "@/components/calendar/calendar-view";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listCalendarItems } from "@/lib/db/calendar";

export const dynamic = "force-dynamic";

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export default async function CalendarPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return <AccessDenied description="Calendar access is limited to signed-in shop users." />;
  }

  const projects = await listCalendarItems(currentUser);
  const events: CalendarEvent[] = projects.flatMap((project) => {
    const projectEvents: CalendarEvent[] = project.dueDate
      ? [
          {
            id: `project-${project.id}`,
            date: toDateKey(project.dueDate),
            title: project.name,
            subtitle: `${project.client.name} project due`,
            href: `/projects/${project.id}`,
            projectId: project.id,
            projectName: project.name,
            type: "PROJECT"
          }
        ]
      : [];

    const taskEvents: CalendarEvent[] = project.tasks.map((task) => ({
      id: `task-${task.id}`,
      date: toDateKey(task.dueDate ?? new Date()),
      title: task.title,
      subtitle: `${project.name} - ${task.department?.name ?? "Unassigned"}`,
      href: `/projects/${project.id}/tasks`,
      projectId: project.id,
      projectName: project.name,
      type: "TASK"
    }));

    return [...projectEvents, ...taskEvents];
  });

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="Shop calendar"
        description="Project and task due dates in one color-coded calendar for the cabinet shop."
      />
      <CalendarView events={events} />
    </>
  );
}
