import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { AnalyticsListener } from "@/components/analytics/AnalyticsListener";
import { VercelAnalytics } from "@/components/analytics/VercelAnalytics";
import { InternalDeviceBadge } from "@/components/analytics/InternalDeviceBadge";
import { ConsentBanner } from "@/components/consent/ConsentBanner";
import { consentBootScript } from "@/lib/consent";

// Production deployments only: local dev and Vercel preview deployments
// would otherwise send test traffic to the real GA4 property. The site's
// dataLayer events still fire everywhere, so they can be checked locally.
const GTM_ID = process.env.VERCEL_ENV === "production" ? process.env.NEXT_PUBLIC_GTM_ID : undefined;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // Without this, Next can't resolve canonical/OG/Twitter image URLs to
  // absolute URLs and warns at build time — matters now that per-page
  // `alternates.canonical` values are relative paths.
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"),
  title: {
    default: "Open Air Allergy Network",
    template: "%s | Open Air Allergy Network",
  },
  description:
    "Find ILIT (intralymphatic immunotherapy) providers near you and learn about allergy treatment options.",
  // Explicit default for every page that doesn't set its own robots (noindexed
  // pages do, and replace this whole object). max-image-preview:large lets
  // Google show our images at full size in results and Discover.
  robots: { index: true, follow: true, "max-image-preview": "large" },
  // Pinterest website claim (2026-10-20). A static label Pinterest's crawler
  // reads; no script, no cookies, no visitor data. Removing it un-claims the site.
  verification: {
    other: { "p:domain_verify": "3bf29227c8029cbf6bfd289e13e061a9" },
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Consent first (docs/consent.md): sets Google Consent Mode defaults
            and loads Tag Manager only if the visitor's choices allow it. GA4,
            Ads conversion tracking, and any future pixel are configured
            inside the GTM container, not here. No <noscript> GTM fallback:
            without JavaScript there's no way to check consent. */}
        <Script id="consent" strategy="beforeInteractive">
          {consentBootScript(GTM_ID)}
        </Script>
        <AnalyticsListener />
        {children}
        <ConsentBanner />
        <VercelAnalytics />
        <InternalDeviceBadge />
      </body>
    </html>
  );
}
