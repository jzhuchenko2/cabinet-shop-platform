import { prisma } from "@/lib/prisma";

export function listProjects(organizationId: string) {
  return prisma.project.findMany({
    where: { organizationId },
    include: {
      client: true,
      currentDepartment: true
    },
    orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }]
  });
}

export function getProject(projectId: string) {
  return prisma.project.findUnique({
    where: { id: projectId },
    include: {
      client: true,
      currentDepartment: true,
      areas: {
        include: { cabinetItems: true },
        orderBy: { sortOrder: "asc" }
      },
      tasks: {
        include: {
          assignee: true,
          department: true
        },
        orderBy: [{ status: "asc" }, { dueDate: "asc" }]
      },
      notes: {
        include: { author: true },
        orderBy: { createdAt: "desc" }
      },
      files: {
        include: { uploadedBy: true },
        orderBy: { createdAt: "desc" }
      },
      photos: {
        include: { uploadedBy: true },
        orderBy: { createdAt: "desc" }
      },
      timeLogs: {
        include: {
          user: true,
          department: true
        },
        orderBy: { workDate: "desc" }
      }
    }
  });
}

