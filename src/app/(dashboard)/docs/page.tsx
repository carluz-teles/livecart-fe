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
        slug: "mercado-pago",
        title: "Integrar com o Mercado Pago",
        description:
          "Aceite Pix e cartão de crédito no checkout autorizando o LiveCart pelo próprio Mercado Pago.",
        href: "/docs/integrations/mercado-pago",
        estimatedTime: "2 minutos",
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
    <div className="mx-auto w-full max-w-5xl space-y-12 py-4">
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
      <div className="space-y-12">
        {CATEGORIES.map((category) => (
          <CategorySection key={category.id} category={category} />
        ))}
      </div>
    </div>
  )
}

function CategorySection({ category }: { category: DocCategory }) {
  const Icon = category.icon
  return (
    <section className="space-y-5">
      <div className="flex items-start gap-4">
        <div
          className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl ${category.iconBg}`}
        >
          <Icon className={`h-5 w-5 ${category.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight">
            {category.name}
          </h2>
          <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {category.description}
          </p>
        </div>
      </div>

      <ul className="grid gap-3 sm:grid-cols-2">
        {category.articles.map((article) => (
          <li key={article.slug}>
            <Link href={article.href} className="block h-full">
              <Card className="group h-full p-5 transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md">
                <div className="flex h-full flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border bg-muted/40 text-muted-foreground transition-colors group-hover:border-primary/30 group-hover:text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <ArrowRight className="h-4 w-4 flex-shrink-0 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>

                  <h3 className="mt-4 text-base font-semibold leading-tight tracking-tight transition-colors group-hover:text-primary">
                    {article.title}
                  </h3>
                  <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {article.description}
                  </p>

                  {article.estimatedTime && (
                    <div className="mt-auto pt-4">
                      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        {article.estimatedTime}
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
