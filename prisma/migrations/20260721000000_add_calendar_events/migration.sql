-- CreateEnum
CREATE TYPE "CalendarEventVisibility" AS ENUM ('PERSONAL', 'COMPANY');

-- CreateEnum
CREATE TYPE "CalendarEventType" AS ENUM ('GENERAL', 'MEETING', 'DELIVERY', 'INSTALL', 'DEADLINE');

-- CreateTable
CREATE TABLE "CalendarEvent" (
    "id" TEXT NOT NULL,
    "organizationId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "projectId" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "eventType" "CalendarEventType" NOT NULL DEFAULT 'GENERAL',
    "visibility" "CalendarEventVisibility" NOT NULL DEFAULT 'PERSONAL',
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3),
    "color" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CalendarEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CalendarEvent_organizationId_startsAt_idx" ON "CalendarEvent"("organizationId", "startsAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_createdById_startsAt_idx" ON "CalendarEvent"("createdById", "startsAt");

-- CreateIndex
CREATE INDEX "CalendarEvent_projectId_startsAt_idx" ON "CalendarEvent"("projectId", "startsAt");

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CalendarEvent" ADD CONSTRAINT "CalendarEvent_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;
