"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard,
  Radio,
  Calendar,
  Package,
  ShoppingCart,
  Settings,
  MessageSquare,
  HelpCircle,
  Building2,
  Users,
  FileText,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useUser } from "@/hooks/useUser"
import { Skeleton } from "@/components/ui/skeleton"

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
  external?: boolean
}

interface NavSection {
  title: string
  items: NavItem[]
}

const navSections: NavSection[] = [
  {
    title: "Geral",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Eventos", href: "/events", icon: Calendar },
      { name: "Produtos", href: "/products", icon: Package },
      { name: "Pedidos", href: "/orders", icon: ShoppingCart },
      { name: "Clientes", href: "/customers", icon: Users },
    ],
  },
  {
    title: "Outros",
    items: [
      { name: "Configurações", href: "/settings/account", icon: Settings },
      { name: "Documentação", href: "/docs", icon: FileText },
    ],
  },
]

const supportItems: NavItem[] = [
  { name: "Feedback", href: "mailto:feedback@livecart.app", icon: MessageSquare, external: true },
  { name: "Suporte", href: "mailto:suporte@livecart.app", icon: HelpCircle, external: true },
]

export function Sidebar() {
  const pathname = usePathname()
  const { user, isLoading } = useUser()

  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-sidebar">
      {/* Organization Header */}
      <div className="flex h-16 items-center gap-3 border-b px-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
          <Building2 className="h-5 w-5 text-primary" />
        </div>
        <div className="flex flex-col">
          {isLoading ? (
            <>
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-1 h-3 w-16" />
            </>
          ) : (
            <>
              <span className="text-sm font-semibold truncate max-w-[140px]">
                {user?.membership?.storeName || "Minha Loja"}
              </span>
              <span className="text-xs text-muted-foreground">LiveCart</span>
            </>
          )}
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <div className="space-y-6">
          {navSections.map((section) => (
            <div key={section.title}>
              {/* Section Title */}
              <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </p>

              {/* Section Items */}
              <div className="space-y-1">
                {section.items.map((item) => {
                  const isActive =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href))

                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.name}
                    </Link>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Footer - Support Links */}
      <div className="border-t p-4">
        <div className="space-y-1">
          {supportItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target={item.external ? "_blank" : undefined}
              rel={item.external ? "noopener noreferrer" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.name}
            </a>
          ))}
        </div>
      </div>
    </aside>
  )
}
