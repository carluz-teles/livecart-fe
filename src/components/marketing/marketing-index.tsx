import Link from "next/link"
import Image from "next/image"
import { landingIntegrationBrands } from "@/components/marketing/landing-integrations.data"
import { ArrowUpRight } from "lucide-react"
import { marketingArticles } from "@/lib/marketing/content"
import { publicIndexes } from "@/lib/marketing/seo"
import { PublicPage } from "@/components/marketing/PublicPage"

export function MarketingIndex({ path }: { path: string }) {
  const index = publicIndexes.find((page) => page.path === path)!
  const articles = marketingArticles.filter((article) => article.path.startsWith(`${path}/`))
  return <PublicPage>
    <PublicPage.Header eyebrow="Explore o LiveCart" title={index.title} description={index.description} />
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:py-16">
      {articles.map((article, number) => <Link key={article.path} href={article.path} className="group flex flex-col gap-4 rounded-2xl border bg-card p-6 transition-colors hover:border-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-8">
        <div className="flex items-center justify-between"><span className="font-mono text-sm text-muted-foreground">{String(number + 1).padStart(2, "0")}</span><ArrowUpRight className="size-5" aria-hidden="true" /></div>
        {landingIntegrationBrands.filter((brand) => brand.href === article.path).map((brand) => <div key={brand.name} className="flex h-16 items-center"><Image src={brand.src} alt={brand.name} width={brand.width} height={brand.height} className="max-h-14 w-auto max-w-40 object-contain" /></div>)}
        {article.status && <span className="text-sm font-semibold">{article.status}</span>}
        <h2 className="text-2xl font-semibold tracking-tight">{article.title}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{article.description}</p>
      </Link>)}
    </div>
    <PublicPage.Cta />
  </PublicPage>
}
