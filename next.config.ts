import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' }
    ],
  },
  async rewrites() {
    return [
      { source: '/',                         destination: '/wrath' },
      { source: '/adventure-log',            destination: '/wrath/adventure-log' },
      { source: '/adventure-log/:path*',     destination: '/wrath/adventure-log/:path*' },
      { source: '/about',                    destination: '/wrath/about' },
      { source: '/dice',                     destination: '/wrath/dice' },
      { source: '/rules',                    destination: '/wrath/rules' },
      { source: '/unauthorized',             destination: '/wrath/unauthorized' },
    ]
  },
};
export default nextConfig;
