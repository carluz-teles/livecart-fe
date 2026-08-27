"use client"

import { use } from "react"
import { Package } from "lucide-react"
import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatDocument,
  formatPhoneBR,
  formatZipBR,
} from "@/lib/format"
import { groupOrderItemsByProduct } from "@/lib/order-items"
import { cn } from "@/lib/utils"
import type { OrderDetail, OrderItem } from "@/types/cart.types"
import { OrderDetailContext } from "./OrderDetailContext"

// Documento impresso do pedido — o papel que a lojista entrega ou manda para a
// cliente. Antes do pagamento é ORÇAMENTO; depois é o pedido em si.
//
// Vive fora do layout de operação por três motivos que valem a duplicação
// aparente de markup:
//
//  1. É outra audiência. A tela é triagem para a lojista (banner de ERP, aba de
//     histórico, botão de retry); o papel é para a CLIENTE decidir a compra.
//     Imprimir a tela entrega esse ruído interno para fora da loja.
//  2. Cor. O painel tem tema escuro, e `text-foreground` no escuro é quase
//     branco — impresso em papel branco, invisível. Aqui as cores são
//     explícitas, nunca tokens de tema.
//  3. Valores. O papel apresenta o que a cliente PODE pagar (payableAmount), e
//     declara o que está em fila em vez de somar às cegas.
export function OrderDetailQuoteDocument() {
  const ctx = use(OrderDetailContext)
  if (!ctx) return null
  const { order } = ctx.state

  const orcamento = order.paymentStatus !== "paid"
  const items = groupOrderItemsByProduct(order.items)
  const pagaveis = items.filter(
    (item) => item.quantity - item.waitlistedQuantity > 0,
  )

  const freteGratis = order.shipping?.freeShipping ?? false
  const freteCents = freteGratis ? 0 : (order.shipping?.costCents ?? 0)
  const total = order.payableAmount + freteCents

  return (
    <article
      // hidden na tela, bloco na impressão: um único Ctrl+P / "Imprimir"
      // produz o documento, sem rota nem segunda requisição.
      className="hidden bg-white text-[13px] leading-relaxed text-neutral-900 print:block"
      lang="pt-BR"
    >
      <Masthead order={order} orcamento={orcamento} />

      <div className="mt-6 grid grid-cols-2 gap-8 print-keep-together">
        <Bloco titulo={orcamento ? "Orçamento para" : "Cliente"}>
          <Cliente order={order} />
        </Bloco>
        <Bloco titulo="Entrega">
          <Entrega order={order} />
        </Bloco>
      </div>

      <TabelaDeItens items={pagaveis} />

      <div className="mt-6 flex justify-end print-keep-together">
        <dl className="w-64 text-[13px]">
          <Linha rotulo="Subtotal" valor={formatCurrency(order.payableAmount)} />
          <Linha
            rotulo="Frete"
            valor={
              freteGratis
                ? "Grátis"
                : order.shipping
                  ? formatCurrency(freteCents)
                  : "A combinar"
            }
          />
          <div className="mt-2 flex items-baseline justify-between border-t-2 border-neutral-900 pt-2">
            <dt className="text-[11px] font-semibold uppercase tracking-[0.18em]">
              Total
            </dt>
            <dd className="text-lg font-semibold tabular-nums">
              {formatCurrency(total)}
            </dd>
          </div>
        </dl>
      </div>

      <FilaDeEspera order={order} />

      <Rodape order={order} orcamento={orcamento} />
    </article>
  )
}

// ─── Cabeçalho ──────────────────────────────────────────────────────────────

interface MastheadProps {
  order: OrderDetail
  orcamento: boolean
}

function Masthead({ order, orcamento }: MastheadProps) {
  const loja = order.store

  return (
    <header className="flex items-start justify-between gap-8 border-b-2 border-neutral-900 pb-4">
      <div className="min-w-0">
        {/* Serifada só aqui: dá ao nome da loja o peso de identidade num
            documento que, no resto, é tabela e número. `font-serif` é a
            Source Serif 4 do próprio projeto (next/font, self-hosted), então
            imprime sem depender de rede. */}
        <p className="font-serif text-2xl font-semibold leading-tight tracking-tight">
          {loja?.name || "Loja"}
        </p>
        <div className="mt-1 space-y-0.5 text-[11px] text-neutral-600">
          {loja?.document && <p>CNPJ {formatDocument(loja.document)}</p>}
          {loja?.phone && <p>{formatPhoneBR(loja.phone)}</p>}
          {loja?.email && <p>{loja.email}</p>}
        </div>
      </div>

      <div className="shrink-0 text-right">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-neutral-500">
          {orcamento ? "Orçamento" : "Pedido"}
        </p>
        <p className="font-serif text-2xl font-semibold leading-tight tabular-nums">
          #{order.shortId}
        </p>
        <p className="mt-1 text-[11px] text-neutral-600">
          Emitido em {formatDate(new Date().toISOString())}
        </p>
        {order.paidAt && (
          <p className="text-[11px] text-neutral-600">
            Pago em {formatDateTime(order.paidAt)}
          </p>
        )}
      </div>
    </header>
  )
}

// ─── Blocos de contexto ─────────────────────────────────────────────────────

interface BlocoProps {
  titulo: string
  children: React.ReactNode
}

function Bloco({ titulo, children }: BlocoProps) {
  return (
    <section>
      <h2 className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        {titulo}
      </h2>
      <div className="space-y-0.5">{children}</div>
    </section>
  )
}

function Cliente({ order }: { order: OrderDetail }) {
  const c = order.customer

  // Antes do checkout a loja só conhece o @ do Instagram — é a identidade que
  // veio do comentário. Imprimir "—" onde deveria estar o nome faz o orçamento
  // parecer defeituoso; o @ é informação de verdade.
  const nome = c?.name || order.customerHandle || "Cliente"

  return (
    <>
      <p className="text-[14px] font-medium">{nome}</p>
      {order.customerHandle && (
        <p className="text-[11px] text-neutral-600">@{order.customerHandle}</p>
      )}
      {c?.document && (
        <p className="text-[11px] text-neutral-600">
          CPF {formatDocument(c.document)}
        </p>
      )}
      {c?.phone && (
        <p className="text-[11px] text-neutral-600">{formatPhoneBR(c.phone)}</p>
      )}
      {c?.email && <p className="text-[11px] text-neutral-600">{c.email}</p>}
    </>
  )
}

function Entrega({ order }: { order: OrderDetail }) {
  const end = order.shippingAddress
  const frete = order.shipping

  if (!end && !frete) {
    return (
      <p className="text-[12px] text-neutral-600">
        A combinar com a loja — a cliente ainda não escolheu a forma de entrega.
      </p>
    )
  }

  return (
    <>
      {frete && (
        <p className="text-[12px] font-medium">
          {frete.serviceName || frete.carrier || "Entrega"}
          {frete.deadlineDays > 0 && (
            <span className="font-normal text-neutral-600">
              {" "}
              · até {frete.deadlineDays}{" "}
              {frete.deadlineDays === 1 ? "dia útil" : "dias úteis"}
            </span>
          )}
        </p>
      )}
      {end ? (
        <div className="text-[11px] text-neutral-600">
          <p>
            {end.street}, {end.number}
            {end.complement ? ` — ${end.complement}` : ""}
          </p>
          <p>
            {end.neighborhood} · {end.city}/{end.state}
          </p>
          <p>CEP {formatZipBR(end.zipCode)}</p>
        </div>
      ) : (
        <p className="text-[11px] text-neutral-600">
          Endereço a informar no checkout.
        </p>
      )}
    </>
  )
}

// ─── Itens ──────────────────────────────────────────────────────────────────

function TabelaDeItens({ items }: { items: OrderItem[] }) {
  if (items.length === 0) {
    return (
      <p className="mt-6 border-y border-neutral-400 py-6 text-center text-[12px] text-neutral-600">
        Nenhum item disponível para pagamento neste momento.
      </p>
    )
  }

  // Coluna de foto só existe se alguma foto existir. Pedido inteiro sem
  // imagem (produto criado na mão, sem anexo no ERP) imprimiria uma coluna de
  // quadrados cinzas vazios — ruído que faz o documento parecer quebrado.
  const comFoto = items.some((item) => item.productImage)

  return (
    <table className="mt-6 w-full border-collapse">
      <caption className="mb-1.5 text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Itens
      </caption>
      <thead>
        <tr className="border-b border-neutral-900 text-[10px] uppercase tracking-[0.12em] text-neutral-500">
          {comFoto && (
            <th scope="col" className="w-[76px] py-1.5 text-left font-semibold">
              {/* Rótulo invisível: o cabeçalho impresso fica limpo sobre a
                  coluna de imagens, sem uma palavra "Foto" competindo com
                  "Produto" logo ao lado. */}
              <span className="sr-only">Foto</span>
            </th>
          )}
          <th scope="col" className="py-1.5 text-left font-semibold">
            Produto
          </th>
          <th scope="col" className="w-16 py-1.5 text-right font-semibold">
            Qtd
          </th>
          <th scope="col" className="w-28 py-1.5 text-right font-semibold">
            Unitário
          </th>
          <th scope="col" className="w-28 py-1.5 text-right font-semibold">
            Total
          </th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => {
          const qtd = item.quantity - item.waitlistedQuantity
          return (
            <tr
              key={item.id}
              // Com foto a linha fica alta o bastante para a quebra de página
              // cair no meio dela — imagem numa folha, preço na outra.
              className="border-b border-neutral-300 align-top print-keep-together"
            >
              {comFoto && (
                <td className="py-2 pr-3">
                  <Foto src={item.productImage} tamanho="h-16 w-16" />
                </td>
              )}
              <td className="py-2 pr-4">
                <span className="font-medium">{item.productName}</span>
                {item.size && (
                  <span className="text-neutral-600"> · Tam. {item.size}</span>
                )}
                {/* Sem "ver abaixo": a unidade em fila pode não ter entrada
                    ativa (quem sai da fila deixa waitlisted_quantity no cart),
                    e a seção de reposição não existiria para apontar. */}
                {item.waitlistedQuantity > 0 && (
                  <span className="block text-[11px] text-neutral-600">
                    +{item.waitlistedQuantity} un. aguardando reposição
                  </span>
                )}
              </td>
              <td className="py-2 text-right tabular-nums">{qtd}</td>
              <td className="py-2 text-right tabular-nums">
                {formatCurrency(item.unitPrice)}
              </td>
              <td className="py-2 text-right font-medium tabular-nums">
                {formatCurrency(item.unitPrice * qtd)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}

// ─── Fila de espera ─────────────────────────────────────────────────────────

function FilaDeEspera({ order }: { order: OrderDetail }) {
  const fila = order.waitlist ?? []
  if (fila.length === 0) return null

  const comFoto = fila.some((item) => item.productImage)

  return (
    <section className="mt-8 border border-neutral-400 p-4 print-keep-together">
      <h2 className="text-[10px] font-semibold uppercase tracking-[0.18em] text-neutral-500">
        Aguardando reposição
      </h2>
      <p className="mt-1 text-[11px] leading-relaxed text-neutral-600">
        Estes produtos estavam esgotados no momento do pedido e{" "}
        <strong className="font-semibold text-neutral-900">
          não estão incluídos no total acima
        </strong>
        . A loja avisa assim que houver estoque.
      </p>
      <ul className="mt-3 space-y-1.5">
        {fila.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between gap-4 border-b border-dotted border-neutral-400 pb-1.5 text-[12px] last:border-0"
          >
            <span className="flex min-w-0 items-center gap-2.5">
              {/* Menor que a da tabela: aqui a foto serve para reconhecer o
                  produto de relance, não para decidir a compra — o item da
                  fila nem entra no total. */}
              {comFoto && (
                <Foto src={item.productImage} tamanho="h-10 w-10" />
              )}
              <span className="min-w-0">
                <span className="font-medium">{item.productName}</span>
                {item.status === "notified" && (
                  <span className="text-neutral-600"> · já liberado</span>
                )}
              </span>
            </span>
            <span className="shrink-0 tabular-nums text-neutral-600">
              {item.quantity} un · {formatCurrency(item.unitPrice)}
            </span>
          </li>
        ))}
      </ul>
      {order.waitlistedAmount > 0 && (
        <p className="mt-2 text-right text-[11px] tabular-nums text-neutral-600">
          Valor não incluído: {formatCurrency(order.waitlistedAmount)}
        </p>
      )}
    </section>
  )
}

// ─── Rodapé ─────────────────────────────────────────────────────────────────

interface RodapeProps {
  order: OrderDetail
  orcamento: boolean
}

function Rodape({ order, orcamento }: RodapeProps) {
  const loja = order.store
  const end = loja?.address

  return (
    <footer className="mt-8 border-t border-neutral-400 pt-4 text-[11px] leading-relaxed text-neutral-600 print-keep-together">
      {orcamento && (
        <p className="mb-2 text-neutral-900">
          {/* Validade honesta: quando não há prazo gravado, prometer data é
              inventar. O que sustenta o orçamento é o estoque. */}
          {order.expiresAt ? (
            <>
              Orçamento válido até{" "}
              <strong className="font-semibold">
                {formatDateTime(order.expiresAt)}
              </strong>
              .
            </>
          ) : (
            <>Orçamento válido enquanto houver estoque disponível.</>
          )}{" "}
          Para confirmar, finalize o pagamento pelo link enviado pela loja.
        </p>
      )}

      {(order.eventTitle || order.liveTitle) && (
        <p>Origem: {order.eventTitle || order.liveTitle}</p>
      )}

      {end?.city && (
        <p>
          {loja.name} · {end.street}
          {end.number ? `, ${end.number}` : ""} · {end.city}/{end.state}
          {end.zipCode ? ` · CEP ${formatZipBR(end.zipCode)}` : ""}
        </p>
      )}
    </footer>
  )
}

// ─── Auxiliares ─────────────────────────────────────────────────────────────

interface FotoProps {
  src: string | null
  /** Classes de dimensão do quadro (ex.: "h-16 w-16"). */
  tamanho: string
}

/**
 * Foto do produto no papel.
 *
 * Três decisões que não são estilo, são o que faz a imagem aparecer impressa:
 *
 *  1. `<img>` cru, nunca `next/image`. A URL vem de origem arbitrária — mídia
 *     do Instagram ou link colado pelo lojista — e o otimizador do Next erra
 *     nesse caso (lança no cliente fora do remotePatterns, e no Railway não
 *     tem permissão de escrita no cache). Mesmo motivo do resto do app.
 *  2. `loading="eager"`. O documento fica em `display:none` até a impressão, e
 *     o navegador nunca busca imagem lazy dentro de subárvore oculta — com o
 *     default, o orçamento sai com os quadros em branco.
 *  3. O quadro cinza é o elemento externo, não um fallback condicional. Assim
 *     a URL que morreu (produto excluído no ERP, CDN do Instagram expirada)
 *     deixa um quadrado neutro no lugar do ícone de imagem quebrada, e a
 *     linha da tabela mantém a mesma altura das outras.
 */
function Foto({ src, tamanho }: FotoProps) {
  return (
    <div
      className={cn(
        tamanho,
        "flex shrink-0 items-center justify-center overflow-hidden rounded border border-neutral-300 bg-neutral-100",
      )}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          // Decorativa: o nome do produto está no texto ao lado, e repetir o
          // mesmo nome em alt só duplicaria a leitura.
          alt=""
          loading="eager"
          decoding="sync"
          className="h-full w-full object-cover"
        />
      ) : (
        <Package className="h-4 w-4 text-neutral-400" aria-hidden="true" />
      )}
    </div>
  )
}

function Linha({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex items-baseline justify-between border-b border-neutral-300 py-1">
      <dt className="text-neutral-600">{rotulo}</dt>
      <dd className="tabular-nums">{valor}</dd>
    </div>
  )
}
