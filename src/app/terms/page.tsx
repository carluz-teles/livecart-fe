import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Termos de Uso - Livecart",
  description: "Termos de Uso da plataforma Livecart",
}

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Termos de Uso — Livecart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong>Última atualização:</strong> Abril de 2026
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p>
            A Livecart é operada pela <strong>DAHLEMTECH SOLUTIONS LTDA</strong>,
            CNPJ 54.350.351/0001-51.
          </p>

          <section>
            <h2 className="text-xl font-semibold">1. Descrição do Serviço</h2>
            <p className="mt-3 text-muted-foreground">
              Plataforma SaaS para monitorar comentários em lives, identificar intenção de compra
              e gerar pedidos automaticamente.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Conta do Usuário</h2>
            <p className="mt-3 text-muted-foreground">
              O usuário é responsável por sua conta e atividades.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Integrações e Meta</h2>
            <p className="mt-3 text-muted-foreground">
              O usuário deve cumprir as políticas da Meta. A Livecart não se responsabiliza
              por bloqueios ou banimentos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Pagamentos</h2>
            <p className="mt-3 text-muted-foreground">
              Pagamentos são processados por terceiros. O usuário é responsável por fraudes,
              chargebacks e disputas.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Limitação de Responsabilidade</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Sem garantia de resultados</li>
              <li>Sem garantia de disponibilidade</li>
              <li>Sem responsabilidade por terceiros</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Uso Proibido</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Uso ilegal</li>
              <li>Spam</li>
              <li>Exploração da plataforma</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Dependência de Terceiros</h2>
            <p className="mt-3 text-muted-foreground">
              O serviço depende do Instagram e outros serviços externos.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Propriedade Intelectual</h2>
            <p className="mt-3 text-muted-foreground">
              Todos os direitos pertencem à Livecart.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Legislação</h2>
            <p className="mt-3 text-muted-foreground">
              Leis brasileiras.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Foro</h2>
            <p className="mt-3 text-muted-foreground">
              Foro da sede da empresa.
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
