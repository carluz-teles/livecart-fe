"use client"

import { useState } from "react"
import { AlertCircle, Plus } from "lucide-react"

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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import {
  useCoupons,
  useCreateCoupon,
  useDeleteCoupon,
  useUpdateCoupon,
} from "@/hooks/coupon"
import type { Coupon, CreateCouponPayload, UpdateCouponPayload } from "@/types"

import { EventCouponsEmpty } from "./EventCoupons.Empty"
import { EventCouponsForm } from "./EventCoupons.Form"
import { EventCouponsList } from "./EventCoupons.List"

interface EventCouponsProps {
  eventId: string
}

export function EventCoupons({ eventId }: EventCouponsProps) {
  const { data: coupons, isLoading, error, refetch } = useCoupons(eventId)
  const createCoupon = useCreateCoupon(eventId)
  const updateCoupon = useUpdateCoupon(eventId)
  const deleteCoupon = useDeleteCoupon(eventId)

  const [formOpen, setFormOpen] = useState(false)
  const [editing, setEditing] = useState<Coupon | null>(null)
  const [pendingDelete, setPendingDelete] = useState<Coupon | null>(null)

  const handleCreate = (payload: CreateCouponPayload) => {
    createCoupon.mutate(payload, {
      onSuccess: () => {
        setFormOpen(false)
      },
    })
  }

  const handleUpdate = (payload: UpdateCouponPayload) => {
    if (!editing) return
    updateCoupon.mutate(
      { couponId: editing.id, payload },
      {
        onSuccess: () => {
          setFormOpen(false)
          setEditing(null)
        },
      },
    )
  }

  const handleEdit = (coupon: Coupon) => {
    setEditing(coupon)
    setFormOpen(true)
  }

  const handleToggleActive = (coupon: Coupon) => {
    updateCoupon.mutate({
      couponId: coupon.id,
      payload: { active: !coupon.active },
    })
  }

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return
    deleteCoupon.mutate(pendingDelete.id, {
      onSuccess: () => setPendingDelete(null),
    })
  }

  const handleNew = () => {
    setEditing(null)
    setFormOpen(true)
  }

  const list = coupons ?? []
  const hasCoupons = list.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="flex items-center gap-2 text-base">
                Cupons da live
              </CardTitle>
              <CardDescription>
                {hasCoupons
                  ? `${list.length} ${list.length === 1 ? "cupom" : "cupons"} criado${list.length === 1 ? "" : "s"} para esta live.`
                  : "Crie códigos promocionais que valem só durante esta transmissão."}
              </CardDescription>
            </div>
            {hasCoupons && (
              <Button onClick={handleNew} size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Novo cupom
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2" aria-live="polite" aria-busy="true">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : error ? (
            <div
              role="alert"
              className="flex flex-col items-center gap-3 rounded-md border border-destructive/30 bg-destructive/5 px-4 py-10 text-center"
            >
              <AlertCircle
                className="h-5 w-5 text-destructive"
                aria-hidden="true"
              />
              <p className="text-sm font-medium text-destructive">
                Não foi possível carregar os cupons
              </p>
              <p className="max-w-md text-xs text-muted-foreground">
                Verifique sua conexão e tente novamente.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => refetch()}
              >
                Tentar de novo
              </Button>
            </div>
          ) : hasCoupons ? (
            <EventCouponsList
              coupons={list}
              onEdit={handleEdit}
              onToggleActive={handleToggleActive}
              onDelete={(c) => setPendingDelete(c)}
              isMutating={updateCoupon.isPending || deleteCoupon.isPending}
            />
          ) : (
            <EventCouponsEmpty onCreate={handleNew} />
          )}
        </CardContent>
      </Card>

      <EventCouponsForm
        open={formOpen}
        onOpenChange={(next) => {
          setFormOpen(next)
          if (!next) setEditing(null)
        }}
        coupon={editing}
        isPending={createCoupon.isPending || updateCoupon.isPending}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      <AlertDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Excluir cupom{" "}
              <span className="font-mono" translate="no">
                {pendingDelete?.code}
              </span>
              ?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Cupons já usados em pedidos não podem ser excluídos —
              desative-os nesse caso. Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteCoupon.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteCoupon.isPending ? "Excluindo…" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

EventCoupons.List = EventCouponsList
EventCoupons.Empty = EventCouponsEmpty
EventCoupons.Form = EventCouponsForm
