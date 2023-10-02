/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: { appDir: true },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "8090",
        pathname: "/api/files/**",
      },
      {
        protocol: "http",
        hostname: "3.70.93.208",
        port: "8090",
        pathname: "/api/files/**",
      },
    ],
  },
  async redirects() {
    return [
      {
        source: "/profile",
        destination: "/profile/activity/searches",
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
