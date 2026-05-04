import { Lightbulb } from "lucide-react"
import { Card } from "@/components/ui/card"

export function IdeaFeedEmpty() {
  return (
    <Card className="flex flex-col items-center justify-center gap-3 p-10 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Lightbulb className="h-6 w-6 text-primary" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm font-medium">Nenhuma ideia por aqui ainda.</p>
        <p className="text-sm text-muted-foreground mt-1">
          Compartilhe a primeira sugestão e abra a discussão com a equipe.
        </p>
      </div>
    </Card>
  )
}
