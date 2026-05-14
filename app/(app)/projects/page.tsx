import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ProjectList } from "@/components/projects/project-list";
import type { ProjectSummary } from "@/components/projects/project-summary-card";
import { getCurrentUser } from "@/lib/auth";
import { listProjects } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

function formatDueDate(dueDate: Date | null) {
  if (!dueDate) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(dueDate);
}

function mapProjectStatus(project: Awaited<ReturnType<typeof listProjects>>[number]): ProjectSummary["status"] {
  if (project.isBlocked || project.status === "BLOCKED") {
    return "Blocked";
  }

  if (project.status === "ACTIVE") {
    return "In progress";
  }

  return "Ready";
}

export default async function ProjectsPage() {
  const currentUser = await getCurrentUser();
  const projects = currentUser
    ? (await listProjects(currentUser.organizationId)).map((project) => ({
        id: project.id,
        name: project.name,
        client: project.client.name,
        department: project.currentDepartment?.name ?? "Unassigned",
        dueDate: formatDueDate(project.dueDate),
        status: mapProjectStatus(project)
      }))
    : [];

  return (
    <>
      <PageHeader
        eyebrow="Jobs"
        title="Projects"
        description="Track active cabinet jobs from first conversation through install and closeout."
        action={
          <Link className="button" href="/projects/new">
            New project
          </Link>
        }
      />
      <ProjectList projects={projects} />
    </>
  );
}
