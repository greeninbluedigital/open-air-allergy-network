import { LEADS_INBOX, escapeHtml, sendEmail } from "@/lib/email";

export const GENERAL_INQUIRY_REASONS = [
  "General Inquiry",
  "Press / Media",
  "Partnership",
  "Accessibility",
  "Other",
] as const;

type GeneralInquiryForEmail = {
  reason: string;
  firstName: string;
  lastName: string;
  email: string;
  message: string;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
};

function oneLine(s: string) {
  return s.replace(/\s+/g, " ").trim();
}

export function buildGeneralInquiryEmail(inquiry: GeneralInquiryForEmail) {
  const name = `${inquiry.firstName} ${inquiry.lastName}`;
  const subject = `[About Page]: ${oneLine(inquiry.reason)}, ${oneLine(name)}`;
  const rows: [string, string][] = [
    ["Reason", escapeHtml(inquiry.reason)],
    ["Name", escapeHtml(name)],
    ["Email", escapeHtml(inquiry.email)],
    ["Message", escapeHtml(inquiry.message).replace(/\n/g, "<br>")],
  ];
  const utm = [inquiry.utmSource, inquiry.utmMedium, inquiry.utmCampaign].filter(Boolean).join(" / ");
  if (utm) rows.push(["UTM", escapeHtml(utm)]);

  const html = `
    <p>New About page message. Reply to this email to respond directly.</p>
    <table cellpadding="4" style="border-collapse:collapse">
      ${rows.map(([k, v]) => `<tr><td valign="top"><strong>${k}</strong></td><td>${v}</td></tr>`).join("")}
    </table>
  `;
  return { subject, html };
}

export async function notifyGeneralInquiry(inquiry: GeneralInquiryForEmail) {
  const { subject, html } = buildGeneralInquiryEmail(inquiry);
  await sendEmail({ to: LEADS_INBOX, replyTo: inquiry.email, subject, html });
}
