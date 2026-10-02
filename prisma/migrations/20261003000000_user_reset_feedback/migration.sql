-- AlterTable: add password reset fields to User (additive, no data loss)
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetToken" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpires" TIMESTAMP(3);

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetToken_key" ON "User"("resetToken");

-- CreateTable: feedback / waitlist messages
CREATE TABLE IF NOT EXISTS "FeedbackMessage" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "message" TEXT,
    "type" TEXT NOT NULL DEFAULT 'waitlist',
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "FeedbackMessage_pkey" PRIMARY KEY ("id")
);
