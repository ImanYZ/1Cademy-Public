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
    ],
    minimumCacheTTL: 315360,
  },
  webpack(config) {
    config.module.rules.push({
      test: /\.md$/,
      use: "raw-loader",
    });
    config.experiments = { ...config.experiments, topLevelAwait: true };

    return config;
  },
};
