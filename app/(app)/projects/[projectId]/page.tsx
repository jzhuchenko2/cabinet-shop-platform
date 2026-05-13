import { ProjectDetail } from "@/components/projects/project-detail";

export default function ProjectDetailPage({ params }: { params: { projectId: string } }) {
  return <ProjectDetail projectId={params.projectId} />;
}
