-- AlterTable
ALTER TABLE "Department" ADD COLUMN "deadlineLabel" TEXT;
ALTER TABLE "Department" ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "Department_organizationId_isActive_sortOrder_idx" ON "Department"("organizationId", "isActive", "sortOrder");
