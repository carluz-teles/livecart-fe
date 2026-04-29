import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Truck,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Callout, FaqItem, Highlight, Step } from "@/components/docs"

export default function MelhorEnvioDocPage() {
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
        <span className="text-foreground">Melhor Envio</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Truck className="h-3.5 w-3.5" />
          Integrações &middot; Frete
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Integrar com o Melhor Envio
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conecte sua conta Melhor Envio para cotar frete no checkout com
          Correios (PAC, SEDEX), Jadlog, Loggi, LATAM Cargo e outras
          transportadoras — direto pelos preços negociados na sua conta.
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
            <strong className="text-foreground">conta Melhor Envio</strong>
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
        Melhor Envio (se ainda não estiver logado), autoriza as permissões e
        pronto. O checkout passa a usar as transportadoras que você já tem
        habilitadas na sua conta — sem precisar configurar uma por uma aqui.
      </Callout>

      {/* Step 1 */}
      <Step
        number={1}
        title='Abra Integrações e clique em "Conectar Melhor Envio"'
        location="livecart"
      >
        <p>
          No LiveCart, vá em{" "}
          <Highlight>Configurações &rsaquo; Integrações</Highlight>. Na aba{" "}
          <Highlight>Frete</Highlight>, encontre o card do Melhor Envio e
          clique em <Highlight>Conectar Melhor Envio</Highlight>.
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
        title="Faça login no Melhor Envio"
        location="melhor_envio"
      >
        <p>
          O LiveCart abre o site do Melhor Envio em uma nova aba. Se você
          ainda não estiver logado, entre com a conta da loja — a mesma onde
          os envios serão gerados.
        </p>
        <p>
          Não tem conta ainda? Crie uma gratuitamente em{" "}
          <a
            href="https://melhorenvio.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary hover:underline"
          >
            melhorenvio.com.br
            <ExternalLink className="ml-0.5 inline h-3 w-3" />
          </a>{" "}
          e volte aqui depois.
        </p>
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title="Autorize o LiveCart"
        location="melhor_envio"
      >
        <p>
          O Melhor Envio mostra uma tela explicando o que o LiveCart está
          pedindo permissão para fazer (em geral: cotar fretes, listar
          serviços contratados e gerar etiquetas). Revise e clique em{" "}
          <Highlight>Autorizar</Highlight>.
        </p>
        <p>
          Após autorizar, o navegador volta automaticamente para o LiveCart
          com a conexão confirmada.
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
              No card do Melhor Envio em Integrações, o status agora aparece
              como <strong>Conectado</strong>. Na próxima cotação no checkout,
              já vão aparecer as transportadoras habilitadas na sua conta com
              os preços negociados — sem cadastrar nada manualmente.
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
          question="Não vejo as transportadoras que esperava no checkout — o que verifico?"
          answer={
            <>
              Abra o Melhor Envio e confirme que (1) o CEP de origem da loja
              está cadastrado, (2) as transportadoras que você quer estão
              <strong> ativas</strong> na sua conta, e (3) elas atendem o CEP
              de destino do cliente. Mudou alguma config no Melhor Envio? A
              próxima cotação no LiveCart já reflete — não precisa
              reconfigurar aqui.
            </>
          }
        />

        <FaqItem
          question="Os preços que aparecem para o cliente são os negociados na minha conta?"
          answer={
            <>
              Sim. O LiveCart usa exatamente a tabela de preços que o Melhor
              Envio retorna pra sua conta. Se você tem preços melhores que
              tabela cheia (Programa Fidelidade, Volume, etc.), eles aparecem
              no checkout — o cliente só vê o preço final, não o detalhe do
              desconto.
            </>
          }
        />

        <FaqItem
          question="Posso usar Melhor Envio e SmartEnvios juntos?"
          answer={
            <>
              Pode. Quando as duas integrações estão ativas, o LiveCart cota
              em ambos e mostra todas as opções no checkout — o cliente
              escolhe a que preferir (ele não vê o nome do gateway, só a
              transportadora e o preço). Útil para comparar tabelas ou ter
              cobertura para regiões onde uma das duas não atende.
            </>
          }
        />

        <FaqItem
          question="O cliente vê o nome “Melhor Envio” no checkout?"
          answer={
            <>
              Não. No checkout o cliente vê apenas o nome da transportadora
              (Correios, Jadlog, Loggi, etc.), o prazo e o preço. O Melhor
              Envio fica nos bastidores — o gateway de cotação que faz tudo
              isso funcionar.
            </>
          }
        />

        <FaqItem
          question="Como desconectar?"
          answer={
            <>
              No card do Melhor Envio em{" "}
              <Highlight>Configurações &rsaquo; Integrações</Highlight>,
              clique no ícone de tomada (Unplug). As cotações com Melhor
              Envio param na hora. Você pode reconectar a qualquer momento —
              basta repetir os 3 passos deste guia.
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
