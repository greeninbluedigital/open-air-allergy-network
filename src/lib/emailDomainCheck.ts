import { resolveMx } from "node:dns/promises";

/**
 * Stage 1 of lead email verification (Section 4) — synchronous DNS/MX
 * lookup at submission, tens of milliseconds, pure Node stdlib (no external
 * service). Only blocks submissions where the domain structurally cannot
 * receive mail (no MX records and no mail-capable A/AAAA fallback) — not a
 * probabilistic spam/risk score.
 */
export async function domainCanReceiveMail(email: string): Promise<boolean> {
  const domain = email.split("@")[1]?.trim().toLowerCase();
  if (!domain) return false;

  try {
    const records = await resolveMx(domain);
    return records.length > 0;
  } catch {
    // NXDOMAIN, no MX records, or any other DNS failure — treat as "cannot
    // receive mail" per Section 4's Stage 1 definition. A transient DNS
    // hiccup on a real domain is rare and not worth a retry loop for a
    // synchronous, tens-of-milliseconds check.
    return false;
  }
}
