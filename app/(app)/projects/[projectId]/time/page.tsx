import { TimeLogList } from "@/components/time-logs/time-log-list";
import { PageHeader } from "@/components/ui/page-header";

export default function ProjectTimePage({ params }: { params: { projectId: string } }) {
  return (
    <>
      <PageHeader
        eyebrow="Time"
        title="Time logs"
        description={`Labor entries by user, department, task, area, or cabinet item for project ${params.projectId}.`}
      />
      <section className="card">
        <TimeLogList
          timeLogs={[
            {
              user: "Taylor",
              department: "Design",
              minutes: 180,
              workDate: "Apr 28",
              notes: "Drawing revisions"
            },
            {
              user: "Sam",
              department: "Cut/Mill",
              minutes: 240,
              workDate: "Apr 29",
              notes: "Material prep"
            }
          ]}
        />
      </section>
    </>
  );
}

