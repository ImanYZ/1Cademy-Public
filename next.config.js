module.exports = {
  output: "standalone",
  ignorePatterns: ["cypress/**"],
  reactStrictMode: false,
  images: {
    domains: ["firebasestorage.googleapis.com", "storage.googleapis.com", "node.1cademy.us", "1cademy.us"],
    minimumCacheTTL: 315360,
  },
};
