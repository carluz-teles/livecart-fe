/**
 * Textos dos campos de Evento — copy deck §3 do épico Evento Guarda-Chuva.
 *
 * Ficam num módulo só porque os MESMOS campos aparecem em três formulários
 * (live, mapear post, publicar post/story) e a divergência entre eles é o que
 * fez o lojista aprender o modelo errado: o `EventForm` dizia "expiração por
 * inatividade" enquanto o `PostEventForm` dizia "término (opcional)", e nenhum
 * dos dois descrevia a regra real.
 */

export const EVENT_COPY = {
  title: {
    label: "Nome da campanha",
    placeholder: "Ex: Semana Black",
    hint: "O nome da campanha, não da publicação. Ele agrupa todas as sessões e aparece nas mensagens que o comprador recebe.",
  },
  startsAt: {
    label: "Início da campanha",
    hint: "Quando a campanha abre para vender. Antes disso, comentários não viram carrinho: o comprador recebe um aviso automático.",
    empty: "Vazio = começa agora.",
  },
  endsAt: {
    label: "Fim da campanha",
    hint: "Quando a campanha fecha. É a partir daqui que o prazo para o comprador finalizar começa a correr.",
    help: "Enquanto o evento estiver aberto, nenhum carrinho expira e nenhum estoque é liberado. Este campo é o teto que garante que isso não fica eterno — você pode encerrar antes pelo botão “Finalizar evento”.",
  },
  cartExpiration: {
    label: "Prazo para finalizar após o evento",
    hint: "Quanto tempo o comprador tem para pagar depois que o evento fecha. Durante o evento o carrinho nunca expira. Mínimo de 15 minutos.",
    help: "O relógio só começa quando a campanha termina. Prazo curto gira o estoque mais rápido; prazo longo converte mais. Não existe “sem prazo”: todo carrinho expira em algum momento, para o estoque voltar para a loja e para quem está na fila.",
  },
  waitlistTtl: {
    label: "Prazo extra para quem estava na fila",
    hint: "Tempo a mais para pagar que quem esperava na fila ganha quando o produto libera. Vale para o carrinho inteiro e não acumula.",
    help: "Sem esse prazo extra, todos os carrinhos da campanha expiram no mesmo instante — o estoque liberado por um carrinho chega em quem esperava exatamente quando o carrinho dela também morreu.",
  },
  maxQuantity: {
    label: "Quantidade máxima por produto na campanha",
    // Curto (≤140) — cabe no tooltip.
    hint: "Limite de unidades por produto no carrinho do EVENTO — não por sessão. Quem comprou 2 na segunda não compra mais até a campanha fechar.",
    // Longo — o copy deck exige que este texto fique SEMPRE visível, não só no
    // tooltip: é o contrato de aceitação do risco R2.
    help: "Este limite vale para a campanha inteira, não para cada transmissão. Como o carrinho é um só do começo ao fim, “máximo 2 por produto” significa 2 unidades na campanha toda: quem atingir o teto na primeira sessão fica bloqueado até ela terminar. Em campanhas longas, use um limite mais alto do que usaria numa live avulsa.",
  },
  closeCartOnEventEnd: {
    label: "Prazo depois que a campanha fechar",
    hint: "Os dois lados têm prazo: o carrinho sempre expira. A escolha é entre um prazo curto depois da campanha e um prazo estendido.",
  },
  freeShipping: {
    label: "Frete grátis nesta campanha",
    hint: "Zera o frete para o comprador em todas as sessões da campanha. Você continua vendo o custo real no painel do pedido. Como o carrinho é um só, o frete grátis vale para tudo que ele juntar até o fim.",
  },
  pixDiscount: {
    label: "Desconto no PIX",
    hint: "Desconto aplicado no checkout quando o comprador escolhe PIX. Vale para a campanha inteira e é independente de cupom.",
  },
} as const

/** Aviso de campanha longa (copy deck §3.3) — mais de 7 dias entre início e fim. */
export const LONG_CAMPAIGN_DAYS = 7

export function isLongCampaign(startsAt: string | null | undefined, endsAt: string | null | undefined): boolean {
  if (!endsAt) return false
  const start = startsAt ? new Date(startsAt).getTime() : Date.now()
  const end = new Date(endsAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return end - start > LONG_CAMPAIGN_DAYS * 24 * 60 * 60 * 1000
}

export const LONG_CAMPAIGN_WARNING =
  "Campanha longa. Eventos com mais de 7 dias seguram o estoque reservado durante todo esse período e podem esbarrar no limite de tempo que o Instagram dá para o LiveCart responder o comprador por DM. Considere quebrar em campanhas menores."

/** Duração em texto, para o aviso do teto de quantidade. */
export function campaignDuration(
  startsAt: string | null | undefined,
  endsAt: string | null | undefined
): string | null {
  if (!endsAt) return null
  const start = startsAt ? new Date(startsAt).getTime() : Date.now()
  const end = new Date(endsAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) return null
  const hours = Math.round((end - start) / (60 * 60 * 1000))
  if (hours < 24) return `${hours} hora${hours === 1 ? "" : "s"}`
  const days = Math.round(hours / 24)
  return `${days} dia${days === 1 ? "" : "s"}`
}

/**
 * Valor inicial do campo `datetime-local` de fim: amanhã às 23h59, no fuso do
 * navegador. `toISOString()` não serve aqui — o input espera hora LOCAL sem
 * timezone, e o ISO em UTC desloca a hora exibida.
 */
export function defaultEndsAtLocal(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(23, 59, 0, 0)
  const pad = (n: number) => String(n).padStart(2, "0")
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Opções do prazo pós-evento. `0` não existe mais (migration 000104). */
export const CART_EXPIRATION_OPTIONS = [
  { value: "inherit", label: "Usar o padrão da loja" },
  { value: "15", label: "15 minutos (mínimo)" },
  { value: "30", label: "30 minutos" },
  { value: "60", label: "1 hora" },
  { value: "120", label: "2 horas" },
  { value: "1440", label: "24 horas" },
]

/** Opções do prazo extra da fila — respeitam o CHECK 5..240 da 000073. */
export const WAITLIST_TTL_OPTIONS = [
  { value: "15", label: "15 minutos" },
  { value: "30", label: "30 minutos (padrão)" },
  { value: "60", label: "1 hora" },
  { value: "120", label: "2 horas" },
  { value: "240", label: "4 horas" },
]

export const MAX_QUANTITY_OPTIONS = [
  { value: "inherit", label: "Usar o padrão da loja" },
  { value: "1", label: "1 unidade" },
  { value: "3", label: "3 unidades" },
  { value: "5", label: "5 unidades" },
  { value: "10", label: "10 unidades" },
]
