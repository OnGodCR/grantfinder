// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove rewrites to avoid conflicts with direct API calls
  // The frontend will call the backend directly using NEXT_PUBLIC_BACKEND_URL
};

module.exports = nextConfig;
