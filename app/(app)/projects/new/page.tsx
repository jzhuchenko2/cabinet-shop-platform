import { PageHeader } from "@/components/ui/page-header";
import { NewProjectForm } from "@/components/projects/new-project-form";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { listDepartmentOptions } from "@/lib/db/departments";
import { hasPermission } from "@/lib/rbac";
import { createProjectAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "manage_projects")) {
    return <AccessDenied description="Only owners, admins, and managers can create new projects." />;
  }

  const departments = await listDepartmentOptions(currentUser.organizationId);

  return (
    <>
      <PageHeader
        eyebrow="Project setup"
        title="New project"
        description="Capture the job basics before areas, cabinet items, tasks, files, and time logs are added."
      />
      <NewProjectForm
        action={createProjectAction}
        departments={departments.map((department) => ({
          id: department.id,
          name: department.name,
          workflowKey: department.workflowKey
        }))}
      />
    </>
  );
}
