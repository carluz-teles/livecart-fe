import dynamic from "next/dynamic"
import { CheckoutPaidScreen } from "@/components/checkout/CheckoutPaidScreen"
import { CheckoutExpiredScreen } from "@/components/checkout/CheckoutExpiredScreen"
import { CheckoutErrorScreen } from "@/components/checkout/CheckoutErrorScreen"
import { getPublicCheckoutCart } from "@/lib/checkout-server"
import { getCheckoutDiagnosticContext } from "@/lib/checkout-diagnostics-server"
import { CheckoutDiagnostics } from "@/components/checkout/CheckoutDiagnostics"

// CheckoutClient pulls in react-hook-form, zod, Radix Label and the
// payment widgets (~40 KiB). Lazy-loading it means shoppers returning to
// a paid/expired cart never download that bundle — only the active
// checkout path pays for it.
const CheckoutClient = dynamic(
  () => import("./CheckoutClient").then((m) => m.CheckoutClient)
)

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { token } = await params
  const diagnostic = getCheckoutDiagnosticContext(token)
  const render = (content: React.ReactNode, mode: "server" | "interactive" | "error" = "server") => (
    <CheckoutDiagnostics {...diagnostic} mode={mode}>
      {content}
    </CheckoutDiagnostics>
  )

  const { cart, errorMessage } = await getPublicCheckoutCart(token)

  if (!cart) {
    return render(
      <CheckoutErrorScreen
        message={errorMessage || "Carrinho não encontrado"}
        retryHref={`/cart/${token}`}
        supportReference={diagnostic.attemptId.slice(0, 8)}
      />, "error"
    )
  }

  // Terminal states render fully on the server — no client JS needed for the
  // shopper to see "Pagamento Confirmado" or "Carrinho Expirado". This is a
  // big LCP win for the most common post-checkout return path.
  if (cart.paymentStatus === "paid") {
    return render(<CheckoutPaidScreen cart={cart} />)
  }

  if (cart.status === "expired") {
    return render(<CheckoutExpiredScreen cart={cart} />)
  }

  if (cart.status !== "checkout" && cart.status !== "active") {
    return render(
      <CheckoutErrorScreen message="Este carrinho não está disponível para pagamento." />
    )
  }

  // Active checkout: hand off to the interactive client with the cart already
  // populated as React Query initialData (no client-side refetch on mount).
  return render(<CheckoutClient token={token} initialCart={cart} />, "interactive")
}
