import { getPublicCheckoutCart } from "@/lib/checkout-server"
import { getPublicCatalog } from "@/lib/catalog-server"
import { CatalogClient } from "./CatalogClient"

interface PageProps {
  params: Promise<{ token: string }>
}

function CatalogMessageScreen({
  title,
  message,
}: {
  title: string
  message: string
}) {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "'Inter',system-ui,sans-serif",
        background: "hsl(210 20% 98.0392%)",
      }}
    >
      <div
        style={{
          maxWidth: "420px",
          textAlign: "center",
          background: "#fff",
          border: "1px solid #f3f4f6",
          borderRadius: "12px",
          boxShadow: "0 12px 30px -18px rgba(0,0,0,.25)",
          padding: "40px 32px",
        }}
      >
        <h1
          style={{
            margin: "0 0 8px",
            fontSize: "20px",
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: "hsl(0 0% 14.9020%)",
          }}
        >
          {title}
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: "14px",
            color: "hsl(220 8.9362% 46.0784%)",
            lineHeight: 1.5,
          }}
        >
          {message}
        </p>
      </div>
    </div>
  )
}

export default async function CartCatalogPage({ params }: PageProps) {
  const { token } = await params

  // Mirror the checkout page: fetch the real cart server-side by token to get
  // the cart + its event id. The catalog is scoped to the cart's event — there
  // is no anonymous cart here, the buyer always arrives from an existing cart.
  const { cart, errorMessage: cartError } = await getPublicCheckoutCart(token)

  if (!cart) {
    return (
      <CatalogMessageScreen
        title="Carrinho indisponível"
        message={cartError || "Carrinho não encontrado"}
      />
    )
  }

  const eventId = cart.event.id
  const { catalog, errorMessage: catalogError } = await getPublicCatalog(
    eventId
  )

  if (!catalog) {
    return (
      <CatalogMessageScreen
        title="Catálogo indisponível"
        message={catalogError || "Catálogo não encontrado"}
      />
    )
  }

  if (!catalog.products || catalog.products.length === 0) {
    return (
      <CatalogMessageScreen
        title={catalog.name}
        message="Nenhum produto disponível neste catálogo por enquanto. Volte durante a live."
      />
    )
  }

  return (
    <CatalogClient
      token={token}
      eventId={eventId}
      initialCatalog={catalog}
      initialCart={cart}
    />
  )
}
