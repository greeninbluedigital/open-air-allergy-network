import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // TODO: once provider/article photo storage is decided (S3, Cloudinary,
  // Vercel Blob, etc.), add its hostname to images.remotePatterns — next/image
  // refuses to optimize external images from hosts not explicitly allowed.
};

export default nextConfig;
