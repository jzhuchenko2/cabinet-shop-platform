"use server";

import { revalidatePath } from "next/cache";
import type { CalendarEventType, CalendarEventVisibility } from "@prisma/client";
import { getCurrentUser } from "@/lib/auth";
import { createCalendarEvent, deleteCalendarEvent, updateCalendarEvent } from "@/lib/db/calendar";
import { hasPermission, isFullAccess } from "@/lib/rbac";
import { requiredString } from "@/lib/validations/common";

export type CalendarEventActionState = {
  error?: string;
  message?: string;
};

const eventTypes: CalendarEventType[] = ["GENERAL", "MEETING", "DELIVERY", "INSTALL", "DEADLINE"];
const eventVisibilities: CalendarEventVisibility[] = ["PERSONAL", "COMPANY"];

function optionalString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text || null;
}

function parseEventType(value: FormDataEntryValue | null) {
  const eventType = String(value ?? "GENERAL") as CalendarEventType;

  if (!eventTypes.includes(eventType)) {
    throw new Error("Choose a valid event type.");
  }

  return eventType;
}

function parseVisibility(value: FormDataEntryValue | null, canManageCompanyEvents: boolean) {
  const visibility = String(value ?? "PERSONAL") as CalendarEventVisibility;

  if (!eventVisibilities.includes(visibility)) {
    throw new Error("Choose a valid calendar type.");
  }

  if (visibility === "COMPANY" && !canManageCompanyEvents) {
    throw new Error("Only managers can add company calendar events.");
  }

  return visibility;
}

function parseDateTime(value: FormDataEntryValue | null, fieldName: string) {
  const text = requiredString(value, fieldName);
  const date = new Date(text);

  if (Number.isNaN(date.getTime())) {
    throw new Error(`${fieldName} must be a valid date and time.`);
  }

  return date;
}

function parseColor(value: FormDataEntryValue | null) {
  const text = optionalString(value);

  if (!text) {
    return null;
  }

  if (!/^#[0-9a-f]{6}$/i.test(text)) {
    throw new Error("Choose a valid event color.");
  }

  return text;
}

function parseEventForm(formData: FormData, canManageCompanyEvents: boolean) {
  const startsAt = parseDateTime(formData.get("startsAt"), "Start date");
  const endsAtValue = optionalString(formData.get("endsAt"));
  const endsAt = endsAtValue ? new Date(endsAtValue) : null;

  if (endsAt && Number.isNaN(endsAt.getTime())) {
    throw new Error("End date must be a valid date and time.");
  }

  if (endsAt && endsAt < startsAt) {
    throw new Error("End date cannot be before the start date.");
  }

  return {
    title: requiredString(formData.get("title"), "Event title"),
    description: optionalString(formData.get("description")),
    eventType: parseEventType(formData.get("eventType")),
    visibility: parseVisibility(formData.get("visibility"), canManageCompanyEvents),
    startsAt,
    endsAt,
    projectId: optionalString(formData.get("projectId")),
    color: parseColor(formData.get("color"))
  };
}

export async function createCalendarEventAction(
  _previousState: CalendarEventActionState,
  formData: FormData
): Promise<CalendarEventActionState> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !hasPermission(currentUser, "view_calendar")) {
      throw new Error("You must be signed in to use the calendar.");
    }

    await createCalendarEvent({
      user: currentUser,
      ...parseEventForm(formData, isFullAccess(currentUser))
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Calendar event could not be created."
    };
  }

  revalidatePath("/calendar");
  return { message: "Calendar event added." };
}

export async function updateCalendarEventAction(
  _previousState: CalendarEventActionState,
  formData: FormData
): Promise<CalendarEventActionState> {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser || !hasPermission(currentUser, "view_calendar")) {
      throw new Error("You must be signed in to use the calendar.");
    }

    await updateCalendarEvent({
      user: currentUser,
      eventId: requiredString(formData.get("eventId"), "Calendar event"),
      ...parseEventForm(formData, isFullAccess(currentUser))
    });
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : "Calendar event could not be updated."
    };
  }

  revalidatePath("/calendar");
  return { message: "Calendar event updated." };
}

export async function deleteCalendarEventAction(formData: FormData) {
  const currentUser = await getCurrentUser();

  if (!currentUser || !hasPermission(currentUser, "view_calendar")) {
    return;
  }

  await deleteCalendarEvent(requiredString(formData.get("eventId"), "Calendar event"), currentUser);
  revalidatePath("/calendar");
}
