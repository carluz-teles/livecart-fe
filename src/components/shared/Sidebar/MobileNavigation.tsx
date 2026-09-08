"use client"

import { useEffect, useState } from "react"
import { Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetDescription,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Sidebar } from "."

export function MobileNavigation() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const desktop = window.matchMedia("(min-width: 1024px)")
    const closeOnDesktop = () => {
      if (desktop.matches) setOpen(false)
    }
    desktop.addEventListener("change", closeOnDesktop)
    return () => desktop.removeEventListener("change", closeOnDesktop)
  }, [])

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          aria-label="Abrir navegação"
        >
          <Menu />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-72 max-w-[calc(100vw-2rem)] p-0">
        <SheetTitle className="sr-only">Navegação da loja</SheetTitle>
        <SheetDescription className="sr-only">
          Acesse as áreas do LiveCart.
        </SheetDescription>
        <Sidebar
          onNavigate={() => setOpen(false)}
          className="w-full border-r-0"
        />
      </SheetContent>
    </Sheet>
  )
}
