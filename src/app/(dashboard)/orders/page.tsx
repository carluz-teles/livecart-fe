export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Pedidos</h1>
        <p className="text-sm text-muted-foreground">
          Acompanhe e gerencie os pedidos das suas lives
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <div className="flex h-64 items-center justify-center">
          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              Nenhum pedido encontrado
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
