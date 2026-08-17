"use client"

import { Loader2, Search } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { HANDLE_SEARCH_MIN_TERM, useSearchHandles } from "@/hooks/customer"
import { BlockedProfilesResults } from "./BlockedProfiles.Results"

interface BlockedProfilesSearchProps {
  term: string
  onTermChange: (value: string) => void
  exact: boolean
  onExactChange: (value: boolean) => void
}

// Busca na plateia das lives.
//
// Uma caixa só resolve os dois caminhos que a lojista precisa: achar o perfil
// pelo trecho que ela lembra, e — quando nada casa — bloquear o arroba digitado
// mesmo assim (conta nova, que ainda não falou em live nenhuma). Duas caixas
// separadas para "buscar" e "bloquear à mão" seriam dois campos fazendo a mesma
// pergunta, com a segunda sem nenhuma evidência para embasar a decisão.
export function BlockedProfilesSearch({
  term,
  onTermChange,
  exact,
  onExactChange,
}: BlockedProfilesSearchProps) {
  const {
    data,
    searching,
    hasTerm,
    isError,
    term: normalizedTerm,
  } = useSearchHandles(term, { exact })

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Search className="h-4 w-4" />
          Buscar perfil
        </CardTitle>
        <p className="text-xs leading-relaxed text-muted-foreground">
          Procura entre os perfis que já mandaram mensagem nas suas lives. A
          lista completa não aparece de propósito — uma live tem centenas de
          arrobas, e achar o certo numa lista desse tamanho é mais arriscado que
          buscar.
        </p>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
          <div className="flex-1 space-y-1.5">
            <Label htmlFor="handle-search">Arroba do perfil</Label>
            <div className="relative">
              <span
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground"
                aria-hidden="true"
              >
                @
              </span>
              <Input
                id="handle-search"
                value={term}
                onChange={(e) => onTermChange(e.target.value)}
                placeholder="cantodaart"
                className="pl-6"
                autoComplete="off"
                spellCheck={false}
                aria-describedby="handle-search-hint"
              />
              {searching && (
                <Loader2
                  className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground"
                  aria-hidden="true"
                />
              )}
            </div>
            <p id="handle-search-hint" className="text-xs text-muted-foreground">
              A partir de {HANDLE_SEARCH_MIN_TERM} caracteres. O @ é opcional.
            </p>
          </div>

          <div className="flex items-center gap-2 sm:mt-8">
            <Switch
              id="exact-match"
              checked={exact}
              onCheckedChange={onExactChange}
            />
            <Label htmlFor="exact-match" className="cursor-pointer text-sm">
              Arroba exato
            </Label>
          </div>
        </div>

        <BlockedProfilesResults
          term={normalizedTerm}
          hasTerm={hasTerm}
          searching={searching}
          isError={isError}
          results={data ?? []}
        />
      </CardContent>
    </Card>
  )
}
