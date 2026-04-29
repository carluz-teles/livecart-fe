import { DocComingSoon } from "@/components/docs"

export default function MelhorEnvioDocPage() {
  return (
    <DocComingSoon
      title="Integrar com o Melhor Envio"
      description="Cote frete no checkout com Correios, Jadlog e outras transportadoras direto pela sua conta Melhor Envio."
      category="Integrações · Frete"
      breadcrumbLabel="Melhor Envio"
      connectHref="/settings/integrations"
      upcomingTopics={[
        "Como criar uma conta no Melhor Envio",
        "Como autorizar o LiveCart via OAuth",
        "Configuração das transportadoras habilitadas",
        "Como conferir prazos e preços que aparecem para o cliente",
      ]}
    />
  )
}
