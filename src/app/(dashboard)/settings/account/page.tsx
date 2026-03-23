export default function AccountSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Minha Conta</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas informacoes pessoais
        </p>
      </div>

      <div className="rounded-lg border bg-card p-6">
        <div className="flex h-48 items-center justify-center rounded-md border border-dashed">
          <p className="text-sm text-muted-foreground">
            Formulario de conta
          </p>
        </div>
      </div>
    </div>
  )
}
