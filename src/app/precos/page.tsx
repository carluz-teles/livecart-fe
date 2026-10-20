import Link from "next/link"
import { PublicPage } from "@/components/marketing/PublicPage"
import { LandingPricingSection } from "@/components/marketing/landing-pricing-section"
import { marketingMetadata, organization } from "@/lib/marketing/seo"
import { PRO_PLAN_PRICE_CENTS, BILLING_INTERVAL_LABELS } from "@/lib/constants"
import { formatCurrency } from "@/lib/format"
import type { BillingInterval } from "@/types"

export const metadata = marketingMetadata("/precos")
export default function Page() {
  const schema = {
    "@context": "https://schema.org", "@type": "WebApplication", name: "LiveCart", url: "https://livecart.com.br",
    applicationCategory: "BusinessApplication", operatingSystem: "Web", publisher: organization,
    offers: { "@type": "Offer", price: PRO_PLAN_PRICE_CENTS.monthly / 100, priceCurrency: "BRL", url: "https://livecart.com.br/precos", description: "Plano Pro com cobrança mensal. Custos dos provedores contratados pela loja são separados." },
  }
  return <PublicPage>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema).replace(/</g, "\\u003c") }} />
    <PublicPage.Header eyebrow="Plano e condições" title="Preços claros para planejar sua operação" description="Teste por 7 dias e escolha o período de cobrança. A LiveCart não cobra comissão sobre as vendas; os serviços contratados pela loja têm suas próprias condições." />
    <LandingPricingSection />
    <div className="mx-auto flex max-w-4xl flex-col gap-10 px-4 py-12 sm:px-6">
      <section><h2 className="text-2xl font-semibold">Quanto é cobrado em cada período</h2><dl className="mt-6 grid gap-4 sm:grid-cols-3">{(Object.keys(PRO_PLAN_PRICE_CENTS) as BillingInterval[]).map((interval) => <div key={interval} className="rounded-xl border p-5"><dt className="font-medium">{BILLING_INTERVAL_LABELS[interval]}</dt><dd className="mt-2 text-xl font-bold">{formatCurrency(PRO_PLAN_PRICE_CENTS[interval])}</dd><dd className="mt-1 text-sm text-muted-foreground">{interval === "monthly" ? "a cada mês" : interval === "semestral" ? "a cada 6 meses" : "a cada 12 meses"}</dd></div>)}</dl></section>
      <section><h2 className="text-2xl font-semibold">O que considerar além da mensalidade</h2><p className="mt-4 leading-relaxed text-muted-foreground">Taxas de Pix e cartão, parcelamento, frete, conta do ERP e mensagens de provedores seguem os contratos da loja com esses serviços. Ausência de comissão do LiveCart não significa ausência de tarifas do meio de pagamento.</p></section>
      <section><h2 className="text-2xl font-semibold">Sua live recebe de 151 a 500 pedidos?</h2><p className="mt-4 leading-relaxed text-muted-foreground">Leve esse cenário para a demonstração e valide quantidade de produtos, pico de comentários, integrações e rotina de fechamento. Não há um limite de volume publicado nesta página: confirme o enquadramento da operação e as condições do plano com a equipe antes de contratar. Para necessidades específicas, consulte o plano Enterprise.</p></section>
      <section><h2 className="text-2xl font-semibold">Escolha o fluxo antes de começar</h2><p className="mt-4 leading-relaxed text-muted-foreground">Confira quais integrações estão disponíveis e como o modo de reserva afeta o envio ao ERP. Nuvemshop está em implantação e precisa de confirmação de disponibilidade.</p><div className="mt-5 flex flex-wrap gap-5"><Link href="/integracoes" className="underline underline-offset-4">Ver escopo das integrações</Link><Link href="/demonstracao" className="underline underline-offset-4">Explorar a demonstração</Link><a href="mailto:eng@livecart.com.br" className="underline underline-offset-4">Consultar a equipe comercial</a></div></section>
    </div>
    <PublicPage.Cta />
  </PublicPage>
}
