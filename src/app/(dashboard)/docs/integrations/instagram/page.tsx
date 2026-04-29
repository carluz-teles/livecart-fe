import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  Info,
  Share2,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Callout, FaqItem, Highlight, Step } from "@/components/docs"

export default function InstagramDocPage() {
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
        <span className="text-foreground">Instagram</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Share2 className="h-3.5 w-3.5" />
          Integrações &middot; Redes Sociais
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Integrar com o Instagram
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conecte sua conta do Instagram para o LiveCart capturar comentários e
          mensagens das suas lives em tempo real e detectar pedidos
          automaticamente — sem você precisar ler tudo no celular durante a
          transmissão.
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
            Conta Instagram <strong className="text-foreground">Profissional</strong>{" "}
            (Comercial ou de Criador) ligada a uma página do Facebook
          </span>
        </div>
      </header>

      {/* Pre-requisite */}
      <Callout
        icon={<AlertTriangle className="h-4 w-4" />}
        title="Antes de começar — sua conta precisa ser Profissional"
        tone="warning"
      >
        <p>
          O Instagram só libera leitura de comentários e DMs para contas{" "}
          <strong>Profissionais</strong> (Comercial ou Criador de Conteúdo) que
          estão conectadas a uma <strong>página do Facebook</strong>. Se a sua
          conta ainda é Pessoal, abra o Instagram, vá em{" "}
          <Highlight>Configurações &rsaquo; Conta &rsaquo; Mudar para conta profissional</Highlight>
          {" "}e siga as instruções — depois volte aqui.
        </p>
        <p className="mt-2">
          A conversão é gratuita e dá pra desfazer quando quiser. Se você já
          recebe DMs comerciais ou usa o Reels com analytics, sua conta provavelmente
          já é Profissional.
        </p>
      </Callout>

      {/* Intro callout */}
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="Como funciona"
        tone="neutral"
      >
        Você clica em <strong>Conectar</strong> aqui no LiveCart, faz login no
        Facebook (que é por onde o Instagram autoriza apps), escolhe a página
        do Facebook e a conta do Instagram que vão ser conectadas, autoriza
        as permissões e pronto. O LiveCart já passa a capturar comentários e
        DMs assim que você começar uma live.
      </Callout>

      {/* Step 1 */}
      <Step
        number={1}
        title='Abra Integrações e clique em "Conectar Instagram"'
        location="livecart"
      >
        <p>
          No LiveCart, vá em{" "}
          <Highlight>Configurações &rsaquo; Integrações</Highlight>. Na aba{" "}
          <Highlight>Redes Sociais</Highlight>, encontre o card do Instagram e
          clique em <Highlight>Conectar Instagram</Highlight>.
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
        title="Faça login no Facebook"
        location="instagram"
      >
        <p>
          O LiveCart abre uma janela do Facebook em uma nova aba — é por lá
          que o Instagram autoriza aplicativos. Entre com a conta do Facebook
          que está vinculada à sua conta Instagram da loja.
        </p>
        <Callout
          icon={<Info className="h-4 w-4" />}
          title="Por que Facebook se eu vou conectar Instagram?"
          tone="neutral"
        >
          O Instagram pertence à Meta e usa o sistema de login do Facebook
          para autorizar aplicativos. Mesmo conectando a conta do Instagram,
          o passo de login acontece no Facebook — é o mesmo padrão usado por
          ferramentas profissionais (Hootsuite, Mlabs, etc.).
        </Callout>
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title="Escolha a página e a conta Instagram"
        location="instagram"
      >
        <p>
          O Facebook vai mostrar uma lista das páginas que você administra.
          Selecione a página associada à conta Instagram que você usa para as
          lives.
        </p>
        <p>
          Em seguida, ele lista as contas Instagram disponíveis. Marque a
          conta da loja e siga em frente.
        </p>
      </Step>

      {/* Step 4 */}
      <Step
        number={4}
        title="Autorize as permissões"
        location="instagram"
      >
        <p>
          O Facebook mostra uma tela com tudo que o LiveCart está pedindo
          permissão para fazer (ler comentários, ler mensagens diretas e
          identificar lives ativas, basicamente). Revise a lista e clique em{" "}
          <Highlight>Permitir todos</Highlight> ou{" "}
          <Highlight>Concluir</Highlight>.
        </p>
        <p>
          Após autorizar, o navegador volta automaticamente para o LiveCart.
        </p>
        <Callout
          icon={<AlertTriangle className="h-4 w-4" />}
          title="Não desmarque permissões"
          tone="warning"
        >
          Se você desmarcar alguma permissão na tela do Facebook, o LiveCart
          pode não conseguir capturar todos os comentários ou DMs durante a
          live. Para uma experiência completa, deixe todas as permissões
          marcadas.
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
              Pronto! Sua conta está conectada
            </h3>
            <p className="text-sm leading-relaxed text-emerald-800 dark:text-emerald-200">
              No card do Instagram em Integrações, o status agora aparece como{" "}
              <strong>Conectado</strong>. Quando você iniciar uma live, o
              LiveCart já vai capturar comentários e DMs em tempo real e
              detectar pedidos automaticamente.
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
          question="Minha conta é Pessoal — preciso mudar?"
          answer={
            <>
              Sim. O Instagram não libera leitura programática de
              comentários/DMs para contas Pessoais. Mude para Profissional
              (Comercial ou Criador) — é gratuito, leva uns 30 segundos e dá
              pra reverter quando quiser. Configurações &rsaquo; Conta &rsaquo;
              Mudar para conta profissional.
            </>
          }
        />

        <FaqItem
          question="Posso conectar mais de uma conta Instagram?"
          answer={
            <>
              Hoje cada loja LiveCart conecta uma conta Instagram por vez. Se
              você tem várias contas (loja principal + segunda marca, por
              exemplo), escolha qual delas vai alimentar esta loja LiveCart.
              Pra mudar depois, é só desconectar e conectar a outra.
            </>
          }
        />

        <FaqItem
          question="O Instagram pode revogar a integração sozinho?"
          answer={
            <>
              Pode acontecer raramente — em geral por mudança de senha,
              alteração no tipo da conta, ou política da Meta. Se isso
              acontecer, o status no LiveCart muda pra{" "}
              <Highlight>Reconectar</Highlight> e basta repetir os 4 passos
              deste guia. Recomendamos conectar pela conta de quem tem acesso
              estável (idealmente o dono da loja, não um colaborador).
            </>
          }
        />

        <FaqItem
          question="Os meus seguidores vão saber que conectei o LiveCart?"
          answer={
            <>
              Não. A conexão é privada — só aparece pra você nas configurações
              do Instagram e do Facebook (em &ldquo;Aplicativos conectados&rdquo;).
              Seguidores não veem nenhuma indicação. Comentários e DMs continuam
              chegando normalmente para o aplicativo do Instagram, e em paralelo
              o LiveCart também recebe.
            </>
          }
        />

        <FaqItem
          question="Como desconectar?"
          answer={
            <>
              No card do Instagram em{" "}
              <Highlight>Configurações &rsaquo; Integrações</Highlight>,
              clique no ícone de tomada (Unplug). Para revogar de vez (do lado
              da Meta), abra o Facebook em{" "}
              <Highlight>Configurações &rsaquo; Integrações de empresas</Highlight>
              e remova o LiveCart.
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
