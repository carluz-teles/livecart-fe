import type { Metadata } from "next"
import { auth } from "@clerk/nextjs/server"

import { LandingNav } from "@/components/marketing/landing-nav"
import { LandingHero } from "@/components/marketing/landing-hero"
import { LandingProblemSection } from "@/components/marketing/landing-problem-section"
import { LandingHowItWorks } from "@/components/marketing/landing-how-it-works"
import { LandingSocialProofSection } from "@/components/marketing/landing-social-proof-section"
import { LandingCasesSection } from "@/components/marketing/landing-cases-section"
import { LandingLiveCommerceSection } from "@/components/marketing/landing-live-commerce-section"
import { LandingInstagramSection } from "@/components/marketing/landing-instagram-section"
import { LandingWhatsappSection } from "@/components/marketing/landing-whatsapp-section"
import { LandingAutomationsSection } from "@/components/marketing/landing-automations-section"
import { LandingAiSection } from "@/components/marketing/landing-ai-section"
import { LandingIntegrationsSection } from "@/components/marketing/landing-integrations-section"
import { LandingCheckoutFeatures } from "@/components/marketing/landing-checkout-features"
import { LandingAudienceRevenueSection } from "@/components/marketing/landing-audience-revenue-section"
import { LandingIcpSection } from "@/components/marketing/landing-icp-section"
import { LandingBenefitsSection } from "@/components/marketing/landing-benefits-section"
import { LandingDemoSection } from "@/components/marketing/landing-demo-section"
import { LandingFaqSection } from "@/components/marketing/landing-faq-section"
import { LandingFinalCta } from "@/components/marketing/landing-final-cta"
import { LandingFooter } from "@/components/marketing/landing-footer"

export const metadata: Metadata = {
  title: "LiveCart | Venda pelo Instagram, WhatsApp e Lives no Automático",
  description:
    "Automatize suas vendas pelo Instagram, WhatsApp e lives. A LiveCart transforma conversas e interações em pedidos, checkout e vendas, integrados à sua operação.",
  openGraph: {
    title: "LiveCart | Venda pelo Instagram, WhatsApp e Lives no Automático",
    description:
      "Automatize suas vendas pelo Instagram, WhatsApp e lives. A LiveCart transforma conversas e interações em pedidos, checkout e vendas, integrados à sua operação.",
    url: "https://livecart.app",
    siteName: "LiveCart",
    locale: "pt_BR",
    type: "website",
  },
}

export default async function LandingPage() {
  const { userId } = await auth()
  return (
    <main className="bg-background text-foreground">
      <LandingNav isSignedIn={!!userId} />
      <LandingHero />
      <LandingProblemSection />
      <LandingHowItWorks />

      {/* Prova Social e Cases: componentes prontos para receber dado real via
       * props (stats/logos/cases). Ainda não há dado real aprovado para
       * publicação, então as seções ficam ocultas — os componentes retornam
       * `null` quando os arrays estão vazios. Basta passar os dados reais
       * aprovados para reativá-las aqui e no reforço mais abaixo. */}
      <LandingSocialProofSection />
      <LandingCasesSection />

      <LandingLiveCommerceSection />
      <LandingInstagramSection />
      <LandingWhatsappSection />
      <LandingAutomationsSection />
      <LandingAiSection />
      <LandingIntegrationsSection />
      <LandingCheckoutFeatures />
      <LandingAudienceRevenueSection />
      <LandingIcpSection />
      <LandingBenefitsSection />
      <LandingDemoSection />

      {/* Reforço de prova social/cases perto do fechamento — mesma regra:
       * oculto até chegar dado real aprovado. */}
      <LandingSocialProofSection />
      <LandingCasesSection />

      <LandingFaqSection />
      <LandingFinalCta />
      <LandingFooter />
    </main>
  )
}
