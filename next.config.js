module.exports = {
  ignorePatterns: ["cypress/**"],
  reactStrictMode: true,
  images: {
    domains: ["firebasestorage.googleapis.com", "storage.googleapis.com", "node.1cademy.us", "1cademy.us"]
  },
  experimental: {
    outputStandalone: true
  }
};
