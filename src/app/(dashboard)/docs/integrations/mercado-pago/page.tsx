import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Info,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Callout, FaqItem, Highlight, Step } from "@/components/docs"

export default function MercadoPagoDocPage() {
  return (
    <article className="mx-auto w-full max-w-3xl space-y-10 py-4">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1 hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" />
          Documentação
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/docs" className="hover:text-foreground">
          Integrações
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-foreground">Mercado Pago</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" />
          Integrações &middot; Pagamentos
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Integrar com o Mercado Pago
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conecte sua conta Mercado Pago ao LiveCart para aceitar Pix e cartão
          de crédito no checkout. A configuração é feita por OAuth — você
          autoriza o LiveCart pelo próprio Mercado Pago, sem precisar copiar
          chave nenhuma.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Tempo estimado: <strong className="text-foreground">2 minutos</strong>
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            •
          </span>
          <span>
            Você precisa de uma{" "}
            <strong className="text-foreground">conta Mercado Pago</strong>
          </span>
        </div>
      </header>

      {/* Intro callout */}
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="Como funciona"
        tone="neutral"
      >
        Você clica em <strong>Conectar</strong> aqui no LiveCart, faz login no
        Mercado Pago (se ainda não estiver logado), revisa as permissões que
        o LiveCart está pedindo e clica em <strong>Autorizar</strong>. Pronto
        — sua conta está conectada e o checkout já vai mostrar Pix e cartão
        para os clientes.
      </Callout>

      {/* Step 1 */}
      <Step
        number={1}
        title='Abra Integrações e clique em "Conectar Mercado Pago"'
        location="livecart"
      >
        <p>
          No menu lateral do LiveCart, vá em{" "}
          <Highlight>Configurações &rsaquo; Integrações</Highlight>. Na aba{" "}
          <Highlight>Pagamentos</Highlight>, encontre o card do Mercado Pago e
          clique em <Highlight>Conectar Mercado Pago</Highlight>.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/integrations">
            Ir para Integrações
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </Step>

      {/* Step 2 */}
      <Step
        number={2}
        title="Faça login no Mercado Pago"
        location="livecart"
      >
        <p>
          O LiveCart abre o Mercado Pago em uma nova aba. Se você ainda não
          estiver logado, entre com a conta da sua loja — a mesma onde os
          pagamentos serão recebidos.
        </p>
        <Callout
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Use a conta certa"
          tone="warning"
        >
          Se você gerencia várias contas Mercado Pago (pessoa física + loja, por
          exemplo), confira no canto superior direito do site se está logado na{" "}
          <strong>conta da loja</strong>. É essa que vai receber os pagamentos.
        </Callout>
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title="Autorize as permissões"
        location="livecart"
      >
        <p>
          O Mercado Pago vai mostrar uma tela listando o que o LiveCart está
          pedindo permissão para fazer (em geral: ler dados da conta, cobrar e
          consultar pagamentos). Revise a lista e clique em{" "}
          <Highlight>Autorizar</Highlight>.
        </p>
        <p>
          Após autorizar, o navegador volta automaticamente para o LiveCart
          com uma confirmação de sucesso.
        </p>
      </Step>

      {/* Done */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
              Pronto! Sua conta está integrada
            </h3>
            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
              No card do Mercado Pago em Integrações, o status agora aparece
              como <strong>Conectado</strong>. O checkout passa a mostrar Pix
              e cartão de crédito automaticamente — você não precisa
              configurar mais nada.
            </p>
          </div>
        </div>
      </div>

      {/* FAQ */}
      <section className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Perguntas frequentes
        </h2>

        <FaqItem
          question="Preciso ter uma conta Mercado Pago empresarial (CNPJ)?"
          answer={
            <>
              Não obrigatoriamente. Pessoa física que vende online também
              consegue receber, mas algumas contas têm limites mensais ou
              precisam de validação. Se você já vende pelo Mercado Pago hoje,
              a conta atual serve.
            </>
          }
        />

        <FaqItem
          question="Quais dados o LiveCart acessa da minha conta?"
          answer={
            <>
              Apenas o necessário para criar e consultar pagamentos: dados
              básicos da conta (id, e-mail), criação de cobranças Pix e
              cartão, e o status dos pagamentos para confirmar quando o
              cliente paga. O LiveCart não move dinheiro entre contas, não
              acessa saldo nem altera configurações da sua conta.
            </>
          }
        />

        <FaqItem
          question="O cliente vê o nome “Mercado Pago” no checkout?"
          answer={
            <>
              No checkout do LiveCart o cliente vê apenas as opções{" "}
              <strong>Pix</strong> e <strong>Cartão de crédito</strong>. O
              processamento por trás é Mercado Pago, mas isso fica em segundo
              plano — o cliente só identifica o gateway na fatura do cartão
              (quando aparece o nome da loja seguido da operadora) e no
              comprovante Pix.
            </>
          }
        />

        <FaqItem
          question="Existe modo de teste antes de receber de verdade?"
          answer={
            <>
              O LiveCart usa as credenciais de produção da sua conta Mercado
              Pago. Para testar fluxo sem cobrar de verdade, recomendamos
              fazer uma venda pequena em uma live de teste e usar o seu
              próprio cartão — você consegue verificar o pagamento e estornar
              em seguida pelo painel do Mercado Pago se quiser.
            </>
          }
        />

        <FaqItem
          question="Como desconectar a conta?"
          answer={
            <>
              No card do Mercado Pago em{" "}
              <Highlight>Configurações &rsaquo; Integrações</Highlight>,
              clique no ícone de tomada (Unplug). Os pagamentos param na hora.
              Você pode reconectar a qualquer momento — basta repetir os 3
              passos deste guia.
            </>
          }
        />
      </section>

      {/* Footer */}
      <div className="border-t pt-6">
        <Link
          href="/docs"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Voltar para Documentação
        </Link>
      </div>
    </article>
  )
}
