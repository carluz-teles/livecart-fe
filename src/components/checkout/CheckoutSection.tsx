"use client"

import { useEffect, useState } from "react"
import { Check, ChevronDown } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface CheckoutSectionProps {
  number: number
  title: string
  icon: React.ElementType
  isComplete?: boolean
  isActive?: boolean
  isCollapsible?: boolean
  defaultOpen?: boolean
  children: React.ReactNode
  className?: string
  delay?: number
}

export function CheckoutSection({
  number,
  title,
  icon: Icon,
  isComplete = false,
  isActive = true,
  isCollapsible = false,
  defaultOpen = true,
  children,
  className,
  delay = 0,
}: CheckoutSectionProps) {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(defaultOpen)

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), delay)
    return () => clearTimeout(timer)
  }, [delay])

  const Header = (
    <div className="flex items-center gap-4">
      {/* Number badge with transition effects */}
      <div className="relative">
        {/* Glow effect for active state */}
        {isActive && !isComplete && (
          <div className="absolute -inset-1 animate-pulse rounded-full bg-primary/20 blur-sm" />
        )}

        <div
          className={cn(
            "relative flex h-10 w-10 items-center justify-center rounded-full text-sm font-semibold transition-all duration-500",
            isComplete
              ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/30"
              : isActive
              ? "bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-lg shadow-gray-400/30"
              : "bg-gray-100 text-gray-600"
          )}
        >
          <span
            className={cn(
              "transition-all duration-300",
              isComplete ? "scale-0 opacity-0" : "scale-100 opacity-100"
            )}
          >
            {number}
          </span>
          <Check
            className={cn(
              "absolute h-5 w-5 transition-all duration-300",
              isComplete ? "scale-100 opacity-100" : "scale-0 opacity-0"
            )}
          />
        </div>
      </div>

      {/* Icon and title with refined typography */}
      <div className="flex flex-1 items-center gap-3">
        <Icon
          className={cn(
            "h-5 w-5 transition-colors duration-300",
            isComplete
              ? "text-emerald-500"
              : isActive
              ? "text-gray-700"
              : "text-gray-300"
          )}
        />
        <h2
          className={cn(
            "text-lg font-semibold tracking-tight transition-colors duration-300",
            isComplete
              ? "text-emerald-700"
              : isActive
              ? "text-gray-900"
              : "text-gray-500"
          )}
        >
          {title}
        </h2>
      </div>

      {/* Completion indicator with animation */}
      {isComplete && (
        <span className="flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-600">
          <Check className="h-3.5 w-3.5" />
          Completo
        </span>
      )}

      {/* Collapse chevron */}
      {isCollapsible && (
        <ChevronDown
          className={cn(
            "h-5 w-5 text-gray-400 transition-transform duration-300",
            isOpen && "rotate-180"
          )}
        />
      )}
    </div>
  )

  const Content = (
    <div
      className={cn(
        "pt-6 transition-opacity duration-300",
        !isActive && "opacity-50 pointer-events-none"
      )}
    >
      {children}
    </div>
  )

  if (isCollapsible) {
    return (
      <Card
        className={cn(
          "overflow-hidden border-gray-100 shadow-sm transition-all duration-700",
          mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
          isActive && "shadow-md shadow-gray-100",
          className
        )}
      >
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <CardContent className="pt-6">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="flex w-full cursor-pointer items-center text-left hover:opacity-80 transition-opacity"
              >
                {Header}
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              {Content}
            </CollapsibleContent>
          </CardContent>
        </Collapsible>
      </Card>
    )
  }

  return (
    <Card
      className={cn(
        "overflow-hidden border-gray-100 transition-all duration-700",
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        isActive && "shadow-md shadow-gray-100/80",
        !isActive && "bg-gray-50/50",
        className
      )}
    >
      <CardContent className="pt-6">
        {Header}
        {Content}
      </CardContent>
    </Card>
  )
}
