import Image from "next/image"
import Link from "next/link"

const columns = [
  {
    title: "Produto",
    links: [
      { label: "Como funciona", href: "#como-funciona" },
      { label: "Canais", href: "#canais" },
      { label: "Integrações", href: "#integracoes" },
      { label: "Preços", href: "#precos" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    title: "Conta",
    links: [
      { label: "Entrar", href: "/login" },
      { label: "Criar conta", href: "/register" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacidade", href: "/privacy" },
      { label: "Termos de uso", href: "/terms" },
    ],
  },
]

export function LandingFooter() {
  return (
    <footer className="bg-neutral-950 text-neutral-400">
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
        <div className="grid gap-10 md:grid-cols-[1.5fr_repeat(3,1fr)]">
          <div>
            <Image
              src="/livecart/logotipo-footer.png"
              alt="LiveCart"
              width={200}
              height={53}
              className="h-11 w-auto"
            />
            <p className="mt-4 max-w-xs text-sm">
              A infraestrutura de vendas para redes sociais. Transformamos
              conversas no Instagram e lives em pedidos, checkout e vendas,
              integrados à sua operação.
            </p>
          </div>

          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-white">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm transition-colors hover:text-white"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row">
          <p>© 2026 LiveCart. Todos os direitos reservados.</p>
        </div>
      </div>
    </footer>
  )
}
