# Testes E2E - LiveCart Frontend

Este documento descreve como configurar e executar testes end-to-end (E2E) usando Playwright com autenticação Clerk.

## Stack de Testes

- **Playwright** - Framework de testes E2E
- **@clerk/testing** - Utilitários para testar com Clerk
- **Clerk Test Mode** - Emails/phones de teste sem verificação real

---

## Configuração

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar variáveis de ambiente

Adicione ao `.env.local`:

```env
# Credenciais de usuário de teste (email/senha real no Clerk)
E2E_CLERK_USER_USERNAME=seu_email@exemplo.com
E2E_CLERK_USER_PASSWORD=sua_senha

# URL base para testes (opcional, default: http://localhost:3000)
E2E_BASE_URL=http://localhost:3000
```

---

## Emails e Phones de Teste do Clerk

O Clerk fornece uma forma de testar fluxos de verificação **sem enviar emails/SMS reais**.

### Como usar

| Tipo | Formato | Código de Verificação |
|------|---------|----------------------|
| Email | `qualquer+clerk_test@dominio.com` | `424242` |
| Phone | `+1 (555) 555-1234` | `424242` |

### Exemplos de emails de teste

```
test+clerk_test@livecart.com
usuario+clerk_test@gmail.com
e2e+clerk_test@exemplo.com
```

### Importante

- O subaddress `+clerk_test` é **obrigatório**
- Funciona apenas em instâncias de **desenvolvimento** (test mode habilitado)
- Nenhum email é realmente enviado
- O código `424242` sempre funciona para verificação

---

## Estrutura de Arquivos

```
livecart-fe/
├── playwright.config.ts          # Configuração do Playwright
├── e2e/
│   ├── .clerk/                   # Sessão salva (gitignored)
│   │   └── user.json
│   ├── global.setup.ts           # Setup do Clerk testing token
│   ├── auth.setup.ts             # Login automático
│   ├── dashboard.spec.ts         # Testes autenticados
│   └── login.unauthenticated.spec.ts  # Testes sem auth
```

---

## Executando os Testes

### Scripts disponíveis

```bash
# Rodar todos os testes (headless)
npm run test:e2e

# Rodar com UI interativa do Playwright
npm run test:e2e:ui

# Rodar com navegador visível
npm run test:e2e:headed

# Ver relatório HTML dos testes
npm run test:e2e:report
```

### Rodar teste específico

```bash
# Por arquivo
npx playwright test e2e/dashboard.spec.ts

# Por nome do teste
npx playwright test -g "should display dashboard"
```

---

## Como Funciona

### 1. Global Setup (`global.setup.ts`)

Configura o testing token do Clerk que permite bypassar detecção de bots:

```typescript
import { clerkSetup } from '@clerk/testing/playwright'
import { test as setup } from '@playwright/test'

setup('global setup', async ({}) => {
  await clerkSetup()
})
```

### 2. Auth Setup (`auth.setup.ts`)

Faz login uma vez e salva a sessão para reutilizar nos testes:

```typescript
import { clerk } from '@clerk/testing/playwright'

setup('authenticate', async ({ page }) => {
  await clerk.signIn({
    page,
    signInParams: {
      strategy: 'password',
      identifier: process.env.E2E_CLERK_USER_USERNAME!,
      password: process.env.E2E_CLERK_USER_PASSWORD!,
    },
  })

  // Salva sessão
  await page.context().storageState({ path: authFile })
})
```

### 3. Testes Autenticados

Testes que usam a sessão salva (não precisam fazer login):

```typescript
// e2e/dashboard.spec.ts
import { test, expect } from '@playwright/test'

test('should display dashboard', async ({ page }) => {
  await page.goto('/dashboard')
  await expect(page).toHaveURL(/.*dashboard.*/)
})
```

### 4. Testes Não Autenticados

Para testar fluxos de login/registro, use `setupClerkTestingToken`:

```typescript
// e2e/login.unauthenticated.spec.ts
import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

test('should show sign-in page', async ({ page }) => {
  await setupClerkTestingToken({ page })  // Bypass bot detection
  await page.goto('/sign-in')
  await expect(page).toHaveURL(/.*sign-in.*/)
})
```

---

## Testando Registro com Email de Teste

Exemplo de teste que registra um novo usuário usando email de teste:

```typescript
import { setupClerkTestingToken } from '@clerk/testing/playwright'
import { test, expect } from '@playwright/test'

test('register new user with test email', async ({ page }) => {
  await setupClerkTestingToken({ page })

  await page.goto('/register')

  // Preencher formulário
  await page.getByRole('textbox', { name: 'Nome' }).fill('Test')
  await page.getByRole('textbox', { name: 'Sobrenome' }).fill('User')
  await page.getByRole('textbox', { name: 'email' }).fill('test+clerk_test@livecart.com')
  await page.getByRole('textbox', { name: 'Senha' }).fill('SenhaSegura123!')

  await page.getByRole('button', { name: 'Continuar' }).click()

  // Verificar email com código de teste
  await page.waitForURL('**/verify-email**')
  await page.getByRole('textbox', { name: 'verification code' }).fill('424242')
  await page.getByRole('button', { name: 'Continuar' }).click()

  // Deve redirecionar para dashboard/onboarding
  await expect(page).toHaveURL(/.*dashboard|onboarding.*/)
})
```

---

## Troubleshooting

### Erro: "Bot traffic detected"

O Clerk está detectando automação. Certifique-se de usar `setupClerkTestingToken({ page })` antes de interagir com a página.

### Erro: "Password has been compromised"

O Clerk verifica senhas em listas de senhas vazadas. Use uma senha mais única nos testes.

### Erro ao buscar `/users/me`

O usuário existe no Clerk mas não no backend. Isso pode indicar:
1. Webhook do Clerk não está configurado no backend
2. O usuário precisa completar o onboarding primeiro

### Testes lentos

O Cloudflare Turnstile pode adicionar delay. Em ambiente de teste, considere desabilitar o Turnstile no Clerk Dashboard.

---

## Boas Práticas

1. **Use emails de teste** (`+clerk_test`) para evitar envio de emails reais
2. **Não commite credenciais** - use `.env.local` (gitignored)
3. **Reutilize sessão** - o setup de auth roda uma vez e salva em `user.json`
4. **Isole testes** - cada teste deve ser independente
5. **Use seletores acessíveis** - `getByRole`, `getByLabel`, `getByText`

---

## Referências

- [Clerk Testing Docs](https://clerk.com/docs/testing/overview)
- [Clerk Test Emails/Phones](https://clerk.com/docs/testing/test-emails-and-phones)
- [Playwright Docs](https://playwright.dev/docs/intro)
