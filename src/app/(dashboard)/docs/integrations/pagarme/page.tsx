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
  ListChecks,
  ShieldCheck,
  Webhook,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Callout, FaqItem, FigureImage, Highlight, Step } from "@/components/docs"

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
          crédito no checkout. Siga o passo a passo até o fim — cada tela está
          ilustrada, e você não precisa de conhecimento técnico.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Tempo estimado:{" "}
            <strong className="text-foreground">~10 minutos</strong>
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            •
          </span>
          <span>
            Você precisa de uma{" "}
            <strong className="text-foreground">conta Pagar.me ativa</strong> e
            da senha dela em mãos
          </span>
        </div>
      </header>

      {/* Intro callout */}
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="A conexão tem duas partes"
        tone="neutral"
      >
        Primeiro você cria o <strong>Webhook</strong> (o aviso automático que a
        Pagar.me manda ao LiveCart quando um pagamento é confirmado). Depois
        você cria as <strong>Chaves de API</strong> (que dão ao LiveCart
        permissão para gerar as cobranças). Faça a Parte 1 inteira e só então a
        Parte 2 — a ordem importa.
      </Callout>

      {/* ==================== PARTE 1 — WEBHOOK ==================== */}
      <div className="!mt-12 flex items-center gap-3 border-b pb-3">
        <Webhook className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Parte 1 de 2
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Criar o Webhook
          </h2>
        </div>
      </div>

      {/* Step 1 */}
      <Step
        number={1}
        title='Abra Configurações › Webhooks e clique em "+ Criar webhook"'
        location="pagarme"
      >
        <p>
          No painel da Pagar.me (<code className="font-mono text-xs">dashboard.pagar.me</code>),
          no menu à esquerda, abra{" "}
          <Highlight>Configurações &rsaquo; Webhooks</Highlight>. Se ainda não
          houver nenhum, a tela mostra &ldquo;Você ainda não criou
          webhooks&rdquo;. Clique no botão verde{" "}
          <Highlight>+ Criar webhook</Highlight>, no canto superior direito.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/webhook-criar.jpg"
          alt="Tela de Webhooks da Pagar.me com o botão Criar webhook destacado"
          caption="A seta laranja aponta para o botão + Criar webhook."
        />
      </Step>

      {/* Step 2 */}
      <Step
        number={2}
        title="Preencha o Status, a URL e o Máximo de tentativas"
        location="pagarme"
      >
        <p>
          Na tela &ldquo;Adicionar Webhook&rdquo;, preencha os três campos do
          topo exatamente assim:
        </p>
        <ul className="ml-4 list-disc space-y-1.5 text-sm">
          <li>
            <strong>Status</strong>: deixe ligado em{" "}
            <Highlight>Ativo</Highlight>.
          </li>
          <li>
            <strong>URL</strong>:{" "}
            <strong>cole a URL que o LiveCart mostrou para você</strong>. Ela
            termina com um código único da sua loja. Não digite à mão e não
            invente — cada loja tem a sua.
          </li>
          <li>
            <strong>Máximo de tentativas</strong>: digite o número{" "}
            <Highlight>3</Highlight>.
          </li>
        </ul>
        <p>
          O campo <Highlight>Habilitar autenticação</Highlight> pode ficar{" "}
          <strong>desligado</strong>.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/webhook-form.jpg"
          alt="Formulário do webhook com Status Ativo, campo URL e Máximo de tentativas igual a 3"
          caption="1 Status Ativo · 2 URL do LiveCart · 3 Máximo de tentativas = 3."
        />
        <Callout
          icon={<AlertTriangle className="h-4 w-4" />}
          title="A URL é única da sua loja"
          tone="warning"
        >
          O endereço tem o formato{" "}
          <code className="font-mono text-xs">
            https://api.livecart.com.br/api/webhooks/pagarme/&lt;código-da-sua-loja&gt;
          </code>
          . Use sempre o botão de copiar dentro do LiveCart — se colar um
          endereço trocado, os pagamentos nunca chegarão.
        </Callout>
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title="Marque os eventos de COBRANÇA e de PEDIDO e salve"
        location="pagarme"
      >
        <p>
          Role a página até a seção <strong>Eventos</strong>. Você só precisa de
          dois grupos:
        </p>
        <ul className="ml-4 list-disc space-y-1.5 text-sm">
          <li>
            Em <strong>COBRANÇA</strong>, clique em{" "}
            <Highlight>Marcar todos</Highlight>.
          </li>
          <li>
            Em <strong>PEDIDO</strong>, clique em{" "}
            <Highlight>Marcar todos</Highlight>.
          </li>
        </ul>
        <p>
          Todos os outros grupos (Assinatura, Plano, Cartão, Cliente, etc.)
          podem ficar <strong>desmarcados</strong> — o LiveCart não usa nenhum
          deles. Depois, na parte de baixo, em{" "}
          <Highlight>Confirmar criação</Highlight>, digite a{" "}
          <strong>senha da sua conta Pagar.me</strong> e clique em{" "}
          <Highlight>Salvar</Highlight>.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/webhook-eventos.jpg"
          alt="Seção de eventos com COBRANÇA e PEDIDO marcados, campo de senha e botão Salvar"
          caption="1 Marcar todos em COBRANÇA · 2 Marcar todos em PEDIDO · 3 senha · 4 Salvar."
        />
        <Callout
          icon={<ListChecks className="h-4 w-4" />}
          title="Por que marcar os dois grupos?"
          tone="neutral"
        >
          Dependendo do tipo da sua conta, a Pagar.me confirma o pagamento por
          eventos de <strong>COBRANÇA</strong> <em>ou</em> de{" "}
          <strong>PEDIDO</strong>. Marcando os dois, a confirmação chega sempre —
          seja Pix, cartão ou boleto. É a opção mais segura e não tem efeito
          colateral.
        </Callout>
      </Step>

      {/* ==================== PARTE 2 — CHAVES ==================== */}
      <div className="!mt-12 flex items-center gap-3 border-b pb-3">
        <KeyRound className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Parte 2 de 2
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Criar as Chaves de API
          </h2>
        </div>
      </div>

      {/* Step 4 */}
      <Step number={4} title="Vá em Configurações › Chaves" location="pagarme">
        <p>
          Ainda no painel da Pagar.me, no menu à esquerda, abra{" "}
          <Highlight>Configurações</Highlight> e clique em{" "}
          <Highlight>Chaves</Highlight>.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/chaves-menu.jpg"
          alt="Menu Configurações aberto com o item Chaves destacado"
          caption="1 Abra Configurações · 2 clique em Chaves."
        />
      </Step>

      {/* Step 5 */}
      <Step
        number={5}
        title="Copie a Chave pública e cole no LiveCart"
        location="pagarme"
      >
        <p>
          No topo, em <strong>Dados da API</strong>, você verá a{" "}
          <strong>Chave pública</strong> (começa com{" "}
          <code className="font-mono text-xs">pk_</code>). Clique no{" "}
          <strong>botão verde de copiar</strong> ao lado dela e cole no campo{" "}
          <Highlight>Chave pública</Highlight> do LiveCart.
        </p>
        <p>
          Feito isso, volte para a Pagar.me e clique no botão{" "}
          <Highlight>Criar chave</Highlight> (à direita, na faixa
          &ldquo;Chaves da API&rdquo;) para gerar a chave secreta.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/chaves-publica.jpg"
          alt="Página de Chaves com a Chave pública e o botão de copiar destacados"
          caption="3 Botão verde ao lado da Chave pública. Depois use Criar chave para gerar a secreta."
        />
      </Step>

      {/* Step 6 */}
      <Step
        number={6}
        title='Dê um nome à chave e escolha o acesso "Total"'
        location="pagarme"
      >
        <p>
          Vai abrir a janela <strong>Criar chave</strong>. Preencha:
        </p>
        <ul className="ml-4 list-disc space-y-1.5 text-sm">
          <li>
            <strong>Nome da chave</strong>: qualquer nome que ajude você a
            lembrar. Recomendamos <Highlight>livecart</Highlight>.
          </li>
          <li>
            <strong>Acesso da chave</strong>: selecione{" "}
            <Highlight>Total</Highlight>.
          </li>
        </ul>
        <p>
          Deixe a caixinha &ldquo;Utilizo os módulos legados do Magento 2 ou
          Woocommerce&rdquo; <strong>desmarcada</strong> e clique em{" "}
          <Highlight>Avançar</Highlight>.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/chave-nome.jpg"
          alt="Janela Criar chave com campo de nome e a opção de acesso Total selecionada"
          caption="Nome à sua escolha (livecart) e acesso Total."
        />
      </Step>

      {/* Step 7 */}
      <Step
        number={7}
        title='Escolha "Leitura e escrita", informe a senha e crie'
        location="pagarme"
      >
        <p>Na segunda parte da janela:</p>
        <ul className="ml-4 list-disc space-y-1.5 text-sm">
          <li>
            Em <strong>Selecione uma permissão</strong>, marque{" "}
            <Highlight>Leitura e escrita</Highlight>.
          </li>
          <li>
            Digite a <strong>senha da sua conta Pagar.me</strong>.
          </li>
          <li>
            Clique em <Highlight>Criar chave</Highlight>.
          </li>
        </ul>
        <FigureImage
          src="/docs/integrations/pagarme/chave-permissao.jpg"
          alt="Segunda parte da janela com a permissão Leitura e escrita marcada, campo de senha e botão Criar chave"
          caption="Permissão Leitura e escrita · senha da conta · Criar chave."
        />
        <Callout
          icon={<AlertTriangle className="h-4 w-4" />}
          title='Precisa ser "Leitura e escrita"'
          tone="warning"
        >
          Se você marcar &ldquo;Somente leitura&rdquo;, o LiveCart consegue
          consultar mas <strong>não consegue criar as cobranças</strong> — e
          nenhuma venda será processada.
        </Callout>
      </Step>

      {/* Step 8 */}
      <Step
        number={8}
        title="Copie a Chave secreta agora — ela só aparece uma vez"
        location="pagarme"
      >
        <p>
          A Pagar.me vai mostrar a <strong>chave secreta</strong> (começa com{" "}
          <code className="font-mono text-xs">sk_</code>) na janela &ldquo;Copiar
          chave&rdquo;. Clique no <strong>botão verde de copiar</strong>, volte
          ao LiveCart e cole no campo <Highlight>Chave secreta</Highlight>. Só
          então clique em <Highlight>Concluir</Highlight> na janela da Pagar.me.
        </p>
        <FigureImage
          src="/docs/integrations/pagarme/chave-secreta.jpg"
          alt="Janela Copiar chave avisando que a informação não poderá ser consultada novamente"
          caption="Copie a chave secreta antes de clicar em Concluir."
        />
        <Callout
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Você não verá esta chave de novo"
          tone="warning"
        >
          A própria Pagar.me avisa: <em>&ldquo;Você não poderá consultar esta
          informação novamente.&rdquo;</em> Copie a chave secreta e cole no
          LiveCart <strong>antes</strong> de fechar essa janela. Se fechar sem
          copiar, não tem problema grave — basta apagar essa chave e criar uma
          nova repetindo os passos 5 a 8.
        </Callout>
      </Step>

      {/* ==================== RETA FINAL ==================== */}
      <div className="!mt-12 flex items-center gap-3 border-b pb-3">
        <CheckCircle2 className="h-5 w-5 text-primary" />
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Reta final
          </p>
          <h2 className="text-xl font-semibold tracking-tight">
            Concluir e testar no LiveCart
          </h2>
        </div>
      </div>

      {/* Step 9 */}
      <Step number={9} title="Confira os campos e conecte" location="livecart">
        <p>
          Em <Highlight>Configurações &rsaquo; Integrações</Highlight>, na
          janela de conexão da Pagar.me, confira o preenchimento:
        </p>
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full min-w-[420px] text-sm">
            <thead>
              <tr className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-2.5 font-medium">Campo no LiveCart</th>
                <th className="px-4 py-2.5 font-medium">O que colar</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b">
                <td className="px-4 py-2.5 font-medium">Chave secreta</td>
                <td className="px-4 py-2.5">
                  A chave que começa com{" "}
                  <code className="font-mono text-xs">sk_</code> (passo 8)
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2.5 font-medium">Chave pública</td>
                <td className="px-4 py-2.5">
                  A chave que começa com{" "}
                  <code className="font-mono text-xs">pk_</code> (passo 5)
                </td>
              </tr>
              <tr className="border-b">
                <td className="px-4 py-2.5 font-medium">Webhook · usuário</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  Deixe <strong>vazio</strong> (não ligamos autenticação no
                  webhook)
                </td>
              </tr>
              <tr>
                <td className="px-4 py-2.5 font-medium">Webhook · senha</td>
                <td className="px-4 py-2.5 text-muted-foreground">
                  Deixe <strong>vazio</strong>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Clique em <Highlight>Conectar</Highlight>. O LiveCart valida as chaves
          contra a Pagar.me na hora — se algo estiver errado, você recebe uma
          mensagem clara em vez de uma falha silenciosa no checkout.
        </p>
        <Callout
          icon={<AlertTriangle className="h-4 w-4" />}
          title="As duas chaves precisam ser do mesmo ambiente"
          tone="warning"
        >
          Para vender de verdade, use as duas chaves de{" "}
          <strong>produção</strong>. O LiveCart identifica o ambiente pelo
          início da chave — não misture uma chave de teste (
          <code className="font-mono text-xs">sk_test_</code>) com uma de
          produção (<code className="font-mono text-xs">sk_</code>).
        </Callout>
      </Step>

      {/* Step 10 */}
      <Step number={10} title="Teste o webhook" location="livecart">
        <p>
          No LiveCart, clique no botão <Highlight>Testar webhook</Highlight>.
          Ele cria um pedido de teste descartável só para confirmar que a
          Pagar.me consegue entregar os avisos no seu endereço. Se aparecer{" "}
          <strong>&ldquo;webhook funcionando&rdquo;</strong>, está tudo certo.
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
              Pronto! Conta integrada
            </h3>
            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
              O card da Pagar.me em Integrações mostra{" "}
              <strong>Conectado</strong> e o webhook aparece como{" "}
              <strong>Ativo</strong>. O checkout passa a oferecer Pix e cartão de
              crédito automaticamente, e cada pagamento confirmado atualiza o
              pedido sozinho.
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
              O pagamento foi confirmado, mas o pedido continua
              &ldquo;aguardando pagamento&rdquo;
            </p>
            <p className="leading-relaxed text-muted-foreground">
              Quase sempre é o webhook. No painel da Pagar.me, em{" "}
              <Highlight>Configurações &rsaquo; Webhooks</Highlight>, confira se
              a <strong>URL</strong> é idêntica à que o LiveCart mostra (mesmo
              código de loja no final) e se os grupos{" "}
              <strong>COBRANÇA</strong> e <strong>PEDIDO</strong> estão marcados.
              Depois clique em <strong>Testar webhook</strong> no LiveCart de
              novo.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">
              &ldquo;Sem ambiente configurado para este tipo de transação&rdquo;
            </p>
            <p className="leading-relaxed text-muted-foreground">
              O produto Pix (ou cartão) não está habilitado no recebedor da
              conta. Acesse{" "}
              <Highlight>Configurações &rsaquo; Recebedores</Highlight> no painel
              da Pagar.me, abra o recebedor padrão e confirme se o Pix está
              ativado. Se a conta é nova, peça ao suporte da Pagar.me para
              habilitar o produto.
            </p>
          </div>
          <div className="space-y-1">
            <p className="font-medium">Uma chave aparece como inválida</p>
            <p className="leading-relaxed text-muted-foreground">
              Verifique se não trocou os campos: a <strong>secreta</strong>{" "}
              começa com <code className="font-mono text-xs">sk_</code> e a{" "}
              <strong>pública</strong> com{" "}
              <code className="font-mono text-xs">pk_</code>. Confirme que as
              duas são do <strong>mesmo ambiente</strong>. Espaços extras ao
              colar também causam erro — apague e cole de novo.
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
          question="Fechei a janela sem copiar a chave secreta. E agora?"
          answer={
            <>
              Sem problema. A chave secreta não pode ser consultada de novo, mas
              você pode criar outra: vá em{" "}
              <Highlight>Configurações &rsaquo; Chaves</Highlight>, apague a
              chave anterior (opcional) e repita os passos 5 a 8. Cole a nova
              chave secreta no LiveCart.
            </>
          }
        />

        <FaqItem
          question="Por que duas chaves (secreta e pública)?"
          answer={
            <>
              A <strong>Chave pública</strong> é usada no checkout para
              tokenizar o cartão antes de mandar ao servidor — assim o número do
              cartão nunca passa pelo nosso backend. A{" "}
              <strong>Chave secreta</strong> é usada para criar cobranças,
              consultar status e estornar. As duas precisam estar configuradas
              para o checkout funcionar.
            </>
          }
        />

        <FaqItem
          question="Preciso marcar os eventos individualmente?"
          answer={
            <>
              Não. Basta clicar em <strong>Marcar todos</strong> nos grupos{" "}
              <strong>COBRANÇA</strong> e <strong>PEDIDO</strong>. Isso já
              inclui tudo o que o LiveCart precisa — inclusive o evento que o
              botão &ldquo;Testar webhook&rdquo; usa para validar a conexão sem
              esperar uma venda real.
            </>
          }
        />

        <FaqItem
          question="Posso usar Mercado Pago e Pagar.me ao mesmo tempo?"
          answer={
            <>
              Sim. Quando você tem dois meios de pagamento conectados, o
              LiveCart usa a <strong>prioridade</strong> definida no card de cada
              integração para escolher qual processa o checkout. Se o primário
              falhar, o LiveCart cai automaticamente para o secundário.
            </>
          }
        />

        <FaqItem
          question="Como troco as chaves (rotação)?"
          answer={
            <>
              Volte em{" "}
              <Highlight>Configurações &rsaquo; Integrações</Highlight>, clique
              em <Highlight>Conectar Pagar.me</Highlight> de novo e cole as novas
              chaves. O LiveCart valida e substitui em uma única operação, sem
              precisar desconectar antes.
            </>
          }
        />

        <FaqItem
          question="Como desconectar?"
          answer={
            <>
              No card da Pagar.me em{" "}
              <Highlight>Configurações &rsaquo; Integrações</Highlight>, clique
              no ícone de tomada. Os pagamentos param na hora. Se você tem
              Mercado Pago configurado como secundário, ele assume
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
