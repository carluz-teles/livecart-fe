import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  CreditCard,
  Info,
  KeyRound,
  ShieldCheck,
  Webhook,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Callout, FaqItem, Highlight, Step } from "@/components/docs"

export default function PagarmeDocPage() {
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
        <span className="text-foreground">Pagar.me</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <CreditCard className="h-3.5 w-3.5" />
          Integrações &middot; Pagamentos
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Integrar com a Pagar.me
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conecte sua conta Pagar.me ao LiveCart para aceitar Pix e cartão de
          crédito no checkout. A integração usa chaves de API estáticas (sem
          OAuth) — você cola a chave secreta e a chave pública aqui, e o
          LiveCart valida tudo em tempo real.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Tempo estimado: <strong className="text-foreground">5 minutos</strong>
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            •
          </span>
          <span>
            Você precisa de uma{" "}
            <strong className="text-foreground">conta Pagar.me ativa</strong>
            {" "}com Pix habilitado
          </span>
        </div>
      </header>

      {/* Intro callout */}
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="Como funciona"
        tone="neutral"
      >
        Você copia as chaves <strong>Secret Key</strong> e{" "}
        <strong>Public Key</strong> do painel da Pagar.me, cola no LiveCart e
        cadastra a nossa URL de Webhook no painel deles. A Pagar.me não tem API
        pública para registrar webhooks — esse passo é manual, e o LiveCart te
        mostra exatamente o que copiar.
      </Callout>

      {/* Step 1 */}
      <Step
        number={1}
        title="Pegue as chaves de API no painel Pagar.me"
        location="pagarme"
      >
        <p>
          No painel da Pagar.me, vá em{" "}
          <Highlight>Configurações &rsaquo; Chaves de API</Highlight>. Você vai
          ver dois pares de chaves:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm">
          <li>
            <code className="font-mono text-xs">sk_test_</code> / <code className="font-mono text-xs">pk_test_</code> — ambiente sandbox (testes)
          </li>
          <li>
            <code className="font-mono text-xs">sk_</code> / <code className="font-mono text-xs">pk_</code> (sem o{" "}
            <code className="font-mono text-xs">test_</code>) — ambiente de produção (cobra de verdade)
          </li>
        </ul>
        <p>
          Copie a <Highlight>Secret Key</Highlight> e a{" "}
          <Highlight>Public Key</Highlight> do par que vai usar. O LiveCart
          detecta automaticamente se você está em sandbox ou produção pelo
          prefixo da chave.
        </p>
        <Callout
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Tratamento das chaves"
          tone="neutral"
        >
          A chave secreta nunca aparece no FE — guardamos criptografada no
          banco. Mesmo assim, trate como senha: nunca cole em chat, e-mail ou
          repositório git.
        </Callout>
      </Step>

      {/* Step 2 */}
      <Step
        number={2}
        title='Cole as chaves no LiveCart e clique em "Conectar"'
        location="livecart"
      >
        <p>
          Em <Highlight>Configurações &rsaquo; Integrações</Highlight>, clique
          em <Highlight>Conectar Pagar.me</Highlight>. No diálogo, cole a
          Secret Key e a Public Key nos campos correspondentes.
        </p>
        <p>
          O LiveCart valida as chaves contra a Pagar.me na hora — se a chave
          for inválida ou expirada, você recebe uma mensagem clara em vez de
          uma falha silenciosa no checkout.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/integrations">
            Ir para Integrações
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title="Cadastre o Webhook no painel Pagar.me"
        location="pagarme"
      >
        <p>
          A Pagar.me precisa enviar notificações para o LiveCart quando um
          pagamento é confirmado ou recusado. No diálogo de conexão, o
          LiveCart já mostra a URL exata para você copiar.
        </p>
        <p>
          No painel da Pagar.me, vá em{" "}
          <Highlight>Configurações &rsaquo; Webhooks &rsaquo; Novo webhook</Highlight>
          {" "}e:
        </p>
        <ul className="ml-4 list-disc space-y-1 text-sm">
          <li>
            <strong>URL</strong>: cole a URL mostrada no diálogo do LiveCart
          </li>
          <li>
            <strong>Eventos</strong>: marque <code className="font-mono text-xs">order.paid</code>, <code className="font-mono text-xs">order.payment_failed</code> e <code className="font-mono text-xs">order.canceled</code>
          </li>
          <li>
            <strong>Basic Auth</strong> (opcional, recomendado): defina um
            usuário e senha aqui e cole os mesmos valores nos campos
            <em>Webhook · usuário</em> e <em>Webhook · senha</em> no LiveCart
          </li>
        </ul>
        <Callout
          icon={<Webhook className="h-4 w-4" />}
          title="Como confirmar que ficou certo"
          tone="neutral"
        >
          Após salvar, abra de novo a integração no LiveCart em{" "}
          <Highlight>Configurações &rsaquo; Integrações</Highlight>. O painel
          consulta o histórico recente da Pagar.me e mostra{" "}
          <strong>Webhook ativo</strong> assim que detecta uma entrega para a
          sua URL — sem precisar esperar uma venda real.
        </Callout>
      </Step>

      {/* Done */}
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-5 dark:border-emerald-900 dark:bg-emerald-950/30">
        <div className="flex items-start gap-3">
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
            <CheckCircle2 className="h-5 w-5" />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h3 className="text-base font-semibold text-emerald-900 dark:text-emerald-100">
              Pronto! Conta integrada
            </h3>
            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
              O card da Pagar.me em Integrações mostra <strong>Conectado</strong>.
              O checkout passa a oferecer Pix e cartão de crédito
              automaticamente.
            </p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <section className="space-y-4 rounded-lg border border-amber-200 bg-amber-50/50 p-5 dark:border-amber-900/40 dark:bg-amber-950/20">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
          <h2 className="text-base font-semibold text-amber-900 dark:text-amber-200">
            Solução de problemas
          </h2>
        </div>
        <div className="space-y-4 pl-8 text-sm">
          <div className="space-y-1">
            <p className="font-medium">
              &ldquo;Sem ambiente configurado para este tipo de transação&rdquo;
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Erro retornado pela Pagar.me quando o produto Pix (ou cartão) não
              está habilitado no recebedor da conta. Acesse{" "}
              <Highlight>Configurações &rsaquo; Recebedores</Highlight> no
              painel da Pagar.me, abra o recebedor padrão e confirme se Pix
              está ativado. Se a conta é nova, peça ao suporte da Pagar.me
              para habilitar o produto.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">
              &ldquo;Internal Server Error&rdquo; em valor alto no sandbox
            </p>
            <p className="leading-relaxed text-muted-foreground">
              O simulador Pix do sandbox da Pagar.me só processa valores até
              cerca de R$ 500. Para testar valores reais, use a chave de
              produção (sk_ sem o test_) com um Pix de valor pequeno (R$ 0,50).
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">&ldquo;Webhook não confirmado&rdquo; no painel</p>
            <p className="leading-relaxed text-muted-foreground">
              Significa que a Pagar.me ainda não enviou nenhum evento para
              nossa URL. Confira se você salvou o webhook no painel deles, se
              a URL está exatamente igual à mostrada no LiveCart e se os
              eventos selecionados incluem <code className="font-mono text-xs">order.paid</code>.
            </p>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="space-y-5">
        <h2 className="text-xl font-semibold tracking-tight">
          Perguntas frequentes
        </h2>

        <FaqItem
          question="Posso usar Mercado Pago e Pagar.me ao mesmo tempo?"
          answer={
            <>
              Sim. Quando você tem dois meios de pagamento conectados, o
              LiveCart usa a <strong>prioridade</strong> definida no card de
              cada integração para escolher qual processador atende o
              checkout. Se o primário falhar (por exemplo, fora do ar), o
              LiveCart cai automaticamente para o secundário.
            </>
          }
        />

        <FaqItem
          question="Por que duas chaves (secreta e pública)?"
          answer={
            <>
              A <strong>Public Key</strong> é usada no FE do checkout para
              tokenizar o cartão antes de mandar ao backend — assim o número
              do cartão nunca passa pelo nosso servidor. A{" "}
              <strong>Secret Key</strong> é usada no BE para criar cobranças,
              consultar status e estornar. As duas precisam estar configuradas
              para o checkout transparente funcionar.
            </>
          }
        />

        <FaqItem
          question="Preciso de Basic Auth no webhook?"
          answer={
            <>
              Não é obrigatório, mas é fortemente recomendado. Sem Basic Auth,
              qualquer pessoa que descubra a URL do seu webhook pode mandar
              eventos falsos para o LiveCart. A Pagar.me v5 não assina
              webhooks com HMAC, então o Basic Auth é a única camada de
              defesa.
            </>
          }
        />

        <FaqItem
          question="O cliente vê o nome “Pagar.me” no checkout?"
          answer={
            <>
              Não. O cliente vê apenas as opções <strong>Pix</strong> e{" "}
              <strong>Cartão de crédito</strong>. O nome que aparece na fatura
              do cartão é o <em>statement descriptor</em> configurado pela
              Pagar.me (geralmente &ldquo;LIVECART&rdquo; por padrão — entre em contato se
              quiser ajustar).
            </>
          }
        />

        <FaqItem
          question="Como troco as chaves (rotação)?"
          answer={
            <>
              Volte em <Highlight>Configurações &rsaquo; Integrações</Highlight>,
              clique em <Highlight>Conectar Pagar.me</Highlight> de novo e
              cole as novas chaves. O LiveCart valida e substitui em uma única
              operação, sem precisar desconectar antes. Se as credenciais do
              webhook também mudaram, atualize-as no mesmo diálogo.
            </>
          }
        />

        <FaqItem
          question="Como desconectar?"
          answer={
            <>
              No card da Pagar.me em{" "}
              <Highlight>Configurações &rsaquo; Integrações</Highlight>,
              clique no ícone de tomada. Os pagamentos param na hora. Se você
              tem Mercado Pago configurado como secundário, ele assume
              automaticamente.
            </>
          }
        />
      </section>

      {/* External link */}
      <div className="rounded-lg border bg-muted/30 p-4">
        <div className="flex items-start gap-3">
          <KeyRound className="mt-0.5 h-4 w-4 flex-shrink-0 text-muted-foreground" />
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">Painel da Pagar.me</p>
            <p className="text-xs text-muted-foreground">
              Acesse para gerenciar chaves de API, webhooks e recebedores.
            </p>
          </div>
          <Button asChild variant="outline" size="sm">
            <a
              href="https://dashboard.pagar.me"
              target="_blank"
              rel="noopener noreferrer"
            >
              Abrir painel
              <ChevronRight className="ml-1 h-3.5 w-3.5" />
            </a>
          </Button>
        </div>
      </div>

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
