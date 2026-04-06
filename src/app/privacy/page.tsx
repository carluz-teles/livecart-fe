import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Política de Privacidade - Livecart",
  description: "Política de Privacidade da plataforma Livecart",
}

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-background">
      <article className="mx-auto max-w-3xl px-6 py-12">
        <header className="mb-10 border-b pb-6">
          <h1 className="text-3xl font-bold tracking-tight">
            Política de Privacidade — Livecart
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            <strong>Última atualização:</strong> Abril de 2026
          </p>
        </header>

        <div className="prose prose-neutral dark:prose-invert max-w-none space-y-8">
          <p>
            A <strong>DAHLEMTECH SOLUTIONS LTDA</strong>, CNPJ 54.350.351/0001-51,
            opera a plataforma app.livecart.com.br.
          </p>

          <section>
            <h2 className="text-xl font-semibold">1. Dados Coletados</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Nome, email e telefone</li>
              <li>Dados de login</li>
              <li>IP, cookies e navegação</li>
              <li>Dados de integrações (Instagram, ERPs, pagamentos)</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">2. Uso dos Dados</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Operar a plataforma</li>
              <li>Identificar intenção de compra</li>
              <li>Processar pagamentos</li>
              <li>Melhorar experiência</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">3. Dados da Meta (Instagram)</h2>
            <p className="mt-3 text-muted-foreground">
              Utilizamos dados do Instagram exclusivamente para funcionalidades do serviço,
              em conformidade com as políticas da Meta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">4. Base Legal</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Execução de contrato</li>
              <li>Consentimento</li>
              <li>Legítimo interesse</li>
              <li>Obrigação legal</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">5. Compartilhamento</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>AWS, Railway</li>
              <li>Mercado Pago, Pagar.me</li>
              <li>Instagram (Meta)</li>
              <li>Tiny, Bling</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">6. Cookies</h2>
            <p className="mt-3 text-muted-foreground">
              Utilizamos cookies para autenticação e análise.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">7. Retenção</h2>
            <p className="mt-3 text-muted-foreground">
              Os dados são armazenados apenas pelo tempo necessário.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">8. Segurança</h2>
            <p className="mt-3 text-muted-foreground">
              Utilizamos criptografia e boas práticas de segurança.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold">9. Direitos do Usuário</h2>
            <ul className="mt-3 list-disc space-y-1 pl-6 text-muted-foreground">
              <li>Acesso</li>
              <li>Correção</li>
              <li>Exclusão</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold">10. Contato</h2>
            <p className="mt-3 text-muted-foreground">
              Email:{" "}
              <a
                href="mailto:eng@livecart.com.br"
                className="text-primary underline-offset-4 hover:underline"
              >
                eng@livecart.com.br
              </a>
            </p>
          </section>
        </div>
      </article>
    </main>
  )
}
