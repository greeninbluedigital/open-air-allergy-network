-- Lead forward bounce tracking (Resend webhook, 2026-11-25)
ALTER TABLE "ContactSubmission" ADD COLUMN "forwardBouncedAt" TIMESTAMP(3);
ALTER TABLE "ContactSubmission" ADD COLUMN "forwardBounceReason" TEXT;
