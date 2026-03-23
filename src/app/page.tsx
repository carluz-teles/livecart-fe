import Link from "next/link"

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-8 p-8">
      <div className="text-center">
        <h1 className="text-4xl font-semibold tracking-tight">LiveCart</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Venda mais nas suas lives
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Entrar
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-input bg-background px-6 py-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
        >
          Criar conta
        </Link>
      </div>
    </main>
  )
}
