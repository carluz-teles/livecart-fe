import { marketingMetadata, organization } from "@/lib/marketing/seo"
import { PublicPage } from "@/components/marketing/PublicPage"
import Link from "next/link"

import { CrispChat } from "@/components/shared/CrispChat"
import { LandingHero } from "@/components/marketing/landing-hero"
import { LandingSocialProofSection } from "@/components/marketing/landing-social-proof-section"
import { LandingProblemSection } from "@/components/marketing/landing-problem-section"
import { LandingHowItWorks } from "@/components/marketing/landing-how-it-works"
import { LandingChannelsSection } from "@/components/marketing/landing-channels-section"
import { LandingUrgencySection } from "@/components/marketing/landing-urgency-section"
import { LandingCheckoutFeatures } from "@/components/marketing/landing-checkout-features"
import { LandingIntegrationsSection } from "@/components/marketing/landing-integrations-section"
import { LandingIcpSection } from "@/components/marketing/landing-icp-section"
import { LandingPricingSection } from "@/components/marketing/landing-pricing-section"
import { LandingFaqSection, faqs } from "@/components/marketing/landing-faq-section"
import { LandingFinalCta } from "@/components/marketing/landing-final-cta"

export const metadata = marketingMetadata("/")
const organizationJsonLd = { "@context": "https://schema.org", ...organization }

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
}

export default function LandingPage() {
  return (
    <PublicPage>
      <CrispChat />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <LandingHero />

      <LandingSocialProofSection />

      <LandingProblemSection />
      <LandingHowItWorks />
      <LandingChannelsSection />
      <LandingUrgencySection />
      <LandingCheckoutFeatures />
      <LandingIntegrationsSection />
      <LandingIcpSection />
      <LandingPricingSection />
      <LandingFaqSection />
      <section aria-label="Guias e casos reais" className="mx-auto grid max-w-6xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-2">
        <Link href="/guias" className="rounded-2xl border p-8 hover:bg-secondary/40"><h2 className="text-2xl font-bold">Prepare sua próxima live</h2><p className="mt-3 text-muted-foreground">Guias práticos sobre códigos, peças únicas, ERP e fechamento.</p><span className="mt-5 block underline underline-offset-4">Explorar os guias</span></Link>
        <Link href="/casos" className="rounded-2xl border p-8 hover:bg-secondary/40"><h2 className="text-2xl font-bold">Conheça operações reais</h2><p className="mt-3 text-muted-foreground">Como Canto da Art e Maricelia Decor organizam seus pedidos.</p><span className="mt-5 block underline underline-offset-4">Conhecer os casos</span></Link>
      </section>
      <LandingFinalCta />
    </PublicPage>
  )
}
