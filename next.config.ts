/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ["example.com", "another-example.com"], // ✅ Replace with your actual domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**", // ✅ Allows all domains dynamically
      },
    ],
  },
  async headers() {
    return [
      {
        source: "/(.*)", // ✅ Correctly placed inside headers function
        headers: [
          { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
          { key: "Cross-Origin-Embedder-Policy", value: "credentialless" },
        ],
      },
    ];
  },
};

export default nextConfig;
