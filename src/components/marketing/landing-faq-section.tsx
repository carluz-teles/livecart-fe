import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const faqs = [
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

        <Accordion type="single" collapsible className="mt-12 w-full">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.question} value={`item-${i}`}>
              <AccordionTrigger className="text-left text-base font-semibold">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-base leading-relaxed text-muted-foreground">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
