"use client"

import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { usePublicCatalog } from "@/hooks/public/usePublicCatalog"
import {
  useCheckoutCart,
  useAddCartItem,
  useUpdateCartItemQuantity,
  useRemoveCartItem,
} from "@/hooks/checkout"
import type {
  PublicCatalog,
  PublicCatalogProduct,
} from "@/services/api/public-catalog.service"
import type { PublicCheckoutCart } from "@/types"
import { formatCurrency, getInitials } from "@/lib/format"

// The design ships a <style> block with CSS custom properties, hover
// transitions and keyframes. Porting it verbatim (scoped to this page) is the
// most faithful way to match the mockup 1:1.
const CATALOG_CSS = `
.catalog-page{
  --background:0 0% 100%;--foreground:0 0% 14.9020%;--card:0 0% 100%;
  --primary:37.6923 92.1260% 50.1961%;--primary-foreground:0 0% 0%;
  --secondary:220 14.2857% 95.8824%;--secondary-foreground:215 13.7931% 34.1176%;
  --muted:210 20% 98.0392%;--muted-foreground:220 8.9362% 46.0784%;
  --accent:48 100% 96.0784%;--accent-foreground:22.7273 82.5% 31.3725%;
  --border:220 13.0435% 90.9804%;--radius:0.375rem;
  --gray900:#111827;--gray50:#f9fafb;--gray100:#f3f4f6;
  --emerald500:#10b981;--emerald600:#059669;
  min-height:100vh;
  font-family:'Inter',system-ui,sans-serif;
  background:hsl(var(--muted));
  color:hsl(var(--foreground));
  text-wrap:pretty;
  -webkit-font-smoothing:antialiased;
}
.catalog-page *{box-sizing:border-box;}
.catalog-page .tnum{font-variant-numeric:tabular-nums;}
.catalog-page .pcard{transition:box-shadow .2s,border-color .2s,transform .2s;}
.catalog-page .pcard:hover{box-shadow:0 12px 30px -18px rgba(0,0,0,.35);border-color:hsl(var(--primary)/.4);transform:translateY(-2px);}
.catalog-page .pimg{transition:transform .3s ease;}
.catalog-page .pcard:hover .pimg{transform:scale(1.04);}
.catalog-page .btn-primary{background:hsl(var(--primary));color:hsl(var(--primary-foreground));transition:background .15s;cursor:pointer;}
.catalog-page .btn-primary:hover{background:hsl(var(--primary)/.9);}
.catalog-page .btn-primary:disabled{opacity:.5;pointer-events:none;}
.catalog-page .code-copy{transition:background .15s,transform .12s;cursor:pointer;}
.catalog-page .code-copy:hover{background:#000;}
.catalog-page .code-copy:active{transform:scale(.98);}
.catalog-page .qbtn{transition:background .15s;cursor:pointer;}
.catalog-page .qbtn:hover{background:var(--gray100);}
.catalog-page .qbtn:disabled{opacity:.4;pointer-events:none;}
.catalog-page .rmbtn{transition:color .15s,background .15s;cursor:pointer;color:#9ca3af;}
.catalog-page .rmbtn:hover{color:#ef4444;background:#fef2f2;}
@keyframes ping{75%,100%{transform:scale(2);opacity:0;}}
.catalog-page .livedot{animation:ping 1.4s cubic-bezier(0,0,.2,1) infinite;}
.catalog-page .cat-layout{display:grid;grid-template-columns:minmax(0,1fr) 360px;gap:32px;align-items:start;}
.catalog-page .summary-col{position:sticky;top:20px;}
@media(max-width:860px){
  .catalog-page .cat-layout{grid-template-columns:1fr;gap:20px;}
  .catalog-page .summary-col{order:-1;position:sticky;top:8px;z-index:20;}
  .catalog-page .summary-col>div{box-shadow:0 8px 24px -12px rgba(0,0,0,.35);}
}
@media(max-width:520px){
  .catalog-page .prod-grid{grid-template-columns:1fr 1fr !important;gap:12px !important;}
}
`

export function CatalogClient({
  token,
  eventId,
  initialCatalog,
  initialCart,
}: {
  token: string
  eventId: string
  initialCatalog: PublicCatalog
  initialCart: PublicCheckoutCart
}) {
  const router = useRouter()

  const { data: catalogData } = usePublicCatalog(eventId, initialCatalog)
  const catalog = catalogData ?? initialCatalog
  const products = catalog.products

  const { data: cart = initialCart } = useCheckoutCart(token, initialCart)

  const addItem = useAddCartItem()
  const updateItemQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  // Uma edição de carrinho por vez — mesma garantia do checkout: entre o clique
  // e o re-render que desabilita o botão cabe um segundo clique, e cada request
  // concorrente sobre o MESMO carrinho pode sobrescrever a resposta anterior.
  const cartEditInFlight =
    addItem.isPending ||
    updateItemQuantity.isPending ||
    removeItem.isPending

  const items = cart.items
  const empty = items.length === 0
  const totalItems = cart.summary.totalItems
  const subtotalFmt = formatCurrency(cart.summary.subtotal)
  const itemWord = totalItems === 1 ? "item" : "itens"
  const maxQty = cart.maxQuantityPerItem

  const storeName = initialCart.store.name

  const copyCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code)
      toast.success(`Código ${code} copiado!`)
    } catch {
      toast.error("Não foi possível copiar o código")
    }
  }

  const handleAdd = (product: PublicCatalogProduct) => {
    if (cartEditInFlight) return
    addItem.mutate({ token, productId: product.id, quantity: 1 })
  }

  const handleInc = (itemId: string, quantity: number) => {
    if (cartEditInFlight) return
    updateItemQuantity.mutate({ token, itemId, quantity: quantity + 1 })
  }

  const handleDec = (itemId: string, quantity: number) => {
    if (cartEditInFlight) return
    if (quantity <= 1) {
      removeItem.mutate({ token, itemId })
      return
    }
    updateItemQuantity.mutate({ token, itemId, quantity: quantity - 1 })
  }

  const handleRemove = (itemId: string) => {
    if (cartEditInFlight) return
    removeItem.mutate({ token, itemId })
  }

  const goCheckout = () => {
    if (empty) return
    router.push(`/cart/${token}`)
  }

  return (
    <div className="catalog-page">
      {/* eslint-disable-next-line react/no-danger */}
      <style dangerouslySetInnerHTML={{ __html: CATALOG_CSS }} />

      <div style={{ minHeight: "100vh" }}>
        {/* ===== HEADER (compartilhado) ===== */}
        <header
          style={{
            position: "relative",
            overflow: "hidden",
            borderBottom: "1px solid var(--gray100)",
            background: "hsl(var(--card))",
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to bottom,hsl(var(--muted)/.8),transparent)",
              pointerEvents: "none",
            }}
          />
          <div
            style={{
              position: "relative",
              maxWidth: "1152px",
              margin: "0 auto",
              padding: "32px 16px",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  right: "16px",
                  top: "4px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  background: "#ef4444",
                  color: "#fff",
                  borderRadius: "9999px",
                  padding: "6px 12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  boxShadow: "0 8px 20px -6px rgba(239,68,68,.5)",
                }}
              >
                <span
                  style={{
                    position: "relative",
                    display: "inline-flex",
                    width: "8px",
                    height: "8px",
                  }}
                >
                  <span
                    className="livedot"
                    style={{
                      position: "absolute",
                      inset: 0,
                      borderRadius: "9999px",
                      background: "#fca5a5",
                    }}
                  />
                  <span
                    style={{
                      position: "relative",
                      width: "8px",
                      height: "8px",
                      borderRadius: "9999px",
                      background: "#fff",
                    }}
                  />
                </span>
                Live em andamento
              </div>
              <div style={{ position: "relative" }}>
                <div
                  style={{
                    position: "absolute",
                    inset: "-4px",
                    borderRadius: "9999px",
                    background:
                      "linear-gradient(135deg,#e5e7eb,#fff,#f3f4f6)",
                    opacity: 0.8,
                  }}
                />
                <div
                  style={{
                    position: "relative",
                    display: "flex",
                    width: "80px",
                    height: "80px",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: "9999px",
                    background:
                      "linear-gradient(135deg,#1f2937,var(--gray900))",
                    fontSize: "28px",
                    fontWeight: 700,
                    color: "#fff",
                    boxShadow: "0 12px 30px -8px rgba(156,163,175,.6)",
                  }}
                >
                  {getInitials(storeName)}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    margin: 0,
                    fontSize: "20px",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    color: "hsl(var(--foreground))",
                  }}
                >
                  {storeName}
                </h1>
                <div
                  style={{
                    marginTop: "12px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    borderRadius: "9999px",
                    background: "hsl(var(--muted))",
                    padding: "6px 16px",
                  }}
                >
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "6px",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{
                        width: "16px",
                        height: "16px",
                        color: "var(--emerald500)",
                      }}
                    >
                      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>
                      Checkout Seguro
                    </span>
                  </span>
                  <span
                    style={{
                      width: "1px",
                      height: "12px",
                      background: "#e5e7eb",
                    }}
                  />
                  <span
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "hsl(var(--muted-foreground))",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "12px", height: "12px" }}
                    >
                      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    <span style={{ fontSize: "12px" }}>SSL</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* ============================ CATÁLOGO ============================ */}
        <main
          style={{
            maxWidth: "1152px",
            margin: "0 auto",
            padding: "32px 16px 64px",
          }}
        >
          <div style={{ marginBottom: "24px" }}>
            <h2
              style={{
                margin: 0,
                fontSize: "22px",
                fontWeight: 600,
                letterSpacing: "-0.02em",
              }}
            >
              Catálogo da live
            </h2>
            <p
              style={{
                margin: "6px 0 0",
                fontSize: "14px",
                color: "hsl(var(--muted-foreground))",
                maxWidth: "60ch",
              }}
            >
              Digite o código do produto no comentário durante a live para
              receber o carrinho na hora — ou adicione aqui e finalize no
              checkout seguro.
            </p>
          </div>
          <div className="cat-layout">
            <div
              className="prod-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill,minmax(210px,1fr))",
                gap: "20px",
              }}
            >
              {products.map((item) => (
                <div
                  key={item.id}
                  className="pcard"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: "8px",
                    border: "1px solid var(--gray100)",
                    background: "hsl(var(--card))",
                    boxShadow: "0 1px 2px rgba(0,0,0,.05)",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      position: "relative",
                      aspectRatio: "1 / 1",
                      overflow: "hidden",
                      background: "var(--gray50)",
                    }}
                  >
                    {item.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        className="pimg"
                        src={item.imageUrl}
                        alt={item.name}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                    ) : (
                      <div
                        className="pimg"
                        style={{
                          display: "flex",
                          width: "100%",
                          height: "100%",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#d1d5db",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ width: "40px", height: "40px" }}
                        >
                          <rect
                            width="18"
                            height="18"
                            x="3"
                            y="3"
                            rx="2"
                            ry="2"
                          />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "10px",
                      padding: "16px",
                      flex: 1,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "baseline",
                        justifyContent: "space-between",
                        gap: "10px",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          fontSize: "15px",
                          fontWeight: 600,
                          letterSpacing: "-0.01em",
                          color: "hsl(var(--foreground))",
                        }}
                      >
                        {item.name}
                      </h3>
                      <span
                        className="tnum"
                        style={{
                          fontSize: "15px",
                          fontWeight: 700,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {formatCurrency(item.price)}
                      </span>
                    </div>
                    <div
                      style={{
                        marginTop: "auto",
                        display: "flex",
                        flexDirection: "column",
                        gap: "4px",
                      }}
                    >
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 600,
                          letterSpacing: ".1em",
                          textTransform: "uppercase",
                          color: "hsl(var(--muted-foreground))",
                        }}
                      >
                        Código da live
                      </span>
                      <button
                        className="code-copy tnum"
                        onClick={() => copyCode(item.code)}
                        title="Copiar código"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          gap: "8px",
                          alignSelf: "flex-start",
                          background: "var(--gray900)",
                          color: "#fff",
                          border: 0,
                          borderRadius: "6px",
                          padding: "8px 12px",
                          fontFamily: "inherit",
                          fontSize: "14px",
                          fontWeight: 600,
                          letterSpacing: ".06em",
                        }}
                      >
                        <span>{item.code}</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ width: "14px", height: "14px", opacity: 0.7 }}
                        >
                          <rect
                            width="14"
                            height="14"
                            x="8"
                            y="8"
                            rx="2"
                            ry="2"
                          />
                          <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                        </svg>
                      </button>
                    </div>
                    <button
                      className="btn-primary"
                      onClick={() => handleAdd(item)}
                      disabled={cartEditInFlight}
                      style={{
                        marginTop: "4px",
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "8px",
                        border: 0,
                        borderRadius: "6px",
                        height: "40px",
                        fontFamily: "inherit",
                        fontSize: "14px",
                        fontWeight: 600,
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: "16px", height: "16px" }}
                      >
                        <path d="M5 12h14" />
                        <path d="M12 5v14" />
                      </svg>
                      Adicionar
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="summary-col">
              <div
                style={{
                  borderRadius: "8px",
                  border: "1px solid var(--gray100)",
                  background: "hsl(var(--card))",
                  boxShadow: "0 12px 30px -18px rgba(0,0,0,.25)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "20px 20px 16px",
                    borderBottom: "1px solid var(--gray100)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      width: "40px",
                      height: "40px",
                      alignItems: "center",
                      justifyContent: "center",
                      borderRadius: "8px",
                      background: "var(--gray900)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ width: "20px", height: "20px", color: "#fff" }}
                    >
                      <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                  </div>
                  <h2
                    style={{
                      margin: 0,
                      fontSize: "18px",
                      fontWeight: 600,
                      letterSpacing: "-0.01em",
                    }}
                  >
                    Resumo do Pedido
                  </h2>
                </div>
                <div style={{ padding: "16px 20px 20px" }}>
                  {empty ? (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        textAlign: "center",
                        gap: "10px",
                        padding: "24px 8px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          width: "52px",
                          height: "52px",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "9999px",
                          background: "hsl(var(--muted))",
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{
                            width: "24px",
                            height: "24px",
                            color: "#9ca3af",
                          }}
                        >
                          <circle cx="8" cy="21" r="1" />
                          <circle cx="19" cy="21" r="1" />
                          <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
                        </svg>
                      </div>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "14px",
                          fontWeight: 500,
                          color: "hsl(var(--foreground))",
                        }}
                      >
                        Seu carrinho está vazio
                      </p>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12.5px",
                          color: "hsl(var(--muted-foreground))",
                          maxWidth: "26ch",
                        }}
                      >
                        Toque em{" "}
                        <strong style={{ color: "hsl(var(--foreground))" }}>
                          Adicionar
                        </strong>{" "}
                        ou digite o código na live.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "2px",
                        }}
                      >
                        {items.map((ci) => {
                          const incDisabled =
                            cartEditInFlight ||
                            ci.quantity >= ci.availableStock ||
                            ci.quantity >= maxQty
                          return (
                            <div
                              key={ci.id}
                              style={{
                                display: "flex",
                                gap: "12px",
                                borderRadius: "12px",
                                padding: "10px 6px",
                              }}
                            >
                              <div style={{ position: "relative", flex: "none" }}>
                                <div
                                  style={{
                                    display: "flex",
                                    width: "56px",
                                    height: "56px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    overflow: "hidden",
                                    borderRadius: "12px",
                                    border: "1px solid var(--gray100)",
                                    background: "var(--gray50)",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{
                                      width: "22px",
                                      height: "22px",
                                      color: "#d1d5db",
                                    }}
                                  >
                                    <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
                                    <path d="M12 22V12" />
                                    <path d="m3.3 7 8.7 5 8.7-5" />
                                    <path d="m7.5 4.27 9 5.15" />
                                  </svg>
                                </div>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  flex: 1,
                                  flexDirection: "column",
                                  justifyContent: "center",
                                  minWidth: 0,
                                }}
                              >
                                <h3
                                  style={{
                                    margin: 0,
                                    fontSize: "13px",
                                    fontWeight: 500,
                                    color: "hsl(var(--foreground))",
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                  }}
                                >
                                  {ci.name}
                                </h3>
                                <p
                                  className="tnum"
                                  style={{
                                    margin: "1px 0 0",
                                    fontSize: "11px",
                                    color: "hsl(var(--muted-foreground))",
                                  }}
                                >
                                  {formatCurrency(ci.unitPrice)} cada
                                  {ci.keyword ? (
                                    <>
                                      {" · "}
                                      <span style={{ letterSpacing: ".04em" }}>
                                        {ci.keyword}
                                      </span>
                                    </>
                                  ) : null}
                                </p>
                              </div>
                              <div
                                style={{
                                  display: "flex",
                                  alignItems: "center",
                                  gap: "6px",
                                }}
                              >
                                <div
                                  style={{
                                    display: "flex",
                                    alignItems: "center",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    background: "#fff",
                                  }}
                                >
                                  <button
                                    className="qbtn"
                                    onClick={() =>
                                      handleDec(ci.id, ci.quantity)
                                    }
                                    disabled={cartEditInFlight}
                                    aria-label="Diminuir"
                                    style={{
                                      display: "flex",
                                      width: "30px",
                                      height: "30px",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: 0,
                                      background: "transparent",
                                      borderRadius: "8px 0 0 8px",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      style={{ width: "12px", height: "12px" }}
                                    >
                                      <path d="M5 12h14" />
                                    </svg>
                                  </button>
                                  <span
                                    className="tnum"
                                    style={{
                                      width: "28px",
                                      textAlign: "center",
                                      fontSize: "13px",
                                      fontWeight: 600,
                                    }}
                                  >
                                    {ci.quantity}
                                  </span>
                                  <button
                                    className="qbtn"
                                    onClick={() =>
                                      handleInc(ci.id, ci.quantity)
                                    }
                                    disabled={incDisabled}
                                    aria-label="Aumentar"
                                    style={{
                                      display: "flex",
                                      width: "30px",
                                      height: "30px",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      border: 0,
                                      background: "transparent",
                                      borderRadius: "0 8px 8px 0",
                                    }}
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      viewBox="0 0 24 24"
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="2"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      style={{ width: "12px", height: "12px" }}
                                    >
                                      <path d="M5 12h14" />
                                      <path d="M12 5v14" />
                                    </svg>
                                  </button>
                                </div>
                                <button
                                  className="rmbtn"
                                  onClick={() => handleRemove(ci.id)}
                                  disabled={cartEditInFlight}
                                  aria-label="Remover"
                                  style={{
                                    display: "flex",
                                    width: "30px",
                                    height: "30px",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    border: 0,
                                    background: "transparent",
                                    borderRadius: "8px",
                                  }}
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    style={{ width: "15px", height: "15px" }}
                                  >
                                    <path d="M3 6h18" />
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                    <line x1="10" x2="10" y1="11" y2="17" />
                                    <line x1="14" x2="14" y1="11" y2="17" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                      <div
                        style={{
                          position: "relative",
                          overflow: "hidden",
                          borderRadius: "12px",
                          border: "1px solid #fed7aa",
                          background:
                            "linear-gradient(to right,#fff7ed,#fffbeb)",
                          padding: "12px 14px",
                          margin: "12px 0",
                        }}
                      >
                        <p
                          style={{
                            margin: 0,
                            fontSize: "12.5px",
                            color: "#9a3412",
                          }}
                        >
                          <strong>Live em andamento!</strong>
                          <br />
                          <span style={{ color: "#c2410c" }}>
                            Novos itens podem ser adicionados até o fim da
                            transmissão.
                          </span>
                        </p>
                      </div>
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                          borderRadius: "12px",
                          background: "hsl(var(--muted)/.6)",
                          padding: "14px",
                          marginTop: "12px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "hsl(var(--muted-foreground))" }}>
                            Subtotal ({totalItems} {itemWord})
                          </span>
                          <span className="tnum" style={{ fontWeight: 500 }}>
                            {subtotalFmt}
                          </span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            fontSize: "13px",
                          }}
                        >
                          <span style={{ color: "hsl(var(--muted-foreground))" }}>
                            Frete
                          </span>
                          <span style={{ color: "hsl(var(--muted-foreground))" }}>
                            A calcular
                          </span>
                        </div>
                        <div
                          style={{ height: "1px", background: "#e5e7eb" }}
                        />
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span style={{ fontSize: "15px", fontWeight: 600 }}>
                            Total
                          </span>
                          <span
                            className="tnum"
                            style={{ fontSize: "20px", fontWeight: 700 }}
                          >
                            {subtotalFmt}
                          </span>
                        </div>
                      </div>
                      <button
                        className="btn-primary"
                        onClick={goCheckout}
                        disabled={empty}
                        style={{
                          marginTop: "14px",
                          width: "100%",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "8px",
                          border: 0,
                          borderRadius: "6px",
                          height: "44px",
                          fontFamily: "inherit",
                          fontSize: "15px",
                          fontWeight: 600,
                        }}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          style={{ width: "16px", height: "16px" }}
                        >
                          <rect
                            width="18"
                            height="11"
                            x="3"
                            y="11"
                            rx="2"
                            ry="2"
                          />
                          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                        </svg>
                        Ir para o pagamento
                      </button>
                    </>
                  )}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "16px",
                      paddingTop: "16px",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: "13px", height: "13px" }}
                      >
                        <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
                        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      SSL Seguro
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: "13px", height: "13px" }}
                      >
                        <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
                        <path d="m9 12 2 2 4-4" />
                      </svg>
                      Dados protegidos
                    </span>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        fontSize: "11px",
                        color: "hsl(var(--muted-foreground))",
                      }}
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        style={{ width: "13px", height: "13px" }}
                      >
                        <rect width="20" height="14" x="2" y="5" rx="2" />
                        <line x1="2" x2="22" y1="10" y2="10" />
                      </svg>
                      Pagamento seguro
                    </span>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  )
}
