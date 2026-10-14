interface IntegrationBrand {
  name: string
  src: string
  width: number
  height: number
  size: string
  showName?: boolean
}

interface IntegrationGroup {
  title: string
  description: string
  brands: IntegrationBrand[]
}

// The public brand showcase is independent of the authenticated provider catalog.
export const landingIntegrationGroups: IntegrationGroup[] = [
  {
    title: "Canais de venda",
    description: "A conversa vira compra. E o cliente volta.",
    brands: [
      { name: "Instagram", src: "/integrations/instagram.webp", width: 180, height: 180, size: "size-9", showName: true },
      { name: "WhatsApp", src: "/integrations/whatsapp.svg", width: 1487, height: 346, size: "h-8 w-auto" },
    ],
  },
  {
    title: "Loja virtual e ERP",
    description: "Suas vendas conectadas à gestão da loja.",
    brands: [
      { name: "Nuvemshop", src: "/integrations/nuvemshop.svg", width: 160, height: 40, size: "h-9 w-auto" },
      { name: "Tiny (Olist)", src: "/integrations/tiny.svg", width: 80, height: 39, size: "h-11 w-auto" },
      { name: "Bling", src: "/integrations/bling.svg", width: 103, height: 50, size: "h-11 w-auto" },
    ],
  },
  {
    title: "Pagamentos",
    description: "Do carrinho ao Pix ou cartão, sem complicar.",
    brands: [
      { name: "Pagar.me", src: "/integrations/pagarme.svg", width: 1129, height: 306, size: "h-9 w-auto" },
      { name: "Mercado Pago", src: "/integrations/mercado-pago.svg", width: 1049, height: 425, size: "h-16 w-auto" },
    ],
  },
  {
    title: "Frete e entrega",
    description: "O próximo passo da venda: chegar ao cliente.",
    brands: [
      { name: "Melhor Envio", src: "/integrations/melhor-envio.svg", width: 52, height: 24, size: "h-11 w-auto" },
      { name: "SmartEnvios", src: "/integrations/smartenvios.png", width: 536, height: 156, size: "h-14 w-auto" },
    ],
  },
]

export const landingIntegrationBrands = landingIntegrationGroups.flatMap((group) => group.brands)
