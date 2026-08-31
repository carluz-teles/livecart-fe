"use client"

/**
 * Simulador de pagamentos — a segunda aba da bancada de staging.
 *
 * Ele encena O GATEWAY, e só. O servidor monta o mesmo `PaymentStatus` que o
 * Mercado Pago devolveria e o entrega à MESMA função que o webhook real chama
 * depois de consultar o gateway. Daí para a frente nada é simulado: o pedido no
 * ERP fecha, o cupom conta uso, a fila de espera promove, o e-mail sai.
 *
 * O cupom também não é simulado — o servidor aplica um cupom DE VERDADE, pelo
 * mesmo caminho do checkout. Por isso o seletor só oferece cupons que existem.
 *
 * Este componente só RENDERIZA. Estado e regras vivem em usePaymentSimulator.
 */

import { CreditCard, Loader2, QrCode, RefreshCw, Wallet } from "lucide-react"

import { usePaymentSimulator } from "@/hooks/staging/usePaymentSimulator"
import { cn } from "@/lib/utils"
import { Bloco, botao, Campo, entrada, Linha, reais } from "../bancada-ui"

export function PaymentSimulator({ ativo }: { ativo: boolean }) {
  const s = usePaymentSimulator(ativo)

  return (
    <div className="flex-1 space-y-5 px-5 py-5">
      {/* ── 01. O PEDIDO ─────────────────────────────────────────────── */}
      <Bloco numero="01" titulo="O pedido">
        <p className="text-[10px] leading-relaxed text-[#8a9a68]">
          Só carrinhos <strong className="text-[#dfe8c4]">abertos e com item</strong>.
          Pagos e expirados saem da lista sozinhos.
        </p>

        {s.carregando ? (
          <p className="flex items-center gap-2 text-[11px] text-[#8a9a68]">
            <Loader2 className="h-3 w-3 animate-spin" /> carregando…
          </p>
        ) : s.carrinhos.length === 0 ? (
          <p className="rounded border border-[#7c8b1a]/30 bg-[#141a08] px-2.5 py-2 text-[11px] leading-relaxed text-[#8a9a68]">
            Nenhum carrinho aberto. Use a aba <strong className="text-[#dfe8c4]">Live</strong> para
            fabricar um comentário primeiro.
          </p>
        ) : (
          <Campo rotulo="carrinho">
            <select
              value={s.cartId}
              onChange={(e) => s.setCartId(e.target.value)}
              className={entrada}
            >
              {s.carrinhos.map((c) => (
                <option key={c.cartId} value={c.cartId}>
                  #{c.shortId} · {c.handle} · {c.itens} it. · {reais(c.subtotalCents)}
                </option>
              ))}
            </select>
          </Campo>
        )}

        <button
          type="button"
          onClick={() => void s.recarregar()}
          disabled={s.carregando}
          className={botao("secundario")}
        >
          <RefreshCw className={cn("h-3 w-3", s.carregando && "animate-spin")} />
          Recarregar
        </button>
      </Bloco>

      {/* ── 02. COMO PAGOU ───────────────────────────────────────────── */}
      <Bloco numero="02" titulo="Como pagou" apagado={!s.carrinho}>
        <div className="flex gap-2">
          {(
            [
              { v: "pix", rotulo: "PIX", Icone: QrCode },
              { v: "credit_card", rotulo: "Cartão", Icone: CreditCard },
            ] as const
          ).map(({ v, rotulo, Icone }) => (
            <button
              key={v}
              type="button"
              onClick={() => s.setMetodo(v)}
              aria-pressed={s.metodo === v}
              className={cn(
                "inline-flex flex-1 items-center justify-center gap-1.5 rounded border px-2 py-2 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors",
                s.metodo === v
                  ? "border-[#c4f82a] bg-[#c4f82a]/10 text-[#c4f82a]"
                  : "border-[#7c8b1a]/40 text-[#8a9a68] hover:border-[#c4f82a]/50",
              )}
            >
              <Icone className="h-3.5 w-3.5" />
              {rotulo}
            </button>
          ))}
        </div>

        {s.metodo === "pix" ? (
          <Campo rotulo={`desconto pix — %  (evento: ${s.carrinho?.pixPercentDoEvento ?? 0}%)`}>
            <input
              type="number"
              min={0}
              max={100}
              value={s.pixPercent ?? s.carrinho?.pixPercentDoEvento ?? 0}
              onChange={(e) => s.setPixPercent(Math.max(0, Math.min(100, Number(e.target.value))))}
              className={entrada}
            />
          </Campo>
        ) : (
          <Campo rotulo="parcelas">
            <input
              type="number"
              min={1}
              max={12}
              value={s.parcelas}
              onChange={(e) => s.setParcelas(Math.max(1, Math.min(12, Number(e.target.value))))}
              className={entrada}
            />
          </Campo>
        )}
      </Bloco>

      {/* ── 03. CUPOM ────────────────────────────────────────────────── */}
      <Bloco numero="03" titulo="Cupom" apagado={!s.carrinho}>
        <p className="text-[10px] leading-relaxed text-[#8a9a68]">
          Aplicado <strong className="text-[#dfe8c4]">de verdade</strong>, pelo mesmo caminho do
          checkout — por isso só aparecem cupons que existem no evento.
        </p>
        {s.cuponsDoCarrinho.length === 0 ? (
          <p className="rounded border border-[#7c8b1a]/30 bg-[#141a08] px-2.5 py-2 text-[10px] leading-relaxed text-[#8a9a68]">
            Este evento não tem cupom ativo. Crie um no painel do evento para testar o desconto.
          </p>
        ) : (
          <Campo rotulo="código">
            <select
              value={s.cupomCodigo}
              onChange={(e) => s.setCupomCodigo(e.target.value)}
              className={entrada}
            >
              <option value="">— sem cupom —</option>
              {s.cuponsDoCarrinho.map((c) => (
                <option key={c.codigo} value={c.codigo}>
                  {c.codigo} ·{" "}
                  {c.percentBps && c.percentBps > 0
                    ? `${c.percentBps / 100}%`
                    : reais(c.valorCents ?? 0)}
                </option>
              ))}
            </select>
          </Campo>
        )}
      </Bloco>

      {/* ── 04. A CONTA ──────────────────────────────────────────────── */}
      {s.previa ? (
        <Bloco numero="04" titulo="A conta">
          <dl className="space-y-1 rounded border border-[#7c8b1a]/30 bg-[#141a08] px-2.5 py-2 text-[11px]">
            <Linha termo="itens" valor={reais(s.previa.subtotal)} />
            {s.previa.cupomDesconto > 0 ? (
              <Linha termo="− cupom" valor={`−${reais(s.previa.cupomDesconto)}`} />
            ) : null}
            {s.previa.pixDesconto > 0 ? (
              <Linha
                termo={`− pix ${s.percentEfetivo}%`}
                valor={`−${reais(s.previa.pixDesconto)}`}
              />
            ) : null}
            {s.previa.frete > 0 ? <Linha termo="+ frete" valor={reais(s.previa.frete)} /> : null}
            <div className="!mt-2 border-t border-[#7c8b1a]/30 pt-2">
              <Linha termo="cobrado" valor={reais(s.previa.cobrado)} destaque />
            </div>
          </dl>
          <p className="text-[10px] leading-relaxed text-[#8a9a68]">
            O desconto do PIX incide sobre (itens − cupom). O frete nunca entra nessa base.
          </p>

          <button
            type="button"
            onClick={() => void s.pagar()}
            disabled={s.pagando || !s.cartId}
            className={cn(botao("primario"), "w-full justify-center py-2")}
          >
            {s.pagando ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Wallet className="h-3.5 w-3.5" />
            )}
            Aprovar pagamento
          </button>
        </Bloco>
      ) : null}

      {/* ── 05. O QUE O SERVIDOR COBROU ──────────────────────────────── */}
      {s.ultima ? (
        <Bloco numero="05" titulo="Última cobrança">
          <dl className="space-y-1 text-[11px]">
            <Linha termo="pagamento" valor={s.ultima.paymentId} />
            <Linha termo="método" valor={s.ultima.metodo} />
            <Linha termo="itens" valor={reais(s.ultima.subtotalCents)} />
            {s.ultima.cupomDescontoCents > 0 ? (
              <Linha
                termo={`− cupom ${s.ultima.cupomCodigo ?? ""}`}
                valor={`−${reais(s.ultima.cupomDescontoCents)}`}
              />
            ) : null}
            {s.ultima.pixDescontoCents > 0 ? (
              <Linha
                termo={`− pix ${s.ultima.pixDescontoPercent}%`}
                valor={`−${reais(s.ultima.pixDescontoCents)}`}
              />
            ) : null}
            {s.ultima.shippingCents > 0 ? (
              <Linha termo="+ frete" valor={reais(s.ultima.shippingCents)} />
            ) : null}
            <div className="!mt-2 border-t border-[#7c8b1a]/30 pt-2">
              <Linha termo="cobrado" valor={reais(s.ultima.cobradoCents)} destaque />
            </div>
          </dl>
        </Bloco>
      ) : null}
    </div>
  )
}
