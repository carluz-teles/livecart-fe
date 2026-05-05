import { CreditCard, Wallet, Truck } from "lucide-react"

import type { ERPHealthCheckCategory, ERPHealthCheckItem } from "@/types"

import { TinyHealthCheckItem } from "./TinyHealthCheck.Item"

interface TinyHealthCheckCategorySectionProps {
  category: ERPHealthCheckCategory
  items: ERPHealthCheckItem[]
}

const CATEGORY_LABEL: Record<ERPHealthCheckCategory, string> = {
  forma_pagamento: "Formas de Pagamento",
  forma_recebimento: "Formas de Recebimento",
  forma_envio: "Formas de Envio",
}

const CATEGORY_ICON: Record<ERPHealthCheckCategory, React.ReactNode> = {
  forma_pagamento: <CreditCard className="h-3.5 w-3.5" />,
  forma_recebimento: <Wallet className="h-3.5 w-3.5" />,
  forma_envio: <Truck className="h-3.5 w-3.5" />,
}

const CATEGORY_HINT: Record<ERPHealthCheckCategory, string> = {
  forma_pagamento:
    "Aplicado ao campo meioPagamento das parcelas — define qual instrumento o cliente usou.",
  forma_recebimento:
    "Aplicado ao campo formaRecebimento das parcelas — define como a entrada classifica em contas a receber.",
  forma_envio:
    "Aplicado ao transportador do pedido para que a etiqueta saia com a transportadora certa.",
}

export function TinyHealthCheckCategorySection({
  category,
  items,
}: TinyHealthCheckCategorySectionProps) {
  if (items.length === 0) return null

  const missingCount = items.filter((i) => i.status === "missing").length

  return (
    <section className="space-y-2.5">
      <header className="flex items-baseline gap-2">
        <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">
          {CATEGORY_ICON[category]}
          {CATEGORY_LABEL[category]}
        </span>
        {missingCount > 0 ? (
          <span className="inline-flex items-center rounded-full bg-amber-100 px-1.5 py-0.5 text-[10px] font-medium text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
            {missingCount} pendente{missingCount > 1 ? "s" : ""}
          </span>
        ) : null}
      </header>

      <p className="text-xs leading-relaxed text-muted-foreground">{CATEGORY_HINT[category]}</p>

      <div className="grid gap-2">
        {items.map((item) => (
          <TinyHealthCheckItem
            key={`${item.category}-${item.expected_name}`}
            item={item}
          />
        ))}
      </div>
    </section>
  )
}
