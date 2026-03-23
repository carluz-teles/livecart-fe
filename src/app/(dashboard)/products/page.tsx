import { Plus } from "lucide-react"

export default function ProductsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie seu catalogo de produtos
          </p>
        </div>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Plus className="h-4 w-4" />
          Novo Produto
        </button>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Voce ainda nao tem nenhum produto
            </p>
            <button
              type="button"
              className="mt-2 text-sm font-medium text-primary hover:underline"
            >
              Adicionar primeiro produto
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
