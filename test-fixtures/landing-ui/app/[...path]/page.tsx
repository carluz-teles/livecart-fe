"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export default function NonLandingPage() {
  const pathname = usePathname()
  const [ready, setReady] = useState(false)
  useEffect(() => setReady(true), [])

  return (
    <main>
      <h1>Página fora da landing</h1>
      <output data-testid="route" data-ready={ready}>{pathname}</output>
      <Link href="/">Voltar à landing</Link>
      <Link href="/cart/checkout-test">Ir ao checkout</Link>
    </main>
  )
}
