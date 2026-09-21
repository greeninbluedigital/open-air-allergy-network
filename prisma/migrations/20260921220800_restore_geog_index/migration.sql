-- Prisma's dev-mode drift checker doesn't recognize an index on an
-- Unsupported geography column as schema-declared, so every schema-changing
-- migrate dev proposes dropping it. Restore it every time this happens.
CREATE INDEX "Provider_geog_idx" ON "Provider" USING GIST ("geog");
