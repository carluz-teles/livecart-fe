interface IntegrationBrand {
  name: string
  href: string
  description: string
  status?: string
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
    title: "Venda e comunicação",
    description: "Instagram para capturar pedidos; WhatsApp para comunicação.",
    brands: [
      { name: "Instagram", href: "/integracoes/instagram", description: "Comentários por código, carrinho e link pelo Direct.", src: "/integrations/instagram.webp", width: 180, height: 180, size: "size-9", showName: true },
      { name: "WhatsApp", href: "/integracoes/whatsapp", description: "Comunicação e recuperação via templates configurados.", src: "/integrations/whatsapp.svg", width: 1487, height: 346, size: "h-8 w-auto" },
    ],
  },
  {
    title: "Loja virtual e ERP",
    description: "Suas vendas conectadas à gestão da loja.",
    brands: [
      { name: "Nuvemshop", href: "/integracoes/nuvemshop", description: "Consulte a liberação e o escopo para sua loja.", status: "Em implantação", src: "/integrations/nuvemshop.svg", width: 160, height: 40, size: "h-9 w-auto" },
      { name: "Tiny (Olist)", href: "/integracoes/tiny", description: "Catálogo, estoque e pedidos conectados ao ERP.", src: "/integrations/tiny.svg", width: 80, height: 39, size: "h-11 w-auto" },
      { name: "Bling", href: "/integracoes/bling", description: "Produtos, pedidos e reserva conforme a conta.", src: "/integrations/bling.svg", width: 103, height: 50, size: "h-11 w-auto" },
    ],
  },
  {
    title: "Pagamentos",
    description: "Do carrinho ao Pix ou cartão, sem complicar.",
    brands: [
      { name: "Pagar.me", href: "/integracoes/pagarme", description: "Pagamentos do checkout na conta da sua loja.", src: "/integrations/pagarme.svg", width: 1129, height: 306, size: "h-9 w-auto" },
      { name: "Mercado Pago", href: "/integracoes/mercado-pago", description: "Pix e cartão conforme as modalidades habilitadas.", src: "/integrations/mercado-pago.svg", width: 1049, height: 425, size: "h-16 w-auto" },
    ],
  },
  {
    title: "Frete e entrega",
    description: "O próximo passo da venda: chegar ao cliente.",
    brands: [
      { name: "Melhor Envio", href: "/integracoes/melhor-envio", description: "Cotações conforme origem, destino e produtos.", src: "/integrations/melhor-envio.svg", width: 52, height: 24, size: "h-11 w-auto" },
      { name: "SmartEnvios", href: "/integracoes/smartenvios", description: "Opções de frete para o fechamento dos pedidos.", src: "/integrations/smartenvios.png", width: 536, height: 156, size: "h-14 w-auto" },
    ],
  },
]

export const landingIntegrationBrands = landingIntegrationGroups.flatMap((group) => group.brands)
