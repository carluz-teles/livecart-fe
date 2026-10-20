import { ERPIntegrationScope } from "@/components/marketing/erp-integration-scope"
import Link from "next/link"
import { notFound } from "next/navigation"
import { findMarketingArticle } from "@/lib/marketing/content"
import { publicPages, organization } from "@/lib/marketing/seo"
import { MARKETING_ORIGIN } from "@/lib/marketing/routes"
import { PublicPage } from "@/components/marketing/PublicPage"

export function MarketingArticlePage({ path }: { path: string }) {
  const article = findMarketingArticle(path)
  if (!article) notFound()
  const graph = {
    "@context": "https://schema.org",
    "@graph": [organization, {
      "@type": article.category === "Guias" ? "Article" : "WebPage",
      "@id": `${MARKETING_ORIGIN}${path}#page`, url: `${MARKETING_ORIGIN}${path}`,
      name: article.title, headline: article.title, description: article.description,
      dateModified: article.updated, inLanguage: "pt-BR",
      publisher: { "@id": organization["@id"] },
      ...(article.category === "Guias" && { author: { "@id": organization["@id"] } }),
    }, {
      "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "LiveCart", item: MARKETING_ORIGIN },
        { "@type": "ListItem", position: 2, name: article.title, item: `${MARKETING_ORIGIN}${path}` },
      ],
    }],
  }
  return <PublicPage>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(graph).replace(/</g, "\\u003c") }} />
    <PublicPage.Header eyebrow={article.category} title={article.title} description={article.description} status={article.status} />
    <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[14rem_minmax(0,1fr)] lg:gap-16">
      <aside>
        <nav aria-label="Nesta página" className="flex flex-col gap-3 lg:sticky lg:top-24">
          <p className="text-sm font-semibold">Nesta página</p>
          {article.sections.map((section) => <a key={section.id} href={`#${section.id}`} className="text-sm leading-relaxed text-muted-foreground underline-offset-4 hover:underline">{section.title}</a>)}
        </nav>
      </aside>
      <article className="min-w-0">
        <p className="mb-8 text-sm text-muted-foreground">Revisão: equipe LiveCart · <time dateTime={article.updated}>{article.updated.split("-").reverse().join("/")}</time></p>
        {path === "/integracoes/tiny" && <ERPIntegrationScope provider="Tiny" />}
        <div className="flex flex-col gap-12">
          {article.sections.map((section) => <section key={section.id} id={section.id} className="scroll-mt-24" aria-labelledby={`${section.id}-title`}>
            <h2 id={`${section.id}-title`} className="text-2xl font-semibold tracking-tight">{section.title}</h2>
            {section.paragraphs.map((paragraph) => <p key={paragraph} className="mt-4 text-base leading-relaxed text-muted-foreground">{paragraph}</p>)}
            {section.items && <ul className="mt-5 flex list-disc flex-col gap-3 pl-5 text-base leading-relaxed text-muted-foreground">{section.items.map((item) => <li key={item}>{item}</li>)}</ul>}
          </section>)}
        </div>
        <section className="mt-12 border-t pt-8" aria-label="Continue a leitura">
          <h2 className="text-xl font-semibold">Continue a leitura</h2>
          <ul className="mt-4 flex flex-col gap-3">{article.related.map((href) => <li key={href}><Link href={href} className="font-medium underline underline-offset-4">{publicPages.find((page) => page.path === href)?.title ?? "Conheça as integrações"}</Link></li>)}</ul>
        </section>
      </article>
    </div>
    <PublicPage.Cta />
  </PublicPage>
}
