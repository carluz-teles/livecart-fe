"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import {
  Radio,
  ShoppingCart,
  TrendingUp,
  Zap,
  Shield,
  BarChart3,
} from "lucide-react"

const features = [
  {
    icon: Radio,
    title: "Lives Automatizadas",
    description: "Capture pedidos automaticamente durante suas transmissões",
  },
  {
    icon: ShoppingCart,
    title: "Checkout Integrado",
    description: "Carrinho e pagamento em um só lugar para seus clientes",
  },
  {
    icon: TrendingUp,
    title: "Analytics em Tempo Real",
    description: "Acompanhe conversões e métricas enquanto vende",
  },
]

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLogin = pathname?.includes("login")

  return (
    <div className="flex min-h-screen">
      {/* Left Panel - Branding */}
      <div className="relative hidden w-1/2 overflow-hidden lg:block">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />

        {/* Animated mesh gradient */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute -left-1/4 -top-1/4 h-[600px] w-[600px] animate-pulse rounded-full bg-gradient-to-r from-violet-600/40 to-fuchsia-600/40 blur-3xl" />
          <div className="absolute -bottom-1/4 -right-1/4 h-[500px] w-[500px] animate-pulse rounded-full bg-gradient-to-r from-cyan-600/30 to-blue-600/30 blur-3xl" style={{ animationDelay: "1s" }} />
          <div className="absolute left-1/3 top-1/2 h-[400px] w-[400px] animate-pulse rounded-full bg-gradient-to-r from-emerald-600/20 to-teal-600/20 blur-3xl" style={{ animationDelay: "2s" }} />
        </div>

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 flex h-full flex-col justify-between p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-600 shadow-lg shadow-violet-500/25">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">
              LiveCart
            </span>
          </div>

          {/* Main content */}
          <div className="space-y-12">
            {/* Headline */}
            <div className="max-w-lg space-y-4">
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-white">
                Transforme suas lives em{" "}
                <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                  máquinas de vendas
                </span>
              </h1>
              <p className="text-lg leading-relaxed text-slate-400">
                A plataforma que automatiza a captura de pedidos durante suas transmissões ao vivo. Simples, rápido e poderoso.
              </p>
            </div>

            {/* Features */}
            <div className="space-y-4">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group flex items-start gap-4 rounded-2xl border border-white/5 bg-white/[0.02] p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/10 hover:bg-white/[0.04]"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/10 to-fuchsia-500/10 text-violet-400 transition-transform duration-300 group-hover:scale-110">
                    <feature.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium text-white">{feature.title}</h3>
                    <p className="text-sm text-slate-500">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span>Dados protegidos</span>
            </div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span>Analytics inclusos</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="relative flex w-full flex-col lg:w-1/2">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-slate-900" />

        {/* Mobile logo */}
        <div className="relative z-10 flex items-center justify-between p-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-fuchsia-600">
              <Zap className="h-4 w-4 text-white" />
            </div>
            <span className="font-semibold">LiveCart</span>
          </Link>
        </div>

        {/* Desktop header */}
        <div className="relative z-10 hidden items-center justify-end p-6 lg:flex">
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
            <Link
              href={isLogin ? "/register" : "/login"}
              className="font-medium text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300"
            >
              {isLogin ? "Criar conta" : "Fazer login"}
            </Link>
          </p>
        </div>

        {/* Form container */}
        <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pb-12 lg:px-12">
          <div className="w-full max-w-sm space-y-8">
            {/* Header text */}
            <div className="space-y-2 text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {isLogin ? "Bem-vindo de volta" : "Crie sua conta"}
              </h2>
              <p className="text-sm text-muted-foreground">
                {isLogin
                  ? "Entre para acessar seu painel de vendas"
                  : "Comece a vender mais em suas lives hoje"}
              </p>
            </div>

            {/* Clerk form */}
            <div className="[&_.cl-card]:border-0 [&_.cl-card]:bg-transparent [&_.cl-card]:shadow-none [&_.cl-footer]:hidden [&_.cl-headerSubtitle]:hidden [&_.cl-headerTitle]:hidden [&_.cl-internal-b3fm6y]:hidden">
              {children}
            </div>

            {/* Mobile link */}
            <p className="text-center text-sm text-muted-foreground lg:hidden">
              {isLogin ? "Não tem uma conta?" : "Já tem uma conta?"}{" "}
              <Link
                href={isLogin ? "/register" : "/login"}
                className="font-medium text-violet-600 hover:text-violet-700"
              >
                {isLogin ? "Criar conta" : "Fazer login"}
              </Link>
            </p>
          </div>
        </div>

        {/* Trust badges */}
        <div className="relative z-10 flex items-center justify-center gap-6 border-t border-border/50 p-6 text-xs text-muted-foreground">
          <span>LGPD Compliant</span>
          <span className="h-1 w-1 rounded-full bg-border" />
          <span>Suporte 24/7</span>
        </div>
      </div>
    </div>
  )
}
