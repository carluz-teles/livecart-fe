import { notFound } from "next/navigation"
import { MarketingArticlePage } from "@/components/marketing/marketing-article"
import { marketingArticles, findMarketingArticle } from "@/lib/marketing/content"
import { marketingMetadata } from "@/lib/marketing/seo"

export const dynamicParams = false
export function generateStaticParams() {
  return marketingArticles.filter((page) => page.path.startsWith("/casos/") && page.path !== "/integracoes/bling").map((page) => ({ slug: page.path.split("/").pop()! }))
}
interface PageProps { params: Promise<{ slug: string }> }
export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const path = `/casos/${slug}`
  if (!findMarketingArticle(path)) notFound()
  return marketingMetadata(path)
}
export default async function Page({ params }: PageProps) {
  const { slug } = await params
  return <MarketingArticlePage path={`/casos/${slug}`} />
}
