import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forwardLeadToPractice } from "@/lib/leadNotify";

/**
 * Stage 2, step 3 of lead email verification (Section 4) — the link sent in
 * the confirmation email. Idempotent: a second click (or a click after the
 * 60-minute auto-forward already fired) redirects the same way without
 * forwarding twice. confirmedAt is set unconditionally — the click itself
 * genuinely happened — but forwardedAt is only set once the send actually
 * succeeds; if it fails, the row stays CONFIRMED with forwardedAt still
 * null, and /api/leads/process-pending's retry branch picks it up rather
 * than the failure being silently swallowed.
 */
export async function GET(
  request: Request,
  context: RouteContext<"/api/leads/confirm/[token]">,
) {
  const { token } = await context.params;

  const submission = await db.contactSubmission.findUnique({
    where: { confirmationToken: token },
    include: { provider: { select: { slug: true, practiceName: true, phone: true, notificationEmail: true } } },
  });

  if (!submission) {
    return NextResponse.json({ error: "This confirmation link is invalid." }, { status: 404 });
  }

  if (submission.confirmationStatus === "PENDING") {
    await db.contactSubmission.update({
      where: { id: submission.id },
      data: { confirmationStatus: "CONFIRMED", confirmedAt: new Date() },
    });

    try {
      await forwardLeadToPractice(submission, submission.provider, "Verified");
      await db.contactSubmission.update({
        where: { id: submission.id },
        data: { forwardedAt: new Date() },
      });
    } catch (err) {
      console.error("Failed to forward confirmed lead — will retry via process-pending:", err);
    }
  }

  const url = new URL(`/find-an-ilit-provider/${submission.provider.slug}`, request.url);
  url.searchParams.set("confirmed", "1");
  return NextResponse.redirect(url);
}
