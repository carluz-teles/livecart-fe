import Link from "next/link"
import { ArrowLeft, Info, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Callout, Step } from "@/components/docs"

export default function BlingDocPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-8 py-4">
      <Link
        href="/docs"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar à documentação
      </Link>
      <header className="space-y-3 border-b pb-6">
        <h1 className="text-3xl font-semibold tracking-tight">
          Conectar o Bling
        </h1>
        <p className="text-muted-foreground">
          Autorize o aplicativo do LiveCart para importar produtos e acompanhar
          as vendas com seu ERP.
        </p>
      </header>
      <Callout
        icon={<Info className="h-4 w-4" />}
        title="Antes de conectar"
        tone="neutral"
      >
        Acesse a conta Bling da loja que você deseja integrar, com permissão
        para autorizar aplicativos. Cada loja LiveCart usa um ERP por vez. Se já
        houver outro ERP conectado, confira seus pedidos em andamento antes de
        trocar.
      </Callout>
      <Step number={1} title="Abra as integrações" location="livecart">
        <p>
          Em Configurações → Integrações, encontre o cartão Bling e clique em
          conectar. O LiveCart utiliza um aplicativo próprio; você não precisa
          criar outro aplicativo nem informar Client ID ou Client Secret.
        </p>
      </Step>
      <Step number={2} title="Autorize na conta correta">
        <p>
          Na página do Bling, confirme a conta da sua loja, confira as
          permissões solicitadas e autorize a conexão. Ao terminar, você voltará
          ao LiveCart.
        </p>
      </Step>
      <Step
        number={3}
        title="Confira a conexão e importe produtos"
        location="livecart"
      >
        <p>
          Confirme que a integração aparece como conectada. Na tela Produtos,
          use o cadastro com busca no ERP para selecionar os produtos que serão
          vendidos pelo LiveCart. Confira código de venda, preço e
          disponibilidade antes da live.
        </p>
      </Step>
      <Callout
        icon={<ShieldCheck className="h-4 w-4" />}
        title="Se a autorização vencer"
        tone="neutral"
      >
        Volte às integrações e refaça a autorização do Bling na mesma conta. Se
        a conexão continuar falhando, confira as permissões da conta e entre em
        contato com nosso suporte pela página inicial. Evite cadastrar novamente
        produtos já importados.
      </Callout>
      <Button asChild>
        <Link href="/settings/integrations">
          Abrir configurações de integrações
        </Link>
      </Button>
    </article>
  )
}
