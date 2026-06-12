import { ProjectSummaryCard, type ProjectSummary } from "@/components/projects/project-summary-card";

export function ProjectList({ projects }: { projects: ProjectSummary[] }) {
  return (
    <section className="project-grid">
      {projects.length > 0 ? (
        projects.map((project) => <ProjectSummaryCard key={project.id} project={project} />)
      ) : (
        <div className="card">
          <h3>No projects yet</h3>
          <p className="muted">Create the first cabinet job to start building the shop schedule.</p>
        </div>
      )}
    </section>
  );
}
