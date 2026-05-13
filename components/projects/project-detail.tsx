"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { NoteList } from "@/components/notes/note-list";
import { PageHeader } from "@/components/ui/page-header";
import { StatCard } from "@/components/ui/stat-card";
import { demoProjectsStorageKey, sampleProjects, type StoredProject } from "@/lib/demo-projects";

function loadProject(projectId: string) {
  const rawProjects = window.localStorage.getItem(demoProjectsStorageKey);
  const storedProjects = rawProjects ? (JSON.parse(rawProjects) as StoredProject[]) : [];
  return storedProjects.find((project) => project.id === projectId) ?? sampleProjects.find((project) => project.id === projectId);
}

export function ProjectDetail({ projectId }: { projectId: string }) {
  const [project, setProject] = useState(() => sampleProjects.find((item) => item.id === projectId));

  useEffect(() => {
    try {
      setProject(loadProject(projectId));
    } catch {
      setProject(sampleProjects.find((item) => item.id === projectId));
    }
  }, [projectId]);

  const title = project?.name ?? "Project not found";
  const client = project?.client ?? "No client";
  const department = project?.department ?? "Unknown";

  return (
    <>
      <PageHeader
        eyebrow="Project"
        title={title}
        description={`Client: ${client}. Current stage: ${department}. Project ID: ${projectId}.`}
        action={
          <Link className="button" href={`/projects/${projectId}/tasks`}>
            View tasks
          </Link>
        }
      />
      <section className="grid grid-3">
        <StatCard label="Areas" value="0" detail="Add rooms and spaces next" />
        <StatCard label="Cabinet items" value="0" detail="Base, wall, tall, trim" />
        <StatCard label="Logged time" value="0h" detail="No time logged yet" />
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
          <NoteList
            notes={[
              {
                body: project ? "Project created and ready for setup." : "Create this project or return to the project list.",
                author: "System",
                noteType: "GENERAL",
                createdAt: "Today"
              }
            ]}
          />
        </div>
      </section>
    </>
  );
}

