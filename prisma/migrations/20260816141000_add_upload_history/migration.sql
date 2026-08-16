-- CreateTable
CREATE TABLE IF NOT EXISTS "uploaded_documents" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "chunkCount" INTEGER NOT NULL,
    "uploadedBy" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "uploaded_documents_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX IF NOT EXISTS "uploaded_documents_uploadedAt_idx" ON "uploaded_documents"("uploadedAt");
