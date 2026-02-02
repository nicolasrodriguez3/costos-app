-- CreateTable
CREATE TABLE "waitlist_subscriber" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_subscriber_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_subscriber_email_key" ON "waitlist_subscriber"("email");

-- CreateIndex
CREATE INDEX "waitlist_subscriber_email_idx" ON "waitlist_subscriber"("email");
