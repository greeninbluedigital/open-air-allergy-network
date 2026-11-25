/**
 * Resends one contact form lead to its practice's current Notification
 * Email, after a bounce (src/app/api/resend/webhook/route.ts) and once the
 * practice's address is fixed on the sheet and synced.
 *
 *   npx tsx scripts/resend-lead.ts <leadId>             # dry run: shows where it would go
 *   npx tsx scripts/resend-lead.ts <leadId> --send      # sends it
 *
 * Uses the same email as the original forward (Verified if the patient
 * confirmed), then clears forwardBouncedAt and resets forwardedAt.
 */
import "dotenv/config";
import { db } from "../src/lib/db";
import { forwardLeadToPractice } from "../src/lib/leadNotify";

async function main() {
  const [leadId, flag] = process.argv.slice(2);
  if (!leadId) {
    console.error("Usage: npx tsx scripts/resend-lead.ts <leadId> [--send]");
    process.exit(1);
  }
  const lead = await db.contactSubmission.findUnique({
    where: { id: leadId },
    include: { provider: { select: { slug: true, city: true, state: true, practiceName: true, phone: true, notificationEmail: true } } },
  });
  if (!lead) throw new Error(`No lead with id ${leadId}`);
  const tag = lead.confirmationStatus === "CONFIRMED" ? "Verified" : "Unverified";
  console.log(`Practice: ${lead.provider.practiceName}`);
  console.log(`Would send to: ${lead.provider.notificationEmail ?? "(no Notification Email set)"}`);
  console.log(`Status: ${tag}; bounced: ${lead.forwardBouncedAt ? "yes" : "no"}`);
  if (flag !== "--send") {
    console.log("Dry run. Add --send to send it.");
    return;
  }
  const sent = await forwardLeadToPractice(lead, lead.provider, tag);
  if (!sent) throw new Error("Not sent: the practice has no Notification Email.");
  await db.contactSubmission.update({
    where: { id: lead.id },
    data: { forwardedAt: new Date(), forwardBouncedAt: null, forwardBounceReason: null },
  });
  console.log("Sent.");
}

main()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error(err instanceof Error ? err.message : err);
    process.exit(1);
  });
