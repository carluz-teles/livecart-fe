export interface SocialProofStat {
  value: string
  label: string
}

export interface SocialProofLogo {
  name: string
  src: string
}

const illustrativeStats: SocialProofStat[] = [
  { value: "+3x", label: "conversão média em lives" },
  { value: "até 30%", label: "das vendas negadas recuperadas" },
  { value: "2 canais", label: "Instagram e lives" },
  { value: "minutos", label: "pra configurar e começar" },
]

const illustrativeLogos: SocialProofLogo[] = [
  { name: "Pagar.me", src: "/integrations/pagarme.svg" },
  { name: "olist", src: "/integrations/tiny.svg" },
  { name: "Melhor Envio", src: "/integrations/melhor-envio.svg" },
  { name: "SmartEnvios", src: "/integrations/smartenvios.png" },
]

interface LandingSocialProofSectionProps {
  /** Métricas a exibir. Por padrão usa números ilustrativos — passe dados reais aprovados para substituí-los. */
  stats?: SocialProofStat[]
  /** Logos a exibir. Por padrão usa os logos de integração. */
  logos?: SocialProofLogo[]
  /** Mostra o aviso "números ilustrativos". Desative ao passar métricas reais aprovadas. */
  illustrative?: boolean
}

/**
 * Seção de prova social. Usa números ilustrativos por padrão (marcados como
 * tal). Assim que houver métricas reais aprovadas, passe `stats`/`logos` com
 * os dados reais e `illustrative={false}`.
 */
export function LandingSocialProofSection({
  stats = illustrativeStats,
  logos = illustrativeLogos,
  illustrative = true,
}: LandingSocialProofSectionProps) {
  if (stats.length === 0 && logos.length === 0) {
    return null
  }

  return (
    <section className="border-b border-border bg-background py-10 sm:py-16">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-8 px-4 sm:px-6">
        {logos.length > 0 && (
          <>
            <span className="text-center text-[13px] font-semibold uppercase tracking-wider text-muted-foreground">
              Integrado às ferramentas que sua operação já usa
            </span>
            <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 sm:gap-x-14">
              {logos.map((logo) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={logo.name}
                  src={logo.src}
                  alt={logo.name}
                  className="h-[26px] w-auto object-contain opacity-70"
                />
              ))}
            </div>
          </>
        )}

        {stats.length > 0 && (
          <dl className="grid w-full grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border sm:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-card px-4 py-6 text-center">
                <dt className="text-[26px] font-extrabold tracking-tight sm:text-[34px]">
                  {stat.value}
                </dt>
                <dd className="mt-1 text-[13px] text-muted-foreground">
                  {stat.label}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {illustrative && (
          <span className="text-xs text-muted-foreground">
            Números ilustrativos. Substitua pelos resultados reais da
            LiveCart.
          </span>
        )}
      </div>
    </section>
  )
}
