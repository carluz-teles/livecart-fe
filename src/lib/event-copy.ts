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
  /** Regra da janela comercial, no "?" do separador. */
  windowSection: {
    hint: "O evento só vende dentro desta janela. Antes do início ou depois do fim, o comentário não vira carrinho — o comprador recebe um aviso automático em vez de ficar sem resposta. O fim é obrigatório: é ele que garante que nenhum carrinho fica sem prazo.",
  },
  /** Regra das configurações de carrinho, no "?" do separador. */
  cartSection: {
    hint: "Valem para o evento inteiro. Como cada cliente tem um carrinho só, somando o que ele compra em todas as transmissões, estas regras não se repetem por transmissão. O prazo de expiração só começa a contar quando o evento fecha.",
  },
  title: {
    label: "Nome do evento",
    placeholder: "Ex: Semana Black",
  },
  startsAt: {
    label: "Início do evento",
    hint: "Quando o evento abre para vender. Antes disso, comentários não viram carrinho: o comprador recebe um aviso automático.",
    empty: "Vazio = começa agora.",
  },
  endsAt: {
    label: "Fim do evento",
    hint: "Quando o evento fecha. É a partir daqui que o prazo para o comprador finalizar começa a correr.",
    help: "Enquanto o evento estiver aberto, nenhum carrinho expira e nenhum estoque é liberado. Este campo é o teto que garante que isso não fica eterno — você pode encerrar antes pelo botão “Finalizar evento”.",
  },
  cartExpiration: {
    label: "Prazo para finalizar após o evento",
    hint: "Quanto tempo o comprador tem para pagar depois que o evento fecha. Durante o evento o carrinho nunca expira. Mínimo de 15 minutos.",
    help: "O relógio só começa quando o evento termina. Prazo curto gira o estoque mais rápido; prazo longo converte mais. Não existe “sem prazo”: todo carrinho expira em algum momento, para o estoque voltar para a loja e para quem está na fila.",
  },
  waitlistTtl: {
    label: "Prazo extra para quem estava na fila",
    hint: "Tempo a mais para pagar que quem esperava na fila ganha quando o produto libera. Vale para o carrinho inteiro e não acumula.",
    help: "Sem esse prazo extra, todos os carrinhos do evento expiram no mesmo instante — o estoque liberado por um carrinho chega em quem esperava exatamente quando o carrinho dela também morreu.",
  },
  maxQuantity: {
    label: "Quantidade máxima por produto",
    // Curto (≤140) — cabe no tooltip.
    hint: "Limite de unidades por produto no carrinho do EVENTO — não por sessão. Quem comprou 2 na segunda não compra mais até o evento fechar.",
    // Longo — o copy deck exige que este texto fique SEMPRE visível, não só no
    // tooltip: é o contrato de aceitação do risco R2.
    help: "Este limite vale para o evento inteiro, não para cada transmissão. Como o carrinho é um só do começo ao fim, “máximo 2 por produto” significa 2 unidades no evento todo: quem atingir o teto na primeira sessão fica bloqueado até ela terminar. Em eventos longos, use um limite mais alto do que usaria numa live avulsa.",
  },
  closeCartOnEventEnd: {
    label: "Prazo depois que o evento fechar",
    hint: "Os dois lados têm prazo: o carrinho sempre expira. O prazo começa a correr quando o evento fecha.",
  },
  freeShipping: {
    label: "Frete grátis neste evento",
    hint: "Zera o frete para o comprador em todas as transmissões do evento. Você continua vendo o custo real no painel do pedido. Como o carrinho é um só, o frete grátis vale para tudo que ele juntar até o fim.",
  },
  pixDiscount: {
    label: "Desconto no PIX",
    hint: "Desconto aplicado no checkout quando o comprador escolhe PIX. Vale para o evento inteiro e é independente de cupom.",
  },
} as const

/** Aviso de evento longo (copy deck §3.3) — mais de 7 dias entre início e fim. */
export const LONG_CAMPAIGN_DAYS = 7

export function isLongCampaign(startsAt: string | null | undefined, endsAt: string | null | undefined): boolean {
  if (!endsAt) return false
  const start = startsAt ? new Date(startsAt).getTime() : Date.now()
  const end = new Date(endsAt).getTime()
  if (Number.isNaN(start) || Number.isNaN(end)) return false
  return end - start > LONG_CAMPAIGN_DAYS * 24 * 60 * 60 * 1000
}

export const LONG_CAMPAIGN_WARNING =
  "Evento longo. Eventos com mais de 7 dias seguram o estoque reservado durante todo esse período e podem esbarrar no limite de tempo que o Instagram dá para o LiveCart responder o comprador por DM. Considere quebrar em eventos menores."

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

/**
 * O modelo em uma página — copy deck §1.1.
 *
 * O dono do produto abriu um evento e leu a métrica de um post como se fosse a
 * campanha. O produto nunca explicou a diferença: até aqui não havia UM texto
 * no painel dizendo o que é evento, o que é sessão e por que o carrinho é um
 * só. Estes textos ficam num módulo porque aparecem em três lugares (banner de
 * /events, diálogo de ajuda e o aviso de campanha com uma sessão só) e
 * divergirem entre si seria repetir o erro que os criou.
 */
export const EVENT_MODEL_COPY = {
  title: "Um evento é a sua venda — não uma publicação",
  levels: [
    {
      term: "Evento",
      text: "É a venda inteira. “Semana Black”, de segunda a sábado. É aqui que você define cupom, frete grátis, desconto no PIX e o prazo para o cliente finalizar.",
    },
    {
      term: "Sessão",
      text: "É cada transmissão dentro do evento: a live de segunda, o post de terça, o story de quarta, o reel de quinta. Um evento pode ter quantas quiser, de tipos diferentes.",
    },
    {
      term: "Mídia",
      text: "É a publicação real no Instagram que a sessão monitora. Você pode criar a sessão antes de a publicação existir e vincular a mídia depois.",
    },
  ],
  cartRule:
    "O carrinho é um só por cliente, por evento. Se a Ana comentou na live de segunda e voltou a comentar no story de quarta, os dois produtos entram no mesmo carrinho, com o mesmo link.",
  deadlineRule:
    "O prazo para pagar só começa a correr quando o evento fecha. Enquanto o evento estiver aberto nenhum carrinho expira — e nenhum estoque volta para a loja.",
  maxQuantityRule:
    "O teto de quantidade vale para o evento inteiro, não para cada transmissão. “Máximo 2 por produto” significa 2 unidades da segunda ao sábado: quem atingir o limite na primeira transmissão fica bloqueado até o evento terminar.",
  /** A exceção da regra acima — e a única. Sem ela o lojista procura os
   *  produtos no lugar em que tudo o mais mora: a campanha. */
  productRule:
    "Cupom, frete, prazo e teto de quantidade são do evento. Os produtos são a única coisa que é de cada transmissão: a live pode vender a loja toda enquanto o story vende só uma peça. Você configura a lista na aba Sessões, no botão “Produtos” da transmissão.",
  /** Resumo de uma linha — cabe acima dos KPIs sem empurrar o número da dobra. */
  shortIntro:
    "Os números abaixo são do evento inteiro — a soma de todas as transmissões. A quebra por transmissão fica na aba Sessões.",
} as const

/**
 * Tipo de sessão: rótulo e ajuda por opção — copy deck §4.1.
 *
 * Story NÃO está aqui, e a ausência é deliberada. Um Story só vira venda se for
 * publicado PELO LiveCart: a intenção chega como resposta de DM, e o vínculo
 * depende do id da mídia que a publicação devolve. Por isso a opção Story não
 * oferece "escolher uma publicação existente" — o Instagram não lista stories
 * numa grade, e uma transmissão de Story sem mídia própria nunca captura nada.
 *
 * Story JÁ pode ser adicionado a um evento existente: o handler de publicação
 * lê `eventId` e `attachPublishedMediaToEvent` anexa a sessão em vez de criar
 * outro evento. A lista aqui o omitia por causa de um estado antigo do backend,
 * e essa omissão sobreviveu à correção — o efeito era o Story só existir pelo
 * atalho da porta de entrada, que era justamente o que fazia uma publicação
 * parecer um evento inteiro.
 */
export const SESSION_TYPE_OPTIONS = [
  {
    value: "live",
    label: "Live ao vivo",
    help: "Você conecta a transmissão do Instagram quando ela começar. Não dá para agendar a publicação de uma live.",
  },
  {
    value: "post",
    label: "Post no feed",
    help: "Comentários no post viram carrinho. Pode ser um post que já existe ou um que o LiveCart publica para você.",
  },
  {
    value: "reel",
    label: "Reel",
    help: "Funciona igual ao post: os comentários do reel viram carrinho.",
  },
  {
    value: "story",
    label: "Story",
    help: "O LiveCart publica o Story e a venda acontece quando o comprador RESPONDE por DM — comentário não existe em story. Fica 24h no ar.",
  },
] as const

export type SessionTypeOptionValue = (typeof SESSION_TYPE_OPTIONS)[number]["value"]

export function sessionTypeHelp(value: string): string {
  return SESSION_TYPE_OPTIONS.find((o) => o.value === value)?.help ?? ""
}

/** Textos do formulário de Sessão — copy deck §4.1 e §4.4. */
export const SESSION_COPY = {
  type: {
    label: "Tipo da sessão",
    hint: "O formato desta transmissão. Um mesmo evento pode misturar live, post e reel — todos somam no mesmo carrinho de cada cliente.",
  },
  media: {
    label: "Publicação vinculada",
    /** Rótulo quando a transmissão é uma live: ela não é uma "publicação", e
     *  este é o nome que o roteiro do App Review da Meta clica no passo 7. */
    liveLabel: "Live ativa",
    hint: "A publicação do Instagram que esta sessão monitora. Uma mídia só pode estar em um evento ativo por vez.",
    help: "Você pode criar a sessão agora e vincular a publicação depois, pelo botão “Vincular” na aba Sessões.",
    later: "Vincular depois",
  },
  /** Badge da sessão sem mídia (copy deck §4.4). */
  noMedia: {
    badge: "Sem publicação vinculada",
    hint: "Esta sessão ainda não está capturando comentários. Use o botão Vincular ao lado para escolher a publicação.",
    /** Texto do formulário quando o lojista deixa a mídia para depois. */
    hintForm:
      "Sem publicação vinculada, a transmissão nasce sem capturar nada. Ela aparece na aba Sessões com o aviso e um botão “Vincular” — é por lá que você conecta a publicação quando ela existir.",
  },
  /**
   * Story não é uma opção de "adicionar transmissão", e o lojista precisa saber
   * para onde ir em vez de procurar um menu que não tem.
   */
  storyElsewhere:
    "Para vender por Story, adicione uma transmissão do tipo Story na aba Sessões — o LiveCart publica o Story e monta a transmissão junto. A venda acontece quando o comprador RESPONDE o story por DM.",
  /** Fallback do vínculo posterior numa sessão de story (que já nasce com mídia). */
  storyNoLink:
    "Stories não aparecem na lista de publicações do Instagram. Uma transmissão de Story recebe a mídia no momento em que o LiveCart publica o Story — não há como vinculá-la depois.",
  /**
   * A transmissão nova nasce vendendo tudo. Fica no "?" do diálogo, não num
   * parágrafo: é a regra completa, e quem já entendeu o modelo não precisa
   * relê-la toda vez que cria uma sessão.
   */
  bornOpen: {
    short: "Ela nasce vendendo todos os produtos da loja.",
    hint: "As restrições de produto das outras transmissões não são copiadas para cá. Se quiser restringir esta, configure os produtos dela depois de criar, pelo botão “Produtos” na aba Sessões.",
  },
} as const

/**
 * Produtos vendáveis de uma transmissão — decisão 15 / N2.
 *
 * A lista é da TRANSMISSÃO: o evento não tem lista, e por isso não existe
 * mais aba "Produtos" no evento. "Whitelist" é nome de tabela e não aparece
 * para o lojista em lugar nenhum.
 */
export const SESSION_PRODUCTS_COPY = {
  title: "Produtos desta transmissão",
  /** Tooltip do "?": a regra inteira, sob demanda. */
  hint: "Cada transmissão do evento tem a própria lista — a live pode vender a loja toda enquanto o story vende uma peça só. Sem produto selecionado, esta transmissão vende qualquer produto ativo da loja.",
  /** Linha de status quando a lista tem produtos. */
  restricted: (count: number) =>
    count === 1
      ? "1 produto liberado. Só ele pode ser vendido nesta transmissão."
      : `${count} produtos liberados. Só eles podem ser vendidos nesta transmissão.`,
  /** Linha de status quando a lista está vazia — o caso da live. */
  open: "Sem produto selecionado: esta transmissão vende qualquer produto da loja.",
  add: "Adicionar produto",
  addFirst: "Adicionar primeiro produto",
  emptyTitle: "Nenhum produto configurado",
  emptyBody:
    "Com a lista vazia, todos os produtos ativos da loja podem ser vendidos nesta transmissão. Adicione produtos para restringir a venda apenas aos itens selecionados.",
  pickerHelp: "Busque e selecione os produtos que poderão ser vendidos nesta transmissão.",
  pickerExhausted: "Todos os produtos ativos já estão nesta transmissão",
  /** Badge da tabela de sessões quando a transmissão não restringe nada. */
  allBadge: "Todos",
  allBadgeHint:
    "Esta transmissão não tem lista: qualquer produto ativo da loja pode ser vendido nela.",
  /**
   * LIVE é a exceção, e a tela não pode fingir que não é.
   *
   * A ingestão de comentário só aplica a lista em post, reel e story. Numa live
   * o comentário nunca é filtrado — é a própria definição do dono ("tem live que
   * o cliente quer vender qualquer coisa"), e mudar isso restringiria em
   * silêncio as lives que hoje vendem tudo. Sem este aviso, o lojista lê "só
   * eles podem ser vendidos" na linha da live e configura uma barreira que não
   * existe.
   */
  liveNotEnforced:
    "Numa live, o comentário não passa por esta lista: a live vende qualquer produto da loja.",
  liveNotEnforcedHint:
    "A lista de uma live não filtra comentários — ela só limita o que o comprador consegue acrescentar sozinho na página do checkout. Para restringir o que é vendido, use uma transmissão de post, reel ou story.",
} as const
