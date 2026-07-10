import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { TimeClockControls } from "@/components/time-logs/time-clock-controls";
import { TimeCardScopeForm } from "@/components/time-logs/time-card-scope-form";
import { TimeCardStopButton } from "@/components/time-logs/time-card-stop-button";
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
                  projectName: userClockState.activeEntry.project?.name ?? null,
                  taskTitle: userClockState.activeEntry.task?.title ?? null
                }
              : null
          }
          clockInAction={clockInAction}
          clockOutAction={clockOutAction}
          lastClockedOutAt={userClockState.lastEntry?.endedAt?.toISOString() ?? null}
          projectOptions={projectOptions}
          taskOptions={taskOptions}
        />
      ) : null}

      <section className="card work-section">
        <div className="section-heading-row">
          <div>
            <p className="eyebrow">Live</p>
            <h2>{activeEntries.length} active time cards</h2>
          </div>
        </div>
        {activeEntries.length > 0 ? (
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Started</th>
                <th>Elapsed</th>
                <th>Work scope</th>
                <th>Manage</th>
              </tr>
            </thead>
            <tbody>
              {activeEntries.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="Employee">{entry.user.name}</td>
                  <td data-label="Started">{formatDateTime(entry.startedAt)}</td>
                  <td data-label="Elapsed">{formatMinutes(elapsedMinutes(entry.startedAt, entry.endedAt))}</td>
                  <td data-label="Work scope">
                    <TimeCardScopeForm
                      action={updateTimeCardScopeAction}
                      entryId={entry.id}
                      notes={entry.notes ?? ""}
                      projectId={entry.projectId ?? ""}
                      projectOptions={projectOptions}
                      taskId={entry.taskId ?? ""}
                      taskOptions={taskOptions}
                    />
                  </td>
                  <td data-label="Manage">
                    {(canManageTimeCards || entry.userId === currentUser.id) ? (
                      <TimeCardStopButton action={stopTimeCardAction} entryId={entry.id} />
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No one is clocked in right now.</p>
        )}
      </section>

      <section className="card work-section">
        <h2>Completed clock sessions</h2>
        {completedEntries.length > 0 ? (
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Task</th>
                <th>Started</th>
                <th>Ended</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {completedEntries.map((entry) => (
                <tr key={entry.id}>
                  <td data-label="Employee">{entry.user.name}</td>
                  <td data-label="Project">{entry.project?.name ?? "General shop time"}</td>
                  <td data-label="Task">{entry.task?.title ?? "No task selected"}</td>
                  <td data-label="Started">{formatDateTime(entry.startedAt)}</td>
                  <td data-label="Ended">{entry.endedAt ? formatDateTime(entry.endedAt) : "Active"}</td>
                  <td data-label="Total">{formatMinutes(elapsedMinutes(entry.startedAt, entry.endedAt))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No completed clock sessions yet.</p>
        )}
      </section>

      <section className="card work-section">
        <h2>Project time logs</h2>
        {timeLogs.length > 0 ? (
          <table className="table responsive-table">
            <thead>
              <tr>
                <th>Employee</th>
                <th>Project</th>
                <th>Task</th>
                <th>Minutes</th>
                <th>Work date</th>
                <th>Notes</th>
              </tr>
            </thead>
            <tbody>
              {timeLogs.map((log) => (
                <tr key={log.id}>
                  <td data-label="Employee">{log.user.name}</td>
                  <td data-label="Project">{log.project.name}</td>
                  <td data-label="Task">{log.task?.title ?? "No task selected"}</td>
                  <td data-label="Minutes">{log.minutes}</td>
                  <td data-label="Work date">{formatDateTime(log.workDate)}</td>
                  <td data-label="Notes">{log.notes ?? ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="muted">No project time logs have been recorded yet.</p>
        )}
      </section>
    </>
  );
}
