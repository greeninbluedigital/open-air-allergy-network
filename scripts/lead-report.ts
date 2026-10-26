/**
 * Read-only monthly report of practice page views, leads and contacts
 * (docs/lead-forms.md, "Counting leads"). Also used by the
 * monthly lead check reminder to decide whether the pending-lead job
 * should go back to every 15 minutes (.github/workflows/process-pending-leads.yml).
 *
 *   npx tsx scripts/lead-report.ts
 *
 * Leads = phone taps, email button clicks, contact form submissions.
 * Contacts = website clicks, address (map) clicks. Demo listings excluded.
 */
import "dotenv/config";
import { db } from "@/lib/db";

const MONTHLY = `
WITH actions AS (
  SELECT e."providerId", e."createdAt", e.type::text AS action
  FROM "AnalyticsEvent" e
  WHERE e.type IN ('PHONE_CLICK', 'EMAIL_CLICK', 'WEBSITE_CLICK', 'ADDRESS_CLICK')
     OR (e.type = 'PAGE_VIEW' AND e.path LIKE '/find-an-ilit-provider/%')
  UNION ALL
  SELECT s."providerId", s."createdAt", 'CONTACT_FORM'
  FROM "ContactSubmission" s
)
SELECT
  to_char(date_trunc('month', a."createdAt"), 'YYYY-MM') AS month,
  CASE
    WHEN a.action = 'PAGE_VIEW' THEN '1 Practice page views'
    WHEN a.action IN ('PHONE_CLICK', 'EMAIL_CLICK', 'CONTACT_FORM') THEN '2 Leads'
    ELSE '3 Contacts'
  END AS category,
  COALESCE(a.action, 'Total') AS action,
  COUNT(*)::int AS total
FROM actions a
JOIN "Provider" p ON p.id = a."providerId"
WHERE NOT p."isDemo"
GROUP BY GROUPING SETS ((1, 2, a.action), (1, 2))
ORDER BY 1, 2, (a.action IS NULL), 3;
`;

// Contact form leads by how they reached the practice: confirmed by the
// visitor, or forwarded unconfirmed by the pending-lead job (the ones its
// schedule delays).
const FORMS = `
SELECT
  to_char(date_trunc('month', s."createdAt"), 'YYYY-MM') AS month,
  s."confirmationStatus"::text AS status,
  COUNT(*)::int AS total
FROM "ContactSubmission" s
JOIN "Provider" p ON p.id = s."providerId"
WHERE NOT p."isDemo"
GROUP BY 1, 2
ORDER BY 1, 2;
`;

async function main() {
  console.log("Monthly page views, leads and contacts (UTC months):");
  console.table(await db.$queryRawUnsafe(MONTHLY));
  console.log("Contact form leads by confirmation status:");
  console.table(await db.$queryRawUnsafe(FORMS));
}

main()
  .catch((err) => {
    console.error(err);
    process.exitCode = 1;
  })
  .finally(() => process.exit());
