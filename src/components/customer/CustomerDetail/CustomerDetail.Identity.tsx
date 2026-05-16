"use client"

import { useState } from "react"
import { Copy, FileText, Mail, Phone as PhoneIcon, User } from "lucide-react"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { formatDocument, formatPhoneBR } from "@/lib/format"
import type { Customer } from "@/types/customer.types"

interface CustomerDetailIdentityProps {
  customer: Customer
}

interface FieldProps {
  icon: React.ReactNode
  label: string
  value: string | null | undefined
  copyValue?: string
  placeholder?: string
  mono?: boolean
}

function Field({ icon, label, value, copyValue, placeholder = "—", mono }: FieldProps) {
  const [copied, setCopied] = useState(false)
  const display = value?.trim()
  const empty = !display

  const handleCopy = async () => {
    if (!copyValue && !display) return
    try {
      await navigator.clipboard.writeText(copyValue ?? display ?? "")
      setCopied(true)
      toast.success(`${label} copiado`)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      toast.error("Não foi possível copiar")
    }
  }

  return (
    <div
      className={cn(
        "group flex items-start gap-3 rounded-lg border bg-background/40 px-3 py-2.5 transition-colors",
        !empty && "hover:bg-background/80",
      )}
    >
      <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <p
          className={cn(
            "mt-0.5 break-words text-sm leading-snug",
            mono && "font-mono",
            empty && "italic text-muted-foreground/60",
          )}
        >
          {display ?? placeholder}
        </p>
      </div>
      {!empty && (
        <button
          type="button"
          onClick={handleCopy}
          aria-label={`Copiar ${label.toLowerCase()}`}
          className={cn(
            "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground/60 transition-all",
            "opacity-0 group-hover:opacity-100 hover:bg-accent hover:text-foreground",
            "focus:opacity-100 focus:bg-accent",
            copied && "opacity-100 bg-emerald-500/10 text-emerald-500",
          )}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}

export function CustomerDetailIdentity({ customer }: CustomerDetailIdentityProps) {
  const phoneDisplay = customer.phone ? formatPhoneBR(customer.phone) : null
  const docDisplay = customer.document ? formatDocument(customer.document) : null

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold tracking-tight">Identidade</h3>
        <span className="text-[10px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
          dados de checkout
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <Field
          icon={<User className="h-4 w-4" />}
          label="Nome"
          value={customer.name}
          placeholder="Não preenchido"
        />
        <Field
          icon={<FileText className="h-4 w-4" />}
          label="CPF/CNPJ"
          value={docDisplay}
          copyValue={customer.document ?? undefined}
          placeholder="Não preenchido"
          mono
        />
        <Field
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={customer.email}
          placeholder="Não preenchido"
        />
        <Field
          icon={<PhoneIcon className="h-4 w-4" />}
          label="Telefone"
          value={phoneDisplay}
          copyValue={customer.phone ?? undefined}
          placeholder="Não preenchido"
          mono
        />
      </div>
    </section>
  )
}
