import { prisma } from "@/lib/prisma";
import type { DepartmentKey } from "@prisma/client";

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
      },
      _count: {
        select: {
          areas: true,
          cabinetItems: true,
          tasks: true,
          files: true,
          photos: true
        }
      }
    }
  });
}

export async function createProject({
  organizationId,
  name,
  clientName,
  departmentKey,
  dueDate
}: {
  organizationId: string;
  name: string;
  clientName: string;
  departmentKey: DepartmentKey;
  dueDate: Date | null;
}) {
  const [client, department] = await Promise.all([
    prisma.client.findFirst({
      where: {
        organizationId,
        name: clientName
      }
    }),
    prisma.department.findUnique({
      where: {
        organizationId_workflowKey: {
          organizationId,
          workflowKey: departmentKey
        }
      }
    })
  ]);

  const projectClient =
    client ??
    (await prisma.client.create({
      data: {
        organizationId,
        name: clientName
      }
    }));

  return prisma.project.create({
    data: {
      organizationId,
      clientId: projectClient.id,
      currentDepartmentId: department?.id,
      name,
      dueDate
    }
  });
}
