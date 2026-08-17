export interface SocialProofStat {
  value: string
  label: string
}

export interface SocialProofLogo {
  name: string
  src: string
}

interface LandingSocialProofSectionProps {
  /** Métricas reais aprovadas (ex.: "+120 mil pedidos processados"). */
  stats?: SocialProofStat[]
  /** Logos de clientes reais aprovados para exibição pública. */
  logos?: SocialProofLogo[]
}

/**
 * Seção de prova social. Não renderiza nada enquanto não houver dado real
 * aprovado — nunca preencher com números, logos ou nomes fictícios. Assim
 * que houver conteúdo aprovado, passe `stats` e/ou `logos` e habilite a
 * seção em `src/app/page.tsx`.
 */
export function LandingSocialProofSection({
  stats = [],
  logos = [],
}: LandingSocialProofSectionProps) {
  if (stats.length === 0 && logos.length === 0) {
    return null
  }

  return (
    <section className="bg-background py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        {stats.length > 0 && (
          <dl className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <dt className="text-3xl font-bold tracking-tight text-primary">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-sm text-muted-foreground">{stat.label}</dd>
              </div>
            ))}
          </dl>
        )}

        {logos.length > 0 && (
          <div className="mt-12 flex flex-wrap items-center justify-center gap-x-10 gap-y-6 opacity-80">
            {logos.map((logo) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={logo.name}
                src={logo.src}
                alt={logo.name}
                className="h-8 w-auto object-contain grayscale"
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
