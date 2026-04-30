import Link from "next/link"
import { Button } from "@/components/ui/button"

interface Props {
  message?: string
}

export function OrderDetailNotFound({ message }: Props) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 py-12">
      <p className="text-destructive">{message ?? "Erro ao carregar pedido"}</p>
      <Button variant="outline" asChild>
        <Link href="/orders">Voltar para pedidos</Link>
      </Button>
    </div>
  )
}
