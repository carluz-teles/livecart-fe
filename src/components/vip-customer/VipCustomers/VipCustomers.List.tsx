"use client"

import { useState } from "react"
import { Crown, Loader2, Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
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
import { useRemoveVip, useVipHandles } from "@/hooks/customer"
import { formatDate } from "@/lib/format"
import type { VipHandle } from "@/types"

export function VipCustomersList() {
  const { data, isLoading } = useVipHandles()
  const vips = data?.data ?? []

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Crown className="h-4 w-4 text-amber-500" />
          Clientes VIP
          {!isLoading && vips.length > 0 && (
            <span className="text-sm tabular-nums text-muted-foreground">{vips.length}</span>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-14 rounded-lg" />
            <Skeleton className="h-14 rounded-lg" />
          </div>
        ) : vips.length === 0 ? (
          <div className="rounded-lg border border-dashed p-6 text-center text-sm text-muted-foreground">
            Nenhum cliente VIP ainda. Adicione o @ de um cliente de confiança
            acima — o carrinho dele passa a nunca expirar.
          </div>
        ) : (
          <ul className="flex flex-col gap-2">
            {vips.map((vip) => (
              <VipRow key={vip.id} vip={vip} />
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

function VipRow({ vip }: { vip: VipHandle }) {
  const [confirm, setConfirm] = useState(false)
  const removeVip = useRemoveVip()

  return (
    <li className="flex items-center justify-between gap-3 rounded-lg border p-3">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-500/10">
          <Crown className="h-4 w-4 text-amber-500" />
        </div>
        <div className="min-w-0">
          <p className="truncate font-medium">@{vip.handle}</p>
          <p className="text-xs text-muted-foreground">VIP desde {formatDate(vip.addedAt)}</p>
        </div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() => setConfirm(true)}
        disabled={removeVip.isPending}
        aria-label={`Remover @${vip.handle} da lista VIP`}
      >
        {removeVip.isPending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
      </Button>

      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remover @{vip.handle} dos VIPs?</AlertDialogTitle>
            <AlertDialogDescription className="leading-relaxed">
              Novas compras dele voltam a criar um carrinho por evento, com prazo
              normal. Um carrinho eterno que ele já tenha em aberto continua
              eterno — a remoção não ressuscita a expiração de um carrinho vivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Voltar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() =>
                removeVip.mutate(vip.handle, {
                  onSuccess: () => toast.success(`@${vip.handle} não é mais VIP`),
                  onError: (e) =>
                    toast.error("Não foi possível remover", {
                      description: e instanceof Error ? e.message : "Tente novamente.",
                    }),
                })
              }
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remover VIP
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  )
}
