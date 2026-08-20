// Corpos DEFAULT dos e-mails transacionais para o preview do editor — réplica
// fiel (com dados de exemplo) do que o BE renderiza quando o lojista não
// customiza nada. O lojista precisa VER o e-mail que sai, não um aviso de
// "usaremos o template padrão".

import type { PostPaymentNotificationType } from "@/types/notification.types"

// Endereço técnico do remetente (domínio autenticado da plataforma). O
// display name é o nome da loja — espelho do envio real no BE.
export const PLATFORM_FROM_EMAIL = "eng@livecart.com.br"

const sampleItemsTable = `
  <table style="width:100%;border-collapse:collapse;margin:8px 0 0;">
    <tr>
      <td style="padding:8px 0;color:#374151;font-size:14px;">2× Vestido Midi Floral (M)</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:right;">R$ 179,80</td>
    </tr>
    <tr>
      <td style="padding:8px 0;color:#374151;font-size:14px;border-top:1px solid #f0f0f0;">1× Cinto Couro Caramelo</td>
      <td style="padding:8px 0;color:#374151;font-size:14px;text-align:right;border-top:1px solid #f0f0f0;">R$ 49,90</td>
    </tr>
    <tr>
      <td style="padding:12px 0 0;color:#111827;font-size:15px;font-weight:600;border-top:1px solid #e5e7eb;">Total</td>
      <td style="padding:12px 0 0;color:#111827;font-size:15px;font-weight:600;text-align:right;border-top:1px solid #e5e7eb;">R$ 248,60</td>
    </tr>
  </table>`

const DEFAULT_PREVIEW_BODIES: Record<PostPaymentNotificationType, string> = {
  payment_confirmed: `
    <p style="margin:0;color:#10b981;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">✓ Pagamento confirmado</p>
    <h2 style="margin:8px 0 12px;font-size:22px;color:#111827;">Pedido #1042 a caminho</h2>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">
      Olá <strong>Ana</strong>, recebemos seu pagamento. Seu pedido foi confirmado e está sendo
      preparado para envio. A gente te avisa por e-mail a cada etapa.
    </p>
    <p style="margin:20px 0 0;color:#6b7280;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">Itens do pedido</p>
    ${sampleItemsTable}
    <p style="margin:20px 0 0;font-size:14px;color:#4b5563;">📦 Entrega: Rua das Flores, 123 — São Paulo/SP<br/>🚚 Sedex · Melhor Envio</p>
    <p style="margin:24px 0 0;"><a href="#" style="display:inline-block;background:#f59e0b;color:#111;font-weight:600;font-size:14px;padding:10px 22px;border-radius:8px;text-decoration:none;">Acompanhar meu pedido</a></p>`,

  payment_cancelled: `
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Pedido #1042 cancelado</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Olá <strong>Ana</strong>, seu pedido de <strong>R$ 248,60</strong> na sua loja foi cancelado.
    </p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">Nenhum valor foi cobrado.</p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
      Foi um engano ou ficou com alguma dúvida? É só responder este e-mail.
    </p>`,

  payment_refunded: `
    <h2 style="margin:0 0 16px;font-size:20px;color:#111827;">Reembolso confirmado ✔</h2>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Olá <strong>Ana</strong>, o valor de <strong>R$ 248,60</strong> do pedido #1042 foi estornado.
    </p>
    <p style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#374151;">
      Como o pagamento foi via PIX, o valor costuma voltar pra sua conta em instantes — no máximo
      em alguns dias úteis.
    </p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
      Qualquer dúvida sobre o reembolso, é só responder este e-mail.
    </p>`,

  shipped: `
    <p style="margin:0;color:#3b82f6;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">📦 Pedido enviado</p>
    <h2 style="margin:8px 0 12px;font-size:22px;color:#111827;">Pedido #1042 está a caminho</h2>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">
      Olá <strong>Ana</strong>, seu pedido saiu para entrega via <strong>Sedex · Correios</strong>.
    </p>
    <p style="margin:12px 0 0;font-size:14px;color:#4b5563;">Código de rastreio: <strong style="font-family:monospace;">BR123456789BR</strong><br/>Prazo estimado: até 5 dias úteis</p>
    <p style="margin:24px 0 0;"><a href="#" style="display:inline-block;background:#f59e0b;color:#111;font-weight:600;font-size:14px;padding:10px 22px;border-radius:8px;text-decoration:none;">Rastrear meu pedido</a></p>`,

  delivered: `
    <p style="margin:0;color:#10b981;font-size:12px;font-weight:600;letter-spacing:.04em;text-transform:uppercase;">✓ Pedido entregue</p>
    <h2 style="margin:8px 0 12px;font-size:22px;color:#111827;">Pedido #1042 chegou!</h2>
    <p style="margin:0 0 8px;font-size:15px;line-height:1.6;color:#4b5563;">
      Olá <strong>Ana</strong>, a transportadora confirmou a entrega do seu pedido.
      Esperamos que você ame cada item! 💜
    </p>
    <p style="margin:24px 0 0;font-size:13px;line-height:1.6;color:#6b7280;">
      Algum problema com a entrega? É só responder este e-mail.
    </p>`,
}

export function defaultPreviewBody(type: PostPaymentNotificationType): string {
  return DEFAULT_PREVIEW_BODIES[type]
}

export function defaultPreviewSubject(type: PostPaymentNotificationType, storeName: string): string {
  switch (type) {
    case "payment_confirmed":
      return `Pedido #1042 confirmado · ${storeName}`
    case "payment_cancelled":
      return `Pedido #1042 cancelado · ${storeName}`
    case "payment_refunded":
      return `Reembolso do pedido #1042 · ${storeName}`
    case "shipped":
      return `Pedido #1042 a caminho · ${storeName}`
    case "delivered":
      return `Pedido #1042 entregue · ${storeName}`
  }
}
