/**
 * O QUE ACONTECEU COM CADA FALA DA COMPRADORA.
 *
 * O motor da live sempre soube o desfecho de um comentário — se virou item, se
 * foi para a fila, se não casou com produto nenhum. Ele só nunca tinha chegado
 * à tela: `hasPurchaseIntent` é binário e diz que ela QUIS comprar, não se ela
 * conseguiu.
 *
 * Três coisas muito diferentes ficavam idênticas:
 *
 *   "1825 QUERO"    virou item                venda
 *   "2096 X 4"      entrou na fila            venda adiada
 *   "quero o 9999"  não casou com produto     VENDA PERDIDA
 *
 * A terceira é a que o lojista precisa ver, e era a mais invisível.
 *
 * ═══ TRÊS CANAIS, NUNCA SÓ A COR ═══
 *
 * Tom, ícone e frase dizem a mesma coisa. Quem não distingue verde de vermelho
 * lê a mesma informação — e é a diferença entre os desfechos que dá valor a
 * isto tudo.
 *
 * Vive em lib/ porque duas telas dependem da MESMA tradução: a linha do tempo
 * do pedido e a lista de comentários do evento. Duas cópias divergiriam no
 * primeiro desfecho novo que o motor aprendesse.
 */

export type TomDoDesfecho = "ok" | "espera" | "perdida" | "neutro"

export interface DesfechoDoComentario {
  tom: TomDoDesfecho
  /** Verbo na frase "@fulana ___ 2× Produto". */
  verbo: string
  /** Frase de quando NÃO há produto para nomear. */
  semAlvo?: string
  /** Explicação curta, abaixo do título. */
  nota?: string
  /** Rótulo curto, para chip e filtro. */
  rotulo: string
}

export const DESFECHO: Record<string, DesfechoDoComentario> = {
  added_to_cart: { tom: "ok", verbo: "pediu", rotulo: "virou item" },
  partial_fulfillment: {
    tom: "espera",
    verbo: "pediu",
    nota: "Só parte tinha estoque — o resto entrou na fila.",
    rotulo: "parcial",
  },
  waitlisted: {
    tom: "espera",
    verbo: "entrou na fila de",
    nota: "Sem estoque no momento do pedido.",
    rotulo: "na fila",
  },
  already_waitlisted: {
    tom: "espera",
    verbo: "pediu de novo",
    nota: "Já estava na fila deste produto.",
    rotulo: "já na fila",
  },
  out_of_stock: {
    tom: "perdida",
    verbo: "pediu",
    semAlvo: "pediu um item sem estoque",
    nota: "Sem estoque e sem fila disponível.",
    rotulo: "sem estoque",
  },
  no_product: {
    tom: "perdida",
    verbo: "pediu",
    semAlvo: "pediu um código que não existe no catálogo",
    nota: "Nenhum produto casou com o código.",
    rotulo: "sem produto",
  },
  max_quantity_reached: {
    tom: "perdida",
    verbo: "pediu",
    nota: "Acima do limite por comprador.",
    rotulo: "acima do limite",
  },
  not_in_promo: {
    tom: "perdida",
    verbo: "pediu",
    nota: "Produto fora desta promoção.",
    rotulo: "fora da promoção",
  },
  event_ended: {
    tom: "perdida",
    verbo: "pediu",
    semAlvo: "pediu depois do fim",
    nota: "A live já tinha encerrado.",
    rotulo: "live encerrada",
  },
  blocked: {
    tom: "perdida",
    verbo: "pediu",
    semAlvo: "tentou pedir",
    nota: "Comprador bloqueado na loja.",
    rotulo: "bloqueado",
  },
}

/** Desfecho conhecido, ou null quando o motor devolveu um código novo. */
export function lerDesfecho(result?: string): DesfechoDoComentario | null {
  if (!result) return null
  return DESFECHO[result] ?? null
}

/**
 * A frase completa: "@fulana pediu 6× Flor Bico de Papagaio".
 *
 * Sem produto para nomear, cai em `semAlvo` — e essa frase importa MAIS que as
 * outras, porque o caso sem produto É a venda perdida. Um título vago ali
 * ("pediu algo") esconderia justamente o que se quer revelar.
 */
export function fraseDoDesfecho(
  handle: string,
  c: { result?: string; productName?: string; productKeyword?: string; quantity?: number },
): { tom: TomDoDesfecho; titulo: string; nota?: string } {
  const quem = `@${handle}`
  const d = lerDesfecho(c.result)

  // Sem intenção de compra, ou desfecho que ainda não conhecemos. Inventar uma
  // frase para um código novo seria afirmar o que ninguém apurou.
  if (!d) return { tom: "neutro", titulo: `${quem} comentou` }

  const qtd = c.quantity && c.quantity > 1 ? `${c.quantity}× ` : ""
  const alvo = c.productName || (c.productKeyword ? `código ${c.productKeyword}` : "")
  const titulo = alvo
    ? `${quem} ${d.verbo} ${qtd}${alvo}`
    : `${quem} ${d.semAlvo ?? d.verbo}`

  return { tom: d.tom, titulo, nota: d.nota }
}

/** Quatro tons com significado fixo, iguais aos da linha do tempo do pedido. */
export const TOM_CLASSE: Record<TomDoDesfecho, string> = {
  ok: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300",
  espera: "bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300",
  perdida: "bg-destructive/15 text-destructive",
  neutro: "bg-muted text-muted-foreground",
}
