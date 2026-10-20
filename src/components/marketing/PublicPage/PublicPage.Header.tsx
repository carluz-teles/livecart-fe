import Link from "next/link"

interface PublicPageHeaderProps { eyebrow: string; title: string; description: string; status?: string }

export function PublicPageHeader({ eyebrow, title, description, status }: PublicPageHeaderProps) {
  return <header className="border-b bg-secondary/40 py-14 sm:py-20">
    <div className="mx-auto max-w-6xl px-4 sm:px-6">
      <Link href="/" className="text-sm text-muted-foreground underline underline-offset-4">LiveCart / Início</Link>
      <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-foreground">{eyebrow}</p>
      {status && <p className="mt-3 inline-block rounded-full border border-border bg-background px-3 py-1 text-sm font-medium">{status}</p>}
      <h1 className="mt-4 max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
      <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground">{description}</p>
    </div>
  </header>
}
