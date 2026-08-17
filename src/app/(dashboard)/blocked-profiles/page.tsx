"use client"

import { useState } from "react"
import { BlockedProfiles } from "@/components/blocked-profile/BlockedProfiles"

// Perfis bloqueados.
//
// O caso que originou a tela: a lojista usa contas secundárias no Instagram para
// INSTRUIR a audiência ("manda 1042 2", ensinando o formato). O LiveCart lê isso
// como intenção de compra e abre pedido no nome dela mesma. Bloquear o arroba
// faz o sistema ignorar aquele perfil em qualquer canal.
//
// `term` e `exact` são estado de UI e vivem aqui; todo estado de servidor está
// nos hooks (useSearchHandles / useBlockedHandles), via React Query.
export default function BlockedProfilesPage() {
  const [term, setTerm] = useState("")
  const [exact, setExact] = useState(false)

  return (
    <div className="flex flex-col gap-6">
      <div>
        <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
          Operação
        </span>
        <h1 className="text-2xl font-semibold tracking-tight">
          Perfis bloqueados
        </h1>
        <p className="mt-1 max-w-2xl text-sm leading-relaxed text-muted-foreground">
          Mensagem de um perfil bloqueado é ignorada por completo — comentário na
          live, comentário em post e resposta de story. Nenhum pedido é criado,
          nenhum estoque é reservado. Use para as contas que você mesma usa para
          instruir a audiência.
        </p>
      </div>

      <BlockedProfiles.Search
        term={term}
        onTermChange={setTerm}
        exact={exact}
        onExactChange={setExact}
      />

      <BlockedProfiles.List />
    </div>
  )
}
