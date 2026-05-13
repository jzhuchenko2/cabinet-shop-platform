import { DepartmentBoard } from "@/components/departments/department-board";
import { PageHeader } from "@/components/ui/page-header";

export default function DepartmentsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Workflow"
        title="Department board"
        description="See what is waiting, active, blocked, or ready to hand off across the shop."
      />
      <DepartmentBoard />
    </>
  );
}

