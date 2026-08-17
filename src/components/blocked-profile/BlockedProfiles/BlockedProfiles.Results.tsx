"use client"

import { Search, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { BlockProfileButton } from "@/components/shared/BlockProfileButton"
import { HANDLE_SEARCH_MIN_TERM } from "@/hooks/customer"
import { formatRelativeDate } from "@/lib/format"
import type { SeenHandle } from "@/types"

export interface BlockedProfilesResultsProps {
  /** Termo JÁ normalizado (sem @, minúsculo) — é o que foi buscado. */
  term: string
  hasTerm: boolean
  searching: boolean
  isError: boolean
  results: SeenHandle[]
}

// Resultado da busca — puramente apresentacional.
//
// Separado do container que chama o hook porque são cinco estados distintos
// (inicial, buscando, erro, nada encontrado, resultados) e cada um tem uma saída
// diferente para a lojista. Misturá-los com a chamada de dados esconde o que a
// tela faz em cada caso — e "nada encontrado" aqui não é vazio, é uma AÇÃO.
export function BlockedProfilesResults({
  term,
  hasTerm,
  searching,
  isError,
  results,
}: BlockedProfilesResultsProps) {
  if (!hasTerm) return <EstadoInicial />

  if (isError) {
    return (
      <p
        role="alert"
        className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
      >
        Não conseguimos buscar agora. Tente de novo em alguns segundos.
      </p>
    )
  }

  if (results.length > 0) {
    return (
      <ul className="divide-y rounded-md border">
        {results.map((perfil) => (
          <LinhaDePerfil key={perfil.handle} perfil={perfil} />
        ))}
      </ul>
    )
  }

  // Enquanto o debounce corre, manter o último resultado vazio silencioso: um
  // "nada encontrado" que aparece e desaparece a cada tecla é ruído.
  if (searching) return null

  return <NadaEncontrado handle={term} />
}

function EstadoInicial() {
  return (
    <div className="rounded-md border border-dashed px-4 py-8 text-center">
      <Search
        className="mx-auto h-6 w-6 text-muted-foreground"
        aria-hidden="true"
      />
      <p className="mt-2 text-sm font-medium">Digite um arroba para começar</p>
      <p className="mx-auto mt-1 max-w-md text-xs leading-relaxed text-muted-foreground">
        Vale um trecho de {HANDLE_SEARCH_MIN_TERM} caracteres ou mais: buscando{" "}
        <span className="font-mono">canto</span> você vê todos os perfis que
        contêm isso, com quantas mensagens cada um mandou e quantas viraram
        pedido.
      </p>
    </div>
  )
}

// Nada encontrado NÃO é um beco sem saída: a conta secundária que a lojista
// acabou de criar não falou em live nenhuma ainda, e ela precisa poder bloquear
// antes da próxima. O bloqueio é por arroba, não por histórico.
function NadaEncontrado({ handle }: { handle: string }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-md border border-dashed px-4 py-6 text-center">
      <p className="text-sm font-medium">
        Nenhum perfil com <span className="font-mono">{handle}</span> falou nas
        suas lives
      </p>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
        Pode ser um arroba escrito diferente — ou uma conta que ainda não
        participou. Você pode bloquear{" "}
        <span className="font-mono">@{handle}</span> desde já: o bloqueio vale
        para a próxima live, mesmo sem histórico.
      </p>
      <BlockProfileButton handle={handle} blocked={false} />
    </div>
  )
}

function LinhaDePerfil({ perfil }: { perfil: SeenHandle }) {
  return (
    <li className="flex flex-wrap items-center justify-between gap-3 p-3">
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate font-mono text-sm font-medium">
            @{perfil.handle}
          </span>
          {perfil.blocked && (
            <Badge variant="destructive" className="gap-1">
              <ShieldAlert className="h-3 w-3" aria-hidden="true" />
              Bloqueado
            </Badge>
          )}
        </div>
        {/* Os dois números são a evidência que separa a conta de instrução da
            compradora de verdade: fala muito E gera pedido. */}
        <p className="mt-0.5 text-xs text-muted-foreground">
          {perfil.messageCount}{" "}
          {perfil.messageCount === 1 ? "mensagem" : "mensagens"}
          {perfil.orderMessageCount > 0 && (
            <>
              {" · "}
              <span className="font-medium text-foreground">
                {perfil.orderMessageCount}{" "}
                {perfil.orderMessageCount === 1
                  ? "gerou pedido"
                  : "geraram pedido"}
              </span>
            </>
          )}
          {/* Dois-pontos porque o valor vem capitalizado ("Ontem") e a elipse
              fica explícita: "última: ontem" lê certo, "última Ontem" não. */}
          {perfil.lastSeenAt && (
            <> · última: {formatRelativeDate(perfil.lastSeenAt).toLowerCase()}</>
          )}
        </p>
      </div>

      <BlockProfileButton handle={perfil.handle} blocked={perfil.blocked} />
    </li>
  )
}
