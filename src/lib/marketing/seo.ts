import type { Metadata } from "next"
import { marketingArticles } from "@/lib/marketing/content"
import { MARKETING_ORIGIN } from "@/lib/marketing/routes"

export const publicIndexes = [
  { path: "/", title: "Pedidos de lives do Instagram", description: "Transforme comentários com códigos em pedidos. Organize carrinhos, reserva e fechamento com integrações Tiny e Bling." },
  { path: "/integracoes", title: "Integrações para sua operação de live", description: "Conheça o escopo e a disponibilidade das integrações LiveCart com Instagram, Tiny, Bling, Nuvemshop, pagamentos, frete e WhatsApp." },
  { path: "/recursos", title: "Recursos para organizar a venda ao vivo", description: "Entenda a reserva de estoque, a fila de espera e as opções para fechar os pedidos depois da live." },
  { path: "/guias", title: "Guias para vender nas lives do Instagram", description: "Passos práticos para preparar códigos, organizar pedidos, vender peças únicas e conectar a live ao ERP." },
  { path: "/casos", title: "Operações que usam o LiveCart", description: "Conheça os fluxos da Canto da Art e da Maricelia Decor: catálogo, pedidos por cliente e fechamento depois da live." },
  { path: "/precos", title: "Preços e condições do LiveCart", description: "Confira o plano Pro, períodos de cobrança, teste de 7 dias e o que considerar nos custos de pagamentos, ERP e frete." },
  { path: "/demonstracao", title: "Veja como um código vira pedido", description: "Uma demonstração explicativa do fluxo por código: comentário, carrinho, reserva, fechamento e envio ao ERP." },
]

export const publicPages = [
  ...publicIndexes.map((page) => ({ ...page, updated: "2026-10-20" })),
  ...marketingArticles,
]

export function marketingMetadata(path: string, title?: string, description?: string): Metadata {
  const page = publicPages.find((item) => item.path === path)
  const pageTitle = `${title ?? page?.title ?? "LiveCart"} | LiveCart`
  const summary = description ?? page?.description
  return {
    title: pageTitle,
    description: summary,
    alternates: { canonical: `${MARKETING_ORIGIN}${path === "/" ? "" : path}` },
    openGraph: {
      title: pageTitle, description: summary, url: `${MARKETING_ORIGIN}${path}`,
      type: "website", siteName: "LiveCart", locale: "pt_BR",
      images: [{ url: "/livecart/logotipo-whitemode.png", width: 1536, height: 1024, alt: "LiveCart — pedidos de lives do Instagram" }],
    },
    twitter: { card: "summary_large_image", title: pageTitle, description: summary, images: ["/livecart/logotipo-whitemode.png"] },
  }
}

export const organization = {
  "@type": "Organization", "@id": `${MARKETING_ORIGIN}/#organization`,
  name: "LiveCart", legalName: "Dahlemtech Solutions Ltda", url: MARKETING_ORIGIN,
  logo: `${MARKETING_ORIGIN}/livecart/logotipo-whitemode.png`,
  description: "Plataforma brasileira para organizar pedidos por código nas lives do Instagram e conectar a operação da loja.",
}
