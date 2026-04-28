import Link from "next/link"
import { AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface CheckoutErrorScreenProps {
  message: string
  retryHref?: string
}

export function CheckoutErrorScreen({ message, retryHref }: CheckoutErrorScreenProps) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md border-gray-100 shadow-xl shadow-gray-100/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="mt-6 text-xl font-semibold text-gray-900">Erro ao carregar</h2>
            <p className="mt-2 text-center text-sm text-gray-500 max-w-xs">{message}</p>
            {retryHref && (
              <Button asChild variant="outline" className="mt-6">
                <Link href={retryHref}>Tentar novamente</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
