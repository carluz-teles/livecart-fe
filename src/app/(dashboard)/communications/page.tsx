"use client"

import Link from "next/link"

import { Info } from "lucide-react"

import { Skeleton } from "@/components/ui/skeleton"
import { NotificationCard } from "@/components/communications/NotificationCard"
import { useCommunications, type CommunicationCard as CommunicationCardData } from "@/hooks/communications"

export default function CommunicationsPage() {
  const { isLoading, cards } = useCommunications()

  // Two sections — channels behave differently enough to warrant separation.
  // Cart-flow cards are IG DM templates the lojista has had since v1; the
  // post-payment cards are email-only and arrived in this phase.
  const cartCards = cards.filter((c) => c.channel === "instagram_dm")
  const emailCards = cards.filter((c) => c.channel === "email")

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Comunicações</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Estas são as mensagens automáticas que o LiveCart envia ao comprador. As de
            carrinho vão por mensagem direta no Instagram; as de pós-venda, por e-mail.
            Você pode editar o texto de todas e usar as variáveis para personalizar.
          </p>
        </div>
      </div>

      {/* N10 — o prazo do Instagram é o motivo pelo qual algumas mensagens não
          saem. Sem este aviso, "não entregue" parece falha do LiveCart. */}
      <div className="flex items-start gap-3 rounded-lg border bg-muted/40 p-4">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Sobre o prazo do Instagram.</strong> O
          Instagram só permite responder um comprador por <strong>7 dias</strong> depois do
          comentário dele, e <strong>uma única vez por comentário</strong>. Em campanhas
          longas, quem comentou no primeiro dia pode estar fora desse prazo quando a
          campanha encerrar. Quando isso acontece, o LiveCart <strong>não envia</strong> —
          marca a mensagem como não entregue, com o motivo, e mostra a lista na página do
          evento para você chamar essas pessoas na mão.
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-5">
          <Skeleton className="h-[110px] w-full rounded-xl" />
          <Skeleton className="h-[110px] w-full rounded-xl" />
          <Skeleton className="h-[110px] w-full rounded-xl" />
        </div>
      ) : (
        <div className="flex flex-col gap-10">
          <Section
            title="Mensagens da campanha"
            subtitle="Instagram DM enquanto o cliente ainda está decidindo a compra — e nos momentos em que o comentário dele não vira carrinho."
            cards={cartCards}
          />
          <Section
            title="Comunicações pós-venda"
            subtitle="Emails automáticos depois que o pagamento é confirmado."
            cards={emailCards}
          />
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  subtitle,
  cards,
}: {
  title: string
  subtitle: string
  cards: CommunicationCardData[]
}) {
  return (
    <section>
      <div className="mb-4">
        <h2 className="text-sm font-medium tracking-tight">{title}</h2>
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      </div>
      <div className="flex flex-col gap-5">
        {cards.map((card) => (
          <Link key={card.type} href={`/communications/${card.type}`}>
            <NotificationCard card={card} onClick={() => undefined} />
          </Link>
        ))}
      </div>
    </section>
  )
}
