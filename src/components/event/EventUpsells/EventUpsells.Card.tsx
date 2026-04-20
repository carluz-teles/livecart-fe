"use client"

import { useState } from "react"
import { Trash2, Package, Percent, MessageSquare } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { formatCurrency } from "@/lib/format"
import { useUpdateUpsell, useRemoveUpsell } from "@/hooks/event"
import { useDebounce } from "@/hooks/shared"
import type { EventUpsell } from "@/types"
import { cn } from "@/lib/utils"
import { useEffect } from "react"

interface EventUpsellCardProps {
  upsell: EventUpsell
  eventId: string
}

export function EventUpsellCard({ upsell, eventId }: EventUpsellCardProps) {
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [editingField, setEditingField] = useState<"discount" | "message" | null>(null)
  const [localDiscount, setLocalDiscount] = useState<string>(upsell.discountPercent.toString())
  const [localMessage, setLocalMessage] = useState<string>(upsell.messageTemplate ?? "")

  const updateMutation = useUpdateUpsell(eventId)
  const removeMutation = useRemoveUpsell(eventId)

  const debouncedDiscount = useDebounce(localDiscount, 500)
  const debouncedMessage = useDebounce(localMessage, 500)

  // Handle debounced discount update
  useEffect(() => {
    if (editingField !== "discount") return

    const discount = parseInt(localDiscount, 10)
    if (isNaN(discount) || discount < 1 || discount > 99) return

    if (discount !== upsell.discountPercent) {
      updateMutation.mutate({
        upsellId: upsell.id,
        payload: { discountPercent: discount },
      })
    }
  }, [debouncedDiscount])

  // Handle debounced message update
  useEffect(() => {
    if (editingField !== "message") return

    const message = localMessage.trim() || null

    if (message !== upsell.messageTemplate) {
      updateMutation.mutate({
        upsellId: upsell.id,
        payload: { messageTemplate: message },
      })
    }
  }, [debouncedMessage])

  const handleToggleActive = (active: boolean) => {
    updateMutation.mutate({
      upsellId: upsell.id,
      payload: { active },
    })
  }

  const handleDelete = () => {
    removeMutation.mutate(upsell.id)
    setDeleteOpen(false)
  }

  const isPending = updateMutation.isPending

  return (
    <>
      <Card className={cn("p-4", isPending && "bg-primary/5")}>
        <div className="flex items-start gap-4">
          {upsell.imageUrl ? (
            <img
              src={upsell.imageUrl}
              alt={upsell.name}
              className="h-16 w-16 rounded object-cover flex-shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded bg-muted flex items-center justify-center flex-shrink-0">
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-medium truncate" title={upsell.name}>
                  {upsell.name}
                </p>
                <code className="text-xs bg-muted px-1.5 py-0.5 rounded font-mono">
                  {upsell.keyword}
                </code>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <Switch
                  checked={upsell.active}
                  onCheckedChange={handleToggleActive}
                  disabled={updateMutation.isPending}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDeleteOpen(true)}
                  disabled={removeMutation.isPending}
                >
                  <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                </Button>
              </div>
            </div>

            <div className="mt-3 flex items-center gap-4">
              <div className="text-sm">
                <span className="text-muted-foreground line-through">
                  {formatCurrency(upsell.originalPrice)}
                </span>
                <span className="ml-2 font-semibold text-green-600">
                  {formatCurrency(upsell.discountedPrice)}
                </span>
              </div>

              <div
                className="cursor-pointer"
                onClick={() => setEditingField("discount")}
              >
                {editingField === "discount" ? (
                  <div className="flex items-center gap-1">
                    <Input
                      autoFocus
                      type="number"
                      min="1"
                      max="99"
                      value={localDiscount}
                      onChange={(e) => setLocalDiscount(e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                      className="h-7 w-16"
                    />
                    <span className="text-sm text-muted-foreground">%</span>
                  </div>
                ) : (
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline">
                    <Percent className="h-3 w-3" />
                    {upsell.discountPercent}% off
                  </span>
                )}
              </div>
            </div>

            <div className="mt-2">
              <div
                className="cursor-pointer"
                onClick={() => setEditingField("message")}
              >
                {editingField === "message" ? (
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <Input
                      autoFocus
                      value={localMessage}
                      onChange={(e) => setLocalMessage(e.target.value)}
                      onBlur={() => setEditingField(null)}
                      onKeyDown={(e) => e.key === "Enter" && setEditingField(null)}
                      className="h-7 text-sm"
                      placeholder="Mensagem promocional..."
                    />
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic hover:underline">
                    {upsell.messageTemplate ? (
                      <>&ldquo;{upsell.messageTemplate}&rdquo;</>
                    ) : (
                      <span className="text-xs">Clique para adicionar mensagem</span>
                    )}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </Card>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover upsell</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja remover &ldquo;{upsell.name}&rdquo; dos upsells?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
