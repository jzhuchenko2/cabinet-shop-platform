import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { TimeClockControls } from "@/components/time-logs/time-clock-controls";
import { TimeCardWorkspaceModal } from "@/components/time-logs/time-card-workspace-modal";
import { getCurrentUser } from "@/lib/auth";
import {
  getUserTimeClockState,
  listAccessibleTimeLogs,
  listActiveTimeClockEntries,
  listCompletedTimeClockEntries,
  listTimeCardProjectOptions,
  listTimeCardTaskOptions
} from "@/lib/db/time-logs";
import { hasPermission, isFullAccess } from "@/lib/rbac";
import { clockInAction, clockOutAction, stopTimeCardAction, updateTimeCardScopeAction } from "@/app/(app)/time-clock/actions";

export const dynamic = "force-dynamic";

function formatDateTime(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(value);
}

function formatMinutes(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainder = minutes % 60;

  if (hours === 0) {
    return `${remainder}m`;
  }

  return `${hours}h ${remainder}m`;
}

function elapsedMinutes(startedAt: Date, endedAt: Date | null) {
  return Math.max(1, Math.round(((endedAt ?? new Date()).getTime() - startedAt.getTime()) / 60000));
}

export default async function TimeCardsPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_time_cards") || !currentUser) {
    return <AccessDenied description="Time cards are limited to signed-in shop users." />;
  }

  const canManageTimeCards = hasPermission(currentUser, "manage_time_clock");
  const [activeEntries, completedEntries, timeLogs, projectOptionsRaw, taskOptionsRaw, userClockState] = await Promise.all([
    listActiveTimeClockEntries(currentUser),
    listCompletedTimeClockEntries(currentUser),
    listAccessibleTimeLogs(currentUser),
    listTimeCardProjectOptions(currentUser),
    listTimeCardTaskOptions(currentUser),
    getUserTimeClockState(currentUser)
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
  const activeEntryRows = activeEntries.map((entry) => ({
    id: entry.id,
    userId: entry.userId,
    employee: entry.user.name,
    startedAt: formatDateTime(entry.startedAt),
    elapsed: formatMinutes(elapsedMinutes(entry.startedAt, entry.endedAt)),
    projectId: entry.projectId ?? "",
    taskId: entry.taskId ?? "",
    notes: entry.notes ?? ""
  }));
  const completedEntryRows = completedEntries.map((entry) => ({
    id: entry.id,
    employee: entry.user.name,
    project: entry.project?.name ?? "General shop time",
    task: entry.task?.title ?? "No task selected",
    startedAt: formatDateTime(entry.startedAt),
    endedAt: entry.endedAt ? formatDateTime(entry.endedAt) : "Active",
    total: formatMinutes(elapsedMinutes(entry.startedAt, entry.endedAt))
  }));
  const timeLogRows = timeLogs.map((log) => ({
    id: log.id,
    employee: log.user.name,
    project: log.project.name,
    task: log.task?.title ?? "No task selected",
    total: formatMinutes(log.minutes),
    totalMinutes: log.minutes,
    workDate: formatDateTime(log.workDate),
    notes: log.notes ?? ""
  }));

  return (
    <>
      <PageHeader
        eyebrow="Labor"
        title={isFullAccess(currentUser) ? "Time cards" : "My time card"}
        description={
          canManageTimeCards
            ? "Live clock-ins, project/task work scope, and completed employee time logs."
            : "Your clock-ins, project/task selections, and completed time log history."
        }
      />

      {!canManageTimeCards ? (
        <TimeClockControls
          activeEntry={
            userClockState.activeEntry
              ? {
                  id: userClockState.activeEntry.id,
                  startedAt: userClockState.activeEntry.startedAt.toISOString(),
                  projectId: userClockState.activeEntry.projectId ?? "",
                  projectName: userClockState.activeEntry.project?.name ?? null,
                  taskId: userClockState.activeEntry.taskId ?? "",
                  taskTitle: userClockState.activeEntry.task?.title ?? null,
                  notes: userClockState.activeEntry.notes ?? ""
                }
              : null
          }
          clockInAction={clockInAction}
          clockOutAction={clockOutAction}
          lastClockedOutAt={userClockState.lastEntry?.endedAt?.toISOString() ?? null}
          projectOptions={projectOptions}
          taskOptions={taskOptions}
          todayLoggedMinutes={userClockState.todayLoggedMinutes}
          userName={currentUser.name}
          weekLoggedMinutes={userClockState.weekLoggedMinutes}
        />
      ) : null}

      <TimeCardWorkspaceModal
        activeEntries={activeEntryRows}
        canManageTimeCards={canManageTimeCards}
        completedEntries={completedEntryRows}
        projectOptions={projectOptions}
        stopAction={stopTimeCardAction}
        taskOptions={taskOptions}
        timeLogs={timeLogRows}
        updateScopeAction={updateTimeCardScopeAction}
      />
    </>
  );
}
