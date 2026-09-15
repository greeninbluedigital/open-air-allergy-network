import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { forwardLeadToPractice } from "@/lib/leadNotify";

/**
 * Stage 2, step 3 of lead email verification (Section 4) — the link sent in
 * the confirmation email. Idempotent: a second click (or a click after the
 * 60-minute auto-forward already fired) redirects the same way without
 * forwarding twice.
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
      data: { confirmationStatus: "CONFIRMED", confirmedAt: new Date(), forwardedAt: new Date() },
    });

    try {
      await forwardLeadToPractice(submission, submission.provider, "Verified");
    } catch (err) {
      console.error("Failed to forward confirmed lead:", err);
    }
  }

  const url = new URL(`/find-a-provider/${submission.provider.slug}`, request.url);
  url.searchParams.set("confirmed", "1");
  return NextResponse.redirect(url);
}
