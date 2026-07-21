import { TimeLogList } from "@/components/time-logs/time-log-list";
import { AccessDenied } from "@/components/ui/access-denied";
import { PageHeader } from "@/components/ui/page-header";
import { getCurrentUser } from "@/lib/auth";
import { listProjectTimeLogs } from "@/lib/db/time-logs";
import { hasPermission } from "@/lib/rbac";

function formatWorkDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

export default async function ProjectTimePage({ params }: { params: { projectId: string } }) {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "view_time_logs")) {
    return <AccessDenied description="Time logs are limited to managers and admins." />;
  }

  const timeLogs = await listProjectTimeLogs(params.projectId);

  return (
    <>
      <PageHeader
        eyebrow="Time"
        title="Time logs"
        description={`Labor entries by user, department, task, area, or cabinet item for project ${params.projectId}.`}
      />
      <section className="card">
        <TimeLogList
          timeLogs={timeLogs.map((log) => ({
            id: log.id,
            user: log.user.name,
            department: log.department?.name ?? "Unassigned",
            minutes: log.minutes,
            task: log.task?.title ?? "Task not recorded",
            workDate: formatWorkDate(log.workDate),
            notes: log.notes ?? ""
          }))}
        />
      </section>
    </>
  );
}
