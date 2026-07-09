import { ProjectDetail } from "@/components/projects/project-detail";
import { AccessDenied } from "@/components/ui/access-denied";
import { getCurrentUser } from "@/lib/auth";
import { canAccessProject } from "@/lib/db/projects";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !(await canAccessProject(params.projectId, currentUser))) {
    return <AccessDenied description="This project is outside your assigned role or task scope." />;
  }

  return <ProjectDetail projectId={params.projectId} user={currentUser} />;
}
