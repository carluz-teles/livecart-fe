"use client"

import { use } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCoupons } from "@/components/event/EventCoupons"
import { EventUpsells } from "@/components/event/EventUpsells"
import { EventWhitelist } from "@/components/event/EventWhitelist"
import { ReconnectForm } from "@/components/event/ReconnectForm"
import { EventWindowForm } from "@/components/event/EventWindowForm"
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
import { EventDetailActiveCheckouts } from "./EventDetail.ActiveCheckouts"
import { EventDetailCheckoutUpsell } from "./EventDetail.CheckoutUpsell"
import { EventDetailEndEventDialog } from "./EventDetail.EndEventDialog"
import { EventDetailCreateSessionDialog } from "./EventDetail.CreateSessionDialog"
import { EventDetailModelBanner } from "./EventDetail.ModelBanner"

// Single Tabs root drives the four sub-screens. Visão geral is the dense
// one: it leans on the OrderDetail 8/4 grid — operational stuff in the main
// column (sessions, carts, live state), analytics summary in the aside
// (funnel, top performers).
export function EventDetailBody() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event, crashRecoveryOpen, editEventOpen } = ctx.state
  const { setCrashRecoveryOpen, setEditEventOpen, refresh } = ctx.actions
  const sessionCount = event.sessions?.length ?? 0

  return (
    <>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
          {/* Aba própria (copy deck §5.3). A tabela vivia enterrada no meio da
              visão geral e DUPLICADA dentro de Métricas — duas cópias da mesma
              lista, e nenhuma delas parecendo o segundo nível da campanha. */}
          <TabsTrigger value="sessions">
            Sessões
            {sessionCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {sessionCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="products">
            Produtos
            {event.productCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {event.productCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="upsells">
            Upsells
            {event.upsellCount > 0 && (
              <Badge variant="secondary" className="ml-2">
                {event.upsellCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="metrics">Métricas</TabsTrigger>
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
        </TabsList>

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
          <p className="max-w-3xl text-sm text-muted-foreground">
            Cada linha é uma transmissão desta campanha. Você pode adicionar sessões
            enquanto o evento estiver aberto, de tipos diferentes. A campanha só fecha na
            data de fim ou quando você clicar em &quot;Finalizar evento&quot; — nenhuma
            sessão sozinha fecha carrinho.
          </p>
          <EventDetailSessions />
        </TabsContent>

        <TabsContent value="metrics" className="mt-6">
          <EventDetailMetrics />
        </TabsContent>

        <TabsContent value="products" className="mt-6">
          <EventWhitelist eventId={event.id} />
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
