import type { Metadata } from "next"
import Image from "next/image"
import {
  ArrowRight,
  Boxes,
  Check,
  FileText,
  LifeBuoy,
  Mail,
  Package,
  Radio,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Wallet,
} from "lucide-react"

import { IntegrationCardLogo } from "@/components/integration/IntegrationCard/IntegrationCard.Logo"
import { Button } from "@/components/ui/button"

/**
 * MANUAL PÚBLICO DA INTEGRAÇÃO COM O BLING.
 *
 * O Bling exige que todo aplicativo publicado na Central de Extensões tenha uma
 * página de instruções acessível SEM login — quem lê ainda não é cliente, e
 * mandar essa pessoa para uma tela de senha é perder a instalação.
 *
 * Por isso a rota fica fora do matcher do middleware e a página não toca em
 * sessão, contexto de loja nem React Query: renderiza no servidor, não hidrata
 * nada e continua de pé mesmo com a API fora.
 *
 * ═══ A IDENTIDADE É A DA CASA ═══
 *
 * Nada aqui é inventado. O topo escuro com o brilho âmbar, o grid de 56px, o
 * badge de borda âmbar e o botão preto-sobre-âmbar são os MESMOS da landing
 * page (`components/marketing/landing-hero`), e o corpo claro segue o ritmo das
 * seções dela. Uma página institucional com paleta própria é uma marca a mais
 * para o cliente decorar — e a primeira versão desta tela cometeu exatamente
 * esse erro.
 *
 * A única liberdade tomada é de acessibilidade: o âmbar da marca (--primary,
 * HSL 37.7 92% 50%) rende cerca de 2:1 sobre branco, o que reprova para texto.
 * Onde ele é TEXTO em fundo claro, entra amber-700; onde é elemento gráfico
 * (círculo, borda, brilho), o âmbar cheio fica.
 *
 * A estrutura segue o "modelo de manual" do Bling, na ordem que eles pedem:
 * requisitos → passos no Bling → passos no integrador → contato.
 */

export const metadata: Metadata = {
  title: "Integração LiveCart + Bling — Manual de instalação",
  description:
    "Como conectar sua conta Bling ao LiveCart e transformar comentários de live do Instagram em pedidos de venda.",
}

export const dynamic = "force-static"

const APP = "https://app.livecart.com.br"

const REQUISITOS = [
  {
    icone: Sparkles,
    titulo: "Uma conta no LiveCart",
    corpo: (
      <>
        Obrigatória, e precisa existir <em>antes</em> de autorizar a integração.
        Crie a sua em{" "}
        <Ancora href={`${APP}/register`}>app.livecart.com.br/register</Ancora> —
        é gratuito e leva um minuto.
      </>
    ),
  },
  {
    icone: ShieldCheck,
    titulo: "Uma conta Bling ativa",
    corpo: (
      <>
        Com permissão para instalar aplicativos da Central de Extensões. Se você
        não é o administrador da conta, peça a quem for.
      </>
    ),
  },
  {
    icone: Boxes,
    titulo: "Produtos cadastrados no Bling",
    corpo: (
      <>
        Com preço e saldo em estoque. O LiveCart lê o seu catálogo do Bling — ele
        não cria produtos por lá.
      </>
    ),
  },
  {
    icone: RefreshCw,
    titulo: "Um ERP por loja",
    corpo: (
      <>
        Cada loja do LiveCart conecta <strong>um</strong> ERP. Se a sua já
        estiver ligada a outro sistema, desconecte antes — assim não fica dúvida
        sobre quem manda no estoque.
      </>
    ),
  },
]

const PASSOS_BLING = [
  {
    titulo: "Abra a Central de Extensões",
    corpo: "Entre na sua conta Bling e acesse o menu Central de Extensões.",
  },
  {
    titulo: "Procure por LiveCart",
    corpo: "Busque pelo nome do aplicativo na vitrine de extensões.",
  },
  {
    titulo: "Clique em Instalar aplicativo",
    corpo:
      "O Bling mostra as permissões que o LiveCart pede: produtos, estoque, pedidos de venda, contatos e notas fiscais.",
  },
  {
    titulo: "Autorize o acesso",
    corpo:
      "Ao confirmar, o Bling gera as credenciais da conexão. Você revoga quando quiser, pela mesma tela.",
  },
]

const PASSOS_LIVECART = [
  {
    titulo: "Acesse Configurações → Integrações",
    corpo: "No painel do LiveCart, abra a aba de integrações da sua loja.",
  },
  {
    titulo: "Clique em Conectar no cartão do Bling",
    corpo:
      "Você é levado ao Bling, entra com o seu próprio usuário e confirma as permissões. Sem criar aplicativo, sem copiar chave nenhuma.",
  },
  {
    titulo: "Importe seu catálogo",
    corpo:
      "Escolha os produtos que vão para a live. Preço, saldo, dimensões, código de barras e imagens vêm do Bling — inclusive as variações de cor e tamanho.",
  },
  {
    titulo: "Defina a palavra-chave de cada produto",
    corpo:
      "É o código que a compradora digita no comentário. O LiveCart sugere um número livre para cada item, e você pode trocar.",
  },
  {
    titulo: "Faça sua live",
    corpo:
      "Daí em diante é automático: comentário vira carrinho, a compradora recebe o link no Direct e o pedido de venda nasce no seu Bling.",
  },
]

const DEPOIS = [
  {
    icone: Package,
    titulo: "Pedido de venda no Bling",
    corpo:
      "Cada carrinho vira um pedido, com o contato da compradora criado ou atualizado. Itens somados ou removidos durante a live acompanham o pedido.",
  },
  {
    icone: Boxes,
    titulo: "Estoque espelhado",
    corpo:
      "O Bling continua dono do saldo. Quando ele muda por qualquer motivo — outra venda, entrada de nota, ajuste manual — o LiveCart é avisado.",
  },
  {
    icone: Wallet,
    titulo: "Pagamento e situação",
    corpo:
      "Pagamento confirmado atualiza a situação do pedido, com forma de pagamento e parcelas registradas.",
  },
  {
    icone: FileText,
    titulo: "Nota fiscal",
    corpo:
      "Emitiu a NF-e no Bling? O LiveCart reconhece e reflete no pedido, sem você avisar.",
  },
]

const DUVIDAS = [
  {
    pergunta: "Preciso criar um aplicativo no Bling?",
    resposta:
      "Não. O LiveCart já tem um aplicativo publicado na Central de Extensões, então você não gera nem cola client_id ou client_secret em lugar nenhum.",
  },
  {
    pergunta: "Meus produtos vão ser alterados no Bling?",
    resposta:
      "Não. O LiveCart lê o catálogo e escreve pedidos de venda e contatos. Cadastro, preço e saldo continuam sendo editados por você, no Bling.",
  },
  {
    pergunta: "E se um produto esgotar no meio da live?",
    resposta:
      "A compradora entra numa fila de espera em vez de perder a compra. Se o saldo voltar no Bling, o LiveCart avisa quem estava na fila.",
  },
  {
    pergunta: "Como eu desconecto?",
    resposta:
      "Pelo painel do LiveCart, em Configurações → Integrações, ou revogando o acesso do aplicativo direto na sua conta Bling. Os dois caminhos encerram a conexão.",
  },
]

export default function ManualBlingPage() {
  return (
    <div className="bg-background">
      {/* ══ TOPO ══════════════════════════════════════════════════════════
          Mesmo tratamento do hero da landing page: neutral-950, gradiente
          âmbar→laranja, dois brilhos borrados e a grade de 56px. É assim que
          o LiveCart se apresenta — e um manual é apresentação. */}
      <header className="relative overflow-hidden bg-neutral-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-950 via-neutral-950 to-orange-950" />
        <div className="absolute inset-0 opacity-50">
          <div className="absolute -left-1/4 -top-1/3 h-[600px] w-[600px] rounded-full bg-gradient-to-r from-orange-500/25 to-amber-500/25 blur-3xl" />
          <div className="absolute -bottom-1/2 -right-1/4 h-[500px] w-[500px] rounded-full bg-gradient-to-r from-yellow-500/20 to-orange-500/20 blur-3xl" />
        </div>
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />

        <div className="relative mx-auto max-w-5xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            <a href={APP} aria-label="LiveCart">
              <Image
                src="/livecart/logotipo-footer.png"
                alt="LiveCart"
                width={190}
                height={51}
                priority
                className="h-7 w-auto"
              />
            </a>
            <a
              href={APP}
              className="text-sm font-medium text-neutral-300 transition-colors hover:text-white"
            >
              Ir para o app
            </a>
          </div>

          <div className="pb-20 pt-14 sm:pb-24 sm:pt-20">
            {/* O par de marcas diz o assunto antes de qualquer palavra. */}
            <div className="flex items-center gap-3">
              <span className="flex size-12 items-center justify-center rounded-xl bg-amber-400/15 ring-1 ring-amber-400/30">
                <Radio className="size-5 text-amber-300" />
              </span>
              <span className="text-lg text-neutral-500">+</span>
              <IntegrationCardLogo provider="bling" size="md" className="size-12" />
            </div>

            <div className="mt-8 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-3 py-1 text-xs font-medium text-amber-200">
              <Sparkles className="size-3.5" />
              Manual de integração
            </div>

            <h1 className="mt-5 max-w-2xl text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              Conecte o Bling e transforme comentários em{" "}
              <span className="bg-gradient-to-r from-amber-300 to-orange-400 bg-clip-text text-transparent">
                pedidos de venda
              </span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-300">
              A compradora comenta o código do produto na sua live do Instagram,
              recebe o link de pagamento no Direct, e o pedido nasce no seu Bling
              — durante a transmissão, não depois dela.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                size="lg"
                className="h-12 bg-amber-400 text-base font-semibold text-black hover:bg-amber-300"
              >
                <a href={`${APP}/settings/integrations`}>
                  Conectar meu Bling
                  <ArrowRight className="ml-2 size-4" />
                </a>
              </Button>
              <p className="text-sm text-neutral-400">
                Leva cerca de 5 minutos · sem custo adicional no Bling
              </p>
            </div>

            <dl className="mt-14 grid gap-6 border-t border-white/10 pt-8 sm:grid-cols-3">
              <Estatistica rotulo="Autenticação" valor="OAuth 2.0" />
              <Estatistica rotulo="Instalação" valor="Cerca de 5 minutos" />
              <Estatistica rotulo="Custo no Bling" valor="Sem custo adicional" />
            </dl>
          </div>
        </div>
      </header>

      <main>
        {/* ══ REQUISITOS ═════════════════════════════════════════════════ */}
        <Secao id="requisitos" eyebrow="Antes de começar" titulo="O que você precisa ter">
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {REQUISITOS.map(({ icone: Icone, titulo, corpo }) => (
              <div
                key={titulo}
                className="rounded-xl border bg-card p-6 transition-colors hover:border-primary/40"
              >
                <span className="flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icone className="size-5 text-amber-700 dark:text-amber-400" />
                </span>
                <h3 className="mt-4 font-bold tracking-tight">{titulo}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {corpo}
                </p>
              </div>
            ))}
          </div>
        </Secao>

        {/* ══ PASSOS NO BLING ════════════════════════════════════════════ */}
        <Secao
          id="no-bling"
          eyebrow="Passos no Bling"
          titulo="Instale o aplicativo"
          lead="Se você prefere começar pelo Bling, o caminho é a Central de Extensões."
          alternado
        >
          <Passos passos={PASSOS_BLING} />
        </Secao>

        {/* ══ PASSOS NO INTEGRADOR ═══════════════════════════════════════ */}
        <Secao
          id="no-livecart"
          eyebrow="Passos no LiveCart"
          titulo="Conecte e importe o catálogo"
          lead="Você também pode começar por aqui — o LiveCart leva você ao Bling na hora de autorizar. Mesmo destino, caminho mais curto."
        >
          <Passos passos={PASSOS_LIVECART} />

          <div className="mt-12 flex justify-center">
            <Button
              asChild
              size="lg"
              className="h-12 text-base font-semibold"
            >
              <a href={`${APP}/settings/integrations`}>
                Ir para Integrações
                <ArrowRight className="ml-2 size-4" />
              </a>
            </Button>
          </div>
        </Secao>

        {/* ══ DEPOIS DE CONECTAR ═════════════════════════════════════════ */}
        <Secao
          id="depois"
          eyebrow="Depois de conectar"
          titulo="O que passa a acontecer sozinho"
          alternado
        >
          <div className="mt-12 grid gap-4 sm:grid-cols-2">
            {DEPOIS.map(({ icone: Icone, titulo, corpo }) => (
              <div key={titulo} className="rounded-xl border bg-card p-6">
                <div className="flex items-center gap-3">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 text-white shadow-sm">
                    <Icone className="size-4" />
                  </span>
                  <h3 className="font-bold tracking-tight">{titulo}</h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {corpo}
                </p>
              </div>
            ))}
          </div>

          {/* Dito com todas as letras porque é a pergunta que o lojista de ERP
              faz primeiro — e prometer reserva seria vender o que não existe. */}
          <div className="mt-6 flex gap-3 rounded-xl border border-primary/20 bg-primary/5 p-5">
            <Check className="mt-0.5 size-5 shrink-0 text-amber-700 dark:text-amber-400" />
            <p className="text-sm leading-relaxed text-muted-foreground">
              O LiveCart{" "}
              <strong className="text-foreground">
                não reserva estoque no Bling
              </strong>
              . Ele segura a disponibilidade do lado dele durante a live e só
              grava o pedido — o saldo do Bling continua sendo a única verdade.
            </p>
          </div>
        </Secao>

        {/* ══ DÚVIDAS ════════════════════════════════════════════════════ */}
        <Secao id="duvidas" eyebrow="Dúvidas frequentes" titulo="Antes de nos chamar">
          <dl className="mt-12 divide-y rounded-xl border bg-card">
            {DUVIDAS.map(({ pergunta, resposta }) => (
              <div key={pergunta} className="p-6">
                <dt className="font-bold tracking-tight">{pergunta}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {resposta}
                </dd>
              </div>
            ))}
          </dl>
        </Secao>

        {/* ══ SUPORTE ════════════════════════════════════════════════════ */}
        <Secao id="suporte" eyebrow="Contato" titulo="Suporte" alternado>
          <p className="mt-4 max-w-xl text-lg text-muted-foreground">
            Travou em algum passo, ou algo não chegou no Bling como você
            esperava? Fale com a gente — respondemos no mesmo dia útil.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            <Contato
              icone={Mail}
              rotulo="E-mail"
              valor="eng@livecart.com.br"
              href="mailto:eng@livecart.com.br"
            />
            {/* A central de ajuda vive dentro do painel e exige login. Quem lê
                este manual pode ainda não ter conta — mandar essa pessoa para
                uma tela de senha é o erro que a página inteira existe para
                evitar. Por isso ela vem rotulada como o que é. */}
            <Contato
              icone={LifeBuoy}
              rotulo="Central de ajuda · para clientes"
              valor="app.livecart.com.br/support"
              href={`${APP}/support`}
            />
          </div>
        </Secao>
      </main>

      {/* ══ RODAPÉ ═══════════════════════════════════════════════════════ */}
      <footer className="bg-neutral-950 text-neutral-400">
        <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6">
          <Image
            src="/livecart/logotipo-footer.png"
            alt="LiveCart"
            width={190}
            height={51}
            className="h-7 w-auto"
          />
          <div className="mt-8 flex flex-col gap-4 border-t border-white/10 pt-6 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p>
              Dahlemtech Solutions Ltda · CNPJ 54.350.351/0001-51
            </p>
            <p className="flex gap-6">
              <a href={`${APP}/privacy`} className="transition-colors hover:text-white">
                Privacidade
              </a>
              <a href={`${APP}/terms`} className="transition-colors hover:text-white">
                Termos
              </a>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PEÇAS
   ══════════════════════════════════════════════════════════════════════ */

/** Ritmo das seções da landing page: eyebrow âmbar, título bold, lead muted. */
function Secao({
  id,
  eyebrow,
  titulo,
  lead,
  alternado,
  children,
}: {
  id: string
  eyebrow: string
  titulo: string
  lead?: string
  alternado?: boolean
  children: React.ReactNode
}) {
  return (
    <section
      id={id}
      aria-labelledby={`${id}-titulo`}
      className={alternado ? "bg-muted/40 py-20 sm:py-24" : "bg-background py-20 sm:py-24"}
    >
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-amber-700 dark:text-amber-400">
          {eyebrow}
        </p>
        <h2
          id={`${id}-titulo`}
          className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl"
        >
          {titulo}
        </h2>
        {lead && (
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            {lead}
          </p>
        )}
        {children}
      </div>
    </section>
  )
}

/** Passos numerados com o disco âmbar→laranja da landing page, ligados por uma
 *  linha vertical: a linha é o que faz a lista virar percurso. */
function Passos({ passos }: { passos: { titulo: string; corpo: string }[] }) {
  return (
    <ol className="mt-12 space-y-0">
      {passos.map((p, i) => (
        <li key={p.titulo} className="relative flex gap-5 pb-8 last:pb-0">
          {i < passos.length - 1 && (
            <span
              aria-hidden
              className="absolute left-5 top-11 h-[calc(100%-1.75rem)] w-px bg-border"
            />
          )}
          <span className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-white shadow-sm">
            {i + 1}
          </span>
          <div className="min-w-0 flex-1 pt-1">
            <h3 className="font-bold tracking-tight">{p.titulo}</h3>
            <p className="mt-1.5 leading-relaxed text-muted-foreground">
              {p.corpo}
            </p>
          </div>
        </li>
      ))}
    </ol>
  )
}

function Estatistica({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wider text-neutral-500">
        {rotulo}
      </dt>
      <dd className="mt-1.5 font-semibold text-white">{valor}</dd>
    </div>
  )
}

function Contato({
  icone: Icone,
  rotulo,
  valor,
  href,
}: {
  icone: React.ComponentType<{ className?: string }>
  rotulo: string
  valor: string
  href: string
}) {
  return (
    <a
      href={href}
      className="group flex items-center gap-4 rounded-xl border bg-card p-5 transition-colors hover:border-primary/40"
    >
      <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
        <Icone className="size-5 text-amber-700 dark:text-amber-400" />
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {rotulo}
        </span>
        <span className="mt-0.5 block truncate font-semibold group-hover:text-amber-700 dark:group-hover:text-amber-400">
          {valor}
        </span>
      </span>
    </a>
  )
}

/** Âncora dentro de texto corrido. Sublinhada, e não só colorida. */
function Ancora({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="font-medium text-amber-700 underline decoration-amber-700/30 underline-offset-4 transition-colors hover:decoration-amber-700 dark:text-amber-400 dark:decoration-amber-400/30 dark:hover:decoration-amber-400"
    >
      {children}
    </a>
  )
}
