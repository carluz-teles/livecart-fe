import Link from "next/link"

const benefits = [
  { title: "Pedidos por código", text: "O produto certo a partir do código divulgado na live.", href: "/guias/pedidos-por-codigo" },
  { title: "Tiny e Bling", text: "Catálogo e pedidos conectados ao ERP da sua loja.", href: "/integracoes" },
  { title: "Fechamento depois da live", text: "Carrinhos por cliente e prazos alinhados à sua operação.", href: "/recursos/fechamento-pos-live" },
]

export function LandingSocialProofSection() {
  return <section aria-label="Conheça a operação" className="border-b bg-background py-10 sm:py-14">
    <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:px-6 md:grid-cols-3">{benefits.map((item) => <Link key={item.title} href={item.href} className="rounded-xl border p-6 transition-colors hover:bg-secondary/40"><h2 className="text-lg font-semibold">{item.title}</h2><p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.text}</p><span className="mt-4 block text-sm font-medium underline underline-offset-4">Entenda o fluxo</span></Link>)}</div>
  </section>
}
