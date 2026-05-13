import { TaskTable } from "@/components/tasks/task-table";
import { PageHeader } from "@/components/ui/page-header";

export default function DepartmentDetailPage({ params }: { params: { departmentId: string } }) {
  return (
    <>
      <PageHeader
        eyebrow="Department"
        title="Department work"
        description={`Active assignments, handoffs, and blockers for department ${params.departmentId}.`}
      />
      <section className="card">
        <TaskTable
          tasks={[
            {
              title: "Confirm cabinet box material",
              department: params.departmentId,
              assignee: "Sam",
              dueDate: "May 6",
              status: "READY"
            },
            {
              title: "Resolve approval note",
              department: params.departmentId,
              assignee: "Morgan",
              dueDate: "May 7",
              status: "BLOCKED"
            }
          ]}
        />
      </section>
    </>
  );
}

