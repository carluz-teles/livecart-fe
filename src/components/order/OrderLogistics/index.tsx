"use client"

import { useMemo, useRef, useState } from "react"
import {
  AlertCircle,
  Check,
  Copy,
  ExternalLink,
  FileText,
  Loader2,
  Package,
  RefreshCw,
  Tag,
  Truck,
  Upload,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import {
  useCreateShipment,
  useAttachInvoice,
  useUploadInvoiceXml,
  useGenerateLabels,
  useFetchTracking,
} from "@/hooks/shipping"
import { formatCurrency, formatDateTime } from "@/lib/format"
import {
  shipmentStatusBucket,
  shipmentStatusLabel,
  SHIPMENT_BUCKET_LABEL,
} from "@/lib/shipment"
import { cn } from "@/lib/utils"
import type {
  CreateShipmentPayload,
  IntegrationProvider,
  OrderDetail,
  OrderItem,
  Shipment,
  ShipmentAddress,
  ShipmentEvent,
  ShipmentItemPayload,
  ShipmentStatusBucket,
} from "@/types"

const BUCKET_STYLE: Record<
  ShipmentStatusBucket,
  { dot: string; badge: string }
> = {
  awaiting: {
    dot: "bg-amber-500",
    badge: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  },
  in_transit: {
    dot: "bg-blue-500",
    badge: "bg-blue-500/10 text-blue-700 border-blue-500/20",
  },
  delivered: {
    dot: "bg-emerald-500",
    badge: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  },
  issue: {
    dot: "bg-red-500",
    badge: "bg-red-500/10 text-red-700 border-red-500/20",
  },
  returning: {
    dot: "bg-orange-500",
    badge: "bg-orange-500/10 text-orange-700 border-orange-500/20",
  },
  canceled: {
    dot: "bg-gray-400",
    badge: "bg-gray-200 text-gray-700 border-gray-300",
  },
}

const PROVIDER_LABEL: Record<string, string> = {
  melhor_envio: "Melhor Envio",
  smartenvios: "SmartEnvios",
}

interface OrderLogisticsProps {
  order: OrderDetail
}

export function OrderLogistics({ order }: OrderLogisticsProps) {
  // Only render for paid orders — a shipment can't exist otherwise.
  if (order.paymentStatus !== "paid") return null

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Truck className="h-4 w-4" />
          Logística
        </CardTitle>
      </CardHeader>
      <CardContent>
        {order.shipment ? (
          <ShipmentView order={order} shipment={order.shipment} />
        ) : (
          <NoShipmentView order={order} />
        )}
      </CardContent>
    </Card>
  )
}

// --------------------------------------------------------------------------
// No-shipment state: either shows the blockers or lets admin create.
// --------------------------------------------------------------------------
function NoShipmentView({ order }: { order: OrderDetail }) {
  const [sheetOpen, setSheetOpen] = useState(false)
  const blockers = collectBlockers(order)
  const canCreate = blockers.length === 0

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Nenhum envio criado ainda para este pedido.
      </p>

      {order.shipping && (
        <div className="rounded-md border bg-muted/40 p-3 text-sm">
          <p className="font-medium">
            Frete escolhido:{" "}
            <span className="text-muted-foreground font-normal">
              {order.shipping.serviceName} · {order.shipping.carrier}
            </span>
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {providerLabel(order.shipping.provider)} ·{" "}
            {formatCurrency(order.shipping.costCents)} ·{" "}
            {order.shipping.deadlineDays}{" "}
            {order.shipping.deadlineDays === 1 ? "dia útil" : "dias úteis"}
          </p>
        </div>
      )}

      {blockers.length > 0 && (
        <div className="flex gap-2 rounded-md border border-amber-200 bg-amber-50/50 p-3 text-sm text-amber-800">
          <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600" />
          <div>
            <p className="font-medium">
              Faltam dados para criar o envio:
            </p>
            <ul className="mt-1 list-disc pl-4 text-xs">
              {blockers.map((b) => (
                <li key={b}>{b}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <Button
        onClick={() => setSheetOpen(true)}
        disabled={!canCreate}
        size="sm"
      >
        <Package className="mr-1.5 h-3.5 w-3.5" />
        Criar envio
      </Button>

      {canCreate && (
        <CreateShipmentSheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          order={order}
        />
      )}
    </div>
  )
}

// Two conceptual buckets: (1) buyer didn't finish checkout, (2) a product
// has no dimensions registered (backend sends 0, meaning "missing", not
// literally zero). Store data is always present so it never surfaces here.
function collectBlockers(order: OrderDetail): string[] {
  const messages: string[] = []

  if (!order.customer || !order.shippingAddress || !order.shipping) {
    messages.push("Cliente não concluiu o checkout")
  }

  const missingDims = order.items.filter(hasMissingDimensions)
  for (const item of missingDims) {
    messages.push(
      `Produto "${item.productName}" sem dimensões (cadastre em Produtos antes de criar o envio)`
    )
  }

  return messages
}

function hasMissingDimensions(item: OrderItem): boolean {
  return (
    item.weightGrams === 0 ||
    item.heightCm === 0 ||
    item.widthCm === 0 ||
    item.lengthCm === 0
  )
}

// --------------------------------------------------------------------------
// Create shipment sheet — reviews pre-filled data and captures optional
// invoiceKey and observation before POSTing.
// --------------------------------------------------------------------------
interface CreateShipmentSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  order: OrderDetail
}

function CreateShipmentSheet({
  open,
  onOpenChange,
  order,
}: CreateShipmentSheetProps) {
  const [invoiceKey, setInvoiceKey] = useState("")
  const [observation, setObservation] = useState("")
  const createShipment = useCreateShipment(order.id)

  const payload = useMemo(() => buildCreatePayload(order), [order])

  const handleSubmit = async () => {
    if (!payload) return
    try {
      await createShipment.mutateAsync({
        provider: order.shipping!.provider as IntegrationProvider,
        payload: {
          ...payload,
          ...(invoiceKey.trim() ? { invoiceKey: invoiceKey.trim() } : {}),
          ...(observation.trim() ? { observation: observation.trim() } : {}),
        },
      })
      toast.success("Envio criado com sucesso")
      onOpenChange(false)
      setInvoiceKey("")
      setObservation("")
    } catch (err) {
      const message =
        (err as { message?: string })?.message ||
        "Não foi possível criar o envio."
      toast.error(message)
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle>Criar envio</SheetTitle>
          <SheetDescription>
            Revise os dados e, opcionalmente, anexe a NFe e uma observação.
          </SheetDescription>
        </SheetHeader>

        {payload ? (
          <div className="mt-6 space-y-6">
            <AddressPreview title="Remetente" address={payload.sender} />
            <AddressPreview title="Destinatário" address={payload.destiny} />

            <div className="space-y-2">
              <p className="text-sm font-medium">Itens · {payload.items.length}</p>
              <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
                {payload.items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-baseline justify-between gap-3 py-0.5"
                  >
                    <span className="truncate">
                      {item.quantity}× {item.name}
                    </span>
                    <span className="tabular-nums">
                      {item.weightGrams}g · {item.heightCm}×{item.widthCm}×
                      {item.lengthCm}cm
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label htmlFor="invoice-key">Chave da NFe (opcional)</Label>
              <Input
                id="invoice-key"
                placeholder="NFe35240..."
                value={invoiceKey}
                onChange={(e) => setInvoiceKey(e.target.value)}
              />
              <p className="text-xs text-muted-foreground">
                Você também pode anexar depois pela chave ou upload de XML.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observation">Observação (opcional)</Label>
              <Textarea
                id="observation"
                placeholder="Ex.: Entregar somente ao destinatário"
                value={observation}
                onChange={(e) => setObservation(e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={createShipment.isPending}>
                {createShipment.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                Criar envio
              </Button>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-muted-foreground">
            Não foi possível montar os dados do envio.
          </p>
        )}
      </SheetContent>
    </Sheet>
  )
}

function AddressPreview({
  title,
  address,
}: {
  title: string
  address: Pick<
    ShipmentAddress,
    "name" | "document" | "street" | "number" | "neighborhood" | "complement" | "zipCode"
  >
}) {
  return (
    <div className="space-y-1">
      <p className="text-sm font-medium">{title}</p>
      <div className="rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
        <p className="font-medium text-foreground">{address.name}</p>
        <p>Doc: {address.document}</p>
        <p>
          {address.street}, {address.number}
          {address.complement ? `, ${address.complement}` : ""}
        </p>
        <p>
          {address.neighborhood} · CEP {address.zipCode}
        </p>
      </div>
    </div>
  )
}

// Build the full POST /shipments payload. collectBlockers is run upstream,
// so any null guard here is only to satisfy the type checker.
function buildCreatePayload(order: OrderDetail): CreateShipmentPayload | null {
  if (!order.shipping || !order.customer || !order.shippingAddress) return null
  const { store } = order

  const sender: ShipmentAddress = {
    name: store.name,
    document: store.document,
    zipCode: store.address.zipCode,
    street: store.address.street,
    number: store.address.number,
    neighborhood: store.address.neighborhood,
    complement: store.address.complement || undefined,
    phone: store.phone || undefined,
    email: store.email || undefined,
  }

  const destiny: Omit<ShipmentAddress, "observation"> = {
    name: order.customer.name,
    document: order.customer.document,
    zipCode: order.shippingAddress.zipCode,
    street: order.shippingAddress.street,
    number: order.shippingAddress.number,
    neighborhood: order.shippingAddress.neighborhood,
    complement: order.shippingAddress.complement || undefined,
    phone: order.customer.phone || undefined,
    email: order.customer.email,
  }

  const items: ShipmentItemPayload[] = order.items.map((item) => ({
    id: item.id,
    name: item.productName,
    quantity: item.quantity,
    unitPriceCents: item.unitPrice,
    weightGrams: item.weightGrams,
    heightCm: item.heightCm,
    widthCm: item.widthCm,
    lengthCm: item.lengthCm,
  }))

  return {
    quoteServiceId: order.shipping.serviceId,
    externalOrderId: order.id,
    sender,
    destiny,
    items,
    volumeCount: 1,
  }
}

// --------------------------------------------------------------------------
// Shipment view: status, identifiers, actions, tracking timeline.
// --------------------------------------------------------------------------
interface ShipmentViewProps {
  order: OrderDetail
  shipment: Shipment
}

function ShipmentView({ order, shipment }: ShipmentViewProps) {
  const provider = shipment.provider as IntegrationProvider
  const [invoiceDialog, setInvoiceDialog] = useState(false)
  const [invoiceKey, setInvoiceKey] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const attachInvoice = useAttachInvoice(order.id)
  const uploadInvoiceXml = useUploadInvoiceXml(order.id)
  const generateLabels = useGenerateLabels()
  const fetchTracking = useFetchTracking(order.id)

  const bucket = shipmentStatusBucket(shipment.status)
  const styles = BUCKET_STYLE[bucket]
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(shipment.trackingCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleAttachInvoice = async () => {
    if (!invoiceKey.trim()) return
    try {
      await attachInvoice.mutateAsync({
        provider,
        shipmentId: shipment.id,
        payload: { invoiceKey: invoiceKey.trim() },
      })
      toast.success("NFe anexada")
      setInvoiceDialog(false)
      setInvoiceKey("")
    } catch (err) {
      toast.error((err as { message?: string })?.message || "Falha ao anexar NFe")
    }
  }

  const handleUploadXml = async (file: File) => {
    try {
      await uploadInvoiceXml.mutateAsync({
        provider,
        shipmentId: shipment.id,
        file,
      })
      toast.success("XML da NFe enviado")
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message || "Falha ao enviar XML"
      )
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = ""
    }
  }

  const handleGenerateLabels = async () => {
    try {
      const result = await generateLabels.mutateAsync({
        provider,
        payload: {
          providerOrderIds: [shipment.providerOrderId],
          format: "pdf",
          documentType: "label_integrated_danfe",
        },
      })
      if (result.labelUrl) {
        window.open(result.labelUrl, "_blank", "noopener,noreferrer")
        toast.success("Etiqueta gerada")
      } else {
        toast.error("Etiqueta gerada mas sem URL disponível")
      }
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message || "Falha ao gerar etiqueta"
      )
    }
  }

  const handleRefreshTracking = async () => {
    try {
      // Prefer providerOrderId (always persisted); others are fallback for
      // cases where we lost the provider id.
      await fetchTracking.mutateAsync({
        provider,
        payload: { providerOrderId: shipment.providerOrderId },
      })
    } catch (err) {
      toast.error(
        (err as { message?: string })?.message || "Falha ao atualizar rastreio"
      )
    }
  }

  const hasPublicTracking = shipment.publicTrackingUrl.length > 0

  return (
    <div className="space-y-5">
      {/* Status + identifiers */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <Badge
            variant="outline"
            className={cn("gap-1.5 font-medium", styles.badge)}
          >
            <span className={cn("h-1.5 w-1.5 rounded-full", styles.dot)} />
            {shipmentStatusLabel(shipment.status)}
          </Badge>
          <p className="text-xs text-muted-foreground">
            {providerLabel(provider)}
            {order.shipping && ` · ${order.shipping.serviceName}`}
            {" · "}
            Criado em {formatDateTime(shipment.createdAt)}
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefreshTracking}
          disabled={fetchTracking.isPending}
        >
          {fetchTracking.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
          )}
          Atualizar rastreio
        </Button>
      </div>

      <Separator />

      {/* Identifiers */}
      <div className="grid gap-3 sm:grid-cols-2">
        <IdentifierRow label="Código de rastreio">
          <span className="font-mono text-sm">{shipment.trackingCode}</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            onClick={handleCopy}
            aria-label="Copiar código"
          >
            {copied ? (
              <Check className="h-3 w-3 text-emerald-600" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        </IdentifierRow>
        <IdentifierRow label="Pedido no provedor">
          {hasPublicTracking ? (
            <a
              href={shipment.publicTrackingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              #{shipment.providerOrderNumber}
              <ExternalLink className="h-3 w-3" />
            </a>
          ) : (
            <span className="text-sm font-medium">
              #{shipment.providerOrderNumber}
            </span>
          )}
        </IdentifierRow>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setInvoiceDialog(true)}
        >
          <Tag className="mr-1.5 h-3.5 w-3.5" />
          Anexar NFe
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploadInvoiceXml.isPending}
        >
          {uploadInvoiceXml.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          Upload XML
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleGenerateLabels}
          disabled={generateLabels.isPending}
        >
          {generateLabels.isPending ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <FileText className="mr-1.5 h-3.5 w-3.5" />
          )}
          Gerar etiqueta
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xml"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleUploadXml(file)
          }}
        />
      </div>

      {/* Timeline */}
      <TrackingTimeline
        events={shipment.events}
        currentStatus={shipmentStatusLabel(shipment.status)}
        currentBucket={bucket}
      />

      {/* Attach NFe dialog */}
      <Dialog
        open={invoiceDialog}
        onOpenChange={(open) => {
          if (!open) setInvoiceDialog(false)
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Anexar NFe</DialogTitle>
            <DialogDescription>
              Informe a chave da NFe emitida (44 dígitos). A operação envia a
              chave para o provedor e vincula ao envio.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-4">
            <Label htmlFor="attach-invoice-key">
              Chave da NFe <span className="text-destructive">*</span>
            </Label>
            <Input
              id="attach-invoice-key"
              placeholder="NFe35240..."
              value={invoiceKey}
              onChange={(e) => setInvoiceKey(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setInvoiceDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleAttachInvoice}
              disabled={!invoiceKey.trim() || attachInvoice.isPending}
            >
              {attachInvoice.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Anexar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function IdentifierRow({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1 rounded-md border bg-muted/30 p-3">
      <span className="text-xs text-muted-foreground">{label}</span>
      <div className="flex items-center gap-1.5">{children}</div>
    </div>
  )
}

interface TrackingTimelineProps {
  events: ShipmentEvent[]
  currentStatus: string
  currentBucket: ShipmentStatusBucket
}

function TrackingTimeline({
  events,
  currentStatus,
  currentBucket,
}: TrackingTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="text-xs text-muted-foreground">
        Ainda sem eventos de rastreio. Clique em{" "}
        <strong>Atualizar rastreio</strong> para sincronizar com o provedor.
      </p>
    )
  }

  // Most recent event first — easiest to scan.
  const ordered = [...events].sort(
    (a, b) => new Date(b.eventAt).getTime() - new Date(a.eventAt).getTime()
  )

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Linha do tempo</p>
      <ol className="space-y-3 border-l pl-4">
        {ordered.map((ev, idx) => (
          <TimelineItem key={`${ev.eventAt}-${idx}`} event={ev} />
        ))}
      </ol>
      <p className="text-xs text-muted-foreground">
        Status atual: <strong>{currentStatus}</strong> ·{" "}
        {SHIPMENT_BUCKET_LABEL[currentBucket]}
      </p>
    </div>
  )
}

function TimelineItem({ event }: { event: ShipmentEvent }) {
  const bucket = shipmentStatusBucket(event.status)
  const styles = BUCKET_STYLE[bucket]
  return (
    <li className="relative pl-4">
      <span
        className={cn(
          "absolute -left-[0.4375rem] top-1.5 h-2 w-2 rounded-full ring-2 ring-background",
          styles.dot
        )}
      />
      <p className="text-sm font-medium">
        {event.rawName || shipmentStatusLabel(event.status)}
      </p>
      {event.observation && (
        <p className="text-xs text-muted-foreground">{event.observation}</p>
      )}
      <p className="text-xs text-muted-foreground">
        {formatDateTime(event.eventAt)}
      </p>
    </li>
  )
}

function providerLabel(provider: string): string {
  return PROVIDER_LABEL[provider] ?? provider
}
