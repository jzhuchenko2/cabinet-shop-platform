-- AlterTable
ALTER TABLE "TimeClockEntry" ADD COLUMN "projectId" TEXT;
ALTER TABLE "TimeClockEntry" ADD COLUMN "taskId" TEXT;
ALTER TABLE "TimeClockEntry" ADD COLUMN "notes" TEXT;

-- CreateIndex
CREATE INDEX "TimeClockEntry_projectId_idx" ON "TimeClockEntry"("projectId");

-- CreateIndex
CREATE INDEX "TimeClockEntry_taskId_idx" ON "TimeClockEntry"("taskId");

-- AddForeignKey
ALTER TABLE "TimeClockEntry" ADD CONSTRAINT "TimeClockEntry_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeClockEntry" ADD CONSTRAINT "TimeClockEntry_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;
