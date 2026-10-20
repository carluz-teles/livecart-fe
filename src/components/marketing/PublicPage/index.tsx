import type { ReactNode } from "react"
import { LandingNav } from "@/components/marketing/landing-nav"
import { LandingFooter } from "@/components/marketing/landing-footer"
import { MarketingAnalytics } from "@/components/marketing/marketing-analytics"
import { PublicPageHeader } from "@/components/marketing/PublicPage/PublicPage.Header"
import { PublicPageCta } from "@/components/marketing/PublicPage/PublicPage.Cta"

interface PublicPageProps { children: ReactNode }

function PublicPage({ children }: PublicPageProps) {
  return <div className="bg-background text-foreground">
    <a href="#conteudo" className="sr-only focus:not-sr-only focus:block focus:bg-background focus:p-4">Pular para o conteúdo</a>
    <LandingNav />
    <MarketingAnalytics />
    <main id="conteudo">{children}</main>
    <LandingFooter />
  </div>
}

PublicPage.Header = PublicPageHeader
PublicPage.Cta = PublicPageCta
export { PublicPage }
