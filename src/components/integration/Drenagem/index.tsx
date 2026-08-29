"use client"

import { useState } from "react"
import { AlertTriangle, ArrowRightLeft, CheckCircle2, Loader2 } from "lucide-react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { useDrenagemPendente, useDrenar, useDrenarTudo } from "@/hooks/integration"
import type { DrainReport } from "@/types"

/**
 * A migração das reservas manuais para pedidos de venda.
 *
 * É um painel com prazo de validade, e ele mesmo sabe disso: só existe enquanto
 * houver carrinho segurando peça pelo modelo antigo. Quando o ensaio devolve
 * zero, não renderiza nada — sem precisar de um segundo deploy para removê-lo,
 * que é como painéis de migração acabam esquecidos em produção.
 *
 * A ordem que ele executa é a segurança inteira, e vive no backend: para cada
 * carrinho o PEDIDO assume a guarda primeiro, e só então a saída manual é
 * devolvida. Invertida, existe um instante em que a peça está solta.
 */
export function Drenagem() {
  const pendente = useDrenagemPendente()
  const drenar = useDrenar()
  const { progresso, rodar, parar } = useDrenarTudo()
  const [confirmando, setConfirmando] = useState<number | null>(null)
  const [ultimo, setUltimo] = useState<DrainReport | null>(null)

  const falta = pendente.data
  // Enquanto carrega, nada aparece. Piscar um painel que pode sumir é pior que
  // esperar meio segundo.
  if (pendente.isLoading || !falta) return null
  if (falta.carts === 0) {
    // Acabou. Mostra o encerramento uma vez, só para quem acabou de rodar.
    if (!ultimo) return null
    return (
      <div className="rounded-lg border border-emerald-200/70 bg-emerald-50/50 px-3.5 py-3 dark:border-emerald-900/40 dark:bg-emerald-950/20">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
          <p className="text-sm font-medium text-foreground">
            Migração concluída — nenhuma reserva manual restante
          </p>
        </div>
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
          Todo carrinho aberto passou a segurar estoque pelo pedido de venda no
          Tiny. Confira que o <span className="font-medium">saldo</span> dos
          produtos subiu e o <span className="font-medium">disponível</span>{" "}
          ficou parado — é a prova de que a guarda trocou sem soltar peça.
        </p>
      </div>
    )
  }

  const rodando = drenar.isPending
  const erro = drenar.error

  return (
    <div className="rounded-lg border border-amber-300/70 bg-amber-50/50 px-3.5 py-3 dark:border-amber-900/50 dark:bg-amber-950/20">
      <div className="flex items-start gap-2">
        <ArrowRightLeft className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-500" />
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-foreground">
            {falta.carts} {falta.carts === 1 ? "pedido segura" : "pedidos seguram"}{" "}
            estoque pelo modelo antigo
          </p>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            São <span className="font-medium text-foreground">{falta.units} unidades</span>{" "}
            fora do Tiny por saída manual. A migração cria o pedido de venda de cada
            um e só então devolve a saída — nessa ordem a peça nunca fica solta.
          </p>

          {ultimo && (
            <div className="mt-2.5 rounded border border-border/70 bg-background/60 px-2.5 py-2">
              <p className="font-mono text-[11px] leading-relaxed text-muted-foreground">
                última passada · {ultimo.ordersCreated} pedidos criados ·{" "}
                {ultimo.rowsReversed} linhas estornadas ·{" "}
                <span className={ultimo.failed > 0 ? "font-semibold text-destructive" : ""}>
                  {ultimo.failed} falhas
                </span>{" "}
                · {ultimo.tookSeconds.toFixed(1)}s
              </p>
              {ultimo.failed > 0 && (
                <p className="mt-1.5 text-[11px] leading-relaxed text-destructive">
                  Cada falha é um carrinho que ficou com a reserva antiga intacta —
                  recuperável, mas não continue sem olhar o log antes.
                </p>
              )}
            </div>
          )}

          {erro && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {erro instanceof Error ? erro.message : "a passada falhou"}
            </p>
          )}

          {progresso.rodando && (
            <div className="mt-2.5">
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-xs font-medium text-foreground">
                  Migrando {progresso.feitos} de {progresso.total} — lote {progresso.lote}
                </p>
                <p className="font-mono text-[11px] text-muted-foreground">
                  ~{Math.max(1, Math.ceil(((progresso.total - progresso.feitos) * 16) / 60))} min
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-amber-200/60 dark:bg-amber-900/40">
                <div
                  className="h-full rounded-full bg-amber-600 transition-[width] duration-500 dark:bg-amber-500"
                  style={{
                    width: `${progresso.total ? (progresso.feitos / progresso.total) * 100 : 0}%`,
                  }}
                />
              </div>
              <p className="mt-1.5 text-[11px] leading-relaxed text-muted-foreground">
                Cada lote leva cerca de um minuto e meio — o teto da conta no Tiny é
                de 30 escritas por minuto. Pode parar entre lotes: a próxima passada
                continua de onde esta ficou.
              </p>
            </div>
          )}

          {progresso.erro && !progresso.rodando && (
            <p className="mt-2 flex items-start gap-1.5 text-xs text-destructive">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {progresso.erro}
            </p>
          )}

          <div className="mt-2.5 flex flex-wrap items-center gap-2">
            {progresso.rodando ? (
              <Button size="sm" variant="outline" onClick={parar}>
                Parar depois deste lote
              </Button>
            ) : (
              <>
                <Button size="sm" disabled={rodando} onClick={() => setConfirmando(-1)}>
                  Migrar tudo ({falta.carts})
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={rodando}
                  onClick={() => setConfirmando(5)}
                >
                  {rodando && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Só 5, para conferir
                </Button>
                <button
                  type="button"
                  disabled={pendente.isFetching}
                  onClick={() => void pendente.refetch()}
                  className="text-xs text-muted-foreground underline-offset-2 hover:underline disabled:opacity-50"
                >
                  recontar
                </button>
              </>
            )}
          </div>
          {!progresso.rodando && (
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Comece por 5 e confira no Tiny antes de soltar o resto: o saldo tem que
              subir e o disponível tem que ficar igual.
            </p>
          )}
        </div>
      </div>

      <AlertDialog
        open={confirmando !== null}
        onOpenChange={(o) => !o && setConfirmando(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmando === -1
                ? `Migrar os ${falta.carts} pedidos agora?`
                : `Migrar ${confirmando} ${confirmando === 1 ? "pedido" : "pedidos"} agora?`}
            </AlertDialogTitle>
            <AlertDialogDescription asChild>
              <div className="space-y-2 text-sm">
                <p>
                  Isto escreve no Tiny e <strong>não tem volta</strong>: cria o pedido
                  de venda de cada carrinho e devolve a saída manual de estoque.
                </p>
                <p>
                  Depois, num dos produtos afetados, o saldo tem de{" "}
                  <strong>subir</strong> e o disponível tem de{" "}
                  <strong>ficar igual</strong>. Se o disponível subir junto, a peça
                  foi solta e está à venda de novo — pare e não rode outro lote.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const n = confirmando ?? 5
                setConfirmando(null)
                if (n === -1) {
                  void rodar()
                  return
                }
                drenar.mutate(n, { onSuccess: (r) => setUltimo(r) })
              }}
            >
              {confirmando === -1 ? "Migrar tudo" : `Migrar ${confirmando}`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
