import { DocComingSoon } from "@/components/docs"

export default function MercadoPagoDocPage() {
  return (
    <DocComingSoon
      title="Integrar com o Mercado Pago"
      description="Receba pagamentos via Pix e cartão de crédito no checkout do LiveCart usando sua conta Mercado Pago."
      category="Integrações · Pagamentos"
      breadcrumbLabel="Mercado Pago"
      connectHref="/settings/integrations"
      upcomingTopics={[
        "Como autorizar a conta Mercado Pago via OAuth",
        "Configuração de Pix e cartão",
        "Testes em ambiente de homologação",
        "Como diagnosticar pagamentos recusados",
      ]}
    />
  )
}
