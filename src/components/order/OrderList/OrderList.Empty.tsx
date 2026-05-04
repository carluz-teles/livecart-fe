export function OrderListEmpty() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <span
        aria-hidden="true"
        className="font-mono text-7xl font-light leading-none tracking-tighter text-muted-foreground/30"
      >
        0
      </span>
      <span className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground/70">
        Sem pedidos nesta visão
      </span>
      <p className="max-w-sm text-sm leading-relaxed text-muted-foreground">
        Ajuste a aba ou os filtros — ou aguarde a próxima live. Pedidos
        finalizados pelos clientes aparecem aqui em tempo real.
      </p>
    </div>
  )
}
