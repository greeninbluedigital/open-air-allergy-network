import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const VALID_TYPES = new Set(["PAGE_VIEW", "PHONE_CLICK"]);

/**
 * Internal analytics log (PROJECT_SPEC.md's Analytics section) — public,
 * unauthenticated, fire-and-forget from src/lib/track.ts. Always responds
 * 204 regardless of outcome; a malformed or spoofed request from a visitor
 * shouldn't ever surface as a page-breaking error, and there's nothing
 * sensitive being written that a bad row would put at risk.
 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      type?: string;
      providerId?: string;
      path?: string;
      utmSource?: string;
      utmMedium?: string;
      utmCampaign?: string;
    };

    if (!body.type || !VALID_TYPES.has(body.type) || !body.providerId || !body.path) {
      return new NextResponse(null, { status: 204 });
    }

    await db.analyticsEvent.create({
      data: {
        type: body.type as "PAGE_VIEW" | "PHONE_CLICK",
        providerId: body.providerId,
        path: body.path.slice(0, 500),
        utmSource: body.utmSource?.slice(0, 200) || null,
        utmMedium: body.utmMedium?.slice(0, 200) || null,
        utmCampaign: body.utmCampaign?.slice(0, 200) || null,
      },
    });
  } catch {
    // Swallow — see doc comment above.
  }

  return new NextResponse(null, { status: 204 });
}
