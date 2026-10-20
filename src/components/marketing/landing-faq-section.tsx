export const faqs = [
  { question: "A LiveCart integra com Tiny e Bling?", answer: "Sim. As integrações permitem importar catálogo e conectar pedidos ao ERP. O modo de reserva define se o pedido é enviado durante a live ou na preparação do pagamento. Veja as páginas públicas de Tiny e Bling para conhecer requisitos e limitações." },
  { question: "Posso fechar os pedidos depois da live?", answer: "Sim. Configure o período do evento e o prazo dos carrinhos para combinar o fechamento após a transmissão. Checkout, cobrança e frete manual precisam estar alinhados ao modo de envio ao ERP da loja." },
  { question: "A reserva impede vendas da mesma peça em outros canais?", answer: "Isso depende do modo de reserva e da configuração do ERP. Uma reserva local não é vista pelos outros canais antes do envio do pedido. No modo nativo, confira se a conta do ERP está configurada para reservar a partir do pedido." },
  {
    question: "O que é a LiveCart?",
    answer:
      "A LiveCart automatiza compras por código no Instagram e nas lives. Você divulga o código de um produto cadastrado; quando o cliente informa esse código, a plataforma adiciona o item ao carrinho e envia o link para concluir a compra.",
  },
  {
    question: "A LiveCart funciona apenas para lives?",
    answer:
      "Não. A compra por código também funciona nos comentários de posts, nas respostas aos Stories e no Direct do Instagram, conforme os canais que você configura.",
  },
  {
    question: "Posso vender pelo Instagram?",
    answer:
      "Sim. Divulgue os códigos dos seus produtos. A LiveCart identifica os códigos recebidos nos comentários, nas respostas aos Stories e no Direct para adicionar os itens ao carrinho.",
  },
  {
    question: "A LiveCart entende pedidos por cor ou descrição?",
    answer:
      "Na compra por código, o produto é identificado pelo código numérico cadastrado, como 1001. Uma frase como “quero o preto” não seleciona automaticamente um produto por cor ou descrição. Você divulga o código correspondente, e o cliente o informa para comprar. Dúvidas sobre os produtos continuam com o atendimento da sua loja.",
  },
  {
    question: "A LiveCart substitui meu ERP?",
    answer:
      "Não. A ideia é conectar suas vendas às ferramentas que você já usa, sem criar uma operação paralela.",
  },
  {
    question: "Preciso cadastrar meus pedidos manualmente?",
    answer:
      "A LiveCart adiciona os produtos ao carrinho a partir dos códigos informados pelo cliente e envia o link de compra. O envio dos pedidos aos sistemas conectados segue as configurações da sua loja.",
  },
  {
    question: "Como o cliente compra durante a live?",
    answer:
      "Você apresenta o produto e seu código, por exemplo 1001. O cliente comenta 1001 para uma unidade ou 2x 1001 para duas. A LiveCart adiciona o produto ao carrinho e envia o link pelo Direct. O cliente abre o link, confere os itens e finaliza a compra.",
  },
]

export function LandingFaqSection() {
  return (
    <section id="faq" className="bg-secondary/40 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            FAQ
          </span>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Perguntas frequentes
          </h2>
        </div>

        <div className="mt-12 divide-y rounded-xl border bg-card">
          {faqs.map((faq) => (
            <details key={faq.question} className="group p-5 sm:p-6">
              <summary className="cursor-pointer text-base font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary">{faq.question}</summary>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">{faq.answer}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
