import { DocComingSoon } from "@/components/docs"

export default function PagarmeDocPage() {
  return (
    <DocComingSoon
      title="Integrar com a Pagar.me"
      description="Receba pagamentos via Pix e cartão de crédito no checkout do LiveCart usando sua conta Pagar.me."
      category="Integrações · Pagamentos"
      breadcrumbLabel="Pagar.me"
      connectHref="/settings/integrations"
      upcomingTopics={[
        "Onde encontrar a chave de API na Pagar.me",
        "Como conectar usando a chave",
        "Testes em ambiente de homologação",
        "Como diagnosticar pagamentos recusados",
      ]}
    />
  )
}
