import Link from "next/link"
import {
  ArrowLeft,
  ChevronRight,
  HardHat,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

export interface DocComingSoonProps {
  // e.g. "Integrar com o Mercado Pago"
  title: string
  // Short blurb shown under the title — same vibe as a real doc.
  description: string
  // e.g. "Integrações · Pagamentos"
  category: string
  // Last segment of the breadcrumb. Defaults to deriving from title.
  breadcrumbLabel: string
  // Optional outline of what the future guide will cover. Renders as a
  // bulleted list inside the placeholder so admins know what to expect.
  upcomingTopics?: string[]
  // When set, surfaces a "Connect now" CTA pointing to /settings/integrations
  // — admins can attempt the integration directly even without the guide.
  connectHref?: string
  // Optional CTA label for the connect button. Defaults below.
  connectLabel?: string
}

// Polite landing for tutorial links that aren't written yet. Same chrome as a
// real doc page (breadcrumb, header, footer link) so the brand stays
// consistent — just the body explains the doc is in progress.
export function DocComingSoon({
  title,
  description,
  category,
  breadcrumbLabel,
  upcomingTopics,
  connectHref,
  connectLabel = "Ir para Integrações",
}: DocComingSoonProps) {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-10 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Documentação
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/docs" className="hover:text-foreground">
          Integrações
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">{breadcrumbLabel}</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          {category}
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          {description}
        </p>
      </header>

      {/* In progress card */}
      <Card className="border-amber-200 bg-amber-50/40 p-8 text-center dark:border-amber-900 dark:bg-amber-950/20">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900 dark:text-amber-300">
          <HardHat className="h-7 w-7" />
        </div>
        <h2 className="mt-5 text-lg font-semibold">
          Estamos finalizando este guia
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          A documentação detalhada deste fluxo ainda está em desenvolvimento.
          Em breve você vai encontrar aqui o passo a passo completo, com
          imagens e perguntas frequentes — como nos outros guias.
        </p>

        {upcomingTopics && upcomingTopics.length > 0 && (
          <div className="mx-auto mt-6 max-w-md text-left">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              O que este guia vai cobrir
            </p>
            <ul className="mt-2 space-y-1.5 text-sm">
              {upcomingTopics.map((topic) => (
                <li
                  key={topic}
                  className="flex items-start gap-2 text-muted-foreground"
                >
                  <span
                    aria-hidden
                    className="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-current"
                  />
                  {topic}
                </li>
              ))}
            </ul>
          </div>
        )}

        {connectHref && (
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Button asChild>
              <Link href={connectHref}>{connectLabel}</Link>
            </Button>
            <Button asChild variant="ghost" size="sm">
              <Link href="/docs">Voltar para Documentação</Link>
            </Button>
          </div>
        )}
      </Card>

      {/* Footer */}
      <div className="border-t pt-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Documentação
        </Link>
      </div>
    </article>
  )
}
