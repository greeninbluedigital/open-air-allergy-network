/**
 * Thin email-sending abstraction. No provider is configured yet (needs
 * RESEND_API_KEY) — until then this logs what would have been sent instead
 * of throwing, so the rest of the lead-verification flow (redirect,
 * confirmation UI, forwarding logic) can still be exercised end-to-end.
 * Swap the body of this function for a real Resend API call once a key is
 * available; nothing else in the codebase needs to change.
 */
/** Where For Practices and About page submissions are emailed. */
export const LEADS_INBOX = "leads@openairallergynetwork.com";

/** For putting user-submitted form text into an email's HTML body. */
export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function sendEmail({
  to,
  subject,
  html,
  replyTo,
  text,
  tags,
}: {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
  /** Plain-text copy; helps with strict mail filters (medical offices). */
  text?: string;
  /** Resend tags, echoed back in webhook events (src/app/api/resend/webhook).
   * Names and values: ASCII letters, numbers, underscores and dashes only. */
  tags?: { name: string; value: string }[];
}): Promise<void> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn(`[email:not-sent, no provider configured] to=${to} subject="${subject}"`);
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: process.env.EMAIL_FROM_ADDRESS || "Open Air Allergy Network <onboarding@resend.dev>",
      to,
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
      ...(text ? { text } : {}),
      ...(tags?.length ? { tags } : {}),
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Resend send failed (${res.status}): ${body}`);
  }
}
