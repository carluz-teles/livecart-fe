"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { User, Building2, Users, Puzzle, CreditCard, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import { Separator } from "@/components/ui/separator"

const settingsNav = [
  {
    title: "Conta",
    href: "/settings/account",
    icon: User,
    description: "Gerencie suas informações pessoais",
  },
  {
    title: "Organização",
    href: "/settings/organization",
    icon: Building2,
    description: "Informações e configurações da loja",
  },
  {
    title: "Checkout",
    href: "/settings/checkout",
    icon: CreditCard,
    description: "Carrinho e finalização de compra",
  },
  {
    title: "Equipe",
    href: "/settings/team",
    icon: Users,
    description: "Gerencie os membros da sua equipe",
  },
  {
    title: "Integrações",
    href: "/settings/integrations",
    icon: Puzzle,
    description: "Conecte com outras plataformas",
  },
  {
    title: "Plano e cobrança",
    href: "/settings/billing",
    icon: Wallet,
    description: "Assinatura, faturas e mudança de plano",
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Configurações</h1>
        <p className="text-sm text-muted-foreground">
          Gerencie suas preferências e configurações da conta
        </p>
      </div>

      <Separator />

      {/* Settings Content */}
      <div className="flex flex-col gap-8 lg:flex-row">
        {/* Settings Sidebar */}
        <aside className="lg:w-64">
          <nav className="flex flex-col gap-1">
            {settingsNav.map((item) => {
              const isActive = pathname === item.href

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Page Content */}
        <div className="flex-1 lg:max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
