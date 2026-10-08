-- Free trials (Providers columns R-S) and the sheet's own tier.
ALTER TABLE "Provider" ADD COLUMN "sheetTier" "Tier" NOT NULL DEFAULT 'FREE_CLAIMED',
ADD COLUMN "trial" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "trialEndsAt" TIMESTAMP(3);
UPDATE "Provider" SET "sheetTier" = "tier";
