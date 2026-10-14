const path = require("node:path")

module.exports = {
  experimental: { externalDir: true },
  webpack(config) {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@clerk/nextjs/server$": path.join(__dirname, "mocks/auth.ts"),
      "@": path.resolve(__dirname, "../../src"),
    }
    return config
  },
}
