interface CartPageProps {
  params: { token: string }
}

export default function CartPage({ params }: CartPageProps) {
  return (
    <main className="min-h-screen bg-surface-secondary">
      <div className="mx-auto max-w-2xl p-4 py-8">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-semibold tracking-tight">Seu Carrinho</h1>
          <p className="text-sm text-muted-foreground">
            Revise os itens e finalize sua compra
          </p>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              CartSummary - Token: {params.token}
            </p>
          </div>
        </div>

        <div className="mt-6 rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Dados para Entrega</h2>
          <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              CartCheckout.Form
            </p>
          </div>
        </div>
      </div>
    </main>
  )
}
