"use client"

import { use } from "react"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { EventCoupons } from "@/components/event/EventCoupons"
import { EventUpsells } from "@/components/event/EventUpsells"
import { ReconnectForm } from "@/components/event/ReconnectForm"
import { EventWindowForm } from "@/components/event/EventWindowForm"
import { EventCatalogSelect } from "@/components/event/EventCatalogSelect"
import { EventDetailNavigation } from "./EventDetail.Navigation"
import { EventDetailContext } from "./EventDetailContext"
import { EventDetailLiveControl } from "./EventDetail.LiveControl"
import { EventDetailKpis } from "./EventDetail.Kpis"
import { EventDetailFunnel } from "./EventDetail.Funnel"
import { EventDetailTopProducts } from "./EventDetail.TopProducts"
import { EventDetailTopBuyers } from "./EventDetail.TopBuyers"
import { EventDetailSessions } from "./EventDetail.Sessions"
import { EventDetailMetrics } from "./EventDetail.Metrics"
import { EventDetailUndelivered } from "./EventDetail.Undelivered"
import { EventDetailCarts } from "./EventDetail.Carts"
import { EventDetailComments } from "./EventDetail.Comments"
import { EventDetailActiveCheckouts } from "./EventDetail.ActiveCheckouts"
import { EventDetailCheckoutUpsell } from "./EventDetail.CheckoutUpsell"
import { EventDetailEndEventDialog } from "./EventDetail.EndEventDialog"
import { EventDetailCreateSessionDialog } from "./EventDetail.CreateSessionDialog"
import { EventDetailModelBanner } from "./EventDetail.ModelBanner"

// A aba fica na URL para links diretos e para preservar a seleção no reload.
export function EventDetailBody() {
  const ctx = use(EventDetailContext)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const requestedTab = searchParams.get("tab") ?? "overview"
  const activeTab = ["overview", "sessions", "comments", "metrics", "upsells", "coupons"].includes(requestedTab) ? requestedTab : "overview"
  if (!ctx) return null
  const { event, crashRecoveryOpen, editEventOpen } = ctx.state
  const { setCrashRecoveryOpen, setEditEventOpen, refresh } = ctx.actions
  const sessionCount = event.sessions?.length ?? 0
  const changeTab = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    if (value === "overview") params.delete("tab")
    else params.set("tab", value)
    router.replace(`${pathname}${params.size ? `?${params}` : ""}`, { scroll: false })
  }

  return (
    <>
      <Tabs value={activeTab} onValueChange={changeTab} className="min-w-0 w-full">
        <EventDetailNavigation sessionCount={sessionCount} upsellCount={event.upsellCount} />

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          {/* Antes dos números: o que estes números são. A tela abria direto
              em cards de métrica, e numa campanha de uma sessão só isso lia
              como "a métrica daquele post". */}
          <EventDetailModelBanner />

          {/* High-priority banner: only shows when event is active. */}
          <EventDetailLiveControl />

          {/* RN-38 — quem o Instagram não deixou avisar. Some quando não há
              ninguém: é o caso normal e não pode sugerir problema. */}
          <EventDetailUndelivered />

          {/* KPIs full width above the split so they read as the headline
              numbers for the event. */}
          <EventDetailKpis />

          <div className="grid gap-4 lg:grid-cols-12">
            <main className="flex flex-col gap-4 lg:col-span-8">
              <EventDetailCarts />
              {/* Comentário é da TRANSMISSÃO, não da campanha: na visão geral
                  ele mistura o que veio da live de segunda com o do post de
                  quarta e não responde nada. Mora na aba Sessões, ao lado da
                  transmissão que o produziu. */}
              <EventDetailActiveCheckouts />
              <EventDetailCheckoutUpsell />
            </main>
            <aside className="flex flex-col gap-4 lg:col-span-4">
              <EventDetailFunnel />
              <EventDetailTopProducts />
              <EventDetailTopBuyers />
            </aside>
          </div>
        </TabsContent>

        <TabsContent value="sessions" className="mt-6 flex flex-col gap-4">
          {/* A regra da campanha já está na descrição do card abaixo, palavra
              por palavra. Aqui fica só o que a aba ganhou de novo: os produtos
              são configurados por transmissão. */}
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cada linha é uma transmissão deste evento. Os produtos que cada uma pode
            vender são configurados nela mesma, no botão &quot;Produtos&quot; da linha.
          </p>
          <EventCatalogSelect eventId={event.id} />
          <EventDetailSessions />
        </TabsContent>

        <TabsContent value="comments" className="mt-6">
          <EventDetailComments key={event.id} />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <EventDetailMetrics />
        </TabsContent>

        <TabsContent value="upsells" className="mt-6">
          <EventUpsells eventId={event.id} />
        </TabsContent>

        <TabsContent value="coupons" className="mt-6">
          <EventCoupons eventId={event.id} />
        </TabsContent>
      </Tabs>

      {/* Dialogs live at the bottom of the tree so any sub-component can
          trigger them via context (Header, Actions dropdown, Body). */}
      <EventDetailEndEventDialog />
      <EventDetailCreateSessionDialog />
      <ReconnectForm
        eventId={event.id}
        open={crashRecoveryOpen}
        onOpenChange={setCrashRecoveryOpen}
        onSuccess={refresh}
      />
      <EventWindowForm
        event={event}
        open={editEventOpen}
        onOpenChange={setEditEventOpen}
        onSuccess={refresh}
      />
    </>
  )
}
