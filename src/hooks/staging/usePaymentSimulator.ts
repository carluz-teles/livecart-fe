"use client"

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"

import { useStoreId } from "@/hooks/useUser"
import {
  paymentSimulatorService,
  type CarrinhoPagavel,
  type CobrancaSimulada,
  type CupomDoEvento,
} from "@/components/staging/PaymentSimulator/payment-simulator.service"

/**
 * O estado e as regras do simulador de pagamentos. O componente só renderiza.
 *
 * A PRÉVIA é calculada aqui, mas ela é só prévia: quem fecha a conta cobrada é
 * o servidor, com a mesma ordem de parcelas do checkout. Se as duas divergirem,
 * quem manda é a resposta — e a divergência aparece na tela, que é o único
 * lugar onde ela pode ser notada antes de virar bug de produção.
 */
export function usePaymentSimulator(ativo: boolean) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  const [carrinhos, setCarrinhos] = useState<CarrinhoPagavel[]>([])
  const [cupons, setCupons] = useState<CupomDoEvento[]>([])
  const [carregando, setCarregando] = useState(true)

  const [cartId, setCartId] = useState("")
  const [metodo, setMetodo] = useState<"pix" | "credit_card">("pix")
  const [cupomCodigo, setCupomCodigo] = useState("")
  const [pixPercent, setPixPercent] = useState<number | null>(null)
  const [parcelas, setParcelas] = useState(1)
  const [pagando, setPagando] = useState(false)
  const [ultima, setUltima] = useState<CobrancaSimulada | null>(null)

  async function recarregar() {
    if (!storeId) return
    setCarregando(true)
    try {
      const token = await getToken()
      const r = await paymentSimulatorService.listarCarrinhos(storeId, token)
      setCarrinhos(r.carrinhos ?? [])
      setCupons(r.cupons ?? [])
      setCartId((atual) =>
        atual && r.carrinhos?.some((c) => c.cartId === atual)
          ? atual
          : (r.carrinhos?.[0]?.cartId ?? ""),
      )
    } catch {
      toast.error("Não consegui listar os carrinhos")
    } finally {
      setCarregando(false)
    }
  }

  useEffect(() => {
    if (!ativo || !storeId) return
    void recarregar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, storeId])

  const carrinho = useMemo(
    () => carrinhos.find((c) => c.cartId === cartId),
    [carrinhos, cartId],
  )

  // Só os cupons do evento DESTE carrinho: oferecer cupom de outra campanha
  // levaria a uma recusa que parece bug do simulador.
  const cuponsDoCarrinho = useMemo(
    () => (carrinho ? cupons.filter((c) => c.eventId === carrinho.eventId) : []),
    [cupons, carrinho],
  )

  /** O percentual que vai valer: o escolhido, ou o do evento. */
  const percentEfetivo =
    metodo === "pix" ? (pixPercent ?? carrinho?.pixPercentDoEvento ?? 0) : 0

  /**
   * A prévia, na MESMA ordem do checkout: o desconto de PIX incide sobre
   * (subtotal − cupom) e nunca sobre o frete.
   */
  const previa = useMemo(() => {
    if (!carrinho) return null
    const cupomEscolhido = cuponsDoCarrinho.find((c) => c.codigo === cupomCodigo)
    let cupomDesconto = carrinho.cupomDescontoCents
    if (cupomEscolhido) {
      cupomDesconto =
        cupomEscolhido.percentBps && cupomEscolhido.percentBps > 0
          ? Math.floor((carrinho.subtotalCents * cupomEscolhido.percentBps) / 10000)
          : (cupomEscolhido.valorCents ?? 0)
    }
    const base = Math.max(0, carrinho.subtotalCents - cupomDesconto)
    const pixDesconto = Math.floor((base * percentEfetivo) / 100)
    return {
      subtotal: carrinho.subtotalCents,
      cupomDesconto,
      pixDesconto,
      frete: carrinho.shippingCents,
      cobrado: Math.max(0, base - pixDesconto + carrinho.shippingCents),
    }
  }, [carrinho, cuponsDoCarrinho, cupomCodigo, percentEfetivo])

  async function pagar() {
    if (!storeId || !cartId) return
    setPagando(true)
    try {
      const token = await getToken()
      const r = await paymentSimulatorService.pagar(
        storeId,
        {
          cartId,
          metodo,
          cupomCodigo: cupomCodigo || undefined,
          pixDescontoPercent: metodo === "pix" && pixPercent !== null ? pixPercent : -1,
          parcelas: metodo === "credit_card" ? parcelas : 1,
        },
        token,
      )
      setUltima(r)
      toast.success("Pagamento aprovado", {
        description: `Cobrado ${(r.cobradoCents / 100).toLocaleString("pt-BR", {
          style: "currency",
          currency: "BRL",
        })}`,
      })
      // O carrinho pago sai da lista — recarregar evita oferecer pagá-lo de novo.
      await recarregar()
      setCupomCodigo("")
    } catch (e) {
      toast.error("Não consegui aprovar o pagamento", {
        description: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setPagando(false)
    }
  }

  return {
    carrinhos,
    carrinho,
    cuponsDoCarrinho,
    carregando,
    cartId,
    setCartId,
    metodo,
    setMetodo,
    cupomCodigo,
    setCupomCodigo,
    pixPercent,
    setPixPercent,
    percentEfetivo,
    parcelas,
    setParcelas,
    previa,
    pagar,
    pagando,
    ultima,
    recarregar,
  }
}
