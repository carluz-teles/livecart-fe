import Link from "next/link"
import { ArrowLeft } from "lucide-react"

interface ProductDetailPageProps {
  params: { id: string }
}

export default function ProductDetailPage({ params }: ProductDetailPageProps) {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-4">
        <Link
          href="/products"
          className="flex h-9 w-9 items-center justify-center rounded-lg border transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Produto #{params.id}
          </h1>
          <p className="text-sm text-muted-foreground">
            Edite as informacoes do produto
          </p>
        </div>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex h-64 items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">
            ProductForm
          </p>
        </div>
      </div>
    </div>
  )
}
