"use client"

import { useState } from "react"
import { Eye, EyeOff } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type SecretInputProps = Omit<React.ComponentProps<typeof Input>, "type">

// Input de segredo com o toggle mostrar/ocultar clássico de senha. Usado em
// campos de credencial (client secrets, tokens, chaves de API).
export function SecretInput({ className, ...props }: SecretInputProps) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className={cn("pr-10", className)}
      />
      <Button
        type="button"
        variant="ghost"
        size="sm"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? "Ocultar valor" : "Mostrar valor"}
        className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 p-0 text-muted-foreground hover:text-foreground"
      >
        {visible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  )
}
