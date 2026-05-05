import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Package,
  ShieldCheck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Callout,
  FaqItem,
  FigureImage,
  Highlight,
  Step,
} from "@/components/docs"

export default function TinyDocPage() {
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
        <span className="text-foreground">Tiny (Olist)</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          Integrações &middot; ERP
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Integrar com a Tiny (Olist)
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conecte sua conta Tiny — atualmente conhecida como{" "}
          <strong className="text-foreground">Olist</strong> — ao LiveCart para
          importar produtos automaticamente, manter o estoque sincronizado e
          enviar pedidos de volta para o ERP em tempo real.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Tempo estimado:{" "}
            <strong className="text-foreground">10 a 15 minutos</strong>
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            •
          </span>
          <span>
            Você precisa de uma{" "}
            <strong className="text-foreground">conta administradora</strong> da
            Tiny
          </span>
        </div>
      </header>

      {/* Naming notice */}
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="Tiny = Olist"
        tone="neutral"
      >
        A Tiny passou a se chamar <strong>Olist</strong>. Muita gente ainda
        conhece como Tiny, então neste guia chamamos os dois nomes do mesmo
        sistema. O endereço de login{" "}
        <Highlight>tiny.com.br/login</Highlight> continua o mesmo — quando você
        fizer login, vai cair na conta Olist.
      </Callout>

      {/* Pre-requisites */}
      <Callout
        icon={<AlertTriangle className="h-4 w-4" />}
        title="Antes de começar — verifique suas extensões"
        tone="warning"
      >
        <p>
          Esta integração precisa de duas extensões da Tiny instaladas na sua
          conta: <Highlight>Gestão de aplicativos</Highlight> e{" "}
          <Highlight>Webhooks</Highlight>. Sem elas, você não consegue criar a
          conexão nem receber atualizações em tempo real.
        </p>
        <p className="mt-2">
          Faça login na Tiny, abra <Highlight>Configurações</Highlight> e veja
          se você consegue acessar essas duas opções dentro da aba{" "}
          <Highlight>Geral</Highlight>. Se uma delas estiver faltando, instale
          gratuitamente pela <strong>Loja de extensões</strong> antes de
          continuar — falamos disso logo no Passo 2.
        </p>
      </Callout>

      {/* Step 1 */}
      <Step
        number={1}
        title="Faça login na Tiny (Olist)"
        location="tiny"
      >
        <p>
          Abra o site da Tiny em uma nova aba e entre com a conta{" "}
          <strong>administradora</strong> (a conta principal da loja, ou um
          usuário que tenha acesso a Aplicativos):
        </p>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs break-all">
          https://tiny.com.br/login
        </div>
        <Button asChild variant="outline" size="sm">
          <a
            href="https://tiny.com.br/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir Tiny / Olist
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </Step>

      {/* Step 2 */}
      <Step
        number={2}
        title="Confirme que as extensões estão instaladas"
        location="tiny"
      >
        <p>
          Vá em <Highlight>Configurações</Highlight> e procure, dentro da aba{" "}
          <Highlight>Geral</Highlight>, pelas opções{" "}
          <Highlight>Aplicativos</Highlight> e <Highlight>Webhooks</Highlight>.
          Se as duas estiverem visíveis, pule para o Passo 3.
        </p>
        <p>
          Se uma delas não aparecer, abra a{" "}
          <Highlight>Loja de extensões</Highlight> e instale a que estiver
          faltando — as duas são gratuitas.
        </p>
        <FigureImage
          src="/docs/integrations/tiny/extention-tiny.png"
          alt="Loja de extensões da Tiny mostrando onde encontrar Gestão de aplicativos e Webhooks"
          caption="Procure por Gestão de aplicativos e por Webhooks na Loja de extensões e clique em instalar."
        />
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title="Vá até Configurações > Aplicativos"
        location="tiny"
      >
        <p>
          Já com as extensões instaladas, no menu da Tiny clique em{" "}
          <Highlight>Configurações</Highlight> e depois em{" "}
          <Highlight>Aplicativos</Highlight> (dentro da aba Geral).
        </p>
        <FigureImage
          src="/docs/integrations/tiny/tiny-config-apps.png"
          alt="Caminho dentro da Tiny até a aba Aplicativos, com setas apontando Configurações e Aplicativos"
          caption="As setas mostram o caminho: Configurações primeiro, depois Aplicativos."
        />
      </Step>

      {/* Step 4 — copy URLs from LiveCart */}
      <Step
        number={4}
        title="Abra o conector no LiveCart e copie a URL de Redirecionamento"
        location="livecart"
      >
        <p>
          Antes de criar o aplicativo na Tiny, vamos pegar uma URL especial que
          o LiveCart precisa que você cole lá. Em uma nova aba, no LiveCart, vá
          em <Highlight>Configurações &rsaquo; Integrações</Highlight>, clique
          na aba <Highlight>ERP</Highlight> e clique em{" "}
          <Highlight>Conectar Tiny ERP</Highlight>.
        </p>
        <p>
          Vai aparecer uma janela com dois endereços importantes:{" "}
          <strong>URL de Redirecionamento (OAuth)</strong> e{" "}
          <strong>URL de Webhooks</strong>. Por enquanto, copie só a primeira —
          a URL de Webhooks vamos usar mais pra frente.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/integrations" target="_blank">
            Abrir Integrações
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </Step>

      {/* Step 5 — create app on Tiny */}
      <Step
        number={5}
        title='Crie um "Novo aplicativo" na Tiny'
        location="tiny"
      >
        <p>
          Na tela de Aplicativos da Tiny, clique em{" "}
          <Highlight>Novo aplicativo</Highlight> (canto superior direito) e
          preencha os campos da seguinte forma:
        </p>
        <ul className="ml-5 list-disc space-y-2 [&_strong]:text-foreground">
          <li>
            <strong>Nome do aplicativo:</strong> qualquer nome que ajude você a
            identificar — sugerimos <Highlight>Live Cart</Highlight>.
          </li>
          <li>
            <strong>URL de Redirecionamento:</strong> cole a URL de
            Redirecionamento (OAuth) que você copiou do LiveCart no passo
            anterior.
          </li>
        </ul>
      </Step>

      {/* Step 6 — permissions */}
      <Step
        number={6}
        title="Marque todas as permissões do aplicativo"
        location="tiny"
      >
        <p>
          Ainda na criação do aplicativo, role até a seção de permissões e{" "}
          <strong>marque todas as opções disponíveis</strong>. Sem elas, o
          LiveCart não consegue ler produtos, sincronizar estoque ou enviar
          pedidos.
        </p>
        <FigureImage
          src="/docs/integrations/tiny/tiny-app-config.png"
          alt="Tela de permissões do aplicativo Tiny com todas as opções marcadas"
          caption="Marque todas as permissões da lista — é o que habilita o sincronismo de produtos, estoque e pedidos."
        />
        <Callout
          icon={<ShieldCheck className="h-4 w-4" />}
          title="Por que tantas permissões?"
          tone="neutral"
        >
          O LiveCart precisa ler produtos para importá-los, atualizar estoque
          quando uma venda fecha, e criar pedidos no Tiny depois que o cliente
          paga. Cada permissão cobre uma dessas operações.
        </Callout>
      </Step>

      {/* Step 7 — save and copy credentials */}
      <Step
        number={7}
        title="Salve e copie o Client ID e o Client Secret"
        location="tiny"
      >
        <p>
          Clique em <Highlight>Salvar</Highlight> no canto inferior esquerdo.
          Em seguida, abra o aplicativo que você acabou de criar — a Tiny vai
          mostrar duas chaves: <Highlight>Client ID</Highlight> e{" "}
          <Highlight>Client Secret</Highlight>.
        </p>
        <p>
          Mantenha essa página da Tiny aberta — vamos copiar uma chave de cada
          vez no próximo passo.
        </p>
        <Callout
          icon={<AlertTriangle className="h-4 w-4" />}
          title="O Client Secret é uma senha"
          tone="warning"
        >
          Trate o Client Secret como qualquer senha: não compartilhe, não envie
          por mensagem e não publique em lugares públicos. Se vazar, volte
          aqui e gere um novo aplicativo.
        </Callout>
      </Step>

      {/* Step 8 — paste credentials in LiveCart */}
      <Step
        number={8}
        title="Volte ao LiveCart e cole as credenciais"
        location="livecart"
      >
        <p>
          Volte para a janela do LiveCart que você abriu no Passo 4 (a janela
          de Conectar Tiny ERP deve continuar aberta). Cole o{" "}
          <Highlight>Client ID</Highlight> e o{" "}
          <Highlight>Client Secret</Highlight> nos campos correspondentes.
        </p>
        <p>
          Clique em <Highlight>Continuar com o OAuth</Highlight>.
        </p>
      </Step>

      {/* Step 9 — authorize */}
      <Step
        number={9}
        title="Autorize a conexão"
        location="tiny"
      >
        <p>
          O LiveCart vai te mandar de volta para a Tiny. Se a Tiny pedir uma
          confirmação de permissões, clique em <Highlight>Aceitar</Highlight> /{" "}
          <Highlight>Autorizar</Highlight>. Depois disso, o navegador volta
          automaticamente para o LiveCart.
        </p>
      </Step>

      {/* Step 10 — confirm connection */}
      <Step
        number={10}
        title='Confirme que o status está "Conectado"'
        location="livecart"
      >
        <p>
          De volta ao LiveCart, abra{" "}
          <Highlight>Configurações &rsaquo; Integrações &rsaquo; ERP</Highlight>{" "}
          e clique em <Highlight>Ver detalhes</Highlight> no card Tiny ERP. Se
          tudo deu certo, o status vai aparecer como{" "}
          <Highlight>Conectado</Highlight>.
        </p>
        <p>
          Falta só uma coisa: configurar os webhooks pra que o LiveCart receba
          atualizações em tempo real do Tiny.
        </p>
      </Step>

      {/* Step 11 — copy webhook URL + configure on Tiny */}
      <Step
        number={11}
        title="Configure os Webhooks na Tiny"
        location="tiny"
      >
        <p>
          Ainda em <Highlight>Ver detalhes</Highlight> no LiveCart, copie a{" "}
          <Highlight>URL de Webhooks</Highlight> que aparece nessa tela.
        </p>
        <p>
          Volte para a Tiny, abra <Highlight>Configurações</Highlight>, vá na
          aba <Highlight>Geral</Highlight> e clique em{" "}
          <Highlight>Webhooks</Highlight>:
        </p>
        <FigureImage
          src="/docs/integrations/tiny/tiny-webhooks.png"
          alt="Caminho dentro da Tiny até a aba Webhooks"
          caption="Configurações > Geral > Webhooks."
        />
        <p>
          Dentro de Webhooks, <strong>ative todas as opções</strong>{" "}
          disponíveis e cole a URL de Webhooks que você copiou do LiveCart.
          Clique em <Highlight>Salvar</Highlight>.
        </p>
        <FigureImage
          src="/docs/integrations/tiny/webhooks-configuration-tiny.png"
          alt="Tela de configuração de webhooks da Tiny com todas as opções ativas e a URL preenchida"
          caption="Ative cada uma das opções (uma por linha) e cole a mesma URL em todas. Clique em Salvar no fim."
        />
      </Step>

      {/* Step 12 — verify webhook status in LiveCart */}
      <Step
        number={12}
        title="Verifique o status do Webhook no LiveCart"
        location="livecart"
      >
        <p>
          Volte ao LiveCart, abra{" "}
          <Highlight>Ver detalhes</Highlight> da integração Tiny e olhe o
          status do Webhook. Quando a Tiny mandar a primeira atualização, o
          status muda de <Highlight>Pendente</Highlight> para{" "}
          <Highlight>Ativo</Highlight>. Pode levar alguns segundos.
        </p>
        <p>
          Se ficar muito tempo em <Highlight>Pendente</Highlight>, confira se
          você salvou todos os webhooks na Tiny e se a URL colada está
          exatamente igual à que aparece no LiveCart.
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
              Pronto! O Tiny está integrado
            </h3>
            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
              A partir de agora você pode importar produtos do Tiny direto pelo
              LiveCart, o estoque vai se manter sincronizado nos dois lados, e
              cada venda fechada no checkout vira um pedido no Tiny
              automaticamente.
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
          question='Não vejo "Aplicativos" ou "Webhooks" nas configurações da Tiny — e agora?'
          answer={
            <>
              Esses dois itens vêm de extensões instaláveis na{" "}
              <Highlight>Loja de extensões</Highlight> da Tiny. Procure por{" "}
              <strong>Gestão de aplicativos</strong> e por{" "}
              <strong>Webhooks</strong> e clique em instalar — as duas são
              gratuitas. Depois de instalar, recarregue a página de
              Configurações e elas vão aparecer.
            </>
          }
        />

        <FaqItem
          question="Por que precisa ser um usuário administrador?"
          answer={
            <>
              Só usuários com acesso à seção de Aplicativos da Tiny podem criar
              uma integração nova. Se você não é o dono da conta, peça pra
              quem é (ou adicione esse acesso ao seu usuário) antes de seguir o
              passo a passo.
            </>
          }
        />

        <FaqItem
          question="Posso conectar mais de uma loja Tiny ao mesmo LiveCart?"
          answer={
            <>
              Hoje cada loja LiveCart conecta com uma conta Tiny por vez. Se
              você tiver mais de uma loja Tiny, escolha qual delas vai
              alimentar o catálogo desta loja LiveCart.
            </>
          }
        />

        <FaqItem
          question="O que acontece se eu desconectar a integração?"
          answer={
            <>
              Os produtos já importados continuam no LiveCart, mas param de
              receber atualizações de preço e estoque. Pedidos novos não vão
              mais para o Tiny. Você pode reconectar a qualquer momento — basta
              repetir o passo a passo deste guia.
            </>
          }
        />

        <FaqItem
          question="Quanto tempo o estoque demora pra atualizar entre os sistemas?"
          answer={
            <>
              Com os webhooks ativos, é praticamente em tempo real — alguns
              segundos depois de você editar um produto na Tiny ou de uma venda
              fechar no LiveCart. Se o webhook estiver pendente, pode demorar
              mais (cai em uma sincronização periódica).
            </>
          }
        />

        <FaqItem
          question="O LiveCart está apontando “cadastros faltando” no Tiny — o que conferir?"
          answer={
            <>
              Quando o Tiny está conectado, o LiveCart audita três cadastros
              que ele consulta na hora de criar o pedido: formas de pagamento,
              formas de recebimento e formas de envio. Os dois primeiros
              ficam em{" "}
              <Highlight>
                Configurações &rsaquo; Finanças &rsaquo; Formas de Pagamento
              </Highlight>{" "}
              e{" "}
              <Highlight>
                Configurações &rsaquo; Finanças &rsaquo; Formas de Recebimento
              </Highlight>{" "}
              — a Tiny já cria os padrões (Cartão de Crédito, Pix, Boleto)
              automaticamente, então normalmente é só confirmar que estão
              ativos. As formas de envio ficam em{" "}
              <Highlight>Cadastros &rsaquo; Formas de Envio</Highlight>; aí
              você precisa cadastrar a transportadora que sua loja usa
              (Correios, Jadlog, etc.) com esse nome exato.
            </>
          }
        />

        <FaqItem
          question="Mesmo com os cadastros padrão habilitados, a auditoria do LiveCart marca como faltando — por quê?"
          answer={
            <>
              O LiveCart procura por nome (exato ou parecido) — as formas
              padrão da Tiny vêm como “Cartão de Crédito” e “Pix”. Se sua
              conta tem outras com nomes muito diferentes (por exemplo
              “Crédito MP” ou “PIX manual”), elas não vão bater. Se isso
              acontecer, basta deixar uma forma com o nome canônico ativa
              (Cartão de Crédito / Pix) que a auditoria fica verde.
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
