import Link from "next/link";
import { PageHeader } from "@/components/ui/page-header";
import { ProjectList } from "@/components/projects/project-list";

export default function ProjectsPage() {
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
      <ProjectList />
    </>
  );
}
