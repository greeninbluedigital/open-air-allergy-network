# Lead forms: how submissions are checked and delivered

Internal reference for every public form on the site: what each one checks,
where submissions go, and what's worth telling practices about lead quality.
Last updated 2026-11-23.

> ## Lead quality: selling points for practices
>
> Written for pitch materials. Every claim below is true of the site as
> built; see "Honest limits" before promising more.
>
> - **Every patient email is verified.** When a patient contacts your
>   practice, we check that their email domain can actually receive mail
>   before the message is accepted. Typos and made-up addresses get caught
>   on the spot, and the patient is asked to fix them (and shown your phone
>   number as a fallback).
> - **Patients confirm their own inquiry.** Each patient gets a
>   confirmation email right away. Leads they confirm reach you marked
>   **Email confirmed: Yes**, so you know a real person is waiting to hear
>   back.
> - **No lead is ever lost.** If a patient doesn't click the confirmation
>   link, their message still reaches you about an hour later. If an
>   email ever fails to send, the system keeps
>   retrying until it goes through.
> - **Spam bots are filtered out before they reach you.** A hidden trap
>   field catches automated submissions, which are discarded silently.
> - **No links, no junk.** Messages containing web addresses are rejected,
>   which blocks the most common spam and phishing attempts. Anything a
>   patient types shows up in your inbox as plain text, never as clickable
>   code or disguised links.
> - **Reply straight to the patient.** Hitting Reply on a lead email goes
>   directly to the patient's own inbox.
> - **Clean contact details.** Phone numbers must be a real 10-digit US
>   number, and messages are kept to a readable length (500 characters).
> - **Know where leads come from.** Each lead records the ad campaign or
>   source that brought the patient in (UTM tracking), which matters most
>   for paid landing pages.
>
> **Honest limits (don't overpromise):**
> - These checks stop bots and bad addresses, not a real person sending a
>   low-quality message.
> - Disposable email services (like Mailinator) can still pass the email
>   check, since their domains do receive mail. Those leads usually arrive
>   unconfirmed.
> - An unconfirmed lead means the patient didn't click the link, not that the
>   lead is fake. Many real patients never open confirmation emails.
> - There's no per-practice lead report yet. Leads and phone-number clicks
>   are logged, but a reporting view for practices isn't built.

## The three forms

| Form | Where | Who receives it | Email subject |
|---|---|---|---|
| Patient contact form | Provider pages (Verified tier and up, since 2026-10-01) and SEM landing pages | The practice's `notificationEmail` (set on the sheet) | `New patient inquiry from {name} via Open Air Allergy Network`. Branded body (logo, intro, office, contact details, message, submitted time, provider page); confirmed leads show "Email confirmed: Yes", unconfirmed leads show no status (2026-11-23). Code: `buildLeadEmail` in `src/lib/leadNotify.ts` |
| For Practices | `/for-practices` | leads@openairallergynetwork.com | `[Practice]: {reason}, {practice name}` |
| About page contact | `/about#contact` | leads@openairallergynetwork.com | `[About Page]: {reason}, {name}` |

Every email sets Reply-To to the person who filled out the form.

## Protections on every form

| Check | What it does | Where it runs |
|---|---|---|
| Hidden bot field (honeypot) | An off-screen field real visitors never see. If it's filled in, the visitor sees the normal thank-you page but nothing is saved or emailed. | Server |
| Email domain check | Rejects email domains that can't receive mail (DNS/MX lookup). Error: "That email address doesn't look right." | Server |
| Link blocking | Rejects messages containing `http://`, `https://`, `www.`, or a bare domain on common spam endings (.com, .net, .org, .info, .xyz, and others). Email addresses are allowed. | Browser (warning as you type, blocks submit) and server |
| Character limit | Message/comments boxes capped at 500 characters, with a live counter. | Browser and server |
| Phone format | Must be a 10-digit US number; any punctuation and a leading +1 are fine. Required on For Practices, optional on the patient form. | Browser (and server on For Practices) |
| Plain-text emails | Everything a visitor types is escaped before it goes into an email, so HTML, scripts, or disguised links display as plain text. | Server |
| Required fields | Validated in the browser and again on the server. | Browser and server |

The For Practices and About forms also require a reason from a fixed
dropdown list; the server rejects any value not on that list.

The patient contact form (provider pages and SEM landing pages) shows this
under the Send button: "We never sell your information. By sending, you
agree to our Terms and Privacy Notice." The links open in a new tab. OAAN doesn't sell
visitor data and doesn't send follow-up or marketing emails to patients;
following up is the practice's job once it has the lead (decided
2026-09-29, see `docs/legal-facts.md`).

## Patient lead pipeline (provider pages and SEM landing pages)

1. **Submit.** The honeypot, required fields, link check, and email domain
   check all run before anything is saved. A failed domain check shows the
   practice's phone number as an alternative way to reach them.
2. **Save.** The lead is stored with the provider ID and its campaign data:
   source, medium, campaign, keyword, ad click id, and landing page. These
   come from the campaign visit even if the patient browsed other pages
   first, for up to 30 days (`docs/gtm-ga4-setup.md`, section 5).
3. **Confirmation email** goes to the patient immediately with a one-click
   confirm link.
4. **Patient confirms:** the lead is forwarded to the practice right away,
   marked **Email confirmed: Yes**.
5. **Patient doesn't confirm:** when the lead is saved, the site asks
   Upstash QStash to call `/api/leads/forward-due` 60 minutes later for that
   one lead. If it's still unconfirmed then, it goes to the practice with
   no status line ("Unverified" read as spam to front desks, owner
   11/23). Every lead email shows when the patient wrote, with "Arrived
   later than this? Ask us why at the email address below." (hello@, in
   the footer) to start a conversation about the wait. No mailto link;
   they work badly in many email clients. The database only wakes when there's a lead (since
   2026-11-23). Before that a GitHub Actions poll did this job. It was
   scheduled hourly, but GitHub only ran it about 3 times a day, so an
   unconfirmed lead could wait 5 hours or more.
6. **Backup poll.** The GitHub Actions job (`/api/leads/process-pending`)
   still runs and forwards anything QStash missed, plus confirmed leads
   whose forward failed.
7. **Delivery failures retry.** A lead is only marked as forwarded after the
   email actually sends. If a send fails, QStash retries the call, and the
   backup poll tries again after that. A practice with no notification
   email leaves the lead unforwarded (it forwards once one is set). The
   form only shows for practices that have one, so this shouldn't happen.

Clicking the confirmation link twice, or after the auto-forward already
happened, never sends a duplicate.

## Where it lives in the code

| Piece | File |
|---|---|
| Form handlers (all three) | `src/lib/actions.ts` |
| Honeypot, link check, 500-char limit, error messages | `src/lib/forms.ts`, `src/components/HoneypotField.tsx`, `src/components/MessageField.tsx` |
| Email domain check | `src/lib/emailDomainCheck.ts` |
| Phone validation | `src/lib/phone.ts` |
| Patient confirmation + practice forwarding emails | `src/lib/leadNotify.ts` |
| Confirm link | `src/app/api/leads/confirm/[token]/route.ts` |
| 60-minute auto-forward (QStash) + shared forward logic | `src/lib/leadForwarding.ts`, `src/app/api/leads/forward-due/route.ts` |
| Backup poll + retries | `src/app/api/leads/process-pending/route.ts`, `.github/workflows/process-pending-leads.yml` |
| For Practices email | `src/lib/practiceLead.ts` |
| About page email | `src/lib/generalInquiry.ts` |
| Email sending (Resend) + HTML escaping | `src/lib/email.ts` |

QStash needs `QSTASH_TOKEN`, `QSTASH_CURRENT_SIGNING_KEY` and
`QSTASH_NEXT_SIGNING_KEY` (plus `QSTASH_URL` if the Upstash console shows
one) in Vercel's environment variables. Without them, leads fall back to
the backup poll.

## Possible next steps

- **Cloudflare Turnstile** (free, mostly invisible bot check) if spam still
  gets through the honeypot.
- **Disposable-email blocklist** to reject throwaway addresses outright.
- **Per-practice lead reporting** (lead counts, Verified vs. Unverified
  rate, phone clicks), built on the existing `ContactSubmission` and
  `AnalyticsEvent` tables. This would also make lead quality something
  practices can see for themselves.

## Counting leads

`npx tsx scripts/lead-report.ts` prints, by month: practice page views,
leads (phone taps, email button clicks, contact form submissions) and
contacts (website and address clicks), plus contact form leads by
confirmation status. Demo listings are excluded. It only reads the
database. The SQL inside can be pasted into Neon's SQL editor as is.

A monthly reminder (`oaan-monthly-lead-check`, the 2nd at 9 AM) runs it and
says whether the pending-lead job should go back to every 15 minutes.
