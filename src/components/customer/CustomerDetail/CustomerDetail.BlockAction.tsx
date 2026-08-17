"use client"

import { BlockProfileButton } from "@/components/shared/BlockProfileButton"
import type { Customer } from "@/types"

interface CustomerDetailBlockActionProps {
  customer: Customer
}

// Delegação fina: a ação de bloquear é a MESMA aqui e na tela de Perfis
// bloqueados, e o que ela precisa saber é só o arroba. Manter duas cópias
// duplicaria o diálogo que explica as consequências do bloqueio, que é o texto
// que a lojista lê antes de confirmar.
export function CustomerDetailBlockAction({
  customer,
}: CustomerDetailBlockActionProps) {
  return <BlockProfileButton handle={customer.handle} />
}
