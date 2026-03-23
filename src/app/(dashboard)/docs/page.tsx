import { ComingSoon } from "@/components/shared/ComingSoon"

export default function DocumentationPage() {
  return (
    <ComingSoon
      title="Documentação"
      description="Estamos preparando uma documentação completa para ajudá-lo a aproveitar ao máximo o LiveCart. Em breve você terá acesso a guias, tutoriais e referências."
      showBackButton={true}
      backHref="/"
      backLabel="Voltar ao Dashboard"
    />
  )
}
