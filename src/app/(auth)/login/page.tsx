import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Entrar</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bem-vindo de volta ao LiveCart
        </p>
      </div>

      {/* Clerk SignIn will be added here */}
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">Clerk SignIn Component</p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ainda nao tem conta?{" "}
        <Link href="/register" className="font-medium text-primary hover:underline">
          Criar conta
        </Link>
      </p>
    </div>
  )
}
