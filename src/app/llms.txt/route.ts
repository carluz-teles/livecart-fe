import { publicPages } from "@/lib/marketing/seo"
import { MARKETING_ORIGIN } from "@/lib/marketing/routes"

export const dynamic = "force-static"
export function GET() {
  const body = ["# LiveCart", "", "> Pedidos por código nas lives do Instagram. Consulte o escopo e a disponibilidade em cada página.", "", ...publicPages.map((page) => `- [${page.title}](${MARKETING_ORIGIN}${page.path}): ${page.description}`)].join("\n")
  return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } })
}
