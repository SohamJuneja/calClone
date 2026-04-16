/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['avatars.githubusercontent.com', 'ui-avatars.com'],
  },
  async redirects() {
    return [
      // Redirect bare root to the event-types dashboard
      // This runs at the edge before any page component renders,
      // making it the authoritative handler for "/"
      {
        source: '/',
        destination: '/event-types',
        permanent: false,
      },
    ];
  },
};

module.exports = nextConfig;
