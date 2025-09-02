// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/grants',
        destination: `${process.env.BACKEND_URL}/api/grants`,
      },
    ];
  },
};

module.exports = nextConfig;
