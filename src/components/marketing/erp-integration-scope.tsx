interface ERPIntegrationScopeProps { provider: "Tiny" | "Bling" }

export function ERPIntegrationScope({ provider }: ERPIntegrationScopeProps) {
  const rows = [
    { operation: "Produtos", direction: `${provider} → LiveCart`, condition: "Importação do catálogo selecionado e atualizações recebidas pela integração." },
    { operation: "Estoque", direction: `${provider} → LiveCart`, condition: "Leitura do saldo disponível. A reserva nativa depende da configuração da conta do ERP." },
    { operation: "Pedido e itens", direction: `LiveCart → ${provider}`, condition: "Durante a live no modo nativo; na preparação do pagamento no modo local. Alterações dependem do estado do pedido." },
    { operation: "Pagamento e situação", direction: "Conciliação entre os sistemas", condition: "Confirmações são tratadas conforme sua origem e os dados disponíveis. Pedido criado ou faturado não comprova pagamento." },
    { operation: "Nota fiscal", direction: `${provider} → LiveCart`, condition: "Acompanhamento dos dados recebidos do ERP. A emissão continua no ERP." },
  ]
  return <section aria-labelledby="escopo-integracao" className="my-10">
    <h2 id="escopo-integracao" className="text-2xl font-semibold tracking-tight">O que a integração faz</h2>
    <div className="mt-5 overflow-x-auto rounded-xl border" role="region" aria-label={`Operações da integração ${provider}`} tabIndex={0}>
      <table className="w-full min-w-full text-left text-sm">
        <caption className="sr-only">Operações, direção dos dados e condições da integração com {provider}</caption>
        <thead className="bg-secondary"><tr><th scope="col" className="p-4">Operação</th><th scope="col" className="p-4">Direção</th><th scope="col" className="p-4">Quando e em quais condições</th></tr></thead>
        <tbody className="divide-y">{rows.map((row) => <tr key={row.operation}><th scope="row" className="p-4 align-top font-medium">{row.operation}</th><td className="p-4 align-top">{row.direction}</td><td className="p-4 align-top leading-relaxed text-muted-foreground">{row.condition}</td></tr>)}</tbody>
      </table>
    </div>
  </section>
}
