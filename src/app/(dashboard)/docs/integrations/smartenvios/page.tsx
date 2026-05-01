import Link from "next/link"
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  Clock,
  ExternalLink,
  Info,
  Package,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Callout,
  FaqItem,
  FigureImage,
  Highlight,
  Step,
} from "@/components/docs"

export default function SmartEnviosDocPage() {
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
        <span className="text-foreground">SmartEnvios</span>
      </nav>

      {/* Title */}
      <header className="space-y-3 border-b pb-8">
        <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
          <Package className="h-3.5 w-3.5" />
          Integrações &middot; Frete
        </span>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Integrar com a SmartEnvios
        </h1>
        <p className="text-base leading-relaxed text-muted-foreground">
          Conecte sua conta SmartEnvios ao LiveCart para que as transportadoras
          que você contratou apareçam automaticamente no checkout — sem precisar
          configurar cada uma manualmente.
        </p>
        <div className="flex flex-wrap items-center gap-4 pt-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1.5">
            <Clock className="h-3.5 w-3.5" />
            Tempo estimado: <strong className="text-foreground">3 minutos</strong>
          </span>
          <span aria-hidden className="text-muted-foreground/40">
            •
          </span>
          <span>
            Você precisa de uma{" "}
            <strong className="text-foreground">conta SmartEnvios ativa</strong>
          </span>
        </div>
      </header>

      {/* Intro callout */}
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="Como funciona"
        tone="neutral"
      >
        A integração usa um <strong>token de acesso</strong> gerado pela própria
        SmartEnvios. Você copia esse token no portal deles e cola aqui no
        LiveCart — pronto, conectado. Não precisa cadastrar transportadora por
        transportadora: o LiveCart usa a configuração que você já tem na
        SmartEnvios.
      </Callout>

      {/* Step 1 */}
      <Step
        number={1}
        title="Acesse o portal da SmartEnvios"
        location="smartenvios"
      >
        <p>
          Abra o portal da SmartEnvios em uma nova aba e faça login com a sua
          conta:
        </p>
        <div className="rounded-md border bg-muted/30 p-3 font-mono text-xs break-all">
          https://portal.smartenvios.com/login
        </div>
        <Button asChild variant="outline" size="sm">
          <a
            href="https://portal.smartenvios.com/login"
            target="_blank"
            rel="noopener noreferrer"
          >
            Abrir portal SmartEnvios
            <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
          </a>
        </Button>
      </Step>

      {/* Step 2 */}
      <Step
        number={2}
        title="Vá até as configurações de integração"
        location="smartenvios"
      >
        <p>
          Já dentro do portal, no menu, clique em{" "}
          <Highlight>Configurações</Highlight> e depois em{" "}
          <Highlight>Integrações</Highlight>.
        </p>
      </Step>

      {/* Step 3 */}
      <Step
        number={3}
        title='Encontre o card "SmartEnvios API" e copie o Token'
        location="smartenvios"
      >
        <p>
          Na lista de integrações, procure pelo card{" "}
          <Highlight>SmartEnvios API</Highlight> e clique em{" "}
          <Highlight>Configurar</Highlight>. Dentro da tela de configuração você
          vai encontrar o campo <Highlight>Token SmartEnvios</Highlight>. Copie
          esse token — vamos colar ele aqui no LiveCart no próximo passo.
        </p>
        <FigureImage
          src="/docs/integrations/smartenvios/smartenvios-api.png"
          alt="Tela do portal SmartEnvios mostrando o card SmartEnvios API e o token a ser copiado"
          caption="As três setas mostram exatamente onde clicar: card, botão Configurar e o token."
        />
        <Callout
          icon={<Info className="h-4 w-4" />}
          title="Guarde o token em segurança"
          tone="warning"
        >
          O token funciona como uma senha — qualquer pessoa que tiver acesso a
          ele pode consultar fretes e gerar envios em sua conta. Não compartilhe
          com terceiros e não publique em lugares públicos.
        </Callout>
      </Step>

      {/* Step 4 */}
      <Step number={4} title="Cole o Token aqui no LiveCart" location="livecart">
        <p>
          Volte para o LiveCart. No menu lateral, clique em{" "}
          <Highlight>Configurações</Highlight>, depois{" "}
          <Highlight>Integrações</Highlight> e mude para a aba{" "}
          <Highlight>Frete</Highlight>. No card{" "}
          <Highlight>SmartEnvios</Highlight>, clique em{" "}
          <Highlight>Conectar SmartEnvios</Highlight>.
        </p>
        <p>
          Cole o token que você copiou no campo{" "}
          <Highlight>Token do embarcador</Highlight> e clique em{" "}
          <Highlight>Conectar</Highlight>. O LiveCart valida o token na hora — se
          ele estiver correto, a conexão é confirmada imediatamente.
        </p>
        <Button asChild variant="outline" size="sm">
          <Link href="/settings/integrations">
            Ir para Integrações
            <ChevronRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
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
              As transportadoras habilitadas no portal SmartEnvios já aparecem
              automaticamente nas cotações de frete do seu checkout. Quando uma
              venda for fechada, o LiveCart usa essa integração para criar o
              envio, gerar a etiqueta e acompanhar o rastreio.
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
          question="Como atualizar (rotacionar) o token mais tarde?"
          answer={
            <>
              Se o token vazar ou a SmartEnvios pedir pra renovar, vá em{" "}
              <Highlight>Configurações &rsaquo; Integrações &rsaquo; Frete</Highlight>
              , clique em <Highlight>Ver detalhes</Highlight> no card SmartEnvios
              e use a opção <Highlight>Rotacionar token</Highlight>. Antes de
              confirmar, gere um token novo no portal SmartEnvios — o token
              antigo continua valendo até você confirmar a substituição aqui.
            </>
          }
        />

        <FaqItem
          question="Quero adicionar uma transportadora nova. Faço isso onde?"
          answer={
            <>
              No próprio portal da SmartEnvios. As transportadoras que você
              habilitar lá começam a aparecer no LiveCart na próxima cotação —
              não precisa fazer nada por aqui depois.
            </>
          }
        />

        <FaqItem
          question="O LiveCart vai cobrar de novo o frete que eu já paguei na SmartEnvios?"
          answer={
            <>
              Não. O LiveCart usa a tabela de preços negociada da sua conta
              SmartEnvios. O cliente paga o frete no checkout e a SmartEnvios
              cobra de você o valor já contratado.
            </>
          }
        />

        <FaqItem
          question="O que aparece pro cliente final no checkout?"
          answer={
            <>
              Apenas o nome da transportadora (ex.: Jadlog, Total Express),
              prazo e preço. O cliente não vê o nome &ldquo;SmartEnvios&rdquo;
              nem detalhes técnicos da integração.
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
