import { Client } from "@upstash/qstash";
import { db } from "@/lib/db";
import { forwardLeadToPractice } from "@/lib/leadNotify";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

/** How long a patient has to click the confirmation link before the lead
 * goes to the practice as Unverified. */
export const CONFIRMATION_WINDOW_MINUTES = 60;

/** A couple of minutes of slack, so a QStash call that lands a moment early
 * (clock differences between Upstash, Vercel and the database) still counts
 * as due instead of waiting hours for the backup poll. */
const DUE_GRACE_MINUTES = 2;

/** The endpoint QStash calls an hour after each lead. */
export const FORWARD_DUE_URL = `${SITE_URL}/api/leads/forward-due`;

type SubmissionForForward = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
  confirmationToken: string;
  confirmationStatus: "PENDING" | "CONFIRMED" | "UNVERIFIED_FORWARDED";
  forwardedAt: Date | null;
  createdAt: Date;
  provider: { practiceName: string; phone: string | null; notificationEmail: string | null };
};

export const FORWARD_INCLUDE = {
  provider: { select: { practiceName: true, phone: true, notificationEmail: true } },
} as const;

export type ForwardResult = "sent" | "already-forwarded" | "not-due" | "no-email";

/**
 * Forwards one lead if it's due: a CONFIRMED lead whose earlier forward
 * failed goes as Verified, and a PENDING lead past the confirmation window
 * goes as Unverified. Only records the forward once the email has actually
 * sent, so a failed send throws and leaves the row for a retry. A practice
 * with no notificationEmail leaves the row untouched too (it used to be
 * marked forwarded anyway).
 */
export async function forwardIfDue(submission: SubmissionForForward): Promise<ForwardResult> {
  if (submission.forwardedAt || submission.confirmationStatus === "UNVERIFIED_FORWARDED") {
    return "already-forwarded";
  }

  let tag: "Verified" | "Unverified";
  if (submission.confirmationStatus === "CONFIRMED") {
    tag = "Verified";
  } else {
    const dueAt =
      submission.createdAt.getTime() + (CONFIRMATION_WINDOW_MINUTES - DUE_GRACE_MINUTES) * 60 * 1000;
    if (Date.now() < dueAt) return "not-due";
    tag = "Unverified";
  }

  const sent = await forwardLeadToPractice(submission, submission.provider, tag);
  if (!sent) return "no-email";

  await db.contactSubmission.update({
    where: { id: submission.id },
    data:
      tag === "Unverified"
        ? { confirmationStatus: "UNVERIFIED_FORWARDED", forwardedAt: new Date() }
        : { forwardedAt: new Date() },
  });
  return "sent";
}

/**
 * Asks QStash to call /api/leads/forward-due an hour from now for this one
 * lead, so the database only wakes when there's a lead to forward. Skipped
 * (and left to the GitHub Actions backup poll) when QStash isn't configured
 * or the site URL is localhost, which QStash can't reach. Never throws: a
 * failure here must not lose the lead, and the backup poll still covers it.
 */
export async function scheduleLeadForward(submissionId: string): Promise<void> {
  const token = process.env.QSTASH_TOKEN;
  if (!token || /localhost|127\.0\.0\.1/.test(SITE_URL)) {
    console.warn(`[qstash:not-scheduled] lead ${submissionId}: QSTASH_TOKEN unset or site URL is local`);
    return;
  }

  try {
    // baseUrl falls back to the SDK default when QSTASH_URL isn't set.
    const client = new Client({ token, ...(process.env.QSTASH_URL ? { baseUrl: process.env.QSTASH_URL } : {}) });
    await client.publishJSON({
      url: FORWARD_DUE_URL,
      body: { id: submissionId },
      delay: `${CONFIRMATION_WINDOW_MINUTES}m`,
      deduplicationId: `lead-${submissionId}`,
    });
  } catch (err) {
    console.error(`Failed to schedule QStash forward for lead ${submissionId}; the backup poll will catch it:`, err);
  }
}
