import Link from "next/link";

export type ProjectSummary = {
  id: string;
  name: string;
  client: string;
  department: string;
  dueDate: string;
  status: "Ready" | "Blocked" | "In progress";
};

export function ProjectSummaryCard({ project }: { project: ProjectSummary }) {
  return (
    <article className="card">
      <h3>{project.name}</h3>
      <p className="muted">{project.client}</p>
      <p>{project.department}</p>
      <p className="muted">Due {project.dueDate}</p>
      <div className="grid">
        <span className={project.status === "Blocked" ? "status-pill blocked" : "status-pill ready"}>
          {project.status}
        </span>
        <Link className="button secondary block" href={`/projects/${project.id}`}>
          Open project
        </Link>
      </div>
    </article>
  );
}
