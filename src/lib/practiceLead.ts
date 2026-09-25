import { escapeHtml, sendEmail } from "@/lib/email";

export const PRACTICE_LEAD_REASONS = [
  "List my practice in the directory",
  "Claim or update my existing listing",
  "Learn about Listing Options",
  "Other",
] as const;

const PRACTICE_LEAD_INBOX = "leads@openairallergynetwork.com";

type PracticeLeadForEmail = {
  reason: string;
  firstName: string;
  lastName: string;
  practiceName: string;
  email: string;
  phone: string;
  phoneExt: string | null;
  website: string | null;
  city: string;
  state: string;
  comments: string | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

/** Adds https:// when the visitor typed a bare domain like "mypractice.com". */
export function normalizeWebsite(raw: string): string | null {
  const trimmed = raw.trim().slice(0, 300);
  if (!trimmed) return null;
  return /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
}

function oneLine(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function buildPracticeLeadEmail(lead: PracticeLeadForEmail) {
  const subject = `[Practice]: ${oneLine(lead.reason)}, ${oneLine(lead.practiceName)}`;
  const phone = `(${lead.phone.slice(0, 3)}) ${lead.phone.slice(3, 6)}-${lead.phone.slice(6)}${lead.phoneExt ? ` ext. ${lead.phoneExt}` : ""}`;

  let websiteHtml = "";
  if (lead.website) {
    let isLinkable = false;
    try {
      isLinkable = ["http:", "https:"].includes(new URL(lead.website).protocol);
    } catch {}
    const text = escapeHtml(lead.website);
    websiteHtml = isLinkable ? `<a href="${text}">${text}</a>` : text;
  }

  const rows: [string, string][] = [
    ["Reason", escapeHtml(lead.reason)],
    ["Name", escapeHtml(`${lead.firstName} ${lead.lastName}`)],
    ["Practice", escapeHtml(lead.practiceName)],
    ["Email", escapeHtml(lead.email)],
    ["Phone", escapeHtml(phone)],
    ...(websiteHtml ? ([["Website", websiteHtml]] as [string, string][]) : []),
    ["Location", escapeHtml(`${lead.city}, ${lead.state}`)],
    ...(lead.comments ? ([["Comments", escapeHtml(lead.comments).replace(/\n/g, "<br>")]] as [string, string][]) : []),
  ];
  const utm = [lead.utmSource, lead.utmMedium, lead.utmCampaign].filter(Boolean).join(" / ");
  if (utm) rows.push(["UTM", escapeHtml(utm)]);

  const html = `
    <p>New For Practices inquiry. Reply to this email to respond directly.</p>
    <table cellpadding="4" style="border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td valign="top"><strong>${k}</strong></td><td>${v}</td></tr>`).join("")}
    </table>
  `;
  return { subject, html };
}

export async function notifyPracticeLead(lead: PracticeLeadForEmail) {
  const { subject, html } = buildPracticeLeadEmail(lead);
  await sendEmail({ to: PRACTICE_LEAD_INBOX, replyTo: lead.email, subject, html });
}
