import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://readdy.ai/**", "https://res.cloudinary.com/**"),
    ],
  },
};

export default nextConfig;
