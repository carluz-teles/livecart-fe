import Link from "next/link"
import {
  ArrowRight,
  BookOpen,
  Clock,
  FileText,
  Plug,
} from "lucide-react"

import { Card } from "@/components/ui/card"

interface DocArticle {
  slug: string
  title: string
  description: string
  href: string
  estimatedTime?: string
}

interface DocCategory {
  id: string
  name: string
  description: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: React.ComponentType<{ className?: string }>
  iconBg: string
  iconColor: string
  articles: DocArticle[]
}

// Single source of truth for the docs index. New articles get a row here
// and a corresponding page under /docs/<category>/<slug>.
const CATEGORIES: DocCategory[] = [
  {
    id: "integrations",
    name: "Integrações",
    description:
      "Como conectar serviços externos — pagamentos, fretes, ERPs e redes sociais — ao LiveCart.",
    icon: Plug,
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    articles: [
      {
        slug: "tiny",
        title: "Integrar com a Tiny (Olist)",
        description:
          "Conecte o Tiny — agora Olist — pra importar produtos, sincronizar estoque e enviar pedidos automaticamente.",
        href: "/docs/integrations/tiny",
        estimatedTime: "10 a 15 minutos",
      },
      {
        slug: "smartenvios",
        title: "Integrar com a SmartEnvios",
        description:
          "Conecte sua conta SmartEnvios para cotar e gerenciar fretes pelo checkout.",
        href: "/docs/integrations/smartenvios",
        estimatedTime: "3 minutos",
      },
    ],
  },
]

export default function DocsIndexPage() {
  return (
    <div className="mx-auto w-full max-w-5xl space-y-10 py-4">
      {/* Hero */}
      <div className="flex flex-col items-start gap-3">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <BookOpen className="h-3.5 w-3.5" />
          Central de ajuda
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Documentação
        </h1>
        <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
          Guias passo a passo para configurar, integrar e tirar o máximo do
          LiveCart. Escolha um tópico abaixo para começar.
        </p>
      </div>

      {/* Categories */}
      <section className="space-y-6">
        {CATEGORIES.map((category) => (
          <CategoryBlock key={category.id} category={category} />
        ))}
      </section>
    </div>
  )
}

function CategoryBlock({ category }: { category: DocCategory }) {
  const Icon = category.icon
  return (
    <Card className="overflow-hidden border-muted/60">
      <div className="border-b bg-gradient-to-b from-muted/30 to-transparent px-6 py-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${category.iconBg}`}
          >
            <Icon className={`h-5 w-5 ${category.iconColor}`} />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-semibold tracking-tight">
              {category.name}
            </h2>
            <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
              {category.description}
            </p>
          </div>
        </div>
      </div>

      <ul className="divide-y">
        {category.articles.map((article) => (
          <li key={article.slug}>
            <Link
              href={article.href}
              className="group flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/30"
            >
              <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-background text-muted-foreground transition-colors group-hover:border-foreground/20 group-hover:text-foreground">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium transition-colors group-hover:text-primary">
                  {article.title}
                </p>
                <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                  {article.description}
                </p>
              </div>
              {article.estimatedTime && (
                <span className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                  <Clock className="h-3 w-3" />
                  {article.estimatedTime}
                </span>
              )}
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}
