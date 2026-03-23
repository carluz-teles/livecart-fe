"use client"

import { Bell, Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { cn } from "@/lib/utils"

export function Header() {
  const { theme, setTheme } = useTheme()

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div />

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Alternar tema</span>
        </button>

        <button
          type="button"
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
            "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          )}
        >
          <Bell className="h-5 w-5" />
          <span className="sr-only">Notificacoes</span>
        </button>

        <div className="ml-2 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
          U
        </div>
      </div>
    </header>
  )
}
