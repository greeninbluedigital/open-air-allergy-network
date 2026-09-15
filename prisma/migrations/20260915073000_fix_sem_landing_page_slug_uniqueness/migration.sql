-- SemLandingPage.urlSlug should be unique per-provider (route is
-- /lp/[provider.slug]/[urlSlug]), not globally. Table is empty (confirmed
-- via count() before writing this), so no data-loss risk despite the
-- generic warning `prisma migrate dev` gives for any new unique constraint
-- (that warning triggered an interactive confirmation prisma refuses to
-- give in a non-interactive shell, so this migration was written by hand
-- rather than generated).
DROP INDEX "SemLandingPage_urlSlug_key";

CREATE UNIQUE INDEX "SemLandingPage_providerId_urlSlug_key" ON "SemLandingPage"("providerId", "urlSlug");
