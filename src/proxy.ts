import { NextResponse, type NextRequest } from "next/server";
import { ZIP_COOKIE, lookupZip } from "@/lib/zip";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

/**
 * Remembers the visitor's zip across visits. Every provider search goes to
 * /find-an-ilit-provider?zip=…, so this is the one place it's captured. A
 * visit with no zip but a saved one is redirected to that search. Only a
 * zip the visitor typed is used here, never IP location: that can be wrong,
 * and crawlers (which carry no cookies) always get the plain page.
 */
export function proxy(request: NextRequest) {
  const zip = request.nextUrl.searchParams.get("zip")?.trim();

  if (!zip) {
    const saved = request.cookies.get(ZIP_COOKIE)?.value;
    if (saved && lookupZip(saved)) {
      const url = request.nextUrl.clone();
      url.searchParams.set("zip", saved);
      return NextResponse.redirect(url);
    }
    return NextResponse.next();
  }

  const response = NextResponse.next();
  if (lookupZip(zip) && request.cookies.get(ZIP_COOKIE)?.value !== zip) {
    response.cookies.set(ZIP_COOKIE, zip, {
      maxAge: ONE_YEAR_SECONDS,
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
    });
  }
  return response;
}

export const config = {
  matcher: "/find-an-ilit-provider",
};
