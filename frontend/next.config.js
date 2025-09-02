// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/grants',
        destination: `${process.env.BACKEND_URL}/api/grants`,
      },
      // add more proxies later if you need:
      // { source: '/api/grants/:id', destination: `${process.env.BACKEND_URL}/api/grants/:id` },
      // { source: '/api/search', destination: `${process.env.BACKEND_URL}/api/search` },
    ];
  },
};

module.exports = nextConfig;
