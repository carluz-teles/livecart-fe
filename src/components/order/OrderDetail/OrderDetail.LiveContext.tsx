"use client"

import { use } from "react"
import { MessageCircle, Radio } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { formatTime } from "@/lib/format"
import { OrderDetailContext } from "./OrderDetailContext"

export function OrderDetailLiveContext() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  const platformLabel =
    order.livePlatform === "instagram"
      ? "Instagram"
      : order.livePlatform.charAt(0).toUpperCase() + order.livePlatform.slice(1)

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Radio className="h-4 w-4" />
          Live de origem
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div>
          <p className="font-medium">{order.liveTitle || "Sem título"}</p>
          <p className="text-xs text-muted-foreground">{platformLabel}</p>
        </div>

        <div className="flex items-center gap-2 border-t pt-2 text-xs font-medium text-muted-foreground">
          <MessageCircle className="h-3.5 w-3.5" />
          Comentários do cliente ({order.comments?.length ?? 0})
        </div>

        {order.comments && order.comments.length > 0 ? (
          <ScrollArea className="h-[280px] pr-4">
            <ol className="space-y-2">
              {order.comments.map((comment) => (
                <li
                  key={comment.id}
                  className="rounded-md bg-muted/40 px-3 py-2"
                >
                  <p className="text-sm leading-snug">{comment.text}</p>
                  <p className="mt-1 font-mono text-[10px] uppercase tracking-wide text-muted-foreground">
                    {formatTime(comment.createdAt)}
                  </p>
                </li>
              ))}
            </ol>
          </ScrollArea>
        ) : (
          <p className="py-4 text-center text-xs text-muted-foreground">
            Nenhum comentário registrado nesta live
          </p>
        )}
      </CardContent>
    </Card>
  )
}
