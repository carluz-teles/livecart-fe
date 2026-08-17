import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "O que é a LiveCart?",
    answer:
      "A LiveCart é uma plataforma de automação de vendas para redes sociais. Ela transforma conversas, comentários, lives e mensagens em oportunidades de venda, automatizando etapas como identificação do produto, criação do carrinho, envio do checkout e integração com sua operação.",
  },
  {
    question: "A LiveCart funciona apenas para lives?",
    answer:
      "Não. Lives são um dos principais casos de uso da LiveCart, mas a plataforma foi criada para permitir vendas em diferentes canais, incluindo Instagram, WhatsApp, mensagens e outros pontos de contato.",
  },
  {
    question: "Posso vender pelo Instagram?",
    answer:
      "Sim. A LiveCart pode ser utilizada para automatizar jornadas de venda iniciadas por interações no Instagram, como Direct, Stories e conteúdos.",
  },
  {
    question: "Posso vender pelo WhatsApp?",
    answer:
      "Sim. A LiveCart pode automatizar partes da jornada de compra iniciada em conversas no WhatsApp, reduzindo o trabalho manual da equipe.",
  },
  {
    question: "A LiveCart substitui meu ERP?",
    answer:
      "Não. A proposta é conectar sua operação de vendas às ferramentas que você já utiliza, evitando criar uma operação paralela.",
  },
  {
    question: "Preciso cadastrar meus pedidos manualmente?",
    answer:
      "A proposta da LiveCart é justamente reduzir esse trabalho. As informações geradas durante a jornada de compra podem ser utilizadas para criar e encaminhar o pedido automaticamente para os sistemas integrados.",
  },
  {
    question: "A LiveCart funciona com qualquer loja?",
    answer:
      "A compatibilidade depende das integrações disponíveis e da estrutura da sua operação. Consulte as integrações suportadas para verificar o seu cenário.",
  },
  {
    question: "Preciso ter uma equipe para atender meus clientes?",
    answer:
      "Não necessariamente. A automação pode assumir grande parte das interações repetitivas e encaminhar situações que exigem intervenção humana para sua equipe.",
  },
  {
    question: "A LiveCart usa inteligência artificial?",
    answer:
      "Sim. A plataforma utiliza IA e automações para interpretar mensagens e identificar intenções de compra, permitindo que o cliente se comunique de forma mais natural.",
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
