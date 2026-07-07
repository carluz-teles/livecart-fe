import type { Metadata } from "next"

import { LandingNav } from "@/components/marketing/landing-nav"
import { LandingHero } from "@/components/marketing/landing-hero"
import { LandingHowItWorks } from "@/components/marketing/landing-how-it-works"
import { LandingCheckoutHero } from "@/components/marketing/landing-checkout-hero"
import { LandingCheckoutFeatures } from "@/components/marketing/landing-checkout-features"
import { LandingAutomationsSection } from "@/components/marketing/landing-automations-section"
import { LandingIntegrationsSection } from "@/components/marketing/landing-integrations-section"
import { LandingPricing } from "@/components/marketing/landing-pricing"
import { LandingFinalCta } from "@/components/marketing/landing-final-cta"
import { LandingFooter } from "@/components/marketing/landing-footer"

export const metadata: Metadata = {
  title: "LiveCart — Venda mais nas suas lives",
  description:
    "A LiveCart lê os comentários da sua live, monta o carrinho automaticamente e envia o checkout no direct. Aceite PIX e cartão em até 12x, com automações e integrações.",
  openGraph: {
    title: "LiveCart — Venda mais nas suas lives",
    description:
      "Live commerce + checkout que converte. Comentário vira pedido, checkout no direct, PIX e cartão em 12x.",
    url: "https://livecart.app",
    siteName: "LiveCart",
    locale: "pt_BR",
    type: "website",
  },
}

export default function LandingPage() {
  return (
    <main className="bg-background text-foreground">
      <LandingNav />
      <LandingHero />
      <LandingHowItWorks />
      <LandingCheckoutHero />
      <LandingCheckoutFeatures />
      <LandingIntegrationsSection />
      <LandingAutomationsSection />
      <LandingPricing />
      <LandingFinalCta />
      <LandingFooter />
    </main>
  )
}
