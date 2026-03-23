import Link from "next/link"

export default function RegisterPage() {
  return (
    <div className="rounded-lg border bg-card p-6 shadow-sm">
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">Criar conta</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Comece a vender mais nas suas lives
        </p>
      </div>

      {/* Clerk SignUp will be added here */}
      <div className="flex h-40 items-center justify-center rounded-md border border-dashed">
        <p className="text-sm text-muted-foreground">Clerk SignUp Component</p>
      </div>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Ja tem uma conta?{" "}
        <Link href="/login" className="font-medium text-primary hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  )
}
