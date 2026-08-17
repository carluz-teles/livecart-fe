import {
  MessageCircleQuestion,
  Search,
  PackageSearch,
  ClipboardList,
  Send,
  Wallet,
  FileCheck,
  RefreshCw,
} from "lucide-react"

const customerQuotes = [
  "Quero esse.",
  "Tem M?",
  "Quanto custa?",
  "Me manda o link.",
  "Quero 2.",
  "Onde compro?",
]

const manualSteps = [
  { icon: MessageCircleQuestion, label: "Responder o cliente" },
  { icon: Search, label: "Identificar o produto" },
  { icon: PackageSearch, label: "Consultar estoque" },
  { icon: ClipboardList, label: "Montar o pedido" },
  { icon: Send, label: "Enviar o checkout" },
  { icon: Wallet, label: "Acompanhar o pagamento" },
  { icon: FileCheck, label: "Registrar a venda" },
  { icon: RefreshCw, label: "Atualizar o ERP" },
]

export function LandingProblemSection() {
  return (
    <section className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            O problema
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Seus clientes já estão nas redes sociais. Sua loja também deveria
            estar.
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Hoje, a jornada de compra não começa necessariamente na sua loja
            virtual — ela começa em uma conversa.
          </p>
        </div>

        <div className="mx-auto mt-12 grid max-w-2xl grid-cols-2 gap-3 sm:grid-cols-3">
          {customerQuotes.map((quote) => (
            <span
              key={quote}
              className="rounded-full border border-border bg-card px-4 py-2.5 text-center text-sm font-semibold text-foreground shadow-sm"
            >
              &quot;{quote}&quot;
            </span>
          ))}
        </div>

        <p className="mx-auto mt-8 max-w-2xl text-center text-base text-muted-foreground">
          Essas conversas acontecem no Instagram, WhatsApp, comentários,
          Stories e lives. O problema é que transformar cada uma delas em uma
          venda normalmente exige alguém para:
        </p>

        <div className="mx-auto mt-10 grid max-w-4xl grid-cols-2 gap-4 sm:grid-cols-4">
          {manualSteps.map((step) => (
            <div
              key={step.label}
              className="flex flex-col items-center gap-3 rounded-xl border border-border bg-card p-5 text-center shadow-sm transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="size-5" />
              </span>
              <span className="text-sm font-semibold leading-snug text-foreground">
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-xl font-bold tracking-tight sm:text-2xl">
          A LiveCart automatiza esse processo.
        </p>
      </div>
    </section>
  )
}
