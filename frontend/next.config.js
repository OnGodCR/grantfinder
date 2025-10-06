// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove rewrites to avoid conflicts with direct API calls
  // The frontend will call the backend directly using NEXT_PUBLIC_BACKEND_URL
  env: {
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
    CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY,
  },
  experimental: {
    serverComponentsExternalPackages: ['@clerk/backend'],
  },
};

module.exports = nextConfig;
