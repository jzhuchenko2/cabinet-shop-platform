import { TaskTable } from "@/components/tasks/task-table";
import { TimeClockControls } from "@/components/time-logs/time-clock-controls";
import { PageHeader } from "@/components/ui/page-header";
import type { CurrentUser } from "@/lib/auth";
import { listAccessibleTasks } from "@/lib/db/tasks";
import { getUserTimeClockState, listTimeCardProjectOptions, listTimeCardTaskOptions } from "@/lib/db/time-logs";
import { updateTaskStatusAction } from "@/app/(app)/projects/[projectId]/tasks/actions";
import { clockInAction, clockOutAction } from "@/app/(app)/time-clock/actions";

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

export async function EmployeeDashboard({ user }: { user: CurrentUser }) {
  const [tasks, timeClockState, projectOptionsRaw, taskOptionsRaw] = await Promise.all([
    listAccessibleTasks(user),
    getUserTimeClockState(user),
    listTimeCardProjectOptions(user),
    listTimeCardTaskOptions(user)
  ]);
  const projectOptions = projectOptionsRaw.map((project) => ({
    id: project.id,
    name: project.name,
    client: project.client.name
  }));
  const taskOptions = taskOptionsRaw.map((task) => ({
    id: task.id,
    title: task.title,
    projectId: task.projectId,
    projectName: task.project.name
  }));
  const taskRows = tasks.map((task) => ({
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    department: task.department?.name ?? "Unassigned",
    assignee: task.assignee?.name ?? "Unassigned",
    dueDate: formatDueDate(task.dueDate),
    status: task.status,
    priority: task.priority,
    projectName: task.project.name,
    scope: task.cabinetItem
      ? `${task.project.name}: ${task.cabinetItem.itemNumber ? `${task.cabinetItem.itemNumber} - ` : ""}${
          task.cabinetItem.name
        }`
      : `${task.project.name}: ${task.area?.name ?? "Project"}`
  }));

  async function updateAssignedTaskStatus(formData: FormData) {
    "use server";

    const projectId = String(formData.get("projectId") ?? "");
    await updateTaskStatusAction(projectId, formData);
  }

  return (
    <>
      <PageHeader
        eyebrow="My work"
        title={`Welcome, ${user.name}`}
        description="Your assigned cabinet-shop tasks, due dates, job context, and time clock."
      />
      <section className="grid grid-2">
        <TimeClockControls
          activeEntry={
            timeClockState.activeEntry
              ? {
                  id: timeClockState.activeEntry.id,
                  startedAt: timeClockState.activeEntry.startedAt.toISOString(),
                  projectId: timeClockState.activeEntry.projectId ?? "",
                  projectName: timeClockState.activeEntry.project?.name ?? null,
                  taskId: timeClockState.activeEntry.taskId ?? "",
                  taskTitle: timeClockState.activeEntry.task?.title ?? null,
                  notes: timeClockState.activeEntry.notes ?? ""
                }
              : null
          }
          clockInAction={clockInAction}
          clockOutAction={clockOutAction}
          lastClockedOutAt={timeClockState.lastEntry?.endedAt?.toISOString() ?? null}
          projectOptions={projectOptions}
          taskOptions={taskOptions}
          todayLoggedMinutes={timeClockState.todayLoggedMinutes}
          userName={user.name}
          weekLoggedMinutes={timeClockState.weekLoggedMinutes}
        />
        <section className="card">
          <p className="eyebrow">Assigned tasks</p>
          <h2>{tasks.length} open items</h2>
          <p className="muted">Only tasks assigned to you or your department scope are shown here.</p>
        </section>
      </section>
      <section className="card work-section">
        <h2>My task queue</h2>
        {tasks.length > 0 ? (
          <TaskTable tasks={taskRows} updateStatusAction={updateAssignedTaskStatus} showProjectIdInputs />
        ) : (
          <p className="muted">You do not have any assigned tasks right now.</p>
        )}
      </section>
    </>
  );
}
