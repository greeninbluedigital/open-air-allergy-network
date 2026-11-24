import { escapeHtml, sendEmail } from "@/lib/email";

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
  const practice = escapeHtml(provider.practiceName);
  await sendEmail({
    to: lead.email,
    subject: `Confirm your inquiry to ${provider.practiceName}`,
    html: `
      <p>Thanks for reaching out to ${practice}.</p>
      <p>Please confirm this is really you so we can pass your message along:</p>
      <p><a href="${confirmUrl}">Confirm my inquiry</a></p>
      <p>If you don't confirm within 60 minutes, we'll send it along anyway, but confirming helps ${practice} know it's a real inquiry.</p>
    `,
  });
}

/** On Cloudinary, not the site: email image proxies fetching from the site
 * itself can be blocked by its bot protection. 1200x240, shown at 240px. */
const LOGO_URL = "https://res.cloudinary.com/qruprn0t/image/upload/v1795495007/open-air-allergy-network-logo.png";

const SAGE = "#4a6350";
const MUTED = "#6b6b6b";
const SAND = "#f5f1e8";
const SAND_LINE = "#e3dcc9";
const HELLO = "hello@openairallergynetwork.com";

/** Under the submitted time on every lead: a lead can wait up to an hour
 * for the patient's confirm click, and the owner wants practices to ask
 * about it. Plain text, no mailto link (they work badly in many email
 * clients, owner 11/23); the address is in the footer. */
const ASK_WHY = "Arrived later than this? Ask us why at the email address below.";

const zones = (states: string, zone: string) => Object.fromEntries(states.split(" ").map((s) => [s, zone]));

/** Each state's main time zone, for telling the practice when the patient
 * wrote. States split across zones use the one most of the state is in. */
const STATE_TIME_ZONES: Record<string, string> = {
  ...zones("CT DE DC FL GA IN KY ME MD MA MI NH NJ NY NC OH PA RI SC VT VA WV", "America/New_York"),
  ...zones("AL AR IL IA KS LA MN MS MO NE ND OK SD TN TX WI", "America/Chicago"),
  ...zones("CO ID MT NM UT WY", "America/Denver"),
  ...zones("CA NV OR WA", "America/Los_Angeles"),
  AZ: "America/Phoenix",
  AK: "America/Anchorage",
  HI: "Pacific/Honolulu",
};

/** "Nov 21, 2026, 9:46 AM CST" in the practice's time zone. */
export function formatSubmittedAt(date: Date, state: string): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: STATE_TIME_ZONES[state.trim().toUpperCase()] ?? "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    timeZoneName: "short",
  }).format(date);
}

type ForwardLead = Lead & { createdAt: Date };
type ForwardProvider = LeadProvider & { slug: string; city: string; state: string };

/**
 * The practice's lead email (owner, 2026-11-23). Usually read by front desk
 * or admin staff who have never heard of OAAN, so it opens with who we are
 * and that the conversation is theirs from here (we never follow up with
 * patients, docs/legal-facts.md). Confirmed leads say so; unconfirmed ones
 * show no status at all, since "Unverified" reads as spam to a busy front
 * desk. A line under the submitted time invites the practice to ask
 * why a lead took a while (ASK_WHY). Patient-typed values are escaped in
 * the HTML. Returns an HTML and a plain-text version.
 */
export function buildLeadEmail(lead: ForwardLead, provider: ForwardProvider, tag: "Verified" | "Unverified") {
  const fullName = `${lead.firstName} ${lead.lastName}`.replace(/\s+/g, " ").trim();
  const name = escapeHtml(fullName);
  const office = `${provider.practiceName}, ${provider.city}, ${provider.state}`;
  const pageUrl = `${SITE_URL}/find-an-ilit-provider/${provider.slug}`;
  const pageLabel = pageUrl.replace(/^https?:\/\//, "");
  const submitted = formatSubmittedAt(lead.createdAt, provider.state);
  const confirmedText = "✓ Yes. They clicked the confirmation link we emailed them.";
  const privacy =
    "You can reply to this email to reach them directly. We won't see or be part of any further communication, and we won't follow up with the patient.";

  const link = `color:${SAGE};font-weight:bold;text-decoration:none;`;
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 0;vertical-align:top;width:150px;color:${MUTED};">${label}</td><td style="padding:6px 0;vertical-align:top;">${value}</td></tr>`;

  const html = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ffffff;">
<tr><td align="center" style="padding:24px 12px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.55;color:#222222;">
<tr><td style="padding:0 0 20px;border-bottom:1px solid ${SAND_LINE};">
<a href="${SITE_URL}"><img src="${LOGO_URL}" width="240" height="48" alt="Open Air Allergy Network" style="display:block;border:0;"></a>
</td></tr>
<tr><td style="padding:20px 0 16px;">
<p style="margin:0;">${name} visited your page on <a href="${SITE_URL}" style="${link}">OpenAirAllergyNetwork.com</a>, the national directory for ILIT, and sent the message below. ${privacy}</p>
</td></tr>
<tr><td style="background:${SAND};padding:16px 20px;border-radius:6px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;line-height:1.55;color:#222222;">
${row("Office", `<a href="${pageUrl}" style="${link}">${escapeHtml(office)}</a>`)}
${row("Name", name)}
${row("Email", escapeHtml(lead.email))}
${lead.phone ? row("Phone", escapeHtml(lead.phone)) : ""}
${row("Message", escapeHtml(lead.message).replace(/\n/g, "<br>"))}
${row("Submitted", `${escapeHtml(submitted)}<br><span style="font-size:13px;color:${MUTED};">${ASK_WHY}</span>`)}
${tag === "Verified" ? row("Email confirmed", confirmedText) : ""}
${row("Provider page", `<a href="${pageUrl}" style="${link}">${escapeHtml(pageLabel)}</a>`)}
</table>
</td></tr>
<tr><td style="padding:20px 0 0;font-size:13px;color:${MUTED};">
Questions about Open Air Allergy Network, or want these sent to a different address? Email <a href="mailto:${HELLO}" style="${link}">${HELLO}</a>.
</td></tr>
</table>
</td></tr>
</table>`;

  const text = [
    "Open Air Allergy Network",
    "",
    `${fullName} visited your page on OpenAirAllergyNetwork.com, the national directory for ILIT, and sent the message below. ${privacy}`,
    "",
    `Office: ${office}`,
    `Name: ${fullName}`,
    `Email: ${lead.email}`,
    ...(lead.phone ? [`Phone: ${lead.phone}`] : []),
    "Message:",
    lead.message,
    "",
    `Submitted: ${submitted}`,
    `(${ASK_WHY})`,
    ...(tag === "Verified" ? [`Email confirmed: ${confirmedText}`] : []),
    `Provider page: ${pageUrl}`,
    "",
    `Questions about Open Air Allergy Network, or want these sent to a different address? Email ${HELLO}.`,
  ].join("\n");

  return { subject: `New patient inquiry from ${fullName} via Open Air Allergy Network`, html, text };
}

/** Stage 2, steps 3/4: sent on the confirm click (Verified) or once the
 * ~60-minute window passes (Unverified). Returns false, and sends nothing,
 * when the practice has no notificationEmail, so callers don't mark the
 * lead forwarded. */
export async function forwardLeadToPractice(
  lead: ForwardLead,
  provider: ForwardProvider,
  tag: "Verified" | "Unverified",
): Promise<boolean> {
  if (!provider.notificationEmail) {
    console.warn(
      `Lead for "${provider.practiceName}" has no notificationEmail set — cannot forward. Lead is still recorded in ContactSubmission.`,
    );
    return false;
  }

  const { subject, html, text } = buildLeadEmail(lead, provider, tag);
  await sendEmail({
    to: provider.notificationEmail,
    // So the practice can just hit Reply and land in the patient's own
    // inbox, instead of replying to the shared sending address.
    replyTo: lead.email,
    subject,
    html,
    text,
  });
  return true;
}
