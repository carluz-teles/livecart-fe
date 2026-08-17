export interface LandingCase {
  customerName: string
  logoSrc?: string
  quote: string
  result: string
  segment: string
}

interface LandingCasesSectionProps {
  /** Cases reais aprovados pelo cliente para publicação. */
  cases?: LandingCase[]
}

/**
 * Seção de cases de clientes. Não renderiza nada enquanto não houver case
 * real aprovado para publicação — nunca preencher com depoimento ou
 * resultado fictício. Assim que houver conteúdo aprovado, passe `cases` e
 * habilite a seção em `src/app/page.tsx`.
 */
export function LandingCasesSection({ cases = [] }: LandingCasesSectionProps) {
  if (cases.length === 0) {
    return null
  }

  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Cases
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Quem já vende com a LiveCart
          </h2>
        </div>

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cases.map((item) => (
            <div
              key={item.customerName}
              className="flex flex-col gap-4 rounded-2xl border border-border bg-card p-6"
            >
              {item.logoSrc && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.logoSrc}
                  alt={item.customerName}
                  className="h-6 w-auto object-contain"
                />
              )}
              <p className="text-sm leading-relaxed text-foreground">
                &quot;{item.quote}&quot;
              </p>
              <div className="mt-auto">
                <p className="text-sm font-semibold text-primary">{item.result}</p>
                <p className="text-xs text-muted-foreground">
                  {item.customerName} · {item.segment}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
