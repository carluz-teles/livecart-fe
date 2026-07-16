import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output in production
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
  // Ambiente de DEPLOY (production/staging/development), distinto do NODE_ENV
  // (que é "production" em qualquer build). Vem do Railway; fora dele,
  // development. Inlined no bundle do client — usado p/ regras que só valem
  // em produção (ex.: StoreSetupGate).
  env: {
    NEXT_PUBLIC_APP_ENV: process.env.RAILWAY_ENVIRONMENT ?? "development",
  },
  // Pin the workspace root so Next.js doesn't get confused by other lockfiles
  // up the tree (e.g. ~/pnpm-lock.yaml).
  outputFileTracingRoot: __dirname,
  experimental: {
    // Split the CSS bundle per route so the public checkout doesn't ship
    // dashboard-only utility classes. Strict mode prevents Next from
    // merging chunks across navigations.
    cssChunking: "strict",
  },
  // Kill switch definitivo do bug "payload RSC servido como HTML": nenhuma
  // resposta de PÁGINA pode ser armazenada (edge do Railway ou cache do
  // navegador). O bug acontece quando um cache guarda a variante RSC
  // (text/x-component) de uma URL e a devolve num hard-load/F5 ignorando o
  // header Vary. Com no-store em tudo que não é asset estático, não existe
  // variante errada pra servir. Assets em /_next/static seguem imutáveis
  // e cacheados normalmente (não passam neste matcher).
  async headers() {
    return [
      {
        source: "/((?!_next/|.*\\.(?:ico|png|jpg|jpeg|svg|webp|woff2?|ttf|css|js|txt|xml|webmanifest)$).*)",
        headers: [{ key: "Cache-Control", value: "no-store, must-revalidate" }],
      },
    ]
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
