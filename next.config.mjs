import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output in production
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
  // Pin the workspace root so Next.js doesn't get confused by other lockfiles
  // up the tree (e.g. ~/pnpm-lock.yaml).
  outputFileTracingRoot: __dirname,
  experimental: {
    // Split the CSS bundle per route so the public checkout doesn't ship
    // dashboard-only utility classes. Strict mode prevents Next from
    // merging chunks across navigations.
    cssChunking: "strict",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
  webpack: (config, { isServer, webpack }) => {
    if (!isServer) {
      // Replace Next.js's modern-features polyfill module with an empty
      // shim. Our .browserslistrc targets browsers that already implement
      // Array.at/flat/flatMap, Object.fromEntries/hasOwn,
      // String.trimStart/trimEnd, etc., so the ~11 KiB of polyfills are
      // pure dead weight in the shared client chunk. Next imports it via
      // a relative require (../build/polyfills/polyfill-module) from
      // inside next/dist/client/index.js, so we match by regex rather
      // than by package-specifier alias.
      config.plugins.push(
        new webpack.NormalModuleReplacementPlugin(
          /[\\/]polyfills[\\/]polyfill-module(\.js)?$/,
          path.resolve(__dirname, "src/lib/empty-polyfill.js")
        )
      )
    }
    return config
  },
}

export default nextConfig
