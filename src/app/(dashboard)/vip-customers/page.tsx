"use client"

import { Crown, Infinity as InfinityIcon, Layers } from "lucide-react"

import { VipCustomers } from "@/components/vip-customer/VipCustomers"

// Clientes VIP.
//
// A mecânica é diferente de "cliente que gasta muito": um VIP tem um carrinho
// que NUNCA expira e acumula compras de várias lives num só carrinho, que só
// fecha quando pago ou cancelado. A explicação abaixo deixa isso claro — "VIP"
// sozinho seria ambíguo.
export default function VipCustomersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Relacionamento
        </span>
        <h1 className="flex items-center gap-2 text-2xl font-semibold tracking-tight">
          <Crown className="h-6 w-6 text-amber-500" />
          Clientes VIP
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Clientes de confiança que compram ao longo de várias lives. O carrinho
          de um VIP <strong className="text-foreground">nunca expira</strong> e
          acumula tudo num só lugar — só fecha quando você recebe o pagamento ou
          cancela.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <InfoCard
          icon={<InfinityIcon className="h-4 w-4 text-amber-500" />}
          title="Carrinho eterno"
          text="Enquanto o carrinho de todo mundo expira quando o evento fecha, o do VIP fica aberto."
        />
        <InfoCard
          icon={<Layers className="h-4 w-4 text-amber-500" />}
          title="Um só carrinho, várias lives"
          text="O que ele pede em qualquer live entra no mesmo carrinho. As vendas continuam contadas por evento."
        />
      </div>

      <VipCustomers.Add />
      <VipCustomers.List />
    </div>
  )
}

function InfoCard({
  icon,
  title,
  text,
}: {
  icon: React.ReactNode
  title: string
  text: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border bg-card p-4">
      <div className="mt-0.5">{icon}</div>
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{text}</p>
      </div>
    </div>
  )
}
