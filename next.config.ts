import type { NextConfig } from "next";

const nextConfig: any = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'github.com',
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'mhgepqndsnnxcmzgekku.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      }
    ],
  },
};

export default nextConfig;
