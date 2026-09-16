import { sendEmail } from "@/lib/email";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

type LeadProvider = {
  practiceName: string;
  phone: string | null;
  notificationEmail: string | null;
};

type Lead = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  message: string;
  confirmationToken: string;
};

/** Stage 2, step 1 — sent immediately on a passing submission. */
export async function sendConfirmationEmail(lead: Lead, provider: LeadProvider) {
  const confirmUrl = `${SITE_URL}/api/leads/confirm/${lead.confirmationToken}`;
  await sendEmail({
    to: lead.email,
    subject: `Confirm your inquiry to ${provider.practiceName}`,
    html: `
      <p>Thanks for reaching out to ${provider.practiceName}.</p>
      <p>Please confirm this is really you so we can pass your message along:</p>
      <p><a href="${confirmUrl}">Confirm my inquiry</a></p>
      <p>If you don't confirm within 60 minutes, we'll send it along anyway — but confirming helps ${provider.practiceName} know it's a real inquiry.</p>
    `,
  });
}

/** Stage 2, steps 3/4 — tagged [Verified] on confirm-click, [Unverified] if
 * the ~60-minute window elapses first. Never silently dropped either way. */
export async function forwardLeadToPractice(lead: Lead, provider: LeadProvider, tag: "Verified" | "Unverified") {
  if (!provider.notificationEmail) {
    console.warn(
      `Lead for "${provider.practiceName}" has no notificationEmail set — cannot forward. Lead is still recorded in ContactSubmission.`,
    );
    return;
  }

  await sendEmail({
    to: provider.notificationEmail,
    // So the practice can just hit Reply and land in the patient's own
    // inbox, instead of replying to the shared sending address.
    replyTo: lead.email,
    subject: `[${tag}] New inquiry from ${lead.firstName} ${lead.lastName}`,
    html: `
      <p><strong>${tag === "Verified" ? "✓ Verified" : "Unverified"} lead</strong></p>
      <p><strong>Name:</strong> ${lead.firstName} ${lead.lastName}</p>
      <p><strong>Email:</strong> ${lead.email}</p>
      ${lead.phone ? `<p><strong>Phone:</strong> ${lead.phone}</p>` : ""}
      <p><strong>Message:</strong></p>
      <p>${lead.message}</p>
    `,
  });
}
