module.exports = {
  output: "standalone",
  ignorePatterns: ["cypress/**"],
  reactStrictMode: false,
  images: {
    domains: [
      "firebasestorage.googleapis.com",
      "storage.googleapis.com",
      "node.1cademy.us",
      "1cademy.us",
      "randomuser.me",
      "img.freepik.com",
      "storage.cloud.google.com",
      "www.core-econ.org",
    ],
    minimumCacheTTL: 315360,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });

    return config;
  },
  rewrites: async () => [
    {
      source: "/public/myfile.html",
      destination: "/pages/api/myfile.js",
    },
  ],
  redirects: async () => {
    return [
      {
        source: "/community",
        destination: "/community/default",
        permanent: false,
      },
    ];
  },
};
