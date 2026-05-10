"use client"

import { EventDetailProvider } from "./EventDetail.Provider"
import { EventDetailFrame } from "./EventDetail.Frame"
import { EventDetailHeader } from "./EventDetail.Header"
import { EventDetailActions } from "./EventDetail.Actions"
import { EventDetailBody } from "./EventDetail.Body"
import { EventDetailFunnel } from "./EventDetail.Funnel"
import { EventDetailKpis } from "./EventDetail.Kpis"
import { EventDetailTopProducts } from "./EventDetail.TopProducts"
import { EventDetailTopBuyers } from "./EventDetail.TopBuyers"
import { EventDetailSessions } from "./EventDetail.Sessions"
import { EventDetailCarts } from "./EventDetail.Carts"
import { EventDetailActiveCheckouts } from "./EventDetail.ActiveCheckouts"
import { EventDetailCheckoutUpsell } from "./EventDetail.CheckoutUpsell"
import { EventDetailLiveControl } from "./EventDetail.LiveControl"
import { EventDetailSkeleton } from "./EventDetail.Skeleton"
import { EventDetailNotFound } from "./EventDetail.NotFound"

// Page wires Header + Body and the Provider surrounds both. Sub-cards are
// exported too — most read directly from context, so the page rarely needs
// to compose them by hand.
export const EventDetail = {
  Provider: EventDetailProvider,
  Frame: EventDetailFrame,
  Header: EventDetailHeader,
  Actions: EventDetailActions,
  Body: EventDetailBody,
  Funnel: EventDetailFunnel,
  Kpis: EventDetailKpis,
  TopProducts: EventDetailTopProducts,
  TopBuyers: EventDetailTopBuyers,
  Sessions: EventDetailSessions,
  Carts: EventDetailCarts,
  ActiveCheckouts: EventDetailActiveCheckouts,
  CheckoutUpsell: EventDetailCheckoutUpsell,
  LiveControl: EventDetailLiveControl,
  Skeleton: EventDetailSkeleton,
  NotFound: EventDetailNotFound,
}
