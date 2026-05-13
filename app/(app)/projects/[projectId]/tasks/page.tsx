import { TaskTable } from "@/components/tasks/task-table";
import { PageHeader } from "@/components/ui/page-header";

export default function ProjectTasksPage({ params }: { params: { projectId: string } }) {
  return (
    <>
      <PageHeader
        eyebrow="Tasks"
        title="Project tasks"
        description={`Department and user assignments for project ${params.projectId}.`}
      />
      <section className="card">
        <TaskTable
          tasks={[
            {
              title: "Finalize appliance panel dimensions",
              department: "Design",
              assignee: "Taylor",
              dueDate: "May 3",
              status: "IN_PROGRESS"
            },
            {
              title: "Approve finish sample",
              department: "Approval",
              assignee: "Morgan",
              dueDate: "May 5",
              status: "BLOCKED"
            },
            {
              title: "Order drawer slides",
              department: "Purchasing",
              assignee: "Riley",
              dueDate: "May 7",
              status: "READY"
            }
          ]}
        />
      </section>
    </>
  );
}

