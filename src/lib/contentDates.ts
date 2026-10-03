import { createHash } from "node:crypto";
import { db } from "@/lib/db";
import { notifyIndexNow, type IndexNowResult } from "@/lib/indexNow";

/**
 * Finds practice pages whose visible content really changed, after a sync.
 *
 * Every daily sync rewrites every Provider row (bumping updatedAt), and
 * "Verified as of" moves daily on purpose, so neither can say when a page
 * actually changed. Instead this fingerprints what a visitor sees (the
 * fields below, treatments and FAQs) and, when the fingerprint differs,
 * stamps contentUpdatedAt (the sitemap's lastmod) and reports the page to
 * IndexNow. A sitemap whose dates move every day teaches Google to ignore
 * them; dates that only move on real changes get used.
 */
export async function refreshContentDates(): Promise<IndexNowResult & { changed: number }> {
  const providers = await db.provider.findMany({
    include: {
      treatments: { select: { treatment: { select: { name: true } } } },
      faqItems: { select: { question: true, answer: true }, orderBy: { sortOrder: "asc" } },
    },
  });

  const now = new Date();
  const paths: string[] = [];
  let changed = 0;
  for (const p of providers) {
    // Everything that shows on the practice page or its search card. Left
    // out on purpose: verifiedAsOf, tierSince, coordinates (follow the
    // address), the notification email, and internal/admin fields.
    const visible = {
      practiceName: p.practiceName, address: p.address, addressLine2: p.addressLine2, city: p.city,
      state: p.state, zip: p.zip, phone: p.phone, website: p.website, groupId: p.groupId,
      tier: p.tier, foundingMember: p.foundingMember, geoExtension: p.geoExtension, academic: p.academic,
      active: p.active, isDemo: p.isDemo, customMessage: p.customMessage, travelNotes: p.travelNotes,
      offersVideoConsult: p.offersVideoConsult, offersPhoneConsult: p.offersPhoneConsult,
      pdpRemoteConsultBadge: p.pdpRemoteConsultBadge, shortBio: p.shortBio, extendedBio: p.extendedBio,
      photoUrl: p.photoUrl, secondaryPhotoUrls: p.secondaryPhotoUrls, srpPhotoUrl: p.srpPhotoUrl,
      businessHours: p.businessHours, ilitScheduleNotes: p.ilitScheduleNotes, showReviews: p.showReviews,
      googlePlaceId: p.googlePlaceId, yelpEmbedCode1: p.yelpEmbedCode1, yelpEmbedCode2: p.yelpEmbedCode2,
      yelpEmbedCode3: p.yelpEmbedCode3, yelpRatingBadgeEmbed: p.yelpRatingBadgeEmbed,
      treatments: p.treatments.map((t) => t.treatment.name).sort(),
      faqs: p.faqItems,
    };
    const hash = createHash("sha256").update(JSON.stringify(visible)).digest("hex");
    if (hash === p.contentHash) continue;

    await db.provider.update({ where: { id: p.id }, data: { contentHash: hash, contentUpdatedAt: now } });
    changed++;
    // Public pages, plus a known page that just changed state (deactivated,
    // made a demo) so the engine sees it's gone. A first fingerprint of a
    // page that was never public isn't worth reporting.
    if ((p.active && !p.isDemo) || p.contentHash !== null) paths.push(`/find-an-ilit-provider/${p.slug}`);
  }

  return { changed, ...(await notifyIndexNow(paths)) };
}
