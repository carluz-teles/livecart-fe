"use client"

/**
 * As peças da bancada de staging.
 *
 * Extraídas para cá quando o simulador de pagamentos chegou: as duas abas usam
 * o mesmo campo, o mesmo botão e o mesmo bloco numerado, e duplicá-los faria a
 * bancada divergir de si mesma ao primeiro ajuste.
 *
 * ═══ POR QUE ELA NÃO PARECE COM O PAINEL ═══
 *
 * A cor é requisito, não enfeite. Esta bancada fabrica comentário e pagamento
 * do nada — e pagamento marca venda como paga. Quem estiver olhando tem de
 * saber, sem ler uma palavra, que não está no painel de verdade.
 *
 * O app inteiro é âmbar sobre claro. Aqui é o oposto: preto de bancada, lima
 * ácido, monoespaçada, faixa listrada no topo. Nenhuma captura de tela desta
 * gaveta pode ser confundida com produção.
 *
 * O gate visual é conveniência. A porta trancada é a do backend: fora de
 * staging as rotas NÃO SÃO REGISTRADAS.
 */

import { cn } from "@/lib/utils"

export const CORES = {
  fundo: "#0b0e05",
  campo: "#141a08",
  borda: "#7c8b1a",
  acento: "#c4f82a",
  texto: "#dfe8c4",
  textoForte: "#f2f7e4",
  apagado: "#8a9a68",
  aviso: "#e0b84a",
} as const

export const entrada =
  "w-full rounded border border-[#7c8b1a]/40 bg-[#141a08] px-2 py-1.5 text-[11px] text-[#dfe8c4] placeholder:text-[#5e6b42] outline-none focus:border-[#c4f82a]"

export function botao(tipo: "primario" | "secundario") {
  return cn(
    "inline-flex items-center gap-1.5 rounded px-2.5 py-1.5 font-mono text-[11px] font-bold uppercase tracking-wider transition-colors disabled:opacity-40",
    tipo === "primario"
      ? "bg-[#c4f82a] text-[#0b0e05] hover:bg-[#d4ff4a]"
      : "border border-[#7c8b1a]/50 text-[#8a9a68] hover:border-[#c4f82a]/60 hover:text-[#c4f82a]",
  )
}

export function Bloco({
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

export function Campo({ rotulo, children }: { rotulo: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-[10px] uppercase tracking-wider text-[#8a9a68]">{rotulo}</span>
      {children}
    </label>
  )
}

export function Linha({
  termo,
  valor,
  alerta,
  destaque,
}: {
  termo: string
  valor: string
  alerta?: boolean
  destaque?: boolean
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className={cn("text-[#8a9a68]", destaque && "font-bold text-[#dfe8c4]")}>{termo}</dt>
      <dd
        className={cn(
          "truncate tabular-nums",
          alerta ? "text-[#e0b84a]" : destaque ? "font-bold text-[#c4f82a]" : "text-[#dfe8c4]",
        )}
      >
        {valor}
      </dd>
    </div>
  )
}

/** Faixa de perigo: o primeiro sinal, antes de qualquer texto. */
export function FaixaDePerigo() {
  return (
    <div
      className="h-2 w-full flex-shrink-0"
      style={{
        backgroundImage: "repeating-linear-gradient(45deg,#c4f82a 0 10px,#0b0e05 10px 20px)",
      }}
      aria-hidden
    />
  )
}

/** Dinheiro em centavos → "R$ 1.234,56". */
export function reais(centavos: number): string {
  return (centavos / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
}
