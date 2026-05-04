"use client"

import { type ReactNode } from "react"
import { type LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface StatsCardProps {
  title: string
  value: ReactNode
  description?: string
  icon?: LucideIcon
  trend?: {
    value: number
    label: string
  }
  isLoading?: boolean
  variant?: "default" | "success" | "warning" | "danger" | "info"
  className?: string
  // Override the value's typography (size, tracking, family). Useful when a
  // dashboard wants display-style numbers without changing the shared
  // component default for every caller.
  valueClassName?: string
}

const variantStyles = {
  default: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-rose-600 dark:text-rose-400",
  },
  success: {
    iconBg: "bg-emerald-100 dark:bg-emerald-950",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-rose-600 dark:text-rose-400",
  },
  warning: {
    iconBg: "bg-amber-100 dark:bg-amber-950",
    iconColor: "text-amber-600 dark:text-amber-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-rose-600 dark:text-rose-400",
  },
  danger: {
    iconBg: "bg-rose-100 dark:bg-rose-950",
    iconColor: "text-rose-600 dark:text-rose-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-rose-600 dark:text-rose-400",
  },
  info: {
    iconBg: "bg-blue-100 dark:bg-blue-950",
    iconColor: "text-blue-600 dark:text-blue-400",
    trendPositive: "text-emerald-600 dark:text-emerald-400",
    trendNegative: "text-rose-600 dark:text-rose-400",
  },
}

export function StatsCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  isLoading = false,
  variant = "default",
  className,
  valueClassName,
}: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card
      className={cn(
        "group relative overflow-hidden transition-all duration-300",
        "hover:shadow-lg hover:shadow-primary/5",
        "hover:-translate-y-0.5",
        "border-border/50 hover:border-border",
        className
      )}
    >
      {/* Subtle gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg transition-transform duration-300 group-hover:scale-110",
              styles.iconBg
            )}
          >
            <Icon className={cn("h-4 w-4", styles.iconColor)} />
          </div>
        )}
      </CardHeader>

      <CardContent className="relative">
        <div className="flex items-baseline gap-2">
          {isLoading ? (
            <Skeleton className="h-8 w-24" />
          ) : (
            <span
              className={cn(
                "text-2xl font-bold tracking-tight",
                valueClassName,
              )}
            >
              {value}
            </span>
          )}
          {trend && !isLoading && (
            <span
              className={cn(
                "text-xs font-medium",
                trend.value >= 0 ? styles.trendPositive : styles.trendNegative
              )}
            >
              {trend.value >= 0 ? "+" : ""}
              {trend.value}%
            </span>
          )}
        </div>
        {description && (
          <p className="mt-1 text-xs text-muted-foreground">{description}</p>
        )}
        {trend && !isLoading && (
          <p className="mt-0.5 text-[10px] text-muted-foreground/70">
            {trend.label}
          </p>
        )}
      </CardContent>
    </Card>
  )
}
