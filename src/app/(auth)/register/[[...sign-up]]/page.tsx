import type { Metadata } from "next"
import { SignUp } from "@clerk/nextjs"

import { safeRedirectPath } from "@/lib/redirect"

export const metadata: Metadata = {
  title: "Criar conta | LiveCart",
  description: "Crie sua conta de lojista na LiveCart para organizar os pedidos das suas lives no Instagram.",
  robots: { index: false, follow: true },
}

// Mesmo motivo do login: preservar o ?redirect_url= é o que mantém o convite
// vivo quando o cadastro acontece no meio do fluxo de aceite.
export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>
}) {
  const { redirect_url } = await searchParams

  return (
    <SignUp
      routing="path"
      path="/register"
      signInUrl="/login"
      forceRedirectUrl={safeRedirectPath(redirect_url) ?? "/dashboard"}
    />
  )
}
