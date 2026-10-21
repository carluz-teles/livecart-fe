import type { OrderDetail } from "@/types/cart.types"
import { formatCurrency } from "@/lib/format"

interface PaymentReviewAmountsProps {
  review: NonNullable<OrderDetail["erpPaymentReview"]>
}

// These are the review's observations, not a new payable total or a charge.
export function OrderDetailPaymentReviewAmounts({ review }: PaymentReviewAmountsProps) {
  const { paidCents, orderTotalCents } = review
  const difference = paidCents !== undefined && orderTotalCents !== undefined
    ? orderTotalCents - paidCents
    : null

  return (
    <div className="space-y-2">
      <dl className="space-y-1 text-sm">
        {paidCents !== undefined && (
          <div className="flex flex-wrap justify-between gap-x-3">
            <dt>Pagamentos registrados</dt>
            <dd className="tabular-nums">{formatCurrency(paidCents)}</dd>
          </div>
        )}
        {orderTotalCents !== undefined && (
          <div className="flex flex-wrap justify-between gap-x-3">
            <dt>Total observado no ERP</dt>
            <dd className="tabular-nums">{formatCurrency(orderTotalCents)}</dd>
          </div>
        )}
        {difference !== null && difference !== 0 && (
          <div className="flex flex-wrap justify-between gap-x-3 font-medium">
            <dt>{difference > 0 ? "Saldo pendente de conferência" : "Pago acima do total observado"}</dt>
            <dd className="tabular-nums">{formatCurrency(Math.abs(difference))}</dd>
          </div>
        )}
      </dl>
      <p className="text-sm">
        {difference !== null && difference > 0
          ? "Esta diferença não confirma uma dívida. "
          : "Os valores observados não confirmam cobrança ou estorno. "}
        Confira os recebimentos e as alterações do pedido no ERP antes de qualquer ação financeira.
      </p>
    </div>
  )
}
