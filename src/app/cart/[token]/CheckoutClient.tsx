"use client"

import { Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react"
import dynamic from "next/dynamic"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import {
  Loader2,
  AlertCircle,
  XCircle,
  User,
  MapPin,
  CreditCard,
  Sparkles,
  ArrowRight,
  Truck,
  Plus,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  CheckoutHeader,
  CheckoutSection,
  CheckoutExpressPayment,
  CheckoutOrderSummary,
  CheckoutWaitlistSection,
  CheckoutShippingOptions,
  CheckoutPromotionBanner,
} from "@/components/checkout"
import type { PendingCartEdit } from "@/components/checkout"

// Heavy payment widgets only render after the shopper completes the
// customer/address forms and picks a method. Lazy-loading keeps the
// Mercado Pago SDK (~bundle-heavy) and the PIX widget out of the initial
// /cart payload — both are pulled on demand.
function PaymentWidgetFallback() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
    </div>
  )
}

const CheckoutCardForm = dynamic(
  () =>
    import("@/components/checkout/CheckoutCardForm").then((m) => m.CheckoutCardForm),
  { loading: () => <PaymentWidgetFallback />, ssr: false }
)

const CheckoutPixDisplay = dynamic(
  () =>
    import("@/components/checkout/CheckoutPixDisplay").then((m) => m.CheckoutPixDisplay),
  { loading: () => <PaymentWidgetFallback />, ssr: false }
)
import { CheckoutPaidScreen } from "@/components/checkout/CheckoutPaidScreen"
import { CheckoutExpiredScreen } from "@/components/checkout/CheckoutExpiredScreen"
import { CheckoutErrorScreen } from "@/components/checkout/CheckoutErrorScreen"
import { CheckoutWaitlistOnlyScreen } from "@/components/checkout/CheckoutWaitlistOnlyScreen"
import { checkoutService } from "@/services/api/checkout.service"
import {
  useCheckoutCart,
  useCheckoutConfig,
  useCepLookup,
  useShippingQuote,
  useSelectShippingMethod,
  usePaymentStatus,
  useUpdateCartItemQuantity,
  useRemoveCartItem,
} from "@/hooks/checkout"
import {
  checkoutFormSchema,
  type CheckoutFormData,
  isCustomerInfoComplete,
  isShippingAddressComplete,
} from "@/schemas/checkout.schema"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import type {
  PublicCheckoutCart,
  PaymentMethod,
  ProcessCardPaymentResponse,
  CheckoutCustomerInfo,
  ShippingOption,
  PickupAddress,
  PublicCheckoutSummary,
} from "@/types"
import type { ApiError } from "@/types/api.types"

function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

function formatPickupAddress(addr: PickupAddress): string {
  const line1 = [addr.street, addr.number].filter(Boolean).join(", ")
  const withComplement = [line1, addr.complement].filter(Boolean).join(" - ")
  const cityState = [addr.district, addr.city && addr.state ? `${addr.city}/${addr.state}` : addr.city || addr.state]
    .filter(Boolean)
    .join(", ")
  const zip = addr.zip ? `CEP ${addr.zip}` : ""
  return [withComplement, cityState, zip].filter(Boolean).join(" — ")
}

function FailedScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <main className="min-h-screen bg-gradient-to-b from-red-50/30 to-white">
      <div className="mx-auto max-w-6xl p-4 py-8">
        <Card className="mx-auto max-w-md border-red-100 shadow-xl shadow-red-100/50">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30">
              <XCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="mt-8 text-2xl font-bold text-gray-900">Pagamento Falhou</h2>
            <p className="mt-2 text-center text-gray-500 max-w-xs">
              Houve um problema com o pagamento. Você pode tentar novamente.
            </p>
            <Button className="mt-8 gap-2" onClick={onRetry}>
              Tentar novamente
              <ArrowRight className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}

interface CheckoutContentProps {
  token: string
  initialCart: PublicCheckoutCart
}

function CheckoutContent({ token, initialCart }: CheckoutContentProps) {
  const router = useRouter()
  const {
    data: cart,
    error: cartError,
    refetch: refetchCart,
  } = useCheckoutCart(token, initialCart)

  // Tracks the last appliedCoupon we observed so the auto-removal toast
  // below can spot the set→null transition. Refs (not state) because the
  // comparison drives a side-effect, not a render. The undefined sentinel
  // distinguishes "first render, nothing to compare" from "currently null".
  const lastAppliedCouponRef = useRef<
    PublicCheckoutCart["appliedCoupon"] | undefined
  >(undefined)
  // Set briefly while the buyer's own click on the coupon X is in flight so
  // the same set→null transition doesn't fire the auto-removal toast.
  const userIsRemovingCouponRef = useRef(false)

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      email: "",
      customerName: "",
      customerDocument: "",
      customerPhone: "",
      shippingAddress: {
        zipCode: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
      },
    },
    mode: "onChange",
  })

  const cepLookup = useCepLookup()

  const updateItemQuantity = useUpdateCartItemQuantity()
  const removeItem = useRemoveCartItem()

  // Uma edição de carrinho por vez.
  //
  // O `disabled` nos botões é o aviso; este guard é a garantia. Entre o clique
  // e o re-render que desabilita o botão cabe um segundo clique — teclado com
  // repeat, duplo-toque no mobile, mão pesada no "+". Cada clique extra vira uma
  // requisição concorrente sobre o MESMO carrinho, e a segunda resposta
  // sobrescreve a primeira: o comprador pede 3 e recebe 2, ou vê a quantidade
  // saltar sozinha quando as respostas chegam fora de ordem.
  const cartEditInFlight = updateItemQuantity.isPending || removeItem.isPending

  const pendingCartEdit = useMemo<PendingCartEdit | null>(() => {
    if (removeItem.isPending && removeItem.variables) {
      return { itemId: removeItem.variables.itemId, kind: "remove" }
    }
    if (updateItemQuantity.isPending && updateItemQuantity.variables) {
      return { itemId: updateItemQuantity.variables.itemId, kind: "quantity" }
    }
    return null
  }, [
    removeItem.isPending,
    removeItem.variables,
    updateItemQuantity.isPending,
    updateItemQuantity.variables,
  ])

  const handleUpdateQuantity = useCallback(
    (itemId: string, quantity: number) => {
      if (quantity < 1) return
      if (cartEditInFlight) return
      updateItemQuantity.mutate({ token, itemId, quantity })
    },
    [cartEditInFlight, updateItemQuantity, token]
  )

  const handleRemoveItem = useCallback(
    (itemId: string) => {
      if (cartEditInFlight) return
      removeItem.mutate({ token, itemId })
    },
    [cartEditInFlight, removeItem, token]
  )

  const shippingQuote = useShippingQuote()
  const selectShippingMethod = useSelectShippingMethod()
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [shippingFreeByEvent, setShippingFreeByEvent] = useState(false)
  const [shippingQuoteError, setShippingQuoteError] = useState<string | null>(null)
  const [shippingReselectNotice, setShippingReselectNotice] = useState<string | null>(null)
  const [quotedZip, setQuotedZip] = useState<string | null>(null)
  const [selectedShippingId, setSelectedShippingId] = useState<string | null>(null)
  const [shippingSummary, setShippingSummary] = useState<PublicCheckoutSummary | null>(null)
  // "Retirar na loja": endereço da loja mostrado junto das opções de frete.
  const [pickupAddress, setPickupAddress] = useState<PickupAddress | null>(null)
  // Sem entrega nem retirada: o cliente finaliza sem frete ("a combinar"),
  // nunca vê o erro cru de cotação.
  const [noShippingAvailable, setNoShippingAvailable] = useState(false)
  // Locked while ViaCEP (or returning-buyer prefill) holds a known city/state
  // for this CEP. Street and neighborhood stay editable so single-CEP cities
  // (where ViaCEP returns empty logradouro/bairro) still work.
  const [isAddressLockedByCep, setIsAddressLockedByCep] = useState(false)
  const shippingSectionRef = useRef<HTMLDivElement>(null)
  const quoteDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const prefilledRef = useRef(false)
  // PRD 006: consent do WhatsApp (pré-marcado; só vale com telefone preenchido)
  const [whatsappConsent, setWhatsappConsent] = useState(true)

  const email = form.watch("email")
  const customerName = form.watch("customerName")
  const customerDocument = form.watch("customerDocument")
  const customerPhone = form.watch("customerPhone")
  const shippingAddress = form.watch("shippingAddress")

  const customerInfoComplete = isCustomerInfoComplete({
    email,
    customerName,
    customerDocument,
    customerPhone,
  })
  const addressComplete = isShippingAddressComplete(shippingAddress)
  // "A combinar" (sem entrega nem retirada) libera o pagamento sem seleção —
  // o frete é acertado com a loja após o pagamento.
  const shippingComplete = selectedShippingId !== null || noShippingAvailable
  const canProceedToPayment = customerInfoComplete && addressComplete && shippingComplete

  const customerPayload = useMemo<CheckoutCustomerInfo | null>(() => {
    if (!canProceedToPayment) return null
    const phoneDigits = (customerPhone ?? "").replace(/\D/g, "")
    const documentDigits = customerDocument.replace(/\D/g, "")
    const zipDigits = shippingAddress.zipCode.replace(/\D/g, "")
    return {
      email,
      customerName: customerName.trim(),
      customerDocument: documentDigits,
      customerPhone: phoneDigits || undefined,
      whatsappConsent: !!phoneDigits && whatsappConsent,
      shippingAddress: {
        zipCode: zipDigits,
        street: shippingAddress.street.trim(),
        number: shippingAddress.number.trim(),
        complement: shippingAddress.complement?.trim() || undefined,
        neighborhood: shippingAddress.neighborhood.trim(),
        city: shippingAddress.city.trim(),
        state: shippingAddress.state.toUpperCase(),
      },
    }
  }, [
    canProceedToPayment,
    email,
    customerName,
    customerDocument,
    customerPhone,
    whatsappConsent,
    shippingAddress.zipCode,
    shippingAddress.street,
    shippingAddress.number,
    shippingAddress.complement,
    shippingAddress.neighborhood,
    shippingAddress.city,
    shippingAddress.state,
  ])

  const {
    data: checkoutConfig,
    isLoading: configLoading,
    error: configError,
    refetch: refetchConfig,
  } = useCheckoutConfig(token, canProceedToPayment)

  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>("pix")
  const [paymentSuccess, setPaymentSuccess] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [paymentFailed, setPaymentFailed] = useState(false)

  const { data: paymentStatusData } = usePaymentStatus(token, {
    enabled: isProcessing,
    refetchInterval: isProcessing ? 5000 : false,
  })

  useEffect(() => {
    if (!paymentStatusData || !isProcessing) return

    if (paymentStatusData.paymentStatus === "paid") {
      setIsProcessing(false)
      setPaymentSuccess(true)
      refetchCart()
    } else if (paymentStatusData.paymentStatus === "failed") {
      setIsProcessing(false)
      setPaymentFailed(true)
    }
  }, [paymentStatusData, isProcessing, refetchCart])

  const availableMethods = useMemo<PaymentMethod[]>(() => {
    const list = checkoutConfig?.availableMethods ?? []
    return list.length > 0 ? list : ["card"]
  }, [checkoutConfig?.availableMethods])
  const methodsCount = availableMethods.length

  // Loja sem gateway de pagamento (ou nenhum respondendo): não é erro do
  // cliente. Mostramos um aviso amigável em vez do erro cru.
  //
  // Tolerância dupla durante a migração do sistema de erros do BE (D1c): os
  // códigos passam de lower_snake para UPPER_SNAKE. Aceitamos os dois enquanto
  // BE e FE não estão no mesmo deploy; o ramo lower_snake sai numa leva seguinte.
  const configApiError = configError as unknown as ApiError | null
  const paymentNotConfigured =
    configApiError?.reason === "PAYMENT_NOT_CONFIGURED" ||
    configApiError?.reason === "PAYMENT_UNAVAILABLE" ||
    configApiError?.reason === "payment_not_configured" ||
    configApiError?.reason === "payment_unavailable"

  useEffect(() => {
    if (!availableMethods.includes(selectedMethod)) {
      setSelectedMethod(
        availableMethods.includes("pix") ? "pix" : availableMethods[0]
      )
    }
  }, [availableMethods, selectedMethod])

  const runShippingQuote = useCallback(
    async (cleaned: string) => {
      if (cleaned.length !== 8) return
      try {
        const quote = await shippingQuote.mutateAsync({ token, zipCode: cleaned })
        setShippingOptions(quote.options)
        setShippingFreeByEvent(quote.freeShipping)
        setPickupAddress(quote.pickupAddress ?? null)
        setNoShippingAvailable(quote.noShippingAvailable ?? false)
        setQuotedZip(cleaned)
        setShippingQuoteError(null)
        setShippingReselectNotice(null)
      } catch (err) {
        const apiErr = err as ApiError
        const message =
          apiErr?.error === "quantity_above_quote_limit"
            ? "Um dos produtos no seu carrinho tem mais de 100 unidades, o que não é suportado pela transportadora. Entre em contato com a loja."
            : apiErr?.message ||
              "Não foi possível cotar o frete. Tente novamente."
        setShippingOptions([])
        setShippingFreeByEvent(false)
        setPickupAddress(null)
        setNoShippingAvailable(false)
        setQuotedZip(cleaned)
        setShippingQuoteError(message)
      }
    },
    [shippingQuote, token]
  )

  const scheduleShippingQuote = useCallback(
    (cleaned: string) => {
      if (quoteDebounceRef.current) {
        clearTimeout(quoteDebounceRef.current)
      }
      quoteDebounceRef.current = setTimeout(() => {
        runShippingQuote(cleaned)
      }, 400)
    },
    [runShippingQuote]
  )

  useEffect(() => {
    return () => {
      if (quoteDebounceRef.current) {
        clearTimeout(quoteDebounceRef.current)
      }
    }
  }, [])

  const handleCepChange = async (value: string) => {
    const cleaned = value.replace(/\D/g, "")
    const formatted = cleaned.length > 5
      ? `${cleaned.slice(0, 5)}-${cleaned.slice(5, 8)}`
      : cleaned

    form.setValue("shippingAddress.zipCode", formatted, { shouldValidate: true })

    // Any keystroke on CEP unlocks city/state until the next successful
    // lookup confirms a new pair.
    setIsAddressLockedByCep(false)

    if (quotedZip && cleaned !== quotedZip) {
      setSelectedShippingId(null)
      setShippingSummary(null)
      setShippingReselectNotice(null)
      setNoShippingAvailable(false)
      setPickupAddress(null)
    }

    if (cleaned.length === 8) {
      try {
        const addressData = await cepLookup.mutateAsync(cleaned)
        form.setValue("shippingAddress.street", addressData.street, { shouldValidate: true })
        form.setValue("shippingAddress.neighborhood", addressData.neighborhood, { shouldValidate: true })
        form.setValue("shippingAddress.city", addressData.city, { shouldValidate: true })
        form.setValue("shippingAddress.state", addressData.state, { shouldValidate: true })
        // Lock city/state — these are authoritative for a CEP. Street and
        // neighborhood stay editable so single-CEP cities (where ViaCEP
        // returns empty logradouro/bairro) still work.
        setIsAddressLockedByCep(true)
      } catch {
        // Error handled by mutation state
      }
      scheduleShippingQuote(cleaned)
    }
  }

  const handleSelectShipping = useCallback(
    async (optionId: string) => {
      const option = shippingOptions.find((o) => o.id === optionId)
      if (!option || !option.available) return
      const zipForSelect =
        quotedZip ??
        (form.getValues("shippingAddress.zipCode") || "").replace(/\D/g, "")
      if (!zipForSelect || zipForSelect.length !== 8) {
        setShippingReselectNotice(
          "Informe o CEP para confirmar o frete."
        )
        return
      }
      try {
        const result = await selectShippingMethod.mutateAsync({
          token,
          serviceId: option.id,
          zipCode: zipForSelect,
          provider: option.provider,
        })
        setSelectedShippingId(option.id)
        setShippingSummary(result.summary)
        setShippingReselectNotice(null)
      } catch (err) {
        const apiErr = err as ApiError
        if (apiErr?.status === 422) {
          setSelectedShippingId(null)
          setShippingSummary(null)
          setShippingReselectNotice(
            "Essa opção não está mais disponível. Cotando novamente..."
          )
          runShippingQuote(zipForSelect)
          return
        }
        console.error(
          "Failed to select shipping method:",
          apiErr?.message || apiErr
        )
      }
    },
    [form, quotedZip, runShippingQuote, selectShippingMethod, shippingOptions, token]
  )

  // O frete descreve uma CAIXA, e a caixa vem dos itens.
  //
  // Mudar a quantidade muda peso e dimensões, então a cotação que está na tela
  // passa a descrever uma encomenda que não existe mais — e o total cobrado sai
  // errado, porque `effectiveTotal` soma o frete velho. Nada aqui reagia a isso:
  // o efeito que cota na primeira carga é travado por `prefilledRef` e roda uma
  // vez só.
  //
  // A assinatura é item + quantidade. Preço não entra: alterar preço não muda o
  // que a transportadora carrega.
  const shippingSignature = useMemo(() => {
    const items = cart?.items ?? []
    return items
      .map((i) => `${i.id}:${i.quantity}`)
      .sort()
      .join("|")
  }, [cart?.items])

  const lastShippingSignatureRef = useRef<string | null>(null)

  // Recota preservando a escolha do comprador quando ela ainda vale.
  //
  // Zerar a seleção sempre seria mais simples e pior: quem só apertou "+" numa
  // camiseta teria de reabrir a lista e escolher o mesmo PAC de novo, sem
  // entender por quê. Só forçamos nova escolha quando a opção realmente saiu.
  const requoteAfterCartChange = useCallback(
    async (zip: string) => {
      const previousId = selectedShippingId
      const previousCost = shippingSummary?.shippingCost ?? null
      try {
        const quote = await shippingQuote.mutateAsync({ token, zipCode: zip })
        setShippingOptions(quote.options)
        setShippingFreeByEvent(quote.freeShipping)
        setPickupAddress(quote.pickupAddress ?? null)
        setNoShippingAvailable(quote.noShippingAvailable ?? false)
        setQuotedZip(zip)
        setShippingQuoteError(null)

        const stillThere = previousId
          ? quote.options.find((o) => o.id === previousId && o.available)
          : undefined

        if (!stillThere) {
          setSelectedShippingId(null)
          setShippingSummary(null)
          setShippingReselectNotice(
            previousId
              ? "A opção de frete que você tinha escolhido não atende ao novo carrinho. Escolha outra."
              : null
          )
          return
        }

        const result = await selectShippingMethod.mutateAsync({
          token,
          serviceId: stillThere.id,
          zipCode: zip,
          provider: stillThere.provider,
        })
        setSelectedShippingId(stillThere.id)
        setShippingSummary(result.summary)
        setShippingReselectNotice(
          previousCost !== null && result.summary.shippingCost !== previousCost
            ? `Seu carrinho mudou, então o frete passou para ${formatCurrency(result.summary.shippingCost)}.`
            : null
        )
      } catch (err) {
        // Cotação falhou com o carrinho novo. Manter a escolha antiga cobraria
        // um frete que ninguém confirmou, então ela cai — e o comprador fica
        // sem poder pagar até haver cotação válida, que é a direção segura.
        const apiErr = err as ApiError
        setSelectedShippingId(null)
        setShippingSummary(null)
        setShippingOptions([])
        setShippingQuoteError(
          apiErr?.message ||
            "Não foi possível recalcular o frete para o novo carrinho. Tente novamente."
        )
        setShippingReselectNotice(null)
      }
    },
    [
      formatCurrency,
      selectShippingMethod,
      selectedShippingId,
      shippingQuote,
      shippingSummary,
      token,
    ]
  )

  useEffect(() => {
    if (!quotedZip) return
    // Espera a edição assentar antes de cotar.
    //
    // A mutation atualiza a quantidade de forma otimista, então a assinatura
    // muda ANTES de o servidor confirmar. Cotar aí é cotar um carrinho que pode
    // não existir: se a reserva for recusada por estoque, o rollback devolve a
    // quantidade antiga e a cotação que acabou de chegar descreve uma encomenda
    // que nunca houve. Depois do settle a assinatura já reflete o que o
    // servidor aceitou, e uma cotação basta.
    if (cartEditInFlight) return
    // Primeira observação: só registra. A cotação inicial já foi feita pelo
    // efeito de preenchimento.
    if (lastShippingSignatureRef.current === null) {
      lastShippingSignatureRef.current = shippingSignature
      return
    }
    if (lastShippingSignatureRef.current === shippingSignature) return
    lastShippingSignatureRef.current = shippingSignature
    setShippingReselectNotice("Seu carrinho mudou. Recalculando o frete...")
    requoteAfterCartChange(quotedZip)
  }, [shippingSignature, quotedZip, cartEditInFlight, requoteAfterCartChange])

  const handleRetryQuote = useCallback(() => {
    const zip = (form.getValues("shippingAddress.zipCode") || "").replace(/\D/g, "")
    if (zip.length === 8) runShippingQuote(zip)
  }, [form, runShippingQuote])

  const formatCPF = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length <= 3) return v
    if (v.length <= 6) return `${v.slice(0, 3)}.${v.slice(3)}`
    if (v.length <= 9) return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6)}`
    return `${v.slice(0, 3)}.${v.slice(3, 6)}.${v.slice(6, 9)}-${v.slice(9)}`
  }

  const formatPhone = (value: string): string => {
    const v = value.replace(/\D/g, "").slice(0, 11)
    if (v.length === 0) return ""
    if (v.length <= 2) return `(${v}`
    if (v.length <= 6) return `(${v.slice(0, 2)}) ${v.slice(2)}`
    if (v.length <= 10) return `(${v.slice(0, 2)}) ${v.slice(2, 6)}-${v.slice(6)}`
    return `(${v.slice(0, 2)}) ${v.slice(2, 7)}-${v.slice(7)}`
  }

  // One-shot prefill from the cart payload. Seeds email (legacy field) and the
  // returning-buyer block (customer + shippingAddress) when present, but never
  // clobbers what the user is already typing. We bypass handleCepChange on
  // purpose so we don't trigger a redundant ViaCEP fetch — the address is
  // already authoritative from the prior paid order. We do trigger a single
  // shipping quote so options appear without the buyer having to retouch the
  // CEP field.
  useEffect(() => {
    if (prefilledRef.current || !cart) return

    if (cart.customerEmail && !form.getValues("email")) {
      form.setValue("email", cart.customerEmail)
    }

    if (cart.customer && !form.getValues("customerName")) {
      form.setValue("customerName", cart.customer.name, { shouldValidate: true })
      if (cart.customer.document) {
        form.setValue("customerDocument", formatCPF(cart.customer.document), { shouldValidate: true })
      }
      if (cart.customer.phone) {
        form.setValue("customerPhone", formatPhone(cart.customer.phone), { shouldValidate: true })
      }
      if (cart.customer.email && !form.getValues("email")) {
        form.setValue("email", cart.customer.email)
      }
    }

    if (cart.shippingAddress && !form.getValues("shippingAddress.zipCode")) {
      const addr = cart.shippingAddress
      const cleanedZip = addr.zipCode.replace(/\D/g, "")
      const formattedZip = cleanedZip.length > 5
        ? `${cleanedZip.slice(0, 5)}-${cleanedZip.slice(5, 8)}`
        : cleanedZip
      form.setValue("shippingAddress", {
        zipCode: formattedZip,
        street: addr.street,
        number: addr.number,
        complement: addr.complement ?? "",
        neighborhood: addr.neighborhood,
        city: addr.city,
        state: addr.state,
      }, { shouldValidate: true })

      if (cleanedZip.length === 8) {
        setIsAddressLockedByCep(true)
        runShippingQuote(cleanedZip)
      }
    }

    // Restore a previously selected shipping method straight from the cart.
    // The buyer reloaded mid-checkout, so we shouldn't force them to re-pick.
    if (cart.shipping && !selectedShippingId) {
      setSelectedShippingId(cart.shipping.serviceId)
      setShippingSummary({
        subtotal: cart.summary.subtotal,
        shippingCost: cart.shipping.costCents,
        couponDiscount: cart.summary.couponDiscount ?? 0,
        pixDiscountPercent: cart.summary.pixDiscountPercent ?? 0,
        pixDiscountCents: cart.summary.pixDiscountCents ?? 0,
        total: cart.summary.subtotal + cart.shipping.costCents,
        totalItems: cart.summary.totalItems,
        hasShippingQuote: true,
      })
    }

    prefilledRef.current = true
  }, [cart, form, runShippingQuote, selectedShippingId])

  const handleCardSuccess = (result: ProcessCardPaymentResponse) => {
    if (result.status === "approved") {
      setPaymentSuccess(true)
      refetchCart()
    } else if (result.status === "pending" || result.status === "in_process") {
      setIsProcessing(true)
    }
  }

  const handlePixSuccess = () => {
    setPaymentSuccess(true)
    refetchCart()
  }

  const handlePaymentError = useCallback((error: string) => {
    console.error("Payment error:", error)
    if (/shipping_quote_expired/i.test(error)) {
      setSelectedShippingId(null)
      setShippingSummary(null)
      const zip = (form.getValues("shippingAddress.zipCode") || "").replace(/\D/g, "")
      if (zip.length === 8) runShippingQuote(zip)
      shippingSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" })
      return
    }
    // Backend returned "provedor de pagamento indisponível" — that's the 5xx
    // transport-error path the BE introduced together with the cart-unbind on
    // failure. The cart is now bound to NULL (or about to be), so refetching
    // /config makes resolveCheckoutIntegration walk the priority chain and
    // hand back the next healthy provider's publicKey. The card form
    // remounts against the new SDK; the buyer re-enters the card on the next
    // attempt (token is gateway-bound, so we can't reuse the old one). For
    // PIX there's no token, so the next "Generate PIX" click lands on the
    // new provider transparently.
    if (/provedor de pagamento indispon[ií]vel/i.test(error)) {
      refetchConfig()
    }
  }, [form, runShippingQuote, refetchConfig])

  const handleApplyCoupon = useCallback(
    async (code: string) => {
      // Service throws on 4xx with the BE message — let it bubble so
      // CheckoutCouponField can surface the inline error. On success we
      // refetch so the cart's appliedCoupon + summary.couponDiscount line
      // up with the new totals.
      const result = await checkoutService.applyCoupon(token, code)
      await refetchCart()
      return {
        code: result.code,
        type: result.type,
        discountCents: result.appliedValueCents,
        maxDiscountCents: result.maxDiscountCents ?? 0,
      }
    },
    [token, refetchCart],
  )

  const handleRemoveCoupon = useCallback(async () => {
    userIsRemovingCouponRef.current = true
    try {
      await checkoutService.removeCoupon(token)
    } catch (err) {
      // Refetch first so the UI reflects whatever the server actually has,
      // then re-throw so CheckoutCouponField can render the inline error
      // (cart paid / network failure / 5xx). The BE remove path is
      // idempotent, so a fresh GET is the safe source of truth either way.
      await refetchCart()
      userIsRemovingCouponRef.current = false
      throw err
    }
    await refetchCart()
    // Cleared after the refetch so the auto-removal effect can observe the
    // set→null transition once and skip it (user-initiated, not auto-removed).
    userIsRemovingCouponRef.current = false
  }, [token, refetchCart])

  // Detects the BE auto-removing the coupon after a cart-item edit (subtotal
  // dropped below min_purchase_cents) and surfaces the reason as a toast so
  // the buyer doesn't watch the discount silently disappear. Skips
  // user-initiated removes (handleRemoveCoupon flag) and the very first
  // render (we don't toast on page load just because a paid cart never had
  // a coupon to begin with).
  useEffect(() => {
    const previous = lastAppliedCouponRef.current
    const current = cart?.appliedCoupon ?? null
    lastAppliedCouponRef.current = current

    if (previous === undefined) return // first render, nothing to compare
    if (!previous || current) return // wasn't set, or still set

    if (userIsRemovingCouponRef.current) return // buyer pressed X themselves

    const min = previous.minPurchaseCents ?? 0
    const message =
      min > 0
        ? `Cupom ${previous.code} removido — sua compra ficou abaixo do mínimo de ${formatCurrency(min)}.`
        : `Cupom ${previous.code} foi removido após a alteração do carrinho.`
    toast.warning(message)
  }, [cart?.appliedCoupon])

  // Cobre também a loja cancelando com o comprador na tela: o refetch passa a
  // receber 422 e a mensagem do backend ("cancelado pela loja") aparece aqui.
  // O envelope da API traz a mensagem em `error`; `message` é o fallback.
  if (cartError || !cart) {
    const apiError = cartError as unknown as ApiError | null
    return (
      <CheckoutErrorScreen
        message={
          apiError?.error || apiError?.message || "Carrinho não encontrado"
        }
        retryHref={`/cart/${token}`}
      />
    )
  }

  if (cart.paymentStatus === "paid" || paymentSuccess) {
    return <CheckoutPaidScreen cart={cart} />
  }

  if (paymentFailed) {
    return (
      <FailedScreen
        onRetry={() => {
          setPaymentFailed(false)
          setIsProcessing(false)
        }}
      />
    )
  }

  if (cart.status === "expired") {
    return <CheckoutExpiredScreen cart={cart} />
  }

  if (cart.status !== "checkout" && cart.status !== "active") {
    return <CheckoutErrorScreen message="Este carrinho não está disponível para pagamento." />
  }

  const isLiveActive = cart.status === "active"
  // Publicação (post/reel/story) usa o copy de promoção; só a live usa "Live em
  // andamento". O campo vem de live_sessions.type — live_events.type não existe
  // mais —, então a lista de espécies é aberta: qualquer coisa que NÃO seja
  // live é publicação.
  const isPost = !!cart.event?.type && cart.event.type !== "live"

  const availableItems = cart.items.filter((item) => {
    const availableQty = item.quantity - item.waitlistedQuantity
    return availableQty > 0
  })

  if (availableItems.length === 0) {
    if (cart.waitlistItems.length > 0) {
      return <CheckoutWaitlistOnlyScreen cart={cart} />
    }
    return <CheckoutErrorScreen message="Nenhum item disponível para pagamento." />
  }

  const orderItems = availableItems.map((item) => {
    const availableQty = item.quantity - item.waitlistedQuantity
    return {
      id: item.id,
      name: item.name,
      groupName: item.groupName,
      variant: item.variant,
      imageUrl: item.imageUrl,
      quantity: availableQty,
      unitPrice: item.unitPrice,
      totalPrice: item.unitPrice * availableQty,
      availableStock: item.availableStock,
    }
  })

  // Notified waitlist entries are already merged into the cart as regular
  // items — we surface them as a celebratory banner at the top instead of
  // duplicating them inside CheckoutWaitlistSection (which now only renders
  // "waiting" entries).
  const notifiedItems = cart.waitlistItems.filter(
    (w) => w.status === "notified",
  )

  const isAddressAutoFilled = cepLookup.isSuccess
  const isFreeShipping =
    shippingFreeByEvent ||
    cart.event?.freeShipping ||
    false

  const shippingCostCents = shippingSummary?.shippingCost ?? null
  const selectedOption = shippingOptions.find((o) => o.id === selectedShippingId)
  const shippingRealCostCents = selectedOption?.realPriceCents ?? null
  // Always derive the total from the live cart subtotal so quantity edits and
  // item removals reflect immediately. shippingSummary caches the chosen
  // carrier's cost; weight-tier re-quoting happens via the existing cart
  // mutation flow.
  const couponDiscount = cart.summary.couponDiscount ?? 0
  const pixDiscountPercent = cart.summary.pixDiscountPercent ?? 0
  const pixDiscountCents = cart.summary.pixDiscountCents ?? 0
  const pixDiscountApplied =
    selectedMethod === "pix" && pixDiscountCents > 0
  // Nada de cobrar enquanto o valor ainda está se formando.
  //
  // `effectiveTotal` é subtotal + frete − descontos, e os três se mexem: uma
  // edição de item muda o subtotal e o peso, o recálculo do frete muda a
  // parcela do frete, e o cupom pode cair sozinho quando o subtotal desce do
  // mínimo. Apertar "pagar" no meio disso cobra um número que já não é o do
  // carrinho — e, diferente dos outros erros desta tela, esse sai do bolso de
  // alguém.
  const checkoutSettling =
    cartEditInFlight ||
    shippingQuote.isPending ||
    selectShippingMethod.isPending

  const effectiveTotal = Math.max(
    0,
    cart.summary.subtotal +
      (shippingCostCents ?? 0) -
      couponDiscount -
      (pixDiscountApplied ? pixDiscountCents : 0),
  )

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <CheckoutHeader
        storeName={cart.store.name}
        logoUrl={cart.store.logoUrl}
        isLiveActive={isLiveActive}
        isPost={isPost}
      />

      <div className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-6 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="gap-2"
            onClick={() => router.push(`/cart/${token}/catalog`)}
          >
            <Plus className="h-4 w-4" />
            Ver catálogo
          </Button>
        </div>

        {notifiedItems.length > 0 && (
          <div className="mb-6">
            <CheckoutPromotionBanner items={notifiedItems} />
          </div>
        )}

        <div className="mb-6 lg:hidden">
          <CheckoutOrderSummary
            items={orderItems}
            subtotal={cart.summary.subtotal}
            totalItems={cart.summary.totalItems}
            shippingCostCents={shippingCostCents}
            shippingRealCostCents={shippingRealCostCents}
            isFreeShipping={isFreeShipping}
            discount={couponDiscount}
            pixDiscountPercent={pixDiscountPercent}
            pixDiscountCents={pixDiscountCents}
            pixDiscountApplied={pixDiscountApplied}
            appliedCoupon={cart.appliedCoupon}
            total={effectiveTotal}
            platformHandle={cart.platformHandle}
            isLiveActive={isLiveActive}
        isPost={isPost}
            allowEdit={cart.allowEdit}
            maxQuantityPerItem={cart.maxQuantityPerItem}
            expiresAt={cart.expiresAt}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={handleRemoveCoupon}
            onUpdateQuantity={handleUpdateQuantity}
            onRemoveItem={handleRemoveItem}
            pendingEdit={pendingCartEdit}
            onExpired={() => refetchCart()}
            formatCurrency={formatCurrency}
          />
          {cart.waitlistItems.length > 0 && (
            <div className="mt-4">
              <CheckoutWaitlistSection
                token={cart.token}
                items={cart.waitlistItems}
              />
            </div>
          )}
        </div>

        <div className="grid gap-8 lg:grid-cols-[1fr,400px]">
          <Form {...form}>
            <form className="space-y-6">
              {cart.isReturningCustomer && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <div>
                    <p className="font-medium">Olá de novo, @{cart.platformHandle} 👋</p>
                    <p className="mt-0.5 text-emerald-800/90">
                      Preenchemos seus dados do último pedido. Confira, escolha o frete e pague.
                    </p>
                  </div>
                </div>
              )}

              <CheckoutSection
                number={1}
                title="Dados do Comprador"
                icon={User}
                isComplete={customerInfoComplete}
                delay={0}
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="customerName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Nome completo <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            autoComplete="name"
                            placeholder="Como está no documento"
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="customerDocument"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            CPF <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              inputMode="numeric"
                              autoComplete="off"
                              placeholder="000.000.000-00"
                              maxLength={14}
                              onChange={(e) => field.onChange(formatCPF(e.target.value))}
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="customerPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Celular *</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              type="tel"
                              inputMode="tel"
                              autoComplete="tel"
                              placeholder="(11) 99999-9999"
                              maxLength={15}
                              onChange={(e) => field.onChange(formatPhone(e.target.value))}
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* PRD 006: consent LGPD para lembretes/recuperação no WhatsApp */}
                  {(customerPhone ?? "").replace(/\D/g, "").length >= 10 && (
                    <label className="flex cursor-pointer items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 text-sm text-gray-700">
                      <input
                        type="checkbox"
                        checked={whatsappConsent}
                        onChange={(e) => setWhatsappConsent(e.target.checked)}
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-emerald-600"
                      />
                      <span>
                        Quero receber o link do pedido e lembretes no{" "}
                        <span className="font-medium text-emerald-700">WhatsApp</span>
                      </span>
                    </label>
                  )}

                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Email <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            {...field}
                            type="email"
                            autoComplete="email"
                            placeholder="seu@email.com"
                            className="h-11 rounded-xl"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </CheckoutSection>

              <CheckoutSection
                number={2}
                title="Endereço de Entrega"
                icon={MapPin}
                isComplete={addressComplete}
                delay={100}
              >
                <div className="grid gap-4">
                  <FormField
                    control={form.control}
                    name="shippingAddress.zipCode"
                    render={({ field }) => (
                      <FormItem className="w-full sm:max-w-[200px]">
                        <FormLabel>
                          CEP <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              {...field}
                              placeholder="00000-000"
                              maxLength={9}
                              onChange={(e) => handleCepChange(e.target.value)}
                              className={cn(
                                "h-11 rounded-xl",
                                cepLookup.error && "border-red-300"
                              )}
                            />
                            {cepLookup.isPending && (
                              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                              </div>
                            )}
                          </div>
                        </FormControl>
                        {cepLookup.error && (
                          <p className="text-xs text-red-500">{cepLookup.error.message}</p>
                        )}
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="shippingAddress.street"
                    render={({ field }) => {
                      return (
                        <FormItem>
                          <FormLabel>
                            Rua <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder={
                                isAddressAutoFilled
                                  ? "Informe a rua"
                                  : "Preencha o CEP"
                              }
                              className={cn(
                                "h-11 rounded-xl",
                                isAddressAutoFilled && "bg-gray-50"
                              )}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )
                    }}
                  />

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="shippingAddress.number"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>
                            Número <span className="text-destructive">*</span>
                          </FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="123"
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.complement"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Complemento</FormLabel>
                          <FormControl>
                            <Input
                              {...field}
                              placeholder="Apto, bloco, etc."
                              className="h-11 rounded-xl"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormField
                      control={form.control}
                      name="shippingAddress.neighborhood"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              Bairro <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={
                                  isAddressAutoFilled
                                    ? "Informe o bairro"
                                    : "Preencha o CEP"
                                }
                                  className={cn(
                                  "h-11 rounded-xl",
                                  isAddressAutoFilled && "bg-gray-50"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.city"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              Cidade <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder={
                                  isAddressAutoFilled
                                    ? "Informe a cidade"
                                    : "Preencha o CEP"
                                }
                                disabled={isAddressLockedByCep}
                                aria-readonly={isAddressLockedByCep}
                                className={cn(
                                  "h-11 rounded-xl",
                                  isAddressLockedByCep && "bg-gray-50 cursor-not-allowed"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                    <FormField
                      control={form.control}
                      name="shippingAddress.state"
                      render={({ field }) => {
                        return (
                          <FormItem>
                            <FormLabel>
                              Estado <span className="text-destructive">*</span>
                            </FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="UF"
                                maxLength={2}
                                onChange={(e) => {
                                  field.onChange(e.target.value.toUpperCase())
                                }}
                                disabled={isAddressLockedByCep}
                                aria-readonly={isAddressLockedByCep}
                                className={cn(
                                  "h-11 rounded-xl",
                                  isAddressLockedByCep && "bg-gray-50 cursor-not-allowed"
                                )}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )
                      }}
                    />
                  </div>
                </div>
              </CheckoutSection>

              <div ref={shippingSectionRef}>
                <CheckoutSection
                  number={3}
                  title="Frete"
                  icon={Truck}
                  isComplete={shippingComplete}
                  isActive={addressComplete}
                  delay={150}
                >
                  {!addressComplete ? (
                    <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                          <Truck className="h-6 w-6 text-gray-400" />
                        </div>
                        <p className="text-sm text-gray-500">
                          Preencha o endereço acima para calcularmos o frete.
                        </p>
                      </div>
                    </div>
                  ) : noShippingAvailable ? (
                    <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-4">
                      <div className="flex items-start gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100">
                          <Truck className="h-5 w-5 text-blue-600" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-blue-900">
                            Frete a combinar
                          </p>
                          <p className="text-sm text-blue-800/80">
                            Você pode finalizar o pedido normalmente. A loja vai
                            combinar o envio com você após o pagamento.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {isFreeShipping && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/50 px-4 py-3 text-sm text-emerald-800">
                          <Sparkles className="h-4 w-4 text-emerald-600" />
                          <span>
                            <strong>Frete grátis neste evento.</strong>{" "}
                            Escolha uma transportadora — você paga R$ 0,00.
                          </span>
                        </div>
                      )}
                      {shippingReselectNotice && (
                        <div className="mb-4 flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/70 px-4 py-3 text-sm text-amber-800">
                          <Loader2 className="h-4 w-4 animate-spin text-amber-600" />
                          <span>{shippingReselectNotice}</span>
                        </div>
                      )}
                      <CheckoutShippingOptions
                        options={shippingOptions}
                        selectedId={selectedShippingId}
                        onSelect={handleSelectShipping}
                        isLoading={shippingQuote.isPending && !shippingOptions.length}
                        isSelecting={selectShippingMethod.isPending}
                        selectingId={
                          selectShippingMethod.isPending
                            ? selectedShippingId ?? null
                            : null
                        }
                        error={shippingQuoteError}
                        onRetry={handleRetryQuote}
                        freeShipping={isFreeShipping}
                        formatCurrency={formatCurrency}
                      />
                      {pickupAddress && selectedShippingId === "pickup" && (
                        <div className="mt-3 rounded-xl border border-gray-200 bg-gray-50/70 px-4 py-3">
                          <p className="text-sm font-medium text-gray-900">
                            Endereço para retirada
                          </p>
                          <p className="mt-1 text-sm text-gray-600">
                            {formatPickupAddress(pickupAddress)}
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </CheckoutSection>
              </div>

              <CheckoutSection
                number={4}
                title="Pagamento"
                icon={CreditCard}
                isComplete={false}
                isActive={canProceedToPayment}
                delay={200}
              >
                {!canProceedToPayment ? (
                  <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <CreditCard className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">
                        Preencha as informações acima para continuar
                      </p>
                    </div>
                  </div>
                ) : configLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="flex flex-col items-center gap-4">
                      <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                      <span className="text-sm text-gray-500">Carregando opções de pagamento...</span>
                    </div>
                  </div>
                ) : paymentNotConfigured ? (
                  <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-100">
                        <CreditCard className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-amber-900">
                          Pagamento indisponível no momento
                        </p>
                        <p className="text-sm text-amber-800/80">
                          A loja ainda não finalizou a configuração dos
                          pagamentos. Entre em contato com o vendedor para
                          concluir a compra.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : configError ? (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                      <AlertCircle className="h-6 w-6 text-red-500" />
                    </div>
                    <p className="mt-4 text-sm text-red-600">
                      {configApiError?.error || "Erro ao carregar pagamento"}
                    </p>
                    <Button variant="outline" className="mt-4" onClick={() => refetchConfig()}>
                      Tentar novamente
                    </Button>
                  </div>
                ) : checkoutConfig ? (
                  <div className="space-y-6">
                    {methodsCount > 1 && (
                      <>
                        <CheckoutExpressPayment
                          selectedMethod={selectedMethod}
                          disabled={checkoutSettling}
                          onSelectMethod={setSelectedMethod}
                          pixAvailable={availableMethods.includes("pix")}
                          cardAvailable={availableMethods.includes("card")}
                          pixDiscountPercent={pixDiscountPercent}
                        />

                        <Separator className="bg-gray-100" />
                      </>
                    )}

                    {selectedMethod === "card" && customerPayload ? (
                      <CheckoutCardForm
                        token={token}
                        provider={checkoutConfig.provider}
                        publicKey={checkoutConfig.publicKey}
                        amount={effectiveTotal}
                        maxInstallments={checkoutConfig.maxInstallments ?? 12}
                        customer={customerPayload}
                        disabled={checkoutSettling}
                        onSuccess={handleCardSuccess}
                        onError={handlePaymentError}
                      />
                    ) : selectedMethod === "pix" && customerPayload ? (
                      <CheckoutPixDisplay
                        token={token}
                        customer={customerPayload}
                        disabled={checkoutSettling}
                        expectedAmount={effectiveTotal}
                        onSuccess={handlePixSuccess}
                        onError={handlePaymentError}
                      />
                    ) : null}
                  </div>
                ) : null}

                {isProcessing && (
                  <div className="flex flex-col items-center justify-center py-12">
                    <div className="relative">
                      <div className="absolute -inset-4 animate-pulse rounded-full bg-primary/10" />
                      <Loader2 className="relative h-10 w-10 animate-spin text-primary" />
                    </div>
                    <h3 className="mt-6 text-lg font-semibold text-gray-900">Processando pagamento...</h3>
                    <p className="mt-2 text-center text-sm text-gray-500">
                      Aguarde enquanto confirmamos seu pagamento.
                    </p>
                  </div>
                )}
              </CheckoutSection>
            </form>
          </Form>

          <div className="hidden space-y-4 lg:block lg:sticky lg:top-8 lg:self-start">
            <CheckoutOrderSummary
              items={orderItems}
              subtotal={cart.summary.subtotal}
              totalItems={cart.summary.totalItems}
              shippingCostCents={shippingCostCents}
              shippingRealCostCents={shippingRealCostCents}
              isFreeShipping={isFreeShipping}
              discount={couponDiscount}
              pixDiscountPercent={pixDiscountPercent}
              pixDiscountCents={pixDiscountCents}
              pixDiscountApplied={pixDiscountApplied}
              appliedCoupon={cart.appliedCoupon}
              total={effectiveTotal}
              platformHandle={cart.platformHandle}
              isLiveActive={isLiveActive}
        isPost={isPost}
              allowEdit={cart.allowEdit}
              maxQuantityPerItem={cart.maxQuantityPerItem}
              expiresAt={cart.expiresAt}
              onApplyCoupon={handleApplyCoupon}
              onRemoveCoupon={handleRemoveCoupon}
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            pendingEdit={pendingCartEdit}
              onExpired={() => refetchCart()}
              formatCurrency={formatCurrency}
            />
            {cart.waitlistItems.length > 0 && (
              <CheckoutWaitlistSection
                token={cart.token}
                items={cart.waitlistItems}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  )
}

interface CheckoutClientProps {
  token: string
  initialCart: PublicCheckoutCart
}

function CheckoutClientInner({ token, initialCart }: CheckoutClientProps) {
  const searchParams = useSearchParams()
  const status = searchParams.get("status")

  if (status === "failure") {
    return <FailedScreen onRetry={() => (window.location.href = `/cart/${token}`)} />
  }

  return <CheckoutContent token={token} initialCart={initialCart} />
}

export function CheckoutClient(props: CheckoutClientProps) {
  return (
    <Suspense fallback={null}>
      <CheckoutClientInner {...props} />
    </Suspense>
  )
}
