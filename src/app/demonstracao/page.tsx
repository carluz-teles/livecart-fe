import Link from "next/link"
import { PublicPage } from "@/components/marketing/PublicPage"
import { PurchaseDemo } from "@/components/marketing/purchase-demo"
import { marketingMetadata } from "@/lib/marketing/seo"

export const metadata = marketingMetadata("/demonstracao")
export default function Page() {
  return <PublicPage>
    <PublicPage.Header eyebrow="Do comentário ao fechamento" title="Veja como um código vira pedido" description="Percorra as etapas da venda por código e entenda onde entram o carrinho, a reserva e o ERP." />
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="mb-8 text-sm text-muted-foreground">Exemplo explicativo com dados fictícios. A demonstração não envia comentários, cria pedidos ou realiza pagamentos.</p>
      <PurchaseDemo />
      <section aria-labelledby="video-title" className="mt-12 border-t pt-8">
        <h2 id="video-title" className="text-2xl font-semibold">Assista ao exemplo completo</h2>
        <p id="video-description" className="mt-3 text-muted-foreground">Gravação silenciosa da demonstração explicativa acima. O texto do fluxo está disponível logo abaixo.</p>
        <video controls muted playsInline preload="none" poster="/media/demonstracao-codigos.png" aria-describedby="video-description" className="mt-6 w-full rounded-xl border" width={1200} height={800}>
          <source src="/media/demonstracao-codigos.mp4" type="video/mp4" />
          <source src="/media/demonstracao-codigos.webm" type="video/webm" />
          Seu navegador não reproduz este formato. Acompanhe a descrição textual abaixo.
        </video>
      </section>
      <section className="mt-12 border-t pt-8" aria-label="Descrição do fluxo">
        <h2 className="text-2xl font-semibold">O fluxo, passo a passo</h2>
        <p className="mt-4 leading-relaxed text-muted-foreground">Você anuncia o código 1001. A cliente comenta 2x 1001. Havendo disponibilidade, duas unidades entram no carrinho. A reserva segue o modo da loja: local ou nativo do ERP. Depois, a equipe e a cliente concluem entrega e pagamento dentro do prazo combinado.</p>
        <p className="mt-4 leading-relaxed text-muted-foreground">O código identifica o produto; a frase “quero o preto” não substitui o código de uma variação. A ordem visual dos comentários no Instagram não comprova prioridade de processamento. A entrega do Direct depende das condições do canal.</p>
        <div className="mt-6 flex flex-wrap gap-5"><Link href="/integracoes/tiny" className="underline underline-offset-4">Veja o fluxo com Tiny</Link><Link href="/integracoes/bling" className="underline underline-offset-4">Veja o fluxo com Bling</Link><Link href="/recursos/fechamento-pos-live" className="underline underline-offset-4">Entenda o fechamento depois da live</Link></div>
      </section>
    </div>
    <PublicPage.Cta />
  </PublicPage>
}
