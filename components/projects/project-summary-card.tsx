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
      <h3>
        <Link href={`/projects/${project.id}`}>{project.name}</Link>
      </h3>
      <p className="muted">{project.client}</p>
      <p>{project.department}</p>
      <p className="muted">Due {project.dueDate}</p>
      <span className={project.status === "Blocked" ? "status-pill blocked" : "status-pill ready"}>
        {project.status}
      </span>
    </article>
  );
}

