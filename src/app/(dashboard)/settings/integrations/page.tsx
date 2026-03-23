export default function IntegrationsSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Integracoes</h1>
        <p className="text-sm text-muted-foreground">
          Conecte suas contas e sistemas externos
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {["Instagram", "Bling", "Tiny", "Shopify"].map((integration) => (
          <div key={integration} className="rounded-lg border bg-card p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{integration}</h3>
                <p className="text-sm text-muted-foreground">Nao conectado</p>
              </div>
              <button
                type="button"
                className="rounded-lg border px-4 py-2 text-sm font-medium transition-colors hover:bg-accent"
              >
                Conectar
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
