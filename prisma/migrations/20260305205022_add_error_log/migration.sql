-- CreateTable
CREATE TABLE "error_log" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "level" TEXT NOT NULL DEFAULT 'ERROR',
    "action" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "stackTrace" TEXT,
    "metadata" TEXT,
    "userId" TEXT,
    "organizationId" TEXT,

    CONSTRAINT "error_log_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "error_log_timestamp_idx" ON "error_log"("timestamp");

-- CreateIndex
CREATE INDEX "error_log_level_idx" ON "error_log"("level");

-- CreateIndex
CREATE INDEX "error_log_action_idx" ON "error_log"("action");

-- CreateIndex
CREATE INDEX "error_log_organizationId_idx" ON "error_log"("organizationId");
