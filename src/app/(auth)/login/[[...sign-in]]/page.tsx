import { SignIn } from "@clerk/nextjs"

import { safeRedirectPath } from "@/lib/redirect"

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
