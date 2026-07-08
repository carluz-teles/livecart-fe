"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser, useClerk } from "@clerk/nextjs"
import { Moon, Sun, LogOut, User, Settings, ChevronsUpDown } from "lucide-react"
import { NotificationsBell } from "@/components/notification/NotificationsBell"
import { useTheme } from "next-themes"

import { isDarkModeAllowed } from "@/lib/env"

import { Button } from "@/components/ui/button"
import { OnboardingChecklist } from "@/components/shared/OnboardingChecklist"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

function getInitials(name: string | null | undefined) {
  if (!name) return "U"
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function Header() {
  const { theme, setTheme } = useTheme()
  const { user, isLoaded } = useUser()
  const { signOut } = useClerk()
  const router = useRouter()

  const handleSignOut = () => {
    signOut(() => router.push("/login"))
  }

  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-6">
      <div />

      <div className="flex items-center gap-2">
        {/* Theme Toggle */}
        {isDarkModeAllowed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="text-muted-foreground"
          >
            <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
            <span className="sr-only">Alternar tema</span>
          </Button>
        )}

        {/* Notifications */}
        <NotificationsBell />

        {/* Onboarding Checklist */}
        <OnboardingChecklist.Trigger />

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              className="ml-2 flex items-center gap-2 px-2"
            >
              <Avatar className="h-8 w-8">
                <AvatarImage src={user?.imageUrl} alt={user?.fullName || "Avatar"} />
                <AvatarFallback className="text-xs">
                  {getInitials(user?.fullName)}
                </AvatarFallback>
              </Avatar>
              {isLoaded && user && (
                <div className="hidden flex-col items-start text-left md:flex">
                  <span className="text-sm font-medium">{user.fullName}</span>
                  <span className="text-xs text-muted-foreground">
                    {user.primaryEmailAddress?.emailAddress}
                  </span>
                </div>
              )}
              <ChevronsUpDown className="ml-1 h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">
                  {user?.fullName || "Usuário"}
                </p>
                <p className="text-xs leading-none text-muted-foreground">
                  {user?.primaryEmailAddress?.emailAddress}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/settings/account">
                  <User className="mr-2 h-4 w-4" />
                  Minha Conta
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings/organization">
                  <Settings className="mr-2 h-4 w-4" />
                  Configurações
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Sair
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
