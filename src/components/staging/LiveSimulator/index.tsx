"use client"

/**
 * Simulador de live — bancada de teste de STAGING.
 *
 * ═══ POR QUE ELE PARECE UM APARELHO, E NÃO COM O RESTO DO PAINEL ═══
 *
 * A cor é requisito, não enfeite. Este painel fabrica comentário do nada, e
 * comentário vira carrinho, que vira pedido no ERP. Quem estiver olhando tem de
 * saber, sem ler uma palavra, que não está no painel de verdade.
 *
 * O app inteiro é âmbar (--primary: hsl(37.7 92% 50%)) sobre claro. Então aqui
 * é o oposto: preto de bancada, lima ácido, tudo em monoespaçada, faixa de
 * perigo listrada no topo. Não existe nada assim no produto — é justamente o
 * ponto. Nenhuma captura de tela desta gaveta pode ser confundida com produção.
 *
 * ═══ E POR QUE A COR NÃO É A SEGURANÇA ═══
 *
 * O gate visual daqui é conveniência. A porta trancada é a do backend: fora de
 * staging as rotas NÃO SÃO REGISTRADAS, e toda chamada volta 404 — nem 403, que
 * já revelaria que existe algo ali. Ver simulador_live.go.
 */

import { useEffect, useMemo, useState } from "react"
import { useAuth } from "@clerk/nextjs"
import { toast } from "sonner"
import { FlaskConical, Loader2, Radio, Send, SquareDashedBottom, X } from "lucide-react"

import { useStoreId } from "@/hooks/useUser"
import { cn } from "@/lib/utils"
import {
  simulatorService,
  type SessaoSimulavel,
  type ComentarioSimuladoResult,
} from "./simulator.service"

/** Só staging. Ver a nota no topo — isto é conveniência, não a tranca. */
const EH_STAGING = process.env.NEXT_PUBLIC_APP_ENV === "staging"

export function LiveSimulator() {
  const [aberto, setAberto] = useState(false)
  if (!EH_STAGING) return null

  return (
    <>
      <button
        type="button"
        onClick={() => setAberto(true)}
        aria-label="Abrir simulador de live (staging)"
        className={cn(
          "fixed right-0 top-1/2 z-40 -translate-y-1/2 rounded-l-md border border-r-0",
          "border-[#7c8b1a] bg-[#0b0e05] px-2 py-4 shadow-lg transition-all",
          "hover:bg-[#141a08] hover:px-3",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4f82a]",
        )}
      >
        <span
          className="flex items-center gap-2 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-[#c4f82a]"
          style={{ writingMode: "vertical-rl" }}
        >
          <FlaskConical className="h-3.5 w-3.5 rotate-90" />
          Simulador
        </span>
      </button>

      {aberto ? <Bancada onFechar={() => setAberto(false)} /> : null}
    </>
  )
}

function Bancada({ onFechar }: { onFechar: () => void }) {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()

  const [sessoes, setSessoes] = useState<SessaoSimulavel[]>([])
  const [carregando, setCarregando] = useState(true)
  const [sessionId, setSessionId] = useState("")
  const [mediaId, setMediaId] = useState("")
  const [handle, setHandle] = useState("@maria.teste")
  const [texto, setTexto] = useState("quero 2")
  const [vezes, setVezes] = useState(1)
  const [ocupado, setOcupado] = useState<string | null>(null)
  const [ultimo, setUltimo] = useState<ComentarioSimuladoResult | null>(null)

  useEffect(() => {
    if (!storeId) return
    let vivo = true
    ;(async () => {
      try {
        const token = await getToken()
        const lista = await simulatorService.listarSessoes(storeId, token)
        if (!vivo) return
        setSessoes(lista)
        const comMidia = lista.find((s) => s.midiasVivas.length > 0)
        if (comMidia) {
          setSessionId(comMidia.sessionId)
          setMediaId(comMidia.midiasVivas[0])
        } else if (lista.length > 0) {
          setSessionId(lista[0].sessionId)
        }
      } catch {
        if (vivo) toast.error("Não consegui listar as sessões")
      } finally {
        if (vivo) setCarregando(false)
      }
    })()
    return () => {
      vivo = false
    }
  }, [storeId, getToken])

  const sessaoEscolhida = useMemo(
    () => sessoes.find((s) => s.sessionId === sessionId),
    [sessoes, sessionId],
  )

  async function criarMidia() {
    if (!storeId || !sessionId) return
    setOcupado("midia")
    try {
      const token = await getToken()
      const r = await simulatorService.criarMidia(storeId, sessionId, "", token)
      setMediaId(r.mediaId)
      toast.success("Mídia no ar", { description: r.mediaId })
    } catch (e) {
      toast.error("Não consegui criar a mídia", { description: String(e) })
    } finally {
      setOcupado(null)
    }
  }

  async function encerrarMidia() {
    if (!storeId || !mediaId) return
    setOcupado("encerrar")
    try {
      const token = await getToken()
      await simulatorService.encerrarMidia(storeId, mediaId, token)
      toast.success("Transmissão encerrada", {
        description: "Comentário nessa mídia não resolve mais a sessão.",
      })
      setMediaId("")
    } catch (e) {
      toast.error("Não consegui encerrar", { description: String(e) })
    } finally {
      setOcupado(null)
    }
  }

  async function comentar() {
    if (!storeId || !mediaId) return
    setOcupado("comentar")
    try {
      const token = await getToken()
      const r = await simulatorService.comentar(
        storeId,
        { mediaId, handle, text: texto, vezes },
        token,
      )
      setUltimo(r)
      if (r.falhas?.length) {
        toast.warning(`${r.entregues.length} entregues, ${r.falhas.length} falharam`)
      } else {
        toast.success(`${r.entregues.length} comentário(s) entregue(s)`)
      }
    } catch (e) {
      toast.error("Não consegui entregar", { description: String(e) })
    } finally {
      setOcupado(null)
    }
  }

  const noAr = Boolean(mediaId)

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"
        onClick={onFechar}
        aria-hidden
      />

      <aside
        className="relative flex h-full w-full max-w-[26rem] flex-col overflow-y-auto border-l border-[#7c8b1a]/50 bg-[#0b0e05] font-mono text-[#dfe8c4] shadow-2xl"
        role="dialog"
        aria-label="Simulador de live (staging)"
      >
        {/* Faixa de perigo: o primeiro sinal, antes de qualquer texto. */}
        <div
          className="h-2 w-full flex-shrink-0"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg,#c4f82a 0 10px,#0b0e05 10px 20px)",
          }}
          aria-hidden
        />

        <header className="flex items-start justify-between gap-3 border-b border-[#7c8b1a]/30 px-5 py-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[#c4f82a]">
              Staging · bancada de teste
            </p>
            <h2 className="mt-1 text-lg font-bold leading-tight text-[#f2f7e4]">
              Simulador de live
            </h2>
            <p className="mt-1 text-[11px] leading-relaxed text-[#8a9a68]">
              Fabrica o webhook que o Instagram mandaria e entrega ao mesmo
              processamento do webhook real. Não existe em produção.
            </p>
          </div>
          <button
            type="button"
            onClick={onFechar}
            aria-label="Fechar"
            className="mt-0.5 rounded p-1 text-[#8a9a68] transition-colors hover:bg-[#c4f82a]/10 hover:text-[#c4f82a]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-5 px-5 py-5">
          {/* ── 1. A TRANSMISSÃO ─────────────────────────────────────── */}
          <Bloco numero="01" titulo="A transmissão">
            {carregando ? (
              <p className="flex items-center gap-2 text-[11px] text-[#8a9a68]">
                <Loader2 className="h-3 w-3 animate-spin" /> lendo sessões…
              </p>
            ) : sessoes.length === 0 ? (
              <p className="text-[11px] leading-relaxed text-[#c9a227]">
                Nenhuma sessão nesta loja. Crie um evento com sessão antes.
              </p>
            ) : (
              <>
                <Campo rotulo="Sessão">
                  <select
                    value={sessionId}
                    onChange={(e) => setSessionId(e.target.value)}
                    className="w-full rounded border border-[#7c8b1a]/40 bg-[#141a08] px-2 py-1.5 text-[11px] text-[#dfe8c4] outline-none focus:border-[#c4f82a]"
                  >
                    {sessoes.map((s) => (
                      <option key={s.sessionId} value={s.sessionId}>
                        {s.eventTitle || "sem título"} · {s.status}
                        {s.midiasVivas.length > 0 ? " · no ar" : ""}
                      </option>
                    ))}
                  </select>
                </Campo>

                {sessaoEscolhida && sessaoEscolhida.midiasVivas.length > 0 && !mediaId ? (
                  <div className="rounded border border-[#7c8b1a]/30 bg-[#141a08] px-2.5 py-2">
                    <p className="text-[10px] uppercase tracking-wider text-[#8a9a68]">
                      já no ar nesta sessão
                    </p>
                    {sessaoEscolhida.midiasVivas.map((m) => (
                      <button
                        key={m}
                        type="button"
                        onClick={() => setMediaId(m)}
                        className="mt-1 block w-full truncate text-left text-[11px] text-[#c4f82a] hover:underline"
                      >
                        {m}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={criarMidia}
                    disabled={!sessionId || ocupado !== null}
                    className={botao("primario")}
                  >
                    {ocupado === "midia" ? (
                      <Loader2 className="h-3 w-3 animate-spin" />
                    ) : (
                      <Radio className="h-3 w-3" />
                    )}
                    Entrar no ar
                  </button>
                  {noAr ? (
                    <button
                      type="button"
                      onClick={encerrarMidia}
                      disabled={ocupado !== null}
                      className={botao("secundario")}
                    >
                      {ocupado === "encerrar" ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <SquareDashedBottom className="h-3 w-3" />
                      )}
                      Encerrar
                    </button>
                  ) : null}
                </div>

                {noAr ? (
                  <div className="rounded border border-[#c4f82a]/40 bg-[#c4f82a]/5 px-2.5 py-2">
                    <p className="flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-[#c4f82a]">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#c4f82a] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#c4f82a]" />
                      </span>
                      no ar
                    </p>
                    <p className="mt-1 break-all text-[11px] text-[#dfe8c4]">{mediaId}</p>
                  </div>
                ) : null}
              </>
            )}
          </Bloco>

          {/* ── 2. O COMENTÁRIO ──────────────────────────────────────── */}
          <Bloco numero="02" titulo="O comentário" apagado={!noAr}>
            <Campo rotulo="@ da compradora">
              <input
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@maria.teste"
                className={entrada}
              />
            </Campo>
            <p className="-mt-1 text-[10px] leading-relaxed text-[#8a9a68]">
              O id do Instagram é derivado do @ e é sempre o mesmo — assim o
              carrinho acumula entre comentários, como numa live de verdade.
            </p>

            <Campo rotulo="Texto">
              <input
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="quero 2"
                className={entrada}
              />
            </Campo>

            <Campo rotulo={`Repetir · ${vezes}×`}>
              <input
                type="range"
                min={1}
                max={25}
                value={vezes}
                onChange={(e) => setVezes(Number(e.target.value))}
                className="w-full accent-[#c4f82a]"
              />
            </Campo>

            <button
              type="button"
              onClick={comentar}
              disabled={!noAr || ocupado !== null || !texto.trim()}
              className={cn(botao("primario"), "w-full justify-center py-2")}
            >
              {ocupado === "comentar" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              Entregar {vezes > 1 ? `${vezes} comentários` : "comentário"}
            </button>
          </Bloco>

          {ultimo ? (
            <Bloco numero="03" titulo="Última entrega">
              <dl className="space-y-1 text-[11px]">
                <Linha termo="comprador" valor={`@${ultimo.handle}`} />
                <Linha termo="id do IG" valor={ultimo.userId} />
                <Linha termo="entregues" valor={String(ultimo.entregues.length)} />
                {ultimo.falhas?.length ? (
                  <Linha termo="falhas" valor={String(ultimo.falhas.length)} alerta />
                ) : null}
              </dl>
              {ultimo.falhas?.length ? (
                <pre className="mt-2 max-h-28 overflow-auto rounded border border-[#c9a227]/40 bg-[#1a1405] p-2 text-[10px] leading-relaxed text-[#e0b84a]">
                  {ultimo.falhas.join("\n")}
                </pre>
              ) : null}
            </Bloco>
          ) : null}
        </div>

        <footer className="border-t border-[#7c8b1a]/30 px-5 py-3">
          <p className="text-[10px] leading-relaxed text-[#8a9a68]">
            As rotas deste painel não existem fora de staging — o servidor
            responde 404 porque não há o que servir.
          </p>
        </footer>
      </aside>
    </div>
  )
}

/* ── peças ──────────────────────────────────────────────────────────── */

const entrada =
  "w-full rounded border border-[#7c8b1a]/40 bg-[#141a08] px-2 py-1.5 text-[11px] text-[#dfe8c4] placeholder:text-[#5e6b42] outline-none focus:border-[#c4f82a]"

function botao(tipo: "primario" | "secundario") {
  return cn(
    "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40",
    tipo === "primario"
      ? "bg-[#c4f82a] text-[#0b0e05] hover:bg-[#d4ff4a]"
      : "border border-[#7c8b1a]/50 text-[#8a9a68] hover:border-[#c4f82a]/60 hover:text-[#c4f82a]",
  )
}

function Bloco({
  numero,
  titulo,
  apagado,
  children,
}: {
  numero: string
  titulo: string
  apagado?: boolean
  children: React.ReactNode
}) {
  return (
    <section className={cn("space-y-2.5", apagado && "pointer-events-none opacity-35")}>
      <h3 className="flex items-baseline gap-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8a9a68]">
        <span className="text-[#c4f82a]">{numero}</span>
        {titulo}
      </h3>
      {children}
    </section>
  )
}

function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-[#8a9a68]">{rotulo}</span>
      {children}
    </label>
  )
}

function Linha({ termo, valor, alerta }: { termo: string; valor: string; alerta?: boolean }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-[#8a9a68]">{termo}</dt>
      <dd className={cn("truncate", alerta ? "text-[#e0b84a]" : "text-[#dfe8c4]")}>{valor}</dd>
    </div>
  )
}
