"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Menu, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navLinks = [
  { label: "Como funciona", href: "/demonstracao" },
  { label: "Integrações", href: "/integracoes" },
  { label: "Recursos", href: "/recursos" },
  { label: "Guias", href: "/guias" },
  { label: "Preços", href: "/precos" },
]

export function LandingNav({ isSignedIn = false }: { isSignedIn?: boolean }) {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center" aria-label="LiveCart">
          <Image
            src="/livecart/logotipo-header.png"
            alt="LiveCart"
            width={190}
            height={51}
            priority
            className="h-8 w-auto"
          />
        </Link>

        <div className="hidden items-center gap-5 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-2 lg:flex">
          {isSignedIn ? (
            <Button asChild>
              <Link href="/dashboard">Ir para o dashboard</Link>
            </Button>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login" prefetch={false}>Entrar</Link>
              </Button>
              <Button asChild>
                <Link href="/register" prefetch={false}>Começar grátis</Link>
              </Button>
            </>
          )}
        </div>

        <button
          className="inline-flex h-10 w-10 items-center justify-center rounded-md text-foreground lg:hidden"
          onClick={() => setOpen((v) => !v)}
          aria-label="Menu"
          aria-expanded={open}
          aria-controls="mobile-navigation"
        >
          {open ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </nav>

      <div
        id="mobile-navigation"
        hidden={!open}
        className={cn(
          "overflow-hidden border-t border-border/60 bg-background lg:hidden",
          open ? "max-h-96" : "max-h-0 border-t-0"
        )}
      >
        <div className="flex flex-col gap-1 px-4 py-3">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              {link.label}
            </Link>
          ))}
          <div className="mt-2 flex flex-col gap-2">
            {isSignedIn ? (
              <Button asChild>
                <Link href="/dashboard">Ir para o dashboard</Link>
              </Button>
            ) : (
              <>
                <Button variant="outline" asChild>
                  <Link href="/login" prefetch={false}>Entrar</Link>
                </Button>
                <Button asChild>
                  <Link href="/register" prefetch={false}>Começar grátis</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
