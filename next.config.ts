import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — chosen for provider/article photo hosting: a real
      // Media Library UI a non-developer can use directly, unlike raw S3.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
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
