"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import {
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Clock,
  CornerDownLeft,
  FileText,
  LifeBuoy,
  Lightbulb,
  Mail,
  MessageSquare,
  Search,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SupportArticle {
  title: string
  href: string
  category: string
  estimatedTime?: string
}

const ARTICLES: SupportArticle[] = [
  {
    title: "Integrar com o Mercado Pago",
    href: "/docs/integrations/mercado-pago",
    category: "Pagamentos",
    estimatedTime: "2 min",
  },
  {
    title: "Integrar com a Pagar.me",
    href: "/docs/integrations/pagarme",
    category: "Pagamentos",
    estimatedTime: "10 min",
  },
  {
    title: "Integrar com a Tiny (Olist)",
    href: "/docs/integrations/tiny",
    category: "ERP",
    estimatedTime: "10 min",
  },
  {
    title: "Integrar com o Instagram",
    href: "/docs/integrations/instagram",
    category: "Lives",
    estimatedTime: "2 min",
  },
  {
    title: "Integrar com o Melhor Envio",
    href: "/docs/integrations/melhor-envio",
    category: "Frete",
    estimatedTime: "2 min",
  },
  {
    title: "Integrar com a SmartEnvios",
    href: "/docs/integrations/smartenvios",
    category: "Frete",
    estimatedTime: "3 min",
  },
]

export default function SupportPage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return []
    return ARTICLES.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.category.toLowerCase().includes(q),
    ).slice(0, 5)
  }, [query])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  // Press "/" anywhere on the page to jump to the search box — same affordance
  // GitHub uses, and the page is tiny enough that hijacking the key is safe.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement !== inputRef.current &&
        !(e.target instanceof HTMLInputElement) &&
        !(e.target instanceof HTMLTextAreaElement)
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const q = query.trim()
    if (!q) return
    if (results[activeIndex]) {
      router.push(results[activeIndex].href)
      return
    }
    router.push(`/ideas?q=${encodeURIComponent(q)}`)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!results.length) return
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, results.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === "Escape") {
      setQuery("")
      inputRef.current?.blur()
    }
  }

  return (
    <div className="relative isolate mx-auto w-full max-w-5xl pb-12">
      {/* Soft amber wash behind the hero — subtle on light, gone on dark via opacity. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -top-10 -z-10 mx-auto h-72 max-w-3xl rounded-[100%] bg-primary/15 blur-3xl"
      />

      {/* Hero */}
      <header className="flex flex-col items-center gap-5 pt-6 text-center">
        <span className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs font-medium text-muted-foreground shadow-sm">
          <LifeBuoy className="h-3.5 w-3.5" />
          Central de suporte
        </span>
        <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-5xl">
          Como podemos ajudar?
        </h1>
        <p className="max-w-xl text-pretty text-base leading-relaxed text-muted-foreground">
          Pesquise nos guias do time ou explore o que outros lojistas estão
          construindo. Estamos a um Enter de distância.
        </p>
      </header>

      {/* Search */}
      <form
        onSubmit={handleSubmit}
        className="relative mx-auto mt-8 w-full max-w-2xl"
        role="search"
      >
        <div
          className={cn(
            "group relative flex items-center gap-3 rounded-2xl border bg-card px-4 shadow-sm transition-all",
            "focus-within:border-primary/40 focus-within:ring-4 focus-within:ring-primary/15",
          )}
        >
          <Search
            className="h-5 w-5 shrink-0 text-muted-foreground transition-colors group-focus-within:text-primary"
            strokeWidth={1.8}
          />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setOpen(true)}
            onBlur={() => setTimeout(() => setOpen(false), 120)}
            onKeyDown={handleKeyDown}
            placeholder="Buscar guias, integrações ou ideias da comunidade…"
            className="h-14 flex-1 bg-transparent text-base outline-none placeholder:text-muted-foreground/70"
            aria-label="Buscar suporte"
          />
          <kbd className="hidden items-center gap-1 rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-muted-foreground sm:inline-flex">
            /
          </kbd>
        </div>

        {/* Live results dropdown */}
        {open && query.trim() && (
          <div className="absolute inset-x-0 top-full z-20 mt-2 overflow-hidden rounded-2xl border bg-popover shadow-xl">
            {results.length > 0 ? (
              <ul className="p-2">
                {results.map((article, i) => (
                  <li key={article.href}>
                    <Link
                      href={article.href}
                      onMouseEnter={() => setActiveIndex(i)}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                        i === activeIndex
                          ? "bg-accent text-accent-foreground"
                          : "text-foreground hover:bg-muted",
                      )}
                    >
                      <FileText
                        className="h-4 w-4 shrink-0 text-muted-foreground"
                        strokeWidth={1.8}
                      />
                      <span className="flex-1 truncate font-medium">
                        {article.title}
                      </span>
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {article.category}
                        {article.estimatedTime && ` · ${article.estimatedTime}`}
                      </span>
                      {i === activeIndex && (
                        <CornerDownLeft className="h-3.5 w-3.5 text-muted-foreground" />
                      )}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="px-4 py-5 text-sm text-muted-foreground">
                Nenhum guia encontrado para{" "}
                <span className="font-medium text-foreground">
                  &ldquo;{query.trim()}&rdquo;
                </span>
                .
              </div>
            )}
            <div className="border-t bg-muted/40 px-3 py-2">
              <Link
                href={`/ideas?q=${encodeURIComponent(query.trim())}`}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                Buscar &ldquo;{query.trim()}&rdquo; nas ideias da comunidade
                <ArrowRight className="ml-auto h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        )}
      </form>

      {/* Submenus */}
      <div className="mx-auto mt-12 grid w-full gap-5 sm:grid-cols-2">
        <SupportTile
          href="/docs"
          icon={BookOpen}
          eyebrow="Documentação"
          title="Guias passo a passo"
          description="Como integrar pagamentos, frete, ERP e tirar o máximo de cada feature do LiveCart."
          meta={`${ARTICLES.length} guias publicados`}
          accent="primary"
        />
        <SupportTile
          href="/ideas"
          icon={Lightbulb}
          eyebrow="Ideias"
          title="O que a comunidade quer"
          description="Vote, comente e proponha o próximo recurso. A gente lê tudo e prioriza com base nos votos."
          meta="Aberto à comunidade"
          accent="sky"
        />
      </div>

      {/* Contact cards — Falar com o time + Feedback */}
      <div className="mx-auto mt-10 grid w-full gap-4 sm:grid-cols-2">
        <ContactCard
          icon={Mail}
          title="Falar com o time"
          description="Travado em algo? A gente responde no mesmo dia útil."
          cta="Pedir ajuda"
          email="suporte@livecart.app"
        />
        <ContactCard
          icon={MessageSquare}
          title="Enviar feedback"
          description="Tem ideia ou crítica? Manda pra gente — a gente lê tudo."
          cta="Mandar feedback"
          email="feedback@livecart.app"
        />
      </div>
    </div>
  )
}

interface ContactCardProps {
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  title: string
  description: string
  cta: string
  email: string
}

function ContactCard({
  icon: Icon,
  title,
  description,
  cta,
  email,
}: ContactCardProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border bg-card p-6">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground">
          <Icon className="h-5 w-5" strokeWidth={1.8} />
        </div>
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight">{title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
      <Button asChild variant="outline" className="self-start">
        <a href={`mailto:${email}`}>
          {cta}
          <ArrowUpRight className="ml-1 h-4 w-4" />
        </a>
      </Button>
    </div>
  )
}

interface SupportTileProps {
  href: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
  eyebrow: string
  title: string
  description: string
  meta: string
  accent: "primary" | "sky"
}

function SupportTile({
  href,
  icon: Icon,
  eyebrow,
  title,
  description,
  meta,
  accent,
}: SupportTileProps) {
  // Two distinct accents so the eye separates Docs (brand amber) from Ideas
  // (cool sky) without breaking the project's amber-led palette.
  const accentStyles = {
    primary: {
      strip: "from-primary/80 via-primary to-amber-400",
      icon: "bg-primary/10 text-primary",
      ring: "group-hover:ring-primary/20",
    },
    sky: {
      strip: "from-sky-500/80 via-sky-500 to-cyan-400",
      icon: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
      ring: "group-hover:ring-sky-500/20",
    },
  }[accent]

  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-2xl border bg-card p-6 transition-all duration-300",
        "hover:-translate-y-0.5 hover:shadow-lg hover:ring-4",
        accentStyles.ring,
      )}
    >
      {/* Top gradient strip — same metaphor as IntegrationCard. */}
      <div
        aria-hidden
        className={cn(
          "absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-50 transition-opacity duration-300 group-hover:opacity-100",
          accentStyles.strip,
        )}
      />

      <div className="flex items-start justify-between gap-4">
        <div
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-105",
            accentStyles.icon,
          )}
        >
          <Icon className="h-6 w-6" strokeWidth={1.6} />
        </div>
        <ArrowRight
          className="h-4 w-4 -translate-x-1 text-muted-foreground opacity-0 transition-all duration-300 group-hover:translate-x-0 group-hover:text-foreground group-hover:opacity-100"
          strokeWidth={2}
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {eyebrow}
        </span>
        <h2 className="mt-1.5 text-xl font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>

        <div className="mt-6 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" strokeWidth={2} />
          {meta}
        </div>
      </div>
    </Link>
  )
}
