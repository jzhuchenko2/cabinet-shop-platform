import { PageHeader } from "@/components/ui/page-header";
import { NewProjectForm } from "@/components/projects/new-project-form";
import { createProjectAction } from "./actions";

export const dynamic = "force-dynamic";

export default function NewProjectPage() {
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
