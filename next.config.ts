import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      // Cloudinary — chosen for provider/article photo hosting: a real
      // Media Library UI a non-developer can use directly, unlike raw S3.
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
  // find-a-provider -> find-an-ilit-provider rename (2026-09): permanent so
  // any already-shared/bookmarked links (e.g. the Avant Allergy PDP link
  // sent as sales collateral) keep working instead of 404ing.
  async redirects() {
    return [
      { source: "/find-a-provider", destination: "/find-an-ilit-provider", permanent: true },
      { source: "/find-a-provider/:slug", destination: "/find-an-ilit-provider/:slug", permanent: true },
    ];
  },
};

export default nextConfig;
