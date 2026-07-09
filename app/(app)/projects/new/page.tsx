import { PageHeader } from "@/components/ui/page-header";
import { NewProjectForm } from "@/components/projects/new-project-form";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission } from "@/lib/rbac";
import { createProjectAction } from "./actions";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const currentUser = await getCurrentUser();

  if (!hasPermission(currentUser, "manage_projects")) {
    return <AccessDenied description="Only owners, admins, and managers can create new projects." />;
  }

  return (
    <>
      <PageHeader
        eyebrow="Project setup"
        title="New project"
        description="Capture the job basics before areas, cabinet items, tasks, files, and time logs are added."
      />
      <NewProjectForm action={createProjectAction} />
    </>
  );
}
