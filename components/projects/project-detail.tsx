import Link from "next/link";
import { NoteList } from "@/components/notes/note-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { getProject } from "@/lib/db/projects";

function formatDate(value: Date) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(value);
}

export async function ProjectDetail({ projectId }: { projectId: string }) {
  const project = await getProject(projectId);

  if (!project) {
    return (
      <>
        <PageHeader
          eyebrow="Project"
          title="Project not found"
          description={`No project exists for ID ${projectId}.`}
          action={
            <Link className="button" href="/projects">
              Back to projects
            </Link>
          }
        />
        <section className="card">
          <p className="muted">Create this project or choose another job from the project list.</p>
        </section>
      </>
    );
  }

  const loggedMinutes = project.timeLogs.reduce((total, log) => total + log.minutes, 0);
  const loggedHours = Math.round((loggedMinutes / 60) * 10) / 10;
  const recentNotes =
    project.notes.length > 0
      ? project.notes.slice(0, 4).map((note) => ({
          body: note.body,
          author: note.author.name,
          noteType: note.noteType,
          createdAt: formatDate(note.createdAt)
        }))
      : [
          {
            body: "Project created and ready for setup.",
            author: "System",
            noteType: "GENERAL",
            createdAt: "Today"
          }
        ];

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title={project.name}
        description={`Client: ${project.client.name}. Current stage: ${
          project.currentDepartment?.name ?? "Unassigned"
        }. Project ID: ${projectId}.`}
        action={
          <Link className="button" href={`/projects/${projectId}/tasks`}>
            View tasks
          </Link>
        }
      />
      <section className="grid grid-3">
        <StatCard label="Areas" value={project._count.areas} detail="Rooms and spaces in scope" />
        <StatCard label="Cabinet items" value={project._count.cabinetItems} detail="Base, wall, tall, trim" />
        <StatCard label="Logged time" value={`${loggedHours}h`} detail={`${loggedMinutes} minutes logged`} />
      </section>
      <section className="grid grid-2" style={{ marginTop: 16 }}>
        <div className="card">
          <h2>Project links</h2>
          <div className="stage-list">
            <Link href={`/projects/${projectId}/areas`}>Areas and cabinet items</Link>
            <Link href={`/projects/${projectId}/files`}>Files and approvals</Link>
            <Link href={`/projects/${projectId}/photos`}>Photos</Link>
            <Link href={`/projects/${projectId}/time`}>Time logs</Link>
          </div>
        </div>
        <div>
          <h2>Recent notes</h2>
          <NoteList notes={recentNotes} />
        </div>
      </section>
    </>
  );
}
