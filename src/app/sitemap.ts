import type { MetadataRoute } from "next"
import { publicPages } from "@/lib/marketing/seo"
import { MARKETING_ORIGIN } from "@/lib/marketing/routes"

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...publicPages.map((page) => ({
      url: `${MARKETING_ORIGIN}${page.path === "/" ? "" : page.path}`,
      lastModified: page.updated,
    })),
    { url: `${MARKETING_ORIGIN}/privacy` },
    { url: `${MARKETING_ORIGIN}/terms` },
  ]
}
