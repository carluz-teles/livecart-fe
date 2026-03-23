export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Visao geral das suas vendas e lives
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Stats cards placeholder */}
        {["Vendas Hoje", "Lives Ativas", "Pedidos Pendentes", "Faturamento Mes"].map(
          (title) => (
            <div
              key={title}
              className="rounded-lg border bg-card p-6"
            >
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
              <p className="mt-2 text-3xl font-semibold tracking-tight">--</p>
            </div>
          )
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Lives Recentes</h2>
          <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              Nenhuma live recente
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card p-6">
          <h2 className="text-lg font-semibold">Ultimos Pedidos</h2>
          <div className="mt-4 flex h-48 items-center justify-center rounded-md border border-dashed">
            <p className="text-sm text-muted-foreground">
              Nenhum pedido recente
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
