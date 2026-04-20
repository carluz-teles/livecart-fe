"use client"

import { useState, useEffect, useRef } from "react"
import { Clock, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"

interface CheckoutExpirationTimerProps {
  expiresAt: string | null
  onExpired?: () => void
  className?: string
}

type UrgencyLevel = "normal" | "warning" | "critical" | "expired"

function getUrgencyLevel(difference: number): UrgencyLevel {
  if (difference <= 0) return "expired"
  if (difference < 2 * 60 * 1000) return "critical" // < 2 minutes
  if (difference < 5 * 60 * 1000) return "warning" // < 5 minutes
  return "normal"
}

const urgencyStyles: Record<UrgencyLevel, {
  container: string
  icon: string
  text: string
  time: string
  progress: string
}> = {
  normal: {
    container: "border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100/50",
    icon: "text-gray-400",
    text: "text-gray-500",
    time: "text-gray-900",
    progress: "bg-gray-200",
  },
  warning: {
    container: "border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50",
    icon: "text-amber-500",
    text: "text-amber-700",
    time: "text-amber-900",
    progress: "bg-gradient-to-r from-amber-400 to-orange-400",
  },
  critical: {
    container: "border-red-200 bg-gradient-to-r from-red-50 to-rose-50 animate-pulse",
    icon: "text-red-500",
    text: "text-red-700",
    time: "text-red-900",
    progress: "bg-gradient-to-r from-red-500 to-rose-500",
  },
  expired: {
    container: "border-red-300 bg-gradient-to-r from-red-100 to-rose-100",
    icon: "text-red-600",
    text: "text-red-800",
    time: "text-red-900",
    progress: "bg-red-500",
  },
}

export function CheckoutExpirationTimer({
  expiresAt,
  onExpired,
  className,
}: CheckoutExpirationTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{
    hours: number
    minutes: number
    seconds: number
    totalMs: number
    urgency: UrgencyLevel
  } | null>(null)

  const [initialDuration, setInitialDuration] = useState<number | null>(null)

  const onExpiredRef = useRef(onExpired)
  useEffect(() => {
    onExpiredRef.current = onExpired
  }, [onExpired])

  const hasExpiredRef = useRef(false)

  useEffect(() => {
    if (!expiresAt) return

    hasExpiredRef.current = false

    const calculateTimeLeft = () => {
      const now = new Date().getTime()
      const expiration = new Date(expiresAt).getTime()
      const difference = expiration - now

      // Set initial duration on first calculation
      if (initialDuration === null && difference > 0) {
        setInitialDuration(difference)
      }

      const urgency = getUrgencyLevel(difference)

      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0, totalMs: 0, urgency: "expired" })
        if (!hasExpiredRef.current) {
          hasExpiredRef.current = true
          onExpiredRef.current?.()
        }
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds, totalMs: difference, urgency })
    }

    calculateTimeLeft()
    const interval = setInterval(calculateTimeLeft, 1000)

    return () => clearInterval(interval)
  }, [expiresAt, initialDuration])

  if (!expiresAt || !timeLeft) return null

  const styles = urgencyStyles[timeLeft.urgency]

  // Calculate progress percentage
  const progressPercent = initialDuration
    ? Math.max(0, Math.min(100, (timeLeft.totalMs / initialDuration) * 100))
    : 100

  if (timeLeft.urgency === "expired") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-xl border-2 px-4 py-3",
          styles.container,
          className
        )}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </div>
          <div>
            <p className="font-semibold text-red-800">Carrinho expirado</p>
            <p className="text-sm text-red-600">O tempo para finalizar a compra acabou</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl border px-4 py-3 transition-all duration-500",
        styles.container,
        className
      )}
    >
      {/* Progress bar background */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-100">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            styles.progress
          )}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Animated clock icon */}
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full transition-colors duration-300",
              timeLeft.urgency === "critical"
                ? "bg-red-100"
                : timeLeft.urgency === "warning"
                ? "bg-amber-100"
                : "bg-gray-100"
            )}
          >
            <Clock className={cn("h-5 w-5", styles.icon)} />
          </div>

          <div>
            <p className={cn("text-sm font-medium", styles.text)}>
              {timeLeft.urgency === "critical"
                ? "Finalize agora!"
                : timeLeft.urgency === "warning"
                ? "Tempo acabando"
                : "Tempo restante"}
            </p>
          </div>
        </div>

        {/* Timer display */}
        <div className="flex items-center gap-1">
          {timeLeft.hours > 0 && (
            <>
              <TimeUnit value={timeLeft.hours} urgency={timeLeft.urgency} />
              <span className={cn("text-lg font-bold", styles.time)}>:</span>
            </>
          )}
          <TimeUnit value={timeLeft.minutes} urgency={timeLeft.urgency} />
          <span className={cn("text-lg font-bold", styles.time)}>:</span>
          <TimeUnit value={timeLeft.seconds} urgency={timeLeft.urgency} />
        </div>
      </div>
    </div>
  )
}

// Separate component for animated time units
function TimeUnit({ value, urgency }: { value: number; urgency: UrgencyLevel }) {
  const formatted = value.toString().padStart(2, "0")

  return (
    <div
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-lg font-mono text-lg font-bold tabular-nums transition-all duration-300",
        urgency === "critical"
          ? "bg-red-100 text-red-900"
          : urgency === "warning"
          ? "bg-amber-100 text-amber-900"
          : "bg-white text-gray-900 shadow-sm"
      )}
    >
      {formatted}
    </div>
  )
}
