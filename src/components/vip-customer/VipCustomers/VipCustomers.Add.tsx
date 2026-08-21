"use client"

import { useState } from "react"
import { Crown, Loader2, Plus } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { useAddVip } from "@/hooks/customer"

// Adiciona um @ à lista VIP. Input direto (o lojista sabe quem quer promover),
// com o @ prefixado visualmente como no resto do produto.
export function VipCustomersAdd() {
  const [handle, setHandle] = useState("")
  const addVip = useAddVip()

  const submit = () => {
    const clean = handle.trim().replace(/^@/, "")
    if (!clean) return
    addVip.mutate(
      { handle: clean },
      {
        onSuccess: (vip) => {
          const n = vip.cartsUpdated ?? 0
          toast.success(`@${vip.handle} agora é VIP`, {
            description:
              n > 0
                ? `${n} carrinho${n > 1 ? "s" : ""} em aberto ${n > 1 ? "viraram" : "virou"} eterno${n > 1 ? "s" : ""}.`
                : "O carrinho dele nunca vai expirar.",
          })
          setHandle("")
        },
        onError: (e) =>
          toast.error("Não foi possível adicionar", {
            description: e instanceof Error ? e.message : "Tente novamente.",
          }),
      },
    )
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              @
            </span>
            <Input
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && submit()}
              placeholder="usuario_do_instagram"
              className="pl-7"
              aria-label="Arroba do cliente VIP"
            />
          </div>
          <Button onClick={submit} disabled={addVip.isPending || !handle.trim()} className="gap-2">
            {addVip.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Plus className="h-4 w-4" />
            )}
            Adicionar VIP
          </Button>
        </div>
        <p className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Crown className="h-3.5 w-3.5 text-amber-500" />
          Digite o @ do cliente. Ele pode estar em maiúsculas ou minúsculas.
        </p>
      </CardContent>
    </Card>
  )
}
