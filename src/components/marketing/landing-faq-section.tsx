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
      "A LiveCart é uma plataforma de automação de vendas para redes sociais. Ela transforma conversas, comentários, lives e mensagens em oportunidades de venda, automatizando etapas como identificação do produto, criação do carrinho, envio do checkout e integração com sua operação.",
  },
  {
    question: "A LiveCart funciona apenas para lives?",
    answer:
      "Não. As lives são um dos usos mais comuns, mas a plataforma também vende pelo Instagram, por mensagens e por outros pontos de contato.",
  },
  {
    question: "Posso vender pelo Instagram?",
    answer:
      "Sim. A LiveCart automatiza vendas que começam no Instagram, seja no Direct, nos Stories ou nos posts.",
  },
  {
    question: "A LiveCart substitui meu ERP?",
    answer:
      "Não. A ideia é conectar suas vendas às ferramentas que você já usa, sem criar uma operação paralela.",
  },
  {
    question: "Preciso cadastrar meus pedidos manualmente?",
    answer:
      "É justamente esse trabalho que a LiveCart tira das suas costas. Os dados da conversa viram um pedido que segue sozinho para os sistemas que você conectou.",
  },
  {
    question: "Como o cliente compra durante a live?",
    answer:
      "Você define um código para cada produto. Durante a live, quem digita o código no comentário recebe uma resposta imediata com o carrinho e o link de checkout.",
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
