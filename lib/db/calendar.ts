import type { CalendarEventType, CalendarEventVisibility } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import type { CurrentUser } from "@/lib/auth";
import { isFullAccess } from "@/lib/rbac";

export function listCalendarItems(user: CurrentUser) {
  return prisma.project.findMany({
    where: {
      organizationId: user.organizationId,
      status: { not: "CANCELED" }
    },
    include: {
      client: true,
      currentDepartment: true,
      tasks: {
        where: {
          dueDate: { not: null }
        },
        include: {
          department: true,
          assignee: true
        },
        orderBy: [{ dueDate: "asc" }, { priority: "desc" }]
      }
    },
    orderBy: [{ dueDate: "asc" }, { updatedAt: "desc" }]
  });
}

export function listCalendarProjectOptions(user: CurrentUser) {
  return prisma.project.findMany({
    where: {
      organizationId: user.organizationId,
      status: { not: "CANCELED" }
    },
    select: {
      id: true,
      name: true,
      client: {
        select: {
          name: true
        }
      }
    },
    orderBy: [{ status: "asc" }, { name: "asc" }]
  });
}

export function listManualCalendarEvents(user: CurrentUser) {
  return prisma.calendarEvent.findMany({
    where: {
      organizationId: user.organizationId,
      OR: [{ visibility: "COMPANY" }, { createdById: user.id }]
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true
        }
      },
      project: {
        include: {
          client: true
        }
      }
    },
    orderBy: [{ startsAt: "asc" }, { createdAt: "desc" }]
  });
}

export async function createCalendarEvent({
  user,
  title,
  description,
  eventType,
  visibility,
  startsAt,
  endsAt,
  projectId,
  color
}: {
  user: CurrentUser;
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  visibility: CalendarEventVisibility;
  startsAt: Date;
  endsAt: Date | null;
  projectId: string | null;
  color: string | null;
}) {
  if (visibility === "COMPANY" && !isFullAccess(user)) {
    throw new Error("Only managers can add company calendar events.");
  }

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId,
        status: { not: "CANCELED" }
      },
      select: {
        id: true
      }
    });

    if (!project) {
      throw new Error("Choose a valid project.");
    }
  }

  return prisma.calendarEvent.create({
    data: {
      organizationId: user.organizationId,
      createdById: user.id,
      projectId,
      title,
      description,
      eventType,
      visibility,
      startsAt,
      endsAt,
      color
    }
  });
}

export async function updateCalendarEvent({
  user,
  eventId,
  title,
  description,
  eventType,
  visibility,
  startsAt,
  endsAt,
  projectId,
  color
}: {
  user: CurrentUser;
  eventId: string;
  title: string;
  description: string | null;
  eventType: CalendarEventType;
  visibility: CalendarEventVisibility;
  startsAt: Date;
  endsAt: Date | null;
  projectId: string | null;
  color: string | null;
}) {
  const existingEvent = await prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      organizationId: user.organizationId,
      ...(isFullAccess(user) ? {} : { createdById: user.id, visibility: "PERSONAL" })
    },
    select: {
      id: true
    }
  });

  if (!existingEvent) {
    throw new Error("You cannot update that calendar event.");
  }

  if (visibility === "COMPANY" && !isFullAccess(user)) {
    throw new Error("Only managers can add company calendar events.");
  }

  if (projectId) {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        organizationId: user.organizationId,
        status: { not: "CANCELED" }
      },
      select: {
        id: true
      }
    });

    if (!project) {
      throw new Error("Choose a valid project.");
    }
  }

  return prisma.calendarEvent.update({
    where: {
      id: existingEvent.id
    },
    data: {
      projectId,
      title,
      description,
      eventType,
      visibility,
      startsAt,
      endsAt,
      color
    }
  });
}

export async function deleteCalendarEvent(eventId: string, user: CurrentUser) {
  const event = await prisma.calendarEvent.findFirst({
    where: {
      id: eventId,
      organizationId: user.organizationId,
      ...(isFullAccess(user) ? {} : { createdById: user.id, visibility: "PERSONAL" })
    },
    select: {
      id: true
    }
  });

  if (!event) {
    throw new Error("You cannot delete that calendar event.");
  }

  await prisma.calendarEvent.delete({
    where: {
      id: event.id
    }
  });
}
