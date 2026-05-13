import { ProjectDetail } from "@/components/projects/project-detail";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  return <ProjectDetail projectId={params.projectId} />;
}
