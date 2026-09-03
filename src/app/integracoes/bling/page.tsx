import type { Metadata } from "next"

/**
 * MANUAL PÚBLICO DA INTEGRAÇÃO COM O BLING.
 *
 * O Bling exige que todo aplicativo publicado na Central de Extensões tenha uma
 * página de manual acessível SEM login — quem lê ainda não é cliente, e mandar
 * essa pessoa para uma tela de senha é perder a instalação.
 *
 * Por isso a rota entra na allowlist do middleware e a página não toca em
 * sessão, contexto de loja nem React Query. É um documento estático: renderiza
 * no servidor, não hidrata nada, e continua de pé mesmo se a API estiver fora.
 *
 * ═══ POR QUE ELA NÃO SE PARECE COM O APP ═══
 *
 * O painel é uma ferramenta de trabalho — denso, rápido, cheio de estado. Isto
 * é um documento: alguém decidindo se confia na integração. Por isso a página
 * tem paleta e composição próprias (papel quente, serifada em display, mono nos
 * rótulos, numerais grandes na margem) em vez dos tokens do dashboard. As cores
 * vivem em variáveis locais justamente para o tema do app não vazar para cá.
 *
 * A estrutura segue o "modelo de manual" do Bling, na ordem que eles pedem:
 * requisitos → passos no Bling → passos no integrador → contato.
 */

export const metadata: Metadata = {
  title: "Integração LiveCart + Bling — Manual de instalação",
  description:
    "Como conectar sua conta Bling ao LiveCart e transformar comentários de live do Instagram em pedidos de venda.",
}

// Documento estático: nada aqui muda entre um acesso e outro.
export const dynamic = "force-static"

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
      "O Bling vai mostrar quais permissões o LiveCart precisa: produtos, estoque, pedidos de venda, contatos e notas fiscais.",
  },
  {
    titulo: "Autorize o acesso",
    corpo:
      "Ao confirmar, o Bling gera as credenciais da conexão. Você pode revogar esse acesso quando quiser, pela mesma tela.",
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
      "Você é levado para o Bling, faz login com o seu próprio usuário e confirma as permissões. Não é preciso criar aplicativo nem copiar chaves.",
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
      "A partir daí é automático: comentário vira carrinho, a compradora recebe o link no Direct e o pedido de venda nasce no seu Bling.",
  },
]

const DEPOIS = [
  {
    titulo: "Pedido de venda no Bling",
    corpo:
      "Cada carrinho vira um pedido, com o contato da compradora criado ou atualizado. Itens adicionados ou removidos durante a live acompanham o pedido.",
  },
  {
    titulo: "Estoque espelhado",
    corpo:
      "O Bling continua sendo o dono do saldo. Quando ele muda por qualquer motivo — outra venda, entrada de nota, ajuste manual — o LiveCart é avisado.",
  },
  {
    titulo: "Pagamento e situação",
    corpo:
      "Pagamento confirmado atualiza a situação do pedido, com forma de pagamento e parcelas registradas.",
  },
  {
    titulo: "Nota fiscal",
    corpo:
      "Emitiu a NF-e no Bling? O LiveCart reconhece e reflete no pedido, sem você avisar.",
  },
]

export default function ManualBlingPage() {
  return (
    <div className="manual">
      {/* A paleta e a tipografia vivem aqui, e não nos tokens do app, para o
          documento ficar igual em qualquer tema — inclusive quando o Bling
          abre o link numa aba sem preferência nenhuma definida. */}
      <style>{`
        .manual {
          --papel: #f7f4ee;
          --papel-fundo: #efeae0;
          --tinta: #1a1815;
          --tinta-suave: #6b6357;
          --regua: #ddd5c6;
          --acento: #b4451f;
          --acento-fraco: #f0e2d8;
          color-scheme: light;
          background-color: var(--papel);
          color: var(--tinta);
          min-height: 100vh;
          /* Grão de papel: um ruído fraquíssimo que tira o achatamento do
             fundo chapado sem virar textura visível. */
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)' opacity='0.035'/%3E%3C/svg%3E");
        }
        .dark .manual {
          --papel: #15130f;
          --papel-fundo: #1d1a15;
          --tinta: #f1ede5;
          --tinta-suave: #9c9385;
          --regua: #302b24;
          --acento: #e5825a;
          --acento-fraco: #2a201a;
          color-scheme: dark;
        }
        .manual ::selection { background: var(--acento); color: var(--papel); }
      `}</style>

      {/* ── CABEÇALHO ───────────────────────────────────────────────────── */}
      <header className="border-b" style={{ borderColor: "var(--regua)" }}>
        <div className="mx-auto max-w-3xl px-6 pb-14 pt-16 sm:px-8 sm:pt-24">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: "var(--acento)" }}
          >
            Manual de integração
          </p>

          <h1
            className="mt-5 font-serif text-4xl leading-[1.08] tracking-tight sm:text-5xl"
            style={{ color: "var(--tinta)" }}
          >
            LiveCart <span style={{ color: "var(--regua)" }}>+</span> Bling
          </h1>

          <p
            className="mt-6 max-w-xl font-serif text-lg leading-relaxed"
            style={{ color: "var(--tinta-suave)" }}
          >
            O LiveCart transforma comentários de live e post do Instagram em
            pedidos de venda no seu Bling. A compradora comenta o código do
            produto, recebe o link de pagamento no Direct, e o pedido nasce no
            seu ERP — durante a transmissão, não depois dela.
          </p>

          <dl
            className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t pt-6 font-mono text-[11px] uppercase tracking-[0.14em]"
            style={{ borderColor: "var(--regua)", color: "var(--tinta-suave)" }}
          >
            <div>
              <dt className="opacity-60">Tempo de instalação</dt>
              <dd className="mt-1" style={{ color: "var(--tinta)" }}>
                cerca de 5 minutos
              </dd>
            </div>
            <div>
              <dt className="opacity-60">Autenticação</dt>
              <dd className="mt-1" style={{ color: "var(--tinta)" }}>
                OAuth 2.0
              </dd>
            </div>
            <div>
              <dt className="opacity-60">Custo no Bling</dt>
              <dd className="mt-1" style={{ color: "var(--tinta)" }}>
                sem custo adicional
              </dd>
            </div>
          </dl>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 sm:px-8">
        {/* ── REQUISITOS ────────────────────────────────────────────────── */}
        <section className="pt-16" aria-labelledby="requisitos">
          <Rotulo>Antes de começar</Rotulo>
          <h2
            id="requisitos"
            className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl"
          >
            O que você precisa ter
          </h2>

          <div
            className="mt-7 space-y-5 border-l-2 py-1 pl-6"
            style={{ borderColor: "var(--acento)" }}
          >
            <Requisito titulo="Uma conta no LiveCart">
              A conta é obrigatória e precisa existir <em>antes</em> de
              autorizar a integração. Crie a sua em{" "}
              <Link href="https://app.livecart.com.br/register">
                app.livecart.com.br/register
              </Link>
              . O cadastro é gratuito e leva um minuto.
            </Requisito>

            <Requisito titulo="Uma conta Bling ativa">
              Com permissão para instalar aplicativos da Central de Extensões.
              Se você não é o administrador da conta, peça a quem for.
            </Requisito>

            <Requisito titulo="Produtos cadastrados no Bling">
              Com preço e saldo em estoque. O LiveCart lê o seu catálogo do
              Bling — ele não cria produtos por lá.
            </Requisito>

            <Requisito titulo="Um ERP por loja">
              Cada loja do LiveCart conecta <strong>um</strong> ERP. Se a sua já
              estiver ligada a outro sistema, desconecte antes de conectar o
              Bling — assim não fica dúvida sobre quem manda no estoque.
            </Requisito>
          </div>
        </section>

        <Divisor />

        {/* ── PASSOS NO BLING ───────────────────────────────────────────── */}
        <Passos
          numero="01"
          rotulo="Passos no Bling"
          titulo="Instale o aplicativo"
          resumo="Se você prefere começar pelo Bling, o caminho é a Central de Extensões."
          passos={PASSOS_BLING}
        />

        {/* ── PASSOS NO INTEGRADOR ──────────────────────────────────────── */}
        <Passos
          numero="02"
          rotulo="Passos no LiveCart"
          titulo="Conecte e importe o catálogo"
          resumo="Você também pode começar por aqui: o LiveCart leva você ao Bling na hora de autorizar. É o mesmo destino, e é o caminho mais curto."
          passos={PASSOS_LIVECART}
        />

        <Divisor />

        {/* ── O QUE ACONTECE DEPOIS ─────────────────────────────────────── */}
        <section aria-labelledby="depois">
          <Rotulo>Depois de conectar</Rotulo>
          <h2
            id="depois"
            className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl"
          >
            O que passa a acontecer sozinho
          </h2>

          <div className="mt-8 grid gap-px sm:grid-cols-2" style={{ backgroundColor: "var(--regua)" }}>
            {DEPOIS.map((item) => (
              <div
                key={item.titulo}
                className="p-6"
                style={{ backgroundColor: "var(--papel-fundo)" }}
              >
                <h3 className="font-serif text-lg">{item.titulo}</h3>
                <p
                  className="mt-2 text-sm leading-relaxed"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {item.corpo}
                </p>
              </div>
            ))}
          </div>

          <p
            className="mt-6 text-sm leading-relaxed"
            style={{ color: "var(--tinta-suave)" }}
          >
            O LiveCart <strong>não reserva estoque no Bling</strong>. Ele segura
            a disponibilidade do lado dele durante a live e só grava o pedido —
            o saldo do Bling continua sendo a única verdade.
          </p>
        </section>

        <Divisor />

        {/* ── DÚVIDAS FREQUENTES ────────────────────────────────────────── */}
        <section aria-labelledby="duvidas">
          <Rotulo>Dúvidas frequentes</Rotulo>
          <h2
            id="duvidas"
            className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl"
          >
            Antes de nos chamar
          </h2>

          <dl className="mt-8 divide-y" style={{ borderColor: "var(--regua)" }}>
            <Duvida pergunta="Preciso criar um aplicativo no Bling?">
              Não. O LiveCart já tem um aplicativo publicado na Central de
              Extensões, então você não precisa gerar nem colar client_id ou
              client_secret em lugar nenhum.
            </Duvida>
            <Duvida pergunta="Meus produtos vão ser alterados no Bling?">
              Não. O LiveCart lê o catálogo e escreve pedidos de venda e
              contatos. Cadastro de produto, preço e saldo continuam sendo
              editados por você, no Bling.
            </Duvida>
            <Duvida pergunta="E se um produto esgotar no meio da live?">
              A compradora entra numa fila de espera em vez de perder a compra.
              Se o saldo voltar no Bling, o LiveCart avisa quem estava na fila.
            </Duvida>
            <Duvida pergunta="Como eu desconecto?">
              Pelo painel do LiveCart, em Configurações → Integrações, ou
              revogando o acesso do aplicativo direto na sua conta Bling. Os dois
              caminhos encerram a conexão.
            </Duvida>
          </dl>
        </section>

        <Divisor />

        {/* ── CONTATO ───────────────────────────────────────────────────── */}
        <section aria-labelledby="suporte" className="pb-4">
          <Rotulo>Contato</Rotulo>
          <h2
            id="suporte"
            className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl"
          >
            Suporte
          </h2>

          <p
            className="mt-4 max-w-xl leading-relaxed"
            style={{ color: "var(--tinta-suave)" }}
          >
            Travou em algum passo, ou algo não chegou no Bling como você
            esperava? Fale com a gente — respondemos no mesmo dia útil.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:gap-12">
            <Contato rotulo="E-mail" valor="suporte@livecart.app" href="mailto:suporte@livecart.app" />
            <Contato
              rotulo="Central de ajuda"
              valor="app.livecart.com.br/support"
              href="https://app.livecart.com.br/support"
            />
          </div>
        </section>
      </main>

      {/* ── RODAPÉ ──────────────────────────────────────────────────────── */}
      <footer
        className="mt-20 border-t"
        style={{ borderColor: "var(--regua)", backgroundColor: "var(--papel-fundo)" }}
      >
        {/* Colofão empilhado, e não em linha: a razão social com CNPJ já ocupa
            a medida inteira, e jogar os links no mesmo eixo os deixava colados
            no número — parecia continuação dele. */}
        <div
          className="mx-auto max-w-3xl px-6 py-10 font-mono text-[11px] uppercase leading-relaxed tracking-[0.14em] sm:px-8"
          style={{ color: "var(--tinta-suave)" }}
        >
          <p>LiveCart — Dahlemtech Solutions Ltda</p>
          <p className="mt-1 opacity-70">CNPJ 54.350.351/0001-51</p>
          <p className="mt-4 flex gap-6">
            <Link href="https://app.livecart.com.br/privacy" discreto>
              Privacidade
            </Link>
            <Link href="https://app.livecart.com.br/terms" discreto>
              Termos
            </Link>
          </p>
        </div>
      </footer>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════════════════
   PEÇAS DO DOCUMENTO
   ══════════════════════════════════════════════════════════════════════ */

function Rotulo({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="font-mono text-[11px] uppercase tracking-[0.22em]"
      style={{ color: "var(--acento)" }}
    >
      {children}
    </p>
  )
}

function Divisor() {
  return (
    <div className="py-16">
      <hr style={{ borderColor: "var(--regua)" }} />
    </div>
  )
}

function Requisito({
  titulo,
  children,
}: {
  titulo: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h3 className="font-serif text-lg leading-snug">{titulo}</h3>
      <p
        className="mt-1 text-sm leading-relaxed"
        style={{ color: "var(--tinta-suave)" }}
      >
        {children}
      </p>
    </div>
  )
}

/** Um bloco de passos numerados. O numeral grande na margem é a assinatura do
 *  documento: dá a quem só folheia a noção de "são duas etapas, não vinte". */
function Passos({
  numero,
  rotulo,
  titulo,
  resumo,
  passos,
}: {
  numero: string
  rotulo: string
  titulo: string
  resumo: string
  passos: { titulo: string; corpo: string }[]
}) {
  return (
    <section aria-labelledby={`etapa-${numero}`} className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute -top-6 right-0 select-none font-mono text-[7rem] leading-none tracking-tighter sm:-top-10 sm:text-[9rem]"
        style={{ color: "var(--regua)", opacity: 0.5 }}
      >
        {numero}
      </div>

      <div className="relative">
        <Rotulo>{rotulo}</Rotulo>
        <h2
          id={`etapa-${numero}`}
          className="mt-3 font-serif text-2xl tracking-tight sm:text-3xl"
        >
          {titulo}
        </h2>
        <p
          className="mt-4 max-w-xl leading-relaxed"
          style={{ color: "var(--tinta-suave)" }}
        >
          {resumo}
        </p>

        <ol className="mt-10 space-y-8">
          {passos.map((p, i) => (
            <li key={p.titulo} className="flex gap-5 sm:gap-7">
              <span
                className="w-7 shrink-0 pt-1 text-right font-mono text-sm tabular-nums"
                style={{ color: "var(--acento)" }}
                aria-hidden
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
                <h3 className="font-serif text-lg leading-snug">{p.titulo}</h3>
                <p
                  className="mt-1.5 leading-relaxed"
                  style={{ color: "var(--tinta-suave)" }}
                >
                  {p.corpo}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  )
}

function Duvida({
  pergunta,
  children,
}: {
  pergunta: string
  children: React.ReactNode
}) {
  return (
    <div className="py-5 first:pt-0">
      <dt className="font-serif text-lg leading-snug">{pergunta}</dt>
      <dd
        className="mt-1.5 max-w-xl leading-relaxed"
        style={{ color: "var(--tinta-suave)" }}
      >
        {children}
      </dd>
    </div>
  )
}

function Contato({
  rotulo,
  valor,
  href,
}: {
  rotulo: string
  valor: string
  href: string
}) {
  return (
    <div>
      <p
        className="font-mono text-[11px] uppercase tracking-[0.14em]"
        style={{ color: "var(--tinta-suave)" }}
      >
        {rotulo}
      </p>
      <p className="mt-1.5 font-serif text-lg">
        <Link href={href}>{valor}</Link>
      </p>
    </div>
  )
}

/** Âncora com sublinhado de régua — o sublinhado é o sinal, nunca só a cor. */
function Link({
  href,
  children,
  discreto,
}: {
  href: string
  children: React.ReactNode
  discreto?: boolean
}) {
  return (
    <a
      href={href}
      className="underline decoration-1 underline-offset-4 transition-colors hover:decoration-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
      style={{
        color: discreto ? "inherit" : "var(--acento)",
        textDecorationColor: "var(--regua)",
      }}
    >
      {children}
    </a>
  )
}
