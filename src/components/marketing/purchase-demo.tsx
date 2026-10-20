"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { trackMarketingEvent } from "@/lib/marketing/analytics"

const steps = [
  { title: "Apresente o código", detail: "Caneca artesanal · código 1001 · R$ 35,00. Você apresenta esse código durante a live.", receipt: "Produto 1001 disponível" },
  { title: "Receba o comentário", detail: "A cliente comenta 2x 1001. O código identifica a caneca e o prefixo informa duas unidades.", receipt: "Comentário: 2x 1001" },
  { title: "Organize o carrinho", detail: "Com duas unidades disponíveis, o item entra no carrinho da cliente. Se faltar estoque, a quantidade precisa seguir as regras de disponibilidade e fila.", receipt: "Caneca × 2 · subtotal R$ 70,00" },
  { title: "Confira o modo de reserva", detail: "No modo nativo, o pedido é enviado ao ERP durante a live e a reserva depende da configuração do ERP. No modo local, a reserva fica no LiveCart e o envio ocorre na preparação do pagamento.", receipt: "Reserva e pagamento são estados diferentes" },
  { title: "Feche a venda", detail: "A cliente usa o checkout ou segue o atendimento combinado com a loja. Frete, cobrança, prazo e envio ao ERP precisam estar alinhados ao fluxo escolhido.", receipt: "Conferir itens, entrega e pagamento" },
]

export function PurchaseDemo() {
  const [active, setActive] = useState(0)
  function selectStep(step: number) {
    setActive(step)
    trackMarketingEvent("lc_demo_step", { step })
  }
  return <div className="grid gap-8 lg:grid-cols-2">
    <ol className="flex flex-col gap-3" aria-label="Etapas da demonstração">
      {steps.map((step, index) => <li key={step.title}>
        <button type="button" onClick={() => selectStep(index)} aria-current={active === index ? "step" : undefined} aria-controls="demo-result" className={`w-full rounded-xl border p-5 text-left transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary ${active === index ? "border-primary bg-secondary" : "bg-card hover:bg-secondary/40"}`}>
          <span className="mr-3 font-mono text-sm">0{index + 1}</span><span className="font-semibold">{step.title}</span>
        </button>
      </li>)}
    </ol>
    <div id="demo-result" className="flex flex-col justify-between gap-6 rounded-2xl border bg-card p-6 sm:p-8">
      <div aria-live="polite" aria-atomic="true">
        <p className="text-sm font-medium text-muted-foreground">Etapa {active + 1} de {steps.length}</p>
        <h2 className="mt-4 text-2xl font-bold">{steps[active].title}</h2>
        <p className="mt-5 leading-relaxed text-muted-foreground">{steps[active].detail}</p>
        <p className="mt-8 rounded-xl bg-secondary p-5 font-mono text-sm">{steps[active].receipt}</p>
      </div>
      <div className="flex gap-3">
        <Button variant="outline" onClick={() => selectStep(Math.max(0, active - 1))} disabled={active === 0}>Anterior</Button>
        <Button onClick={() => selectStep(active === steps.length - 1 ? 0 : active + 1)}>{active === steps.length - 1 ? "Recomeçar" : "Próxima etapa"}</Button>
      </div>
    </div>
  </div>
}
