import { CalendarView, type CalendarEvent, type CalendarProjectOption } from "@/components/calendar/calendar-view";
import { createCalendarEventAction, deleteCalendarEventAction, updateCalendarEventAction } from "@/app/(app)/calendar/actions";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listCalendarItems, listCalendarProjectOptions, listManualCalendarEvents } from "@/lib/db/calendar";
import { hasPermission, isFullAccess } from "@/lib/rbac";

export const dynamic = "force-dynamic";

function toDateKey(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function toDateTimeInputValue(value: Date) {
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  const hours = String(value.getHours()).padStart(2, "0");
  const minutes = String(value.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function formatEventType(value: string) {
  return value
    .toLowerCase()
    .split("_")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");
}

export default async function CalendarPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "view_calendar")) {
    return <AccessDenied description="Calendar access is limited to signed-in shop users." />;
  }

  const [projects, manualEvents, calendarProjects] = await Promise.all([
    listCalendarItems(currentUser),
    listManualCalendarEvents(currentUser),
    listCalendarProjectOptions(currentUser)
  ]);

  const projectEvents: CalendarEvent[] = projects.flatMap((project) => {
    const dueEvents: CalendarEvent[] = [];

    if (project.dueDate) {
      dueEvents.push({
        id: `project-${project.id}`,
        date: toDateKey(project.dueDate),
        title: project.name,
        subtitle: `${project.client.name} project due`,
        href: `/projects/${project.id}`,
        projectId: project.id,
        projectName: project.name,
        kind: "PROJECT_DUE",
        eventType: "PROJECT"
      });
    }

    if (project.installDate) {
      dueEvents.push({
        id: `project-install-${project.id}`,
        date: toDateKey(project.installDate),
        title: `${project.name} install`,
        subtitle: `${project.client.name} install date`,
        href: `/projects/${project.id}`,
        projectId: project.id,
        projectName: project.name,
        kind: "PROJECT_DUE",
        eventType: "INSTALL"
      });
    }

    const taskEvents: CalendarEvent[] = project.tasks.map((task) => ({
      id: `task-${task.id}`,
      date: toDateKey(task.dueDate ?? new Date()),
      title: task.title,
      subtitle: `${project.name} - ${task.department?.name ?? "Unassigned"}`,
      href: `/projects/${project.id}/tasks`,
      projectId: project.id,
      projectName: project.name,
      kind: "TASK_DUE",
      eventType: "TASK"
    }));

    return [...dueEvents, ...taskEvents];
  });

  const customEvents: CalendarEvent[] = manualEvents.map((event) => {
    const eventType = formatEventType(event.eventType);

    return {
      id: `event-${event.id}`,
      date: toDateKey(event.startsAt),
      endDate: event.endsAt ? toDateKey(event.endsAt) : null,
      title: event.title,
      subtitle: event.project ? `${event.project.name} - ${eventType}` : `${formatEventType(event.visibility)} - ${eventType}`,
      projectId: event.projectId,
      projectName: event.project?.name ?? null,
      kind: event.visibility,
      eventType: event.eventType,
      color: event.color,
      editable: isFullAccess(currentUser) || (event.createdById === currentUser.id && event.visibility === "PERSONAL"),
      description: event.description,
      startsAtInput: toDateTimeInputValue(event.startsAt),
      endsAtInput: event.endsAt ? toDateTimeInputValue(event.endsAt) : null
    };
  });

  const projectOptions: CalendarProjectOption[] = calendarProjects.map((project) => ({
    id: project.id,
    name: project.name,
    client: project.client.name
  }));

  return (
    <>
      <PageHeader
        eyebrow="Schedule"
        title="Shop calendar"
        description="Personal, company, and project due dates in one color-coded calendar for the cabinet shop."
      />
      <CalendarView
        canManageCompanyEvents={isFullAccess(currentUser)}
        createAction={createCalendarEventAction}
        deleteAction={deleteCalendarEventAction}
        events={[...projectEvents, ...customEvents]}
        projectOptions={projectOptions}
        updateAction={updateCalendarEventAction}
      />
    </>
  );
}
