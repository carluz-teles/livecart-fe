import Link from "next/link"
import { Construction } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ComingSoonProps {
  title?: string
  description?: string
  showBackButton?: boolean
  backHref?: string
  backLabel?: string
}

export function ComingSoon({
  title = "Em breve",
  description = "Esta página está em construção. Estamos trabalhando para trazer novidades em breve!",
  showBackButton = true,
  backHref = "/",
  backLabel = "Voltar ao início",
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10">
        <Construction className="h-10 w-10 text-primary" />
      </div>

      <h1 className="mt-6 text-2xl font-semibold tracking-tight">{title}</h1>

      <p className="mt-2 max-w-md text-muted-foreground">{description}</p>

      {showBackButton && (
        <Button asChild className="mt-6">
          <Link href={backHref}>{backLabel}</Link>
        </Button>
      )}
    </div>
  )
}
