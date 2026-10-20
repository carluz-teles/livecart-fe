import Link from "next/link"
import { landingIntegrationGroups } from "@/components/marketing/landing-integrations.data"

export function LandingIntegrationsSection() {
  return (
    <section id="integracoes" aria-labelledby="integracoes-title" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between lg:gap-12">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-primary">
              <span aria-hidden="true" className="size-2 rounded-full bg-primary" />
              Integrações
            </span>
            <h2 id="integracoes-title" className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              As ferramentas que você usa.
              <span className="mt-2 block font-serif font-normal italic">Agora, trabalhando juntas.</span>
            </h2>
          </div>
          <p className="max-w-sm text-base leading-relaxed text-muted-foreground lg:pb-1">
            Do primeiro comentário à entrega, a LiveCart conecta cada etapa da
            venda. Sua operação continua nas ferramentas que você já conhece.
          </p>
        </div>

        <div className="mt-10 overflow-hidden rounded-3xl border border-border bg-card shadow-sm sm:mt-12">
          <div className="flex items-center justify-between gap-4 border-b border-border bg-secondary/40 px-5 py-4 sm:px-8">
            <span className="text-sm font-medium">O ecossistema da sua loja</span>
            <span className="shrink-0 rounded-full border border-border bg-card px-3 py-1 font-mono text-xs text-muted-foreground">
              {landingIntegrationGroups.reduce((total, group) => total + group.brands.length, 0)} conexões · confira a disponibilidade
            </span>
          </div>

          <div className="divide-y divide-border">
            {landingIntegrationGroups.map((group, index) => (
              <div key={group.title} className="grid items-center gap-5 p-5 sm:p-8 lg:grid-cols-12 lg:gap-8">
                <div className="flex items-start gap-4 lg:col-span-4">
                  <span aria-hidden="true" className="mt-1 font-mono text-xs text-muted-foreground">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-base font-semibold sm:text-lg">{group.title}</h3>
                    <p className="mt-1 max-w-xs text-sm leading-relaxed text-muted-foreground">{group.description}</p>
                  </div>
                </div>

                <ul
                  aria-label={`Integrações: ${group.title}`}
                  className={`grid gap-3 lg:col-span-8 ${group.brands.length === 3 ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-2"}`}
                >
                  {group.brands.map((brand, brandIndex) => (
                    <li key={brand.name} className={`min-w-0 ${group.brands.length === 3 && brandIndex === 0 ? "col-span-2 sm:col-span-1" : ""}`}>
                      <Link href={brand.href} className="flex h-full flex-col items-center gap-3 rounded-xl bg-secondary/40 p-4 text-center transition-colors hover:bg-secondary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary sm:p-5">
                        <span className="flex h-16 w-full items-center justify-center">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={brand.src} alt={brand.name} width={brand.width} height={brand.height} loading="lazy" decoding="async" className={`max-w-full object-contain ${brand.size}`} />
                        </span>
                        <span className="text-sm font-semibold">{brand.name}</span>
                        {brand.status && <span className="rounded-full border bg-background px-2 py-1 text-xs font-medium">{brand.status}</span>}
                        <span className="text-sm leading-relaxed text-muted-foreground">{brand.description}</span>
                        <span className="mt-auto text-sm underline underline-offset-4">Como funciona</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          <Link href="/integracoes" className="font-medium underline underline-offset-4">Compare o escopo e os requisitos de todas as integrações</Link>
        </p>
      </div>
    </section>
  )
}
