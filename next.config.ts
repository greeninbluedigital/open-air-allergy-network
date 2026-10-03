import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — chosen for provider/article photo hosting: a real
      // Media Library UI a non-developer can use directly, unlike raw S3.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // The original vercel.app address still serves the production site, so
  // send visitors and crawlers to the real domain. API routes are left alone:
  // Vercel's cron jobs call them on that address and wouldn't follow a
  // redirect. Preview deployments have their own hostnames, so they're
  // unaffected.
  async redirects() {
    return [
      {
        source: "/:path((?!api/).*)",
        has: [{ type: "host", value: "open-air-allergy-network.vercel.app" }],
        destination: "https://openairallergynetwork.com/:path",
        permanent: true,
      },
    ];
  },
  // <meta name="robots"> only applies to HTML documents — API routes return
  // JSON, so they need the HTTP-header form instead. Defensive: robots.ts
  // already blanket-disallows crawling everything site-wide right now, but
  // that only stops crawling, not indexing a URL discovered some other way
  // (e.g. linked from an external site). This guarantees these routes never
  // get indexed even if that happens, and keeps working once robots.ts is
  // eventually opened up for real launch.
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
};

export default nextConfig;
