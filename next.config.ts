import type { NextConfig } from "next";
import { withPayload } from "@payloadcms/next/withPayload";

const nextConfig: NextConfig = {
  // Bloque l'indexation tant que NEXT_PUBLIC_ALLOW_INDEXING != "true"
  async headers() {
    const allowIndex = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
    return [
      {
        source: "/:path*",
        headers: allowIndex
          ? []
          : [
              { key: "X-Robots-Tag", value: "noindex, nofollow" },
            ],
      },
    ];
  },

  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      // Pour servir les médias Supabase Storage / S3 public plus tard
      { protocol: "https", hostname: "**.supabase.co" },
      { protocol: "https", hostname: "**.cellar-c2.services.clever-cloud.com" },
    ],
  },

  experimental: {
    // Payload nécessite la résolution des paquets ESM modernes
    serverActions: { bodySizeLimit: "10mb" },
  },
};

export default withPayload(nextConfig);
