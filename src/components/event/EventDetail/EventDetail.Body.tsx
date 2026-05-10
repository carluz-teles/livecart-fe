"use client"

import { use } from "react"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EventCoupons } from "@/components/event/EventCoupons"
import { EventUpsells } from "@/components/event/EventUpsells"
import { EventWhitelist } from "@/components/event/EventWhitelist"
import { ReconnectForm } from "@/components/event/ReconnectForm"
import { EventDetailContext } from "./EventDetailContext"
import { EventDetailLiveControl } from "./EventDetail.LiveControl"
import { EventDetailKpis } from "./EventDetail.Kpis"
import { EventDetailFunnel } from "./EventDetail.Funnel"
import { EventDetailTopProducts } from "./EventDetail.TopProducts"
import { EventDetailTopBuyers } from "./EventDetail.TopBuyers"
import { EventDetailSessions } from "./EventDetail.Sessions"
import { EventDetailCarts } from "./EventDetail.Carts"
import { EventDetailActiveCheckouts } from "./EventDetail.ActiveCheckouts"
import { EventDetailCheckoutUpsell } from "./EventDetail.CheckoutUpsell"
import { EventDetailEndEventDialog } from "./EventDetail.EndEventDialog"
import { EventDetailCreateSessionDialog } from "./EventDetail.CreateSessionDialog"

// Single Tabs root drives the four sub-screens. Visão geral is the dense
// one: it leans on the OrderDetail 8/4 grid — operational stuff in the main
// column (sessions, carts, live state), analytics summary in the aside
// (funnel, top performers).
export function EventDetailBody() {
  const ctx = use(EventDetailContext)
  if (!ctx) return null
  const { event, crashRecoveryOpen } = ctx.state
  const { setCrashRecoveryOpen, refresh } = ctx.actions

  return (
    <>
      <Tabs defaultValue="overview" className="w-full">
        <TabsList>
          <TabsTrigger value="overview">Visão geral</TabsTrigger>
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
          <TabsTrigger value="coupons">Cupons</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6 flex flex-col gap-6">
          {/* High-priority banner: only shows when event is active. */}
          <EventDetailLiveControl />

          {/* KPIs full width above the split so they read as the headline
              numbers for the event. */}
          <EventDetailKpis />

          <div className="grid gap-4 lg:grid-cols-12">
            <main className="flex flex-col gap-4 lg:col-span-8">
              <EventDetailSessions />
              <EventDetailCarts />
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
    </>
  )
}
