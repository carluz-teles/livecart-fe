import { CheckoutPaidScreen } from "@/components/checkout/CheckoutPaidScreen"
import { CheckoutExpiredScreen } from "@/components/checkout/CheckoutExpiredScreen"
import { CheckoutErrorScreen } from "@/components/checkout/CheckoutErrorScreen"
import { getPublicCheckoutCart } from "@/lib/checkout-server"
import { CheckoutClient } from "./CheckoutClient"

interface PageProps {
  params: Promise<{ token: string }>
}

export default async function CheckoutPage({ params }: PageProps) {
  const { token } = await params

  const { cart, errorMessage } = await getPublicCheckoutCart(token)

  if (!cart) {
    return (
      <CheckoutErrorScreen
        message={errorMessage || "Carrinho não encontrado"}
        retryHref={`/cart/${token}`}
      />
    )
  }

  // Terminal states render fully on the server — no client JS needed for the
  // shopper to see "Pagamento Confirmado" or "Carrinho Expirado". This is a
  // big LCP win for the most common post-checkout return path.
  if (cart.paymentStatus === "paid") {
    return <CheckoutPaidScreen cart={cart} />
  }

  if (cart.status === "expired") {
    return <CheckoutExpiredScreen cart={cart} />
  }

  if (cart.status !== "checkout" && cart.status !== "active") {
    return (
      <CheckoutErrorScreen message="Este carrinho não está disponível para pagamento." />
    )
  }

  // Active checkout: hand off to the interactive client with the cart already
  // populated as React Query initialData (no client-side refetch on mount).
  return <CheckoutClient token={token} initialCart={cart} />
}
