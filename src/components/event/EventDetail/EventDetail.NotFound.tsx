import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

interface Props {
  message?: string
}

export function EventDetailNotFound({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-destructive">{message ?? "Erro ao carregar evento"}</p>
      <Button variant="outline" asChild>
        <Link href="/events">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para eventos
        </Link>
      </Button>
    </div>
  )
}
