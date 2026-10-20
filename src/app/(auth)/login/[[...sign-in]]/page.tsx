import type { Metadata } from "next"
import { SignIn } from "@clerk/nextjs"

import { safeRedirectPath } from "@/lib/redirect"

export const metadata: Metadata = {
  title: "Entrar | LiveCart",
  description: "Acesse sua conta de lojista na LiveCart para gerenciar produtos e pedidos das suas lives.",
  robots: { index: false, follow: true },
}

// forceRedirectUrl fixo em /dashboard descartava em silêncio o destino pedido —
// era assim que um convite se perdia quando o usuário precisava logar no meio
// do fluxo de aceite.
export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect_url?: string | string[] }>
}) {
  const { redirect_url } = await searchParams

  return (
    <SignIn
      routing="path"
      path="/login"
      signUpUrl="/register"
      forceRedirectUrl={safeRedirectPath(redirect_url) ?? "/dashboard"}
    />
  )
}
