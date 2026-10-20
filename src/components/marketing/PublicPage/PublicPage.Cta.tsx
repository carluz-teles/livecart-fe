import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

export function PublicPageCta() {
  return <section aria-label="Experimente o LiveCart" className="border-t bg-secondary/40 py-12">
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 sm:px-6 md:flex-row md:items-center md:justify-between">
      <div><h2 className="text-2xl font-bold tracking-tight">Veja o fluxo na sua operação</h2><p className="mt-2 text-muted-foreground">Prepare seus códigos e confira as integrações durante o teste de 7 dias.</p></div>
      <Button asChild size="lg"><Link href="/register" prefetch={false} data-marketing-cta="article_trial">Testar 7 dias grátis <ArrowRight className="size-4" aria-hidden="true" /></Link></Button>
    </div>
  </section>
}
