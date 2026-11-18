-- Profile links for a practitioner (Practitioners column F), used as the
-- Person markup's sameAs on credited articles.
ALTER TABLE "Author" ADD COLUMN "sameAs" TEXT[] DEFAULT ARRAY[]::TEXT[];
