import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only use standalone output in production
  ...(process.env.NODE_ENV === "production" && { output: "standalone" }),
  // Ambiente de DEPLOY (production/staging/development), distinto do NODE_ENV
  // (que é "production" em qualquer build). Inlined no bundle do client — é o
  // que decide regras que só valem num ambiente (StoreSetupGate em produção, o
  // simulador de live em staging).
  //
  // A ordem importa, e ela nasceu de um bug: este bloco lia SÓ
  // RAILWAY_ENVIRONMENT, que não existe dentro do build Docker — e como o bloco
  // `env` do next.config SOBRESCREVE a variável de ambiente de mesmo nome, ele
  // apagava o NEXT_PUBLIC_APP_ENV que o Railway já entregava. O bundle saía com
  // "development" em todo ambiente, inclusive produção, e o StoreSetupGate
  // nunca chegou a valer lá.
  //
  // Agora a variável explícita vem primeiro e o nome do ambiente do Railway é
  // só o plano B. As duas chegam ao build pelos ARG do Dockerfile.
  env: {
    NEXT_PUBLIC_APP_ENV:
      process.env.NEXT_PUBLIC_APP_ENV ??
      process.env.RAILWAY_ENVIRONMENT_NAME ??
      process.env.RAILWAY_ENVIRONMENT ??
      "development",
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
    // hostname "**" fica (não dá pra restringir): fotos de produto vêm de URL
    // colada pelo lojista ou de mídia do Instagram — origem arbitrária por
    // natureza do produto, não um conjunto fixo de domínios.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Sem isso, o Next usa os arrays default (8 deviceSizes até 3840px x 8
    // imageSizes), e cada combinação nova é processada pelo `sharp` DENTRO do
    // processo Node (decodifica a imagem inteira, resiza, reencoda) — o maior
    // consumidor de memória do FE no Railway (maior que Postgres+backend+Redis
    // somados). O maior `sizes` realmente usado no app hoje é 672px (banner
    // responsivo); o resto são thumbnails de 40-120px — não existe tela pedindo
    // as resoluções de device grandes do default (1920/2048/3840).
    // Cortar os arrays para o que o app de fato usa reduz tanto o número de
    // variantes distintas cacheadas em disco (.next/cache/images, sem limite
    // de tamanho) quanto a maior dimensão que o sharp precisa decodificar.
    deviceSizes: [384, 640, 750],
    imageSizes: [16, 32, 48, 64, 96, 128],
    // Variantes já otimizadas não mudam — a imagem original que muda vira uma
    // URL nova (upload substitui). 30 dias reduz o reprocessamento pelo sharp
    // em cache miss por expiração, sem risco de servir uma foto desatualizada.
    minimumCacheTTL: 60 * 60 * 24 * 30,
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
