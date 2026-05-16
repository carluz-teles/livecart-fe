"use client"

import { useState } from "react"
import {
  Ban,
  Copy,
  Instagram,
  Mail,
  MessageCircle,
  Phone as PhoneIcon,
} from "lucide-react"
import { toast } from "sonner"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import { useBlockedHandle } from "@/hooks/customer"
import { formatDate, toWhatsAppDigits } from "@/lib/format"
import type { Customer } from "@/types/customer.types"
import { CustomerDetailBlockAction } from "./CustomerDetail.BlockAction"

interface CustomerDetailHeroProps {
  customer: Customer | undefined
  isLoading: boolean
}

function initials(handle: string) {
  return handle.slice(0, 2).toUpperCase()
}

interface QuickActionProps {
  label: string
  icon: React.ReactNode
  href?: string
  onClick?: () => void
  disabled?: boolean
  variant?: "default" | "whatsapp"
}

function QuickAction({ label, icon, href, onClick, disabled, variant }: QuickActionProps) {
  const className = [
    "inline-flex h-9 w-9 items-center justify-center rounded-full border transition-all",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    disabled
      ? "cursor-not-allowed border-border/60 bg-muted/30 text-muted-foreground/40"
      : variant === "whatsapp"
        ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white hover:shadow-lg hover:shadow-emerald-500/20"
        : "border-border bg-background text-foreground hover:bg-accent hover:border-foreground/30",
  ].join(" ")

  const inner = (
    <Tooltip>
      <TooltipTrigger asChild>
        {href && !disabled ? (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={className}
            aria-label={label}
          >
            {icon}
          </a>
        ) : (
          <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            className={className}
            aria-label={label}
          >
            {icon}
          </button>
        )}
      </TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">
        {label}
      </TooltipContent>
    </Tooltip>
  )
  return inner
}

export function CustomerDetailHero({ customer, isLoading }: CustomerDetailHeroProps) {
  const blocked = useBlockedHandle(customer?.handle)
  const [copied, setCopied] = useState<string | null>(null)

  if (isLoading || !customer) {
    return (
      <div className="relative overflow-hidden rounded-2xl border bg-card p-6">
        <div className="flex items-start gap-4">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex flex-1 flex-col gap-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-36" />
          </div>
        </div>
        <div className="mt-5 flex gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-9 w-9 rounded-full" />
          ))}
        </div>
      </div>
    )
  }

  const displayName = customer.name?.trim()
  const whatsAppDigits = toWhatsAppDigits(customer.phone)
  const whatsAppHref = whatsAppDigits ? `https://wa.me/${whatsAppDigits}` : undefined
  const instagramHref = `https://ig.me/m/${customer.handle}`
  const mailtoHref = customer.email ? `mailto:${customer.email}` : undefined

  const copyToClipboard = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(label)
      toast.success(`${label} copiado`)
      setTimeout(() => setCopied(null), 1500)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="relative overflow-hidden rounded-2xl border bg-card">
        {/* Subtle gradient stripe for premium dossier feel */}
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-24 bg-gradient-to-br from-primary/10 via-primary/[0.04] to-transparent"
        />
        {/* Decorative grid pattern */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,1) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative p-6">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-start gap-4">
              <Avatar
                className={[
                  "h-16 w-16 ring-2",
                  blocked
                    ? "ring-destructive/40"
                    : "ring-primary/30 ring-offset-2 ring-offset-card",
                ].join(" ")}
              >
                <AvatarFallback
                  className={[
                    "text-xl font-semibold tracking-tight",
                    blocked
                      ? "bg-destructive/10 text-destructive"
                      : "bg-primary/10 text-primary",
                  ].join(" ")}
                >
                  {initials(customer.handle)}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1 space-y-1.5">
                {displayName && (
                  <p className="text-base font-medium leading-tight tracking-tight">
                    {displayName}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-mono text-xl font-semibold leading-none tracking-tight">
                    @{customer.handle}
                  </h2>
                  {blocked && (
                    <Badge variant="destructive" className="gap-1 text-[10px] uppercase tracking-wide">
                      <Ban className="h-3 w-3" />
                      Bloqueado
                    </Badge>
                  )}
                </div>
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {customer.firstOrderAt ? (
                    <>Cliente desde {formatDate(customer.firstOrderAt)}</>
                  ) : (
                    "Novo cliente — sem compras"
                  )}
                </p>
                {blocked?.reason && (
                  <p className="mt-1 max-w-md rounded-md border border-destructive/30 bg-destructive/5 px-2 py-1 text-xs italic text-destructive">
                    {blocked.reason}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Quick action toolbar */}
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <QuickAction
              label={whatsAppHref ? "Chamar no WhatsApp" : "Sem telefone cadastrado"}
              icon={<MessageCircle className="h-4 w-4" />}
              href={whatsAppHref}
              disabled={!whatsAppHref}
              variant="whatsapp"
            />
            <QuickAction
              label="Abrir DM no Instagram"
              icon={<Instagram className="h-4 w-4" />}
              href={instagramHref}
            />
            <QuickAction
              label={mailtoHref ? "Enviar email" : "Sem email cadastrado"}
              icon={<Mail className="h-4 w-4" />}
              href={mailtoHref}
              disabled={!mailtoHref}
            />
            <QuickAction
              label={customer.phone ? "Copiar telefone" : "Sem telefone"}
              icon={
                copied === "Telefone" ? (
                  <Copy className="h-4 w-4 text-emerald-500" />
                ) : (
                  <PhoneIcon className="h-4 w-4" />
                )
              }
              onClick={() =>
                customer.phone && copyToClipboard(customer.phone, "Telefone")
              }
              disabled={!customer.phone}
            />

            <span className="mx-1 h-6 w-px bg-border" aria-hidden />

            <CustomerDetailBlockAction customer={customer} />
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
