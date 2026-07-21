-- AlterTable
ALTER TABLE "File"
ADD COLUMN "sourceFileId" TEXT,
ADD COLUMN "lastMarkedUpById" TEXT,
ADD COLUMN "markupJson" JSONB,
ADD COLUMN "pageRotations" JSONB,
ADD COLUMN "deletedPages" JSONB,
ADD COLUMN "lastMarkedUpAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "File_sourceFileId_idx" ON "File"("sourceFileId");

-- CreateIndex
CREATE INDEX "File_lastMarkedUpById_idx" ON "File"("lastMarkedUpById");

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_sourceFileId_fkey" FOREIGN KEY ("sourceFileId") REFERENCES "File"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "File" ADD CONSTRAINT "File_lastMarkedUpById_fkey" FOREIGN KEY ("lastMarkedUpById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
