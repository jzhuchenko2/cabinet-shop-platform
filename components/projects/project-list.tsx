"use client";

import { useEffect, useState } from "react";
import { ProjectSummaryCard, type ProjectSummary } from "@/components/projects/project-summary-card";
import { demoProjectsStorageKey, sampleProjects, type StoredProject } from "@/lib/demo-projects";

function loadStoredProjects() {
  const rawProjects = window.localStorage.getItem(demoProjectsStorageKey);

  if (!rawProjects) {
    return [];
  }

  try {
    return JSON.parse(rawProjects) as StoredProject[];
  } catch {
    return [];
  }
}

export function ProjectList() {
  const [projects, setProjects] = useState<ProjectSummary[]>(sampleProjects);

  useEffect(() => {
    setProjects([...loadStoredProjects(), ...sampleProjects]);
  }, []);

  return (
    <section className="grid grid-3">
      {projects.map((project) => (
        <ProjectSummaryCard key={project.id} project={project} />
      ))}
    </section>
  );
}

