import {
  BarChart3,
  Gift,
  LayoutDashboard,
  MessageCircle,
  Radio,
  Ticket,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { TabsList, TabsTrigger } from "@/components/ui/tabs"

export function EventDetailNavigation({
  sessionCount,
  upsellCount,
}: {
  sessionCount: number
  upsellCount: number
}) {
  const tabs = [
    { value: "overview", label: "Visão geral", icon: LayoutDashboard },
    { value: "sessions", label: "Sessões", icon: Radio, count: sessionCount },
    { value: "comments", label: "Comentários", icon: MessageCircle },
    { value: "metrics", label: "Métricas", icon: BarChart3 },
    { value: "upsells", label: "Upsells", icon: Gift, count: upsellCount },
    { value: "coupons", label: "Cupons", icon: Ticket },
  ]

  return (
    <div className="min-w-0 overflow-x-auto border-b">
      <TabsList
        aria-label="Seções do evento"
        className="h-auto w-max min-w-full justify-start gap-1 rounded-none bg-transparent p-0"
      >
        {tabs.map(({ value, label, icon: Icon, count }) => (
          <TabsTrigger
            key={value}
            value={value}
            className="relative min-h-12 gap-2 rounded-none border-b-2 border-transparent px-3 py-3 data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none sm:px-4"
          >
            <Icon className="size-4" aria-hidden />
            {label}
            {count !== undefined && count > 0 && (
              <Badge variant="secondary">{count}</Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>
    </div>
  )
}
