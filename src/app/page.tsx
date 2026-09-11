import type { Metadata } from "next"
import { currentUser } from "@clerk/nextjs/server"

import { CrispIdentify } from "@/components/shared/CrispChat/CrispChat.Identify"
import { LandingNav } from "@/components/marketing/landing-nav"
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
import { LandingFooter } from "@/components/marketing/landing-footer"

const title = "LiveCart | Venda pelo Instagram e Lives no Automático"
const description =
  "Automatize suas vendas pelo Instagram e lives. A LiveCart transforma conversas e interações em pedidos, checkout e vendas, integrados à sua operação."
const ogImage = "/livecart/logotipo-whitemode.png"

export const metadata: Metadata = {
  title,
  description,
  alternates: {
    canonical: "https://livecart.com.br",
  },
  openGraph: {
    title,
    description,
    url: "https://livecart.com.br",
    siteName: "LiveCart",
    locale: "pt_BR",
    type: "website",
    images: [{ url: ogImage, width: 1536, height: 1024, alt: "LiveCart" }],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [ogImage],
  },
}

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "LiveCart",
  url: "https://livecart.com.br",
  logo: "https://livecart.com.br/livecart/logotipo-whitemode.png",
  description,
}

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

export default async function LandingPage() {
  const user = await currentUser()
  const email = user?.primaryEmailAddress?.emailAddress ?? user?.emailAddresses[0]?.emailAddress
  const name = [user?.firstName, user?.lastName].filter(Boolean).join(" ") || null

  return (
    <main className="bg-background text-foreground">
      <CrispIdentify email={email} name={name} />
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

      <LandingNav isSignedIn={!!user} />
      <LandingHero />

      {/* Prova social: mostra números ilustrativos (marcados como tal) até
       * termos métricas reais aprovadas. Quando houver, passe `stats`/`logos`
       * reais e `illustrative={false}`. */}
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
      <LandingFinalCta />
      <LandingFooter />
    </main>
  )
}
