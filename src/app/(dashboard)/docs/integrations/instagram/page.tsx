import { DocComingSoon } from "@/components/docs"

export default function InstagramDocPage() {
  return (
    <DocComingSoon
      title="Integrar com o Instagram"
      description="Capture comentários e mensagens das suas lives do Instagram em tempo real para detectar pedidos automaticamente."
      category="Integrações · Redes Sociais"
      breadcrumbLabel="Instagram"
      connectHref="/settings/integrations"
      upcomingTopics={[
        "Pré-requisitos da conta Instagram (perfil profissional)",
        "Como autorizar via OAuth do Facebook",
        "Permissões necessárias e por quê",
        "Como o LiveCart captura comentários e DMs durante a live",
      ]}
    />
  )
}
