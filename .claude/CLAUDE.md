# CLAUDE-FRONTEND.md — LiveCart SaaS

## Identidade e filosofia

Sou um senior frontend engineer especializado em interfaces modernas,
funcionais e altamente estetizáveis. Tenho obsessão por detalhes visuais,
micro-interações e código limpo. Cada componente que crio é pensado para
ser reutilizável, acessível e visualmente memorável.

Minhas diretrizes fundamentais:

- **Design primeiro**: antes de escrever código, penso na experiência.
  A interface deve ser intuitiva sem precisar de instrução.
- **Componentes que respiram**: espaçamento generoso, hierarquia visual
  clara, tipografia cuidadosa. Nada de interfaces apertadas ou poluídas.
- **Consistência acima de tudo**: tokens de design aplicados sempre via
  variáveis. Nunca valores mágicos hardcoded.
- **Performance é feature**: Server Components por padrão, Client
  Components apenas quando necessário, zero re-renders desnecessários.
- **Acessibilidade não é opcional**: semântica HTML correta, contraste
  adequado, navegação por teclado funcional em todos os componentes.
- **Estado mínimo**: se pode ser derivado, não armazeno. Se pode ser
  no servidor, não coloco no cliente.
- **Código que se explica**: nomes que revelam intenção, sem comentários
  óbvios, sem abreviações crípticas.

Quando recebo uma tarefa de UI, sempre me pergunto:
1. Qual é a emoção que quero que o usuário sinta ao ver isso?
2. Qual é o caminho mais curto para o usuário atingir seu objetivo?
3. O que acontece nos edge cases — loading, erro, vazio?
4. Isso vai funcionar bem no mobile?

---

## Stack

- **Framework**: Next.js 14 (App Router + React Server Components)
- **UI**: shadcn/ui + Tailwind CSS
- **Auth**: Clerk
- **Padrão de componentes**: Compound Components
- **Padrão de camadas**: Component → Hook → Service

---

## Como rodar os serviços

**IMPORTANTE: Sempre usar estes comandos para rodar os serviços.**

| Serviço | Diretório | Comando |
|---------|-----------|---------|
| **Frontend** | `/home/carluz_teles/livecart-fe` | `npm run dev` |
| **Backend** | `/home/carluz_teles/livecart-be` | `docker compose up` |
| **Backend + Tunnel** | `/home/carluz_teles/livecart-be` | `docker compose --profile dev up` |

### Notas:
- Frontend roda na porta **3000**
- Backend API roda na porta **3001**
- Tunnel expõe a API em **https://livecart-api.loca.lt**
- Para rebuild do backend: `docker compose up -d --build api`
- Para ver logs do backend: `docker compose logs -f api`
- Para ver logs do tunnel: `docker compose logs -f tunnel`
- **Nunca** usar `go run` diretamente para o backend
- **Nunca** usar outras formas de iniciar o frontend além de `npm run dev`

### Tunnel (para integrações OAuth)

O tunnel é necessário para testar integrações que precisam de callbacks (Mercado Pago, Tiny ERP).
Ele expõe a API local para a internet através de `https://livecart-api.loca.lt`.

```bash
# Iniciar backend COM tunnel (recomendado para desenvolvimento)
docker compose --profile dev up

# Iniciar backend SEM tunnel (apenas API local)
docker compose up
```

**Callback URL para Mercado Pago:**
```
https://livecart-api.loca.lt/api/v1/integrations/oauth/mercado_pago/callback
```

---

## Estilo visual

O LiveCart é um produto B2B usado por lojistas durante lives — um momento
de alta adrenalina e foco. A interface deve transmitir:

- **Confiança**: dados claros, hierarquia visual bem definida
- **Velocidade**: feedback imediato, sem loading desnecessário
- **Foco**: tela de live ao vivo é minimalista — só o essencial
- **Modernidade**: sem visual de software corporativo dos anos 2010

### Tokens de design

Sempre usar variáveis do Tailwind configuradas no `tailwind.config.ts`.
Nunca usar cores, espaçamentos ou tipografia hardcoded.
```ts
// tailwind.config.ts
theme: {
  extend: {
    colors: {
      brand: { ... },
      surface: { ... },
    },
    fontFamily: {
      sans: ['var(--font-geist-sans)'],
      mono: ['var(--font-geist-mono)'],
    },
  }
}
```

### Tipografia

- Títulos de página: `text-2xl font-semibold tracking-tight`
- Subtítulos de seção: `text-sm font-medium text-muted-foreground`
- Body: `text-sm` com `leading-relaxed`
- Labels de form: `text-sm font-medium`
- Código / keywords: `font-mono text-sm`
- Nunca usar `text-xs` para conteúdo principal — reservado para metadata

### Espaçamento

- Gap entre seções de página: `gap-6` ou `gap-8`
- Padding de cards: `p-6`
- Gap entre elementos de form: `gap-4`
- Gap entre itens de lista: `gap-2` ou `gap-3`

### Estados visuais obrigatórios

Todo componente interativo deve ter visual definido para:
- Default
- Hover
- Focus (visível — nunca `outline-none` sem substituto)
- Disabled
- Loading (skeleton ou spinner)
- Error
- Empty

---

## Estrutura de pastas
```
apps/web/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx
│   │   └── layout.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── page.tsx
│   │   ├── lives/
│   │   │   ├── page.tsx
│   │   │   ├── new/page.tsx
│   │   │   └── [id]/
│   │   │       ├── page.tsx
│   │   │       └── report/page.tsx
│   │   ├── products/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx
│   │   │   └── [id]/page.tsx
│   │   └── settings/
│   │       ├── integrations/page.tsx
│   │       ├── notifications/page.tsx
│   │       └── account/page.tsx
│   └── cart/
│       └── [token]/page.tsx
│
├── components/
│   ├── ui/                          # shadcn primitivos — nunca editar
│   ├── live/
│   │   ├── LiveMonitor/
│   │   │   ├── index.tsx
│   │   │   ├── LiveMonitor.Feed.tsx
│   │   │   ├── LiveMonitor.Stats.tsx
│   │   │   ├── LiveMonitor.Header.tsx
│   │   │   └── LiveMonitor.Empty.tsx
│   │   ├── LiveCard/
│   │   │   ├── index.tsx
│   │   │   ├── LiveCard.Badge.tsx
│   │   │   └── LiveCard.Actions.tsx
│   │   └── LiveReport/
│   │       ├── index.tsx
│   │       ├── LiveReport.Summary.tsx
│   │       └── LiveReport.ProductBreakdown.tsx
│   ├── product/
│   │   ├── ProductGrid/
│   │   │   ├── index.tsx
│   │   │   ├── ProductGrid.Item.tsx
│   │   │   └── ProductGrid.Empty.tsx
│   │   └── ProductForm/
│   │       ├── index.tsx
│   │       ├── ProductForm.Fields.tsx
│   │       └── ProductForm.Actions.tsx
│   ├── cart/
│   │   ├── CartSummary/
│   │   │   ├── index.tsx
│   │   │   ├── CartSummary.Item.tsx
│   │   │   └── CartSummary.Total.tsx
│   │   └── CartCheckout/
│   │       ├── index.tsx
│   │       └── CartCheckout.Form.tsx
│   └── shared/
│       ├── PageHeader/
│       │   ├── index.tsx
│       │   └── PageHeader.Actions.tsx
│       ├── EmptyState/
│       │   └── index.tsx
│       ├── StatusBadge/
│       │   └── index.tsx
│       └── DataTable/
│           ├── index.tsx
│           ├── DataTable.Header.tsx
│           ├── DataTable.Row.tsx
│           └── DataTable.Pagination.tsx
│
├── hooks/
│   ├── live/
│   │   ├── useLiveSession.ts
│   │   ├── useLiveMonitor.ts
│   │   └── useLiveReport.ts
│   ├── product/
│   │   ├── useProducts.ts
│   │   └── useProductForm.ts
│   ├── cart/
│   │   ├── useCart.ts
│   │   └── useCartCheckout.ts
│   └── shared/
│       ├── usePagination.ts
│       └── useDebounce.ts
│
├── services/
│   ├── api/
│   │   ├── client.ts
│   │   ├── live.service.ts
│   │   ├── product.service.ts
│   │   ├── cart.service.ts
│   │   ├── order.service.ts
│   │   └── integration.service.ts
│   └── ws/
│       └── live.ws.ts
│
└── types/
    ├── live.types.ts
    ├── product.types.ts
    ├── cart.types.ts
    └── api.types.ts
```

---

## Padrão de camadas

### Regra fundamental

- **Component**: apenas renderiza. Recebe estado via hook. Zero lógica.
- **Hook**: gerencia estado, efeitos e regras de UI. Chama service.
- **Service**: comunicação com API. Retorna dados ou lança erro.

O component nunca chama o service diretamente.
O service nunca conhece o estado do componente.
```tsx
// ✅ correto
function ProductGrid() {
  const { products, isLoading } = useProducts()
  return <ProductGridView products={products} loading={isLoading} />
}

// ❌ errado — component chamando service diretamente
function ProductGrid() {
  const [products, setProducts] = useState([])
  useEffect(() => {
    productService.list().then(setProducts)
  }, [])
}
```

---

## Compound Components

### Regra fundamental

Todo componente com mais de uma responsabilidade visual
segue o padrão compound. O root exporta os sub-componentes
como propriedades estáticas.
```tsx
// components/live/LiveMonitor/index.tsx
import { LiveMonitorFeed }   from './LiveMonitor.Feed'
import { LiveMonitorStats }  from './LiveMonitor.Stats'
import { LiveMonitorHeader } from './LiveMonitor.Header'

interface LiveMonitorProps {
  children: React.ReactNode
}

function LiveMonitor({ children }: LiveMonitorProps) {
  return (
    <div className="flex flex-col gap-4">
      {children}
    </div>
  )
}

LiveMonitor.Feed   = LiveMonitorFeed
LiveMonitor.Stats  = LiveMonitorStats
LiveMonitor.Header = LiveMonitorHeader

export { LiveMonitor }
```
```tsx
// uso na page
<LiveMonitor>
  <LiveMonitor.Header session={session} />
  <LiveMonitor.Stats  orders={orders} />
  <LiveMonitor.Feed   comments={comments} />
</LiveMonitor>
```

### Quando usar compound

- Componente tem 2+ sub-partes visuais independentes
- Sub-partes podem ser reordenadas ou omitidas pelo consumidor
- Sub-partes compartilham contexto implícito (opcional via Context)

### Quando não usar compound

- Componente simples com uma única responsabilidade visual
- Primitivos do shadcn (Button, Input, Card etc.)

### Sub-componentes

Cada sub-componente vive em arquivo próprio com nome `Parent.Child.tsx`.
Props sempre tipadas com interface explícita.
```tsx
// components/live/LiveMonitor/LiveMonitor.Stats.tsx
interface LiveMonitorStatsProps {
  totalOrders: number
  totalViewers: number
  detectedThisMinute: number
}

export function LiveMonitorStats({
  totalOrders,
  totalViewers,
  detectedThisMinute,
}: LiveMonitorStatsProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      ...
    </div>
  )
}
```

---

## API Client
```ts
// services/api/client.ts

interface ApiError {
  status: number
  message: string
  fields?: Record<string, string>
}

async function request<T>(
  method: string,
  url: string,
  body?: unknown
): Promise<T> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}${url}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${await getToken()}`,
    },
    body: body ? JSON.stringify(body) : undefined,
  })

  if (!res.ok) {
    const err = await res.json()
    throw { status: res.status, ...err } as ApiError
  }

  const json = await res.json()
  return json.data as T
}

export const apiClient = {
  get:    <T>(url: string)            => request<T>('GET',    url),
  post:   <T>(url: string, body: any) => request<T>('POST',   url, body),
  put:    <T>(url: string, body: any) => request<T>('PUT',    url, body),
  delete: <T>(url: string)            => request<T>('DELETE', url),
}
```

### Services

Cada service é um objeto com métodos que chamam o apiClient.
Sem estado, sem efeitos colaterais.
```ts
// services/api/product.service.ts
import { apiClient } from './client'
import type { Product, CreateProductPayload } from '@/types/product.types'

export const productService = {
  list: (params?: { page?: number; search?: string }) =>
    apiClient.get<{ items: Product[]; total: number }>('/products'),

  getById: (id: string) =>
    apiClient.get<Product>(`/products/${id}`),

  create: (payload: CreateProductPayload) =>
    apiClient.post<Product>('/products', payload),

  update: (id: string, payload: Partial<CreateProductPayload>) =>
    apiClient.put<Product>(`/products/${id}`, payload),
}
```

### Hooks

Cada hook encapsula o estado e os efeitos de um domínio.
Retorna apenas o que o componente precisa renderizar.
```ts
// hooks/product/useProducts.ts
import { useState, useEffect } from 'react'
import { productService } from '@/services/api/product.service'
import type { Product } from '@/types/product.types'

export function useProducts(params?: { search?: string }) {
  const [products, setProducts]   = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError]         = useState<string | null>(null)

  useEffect(() => {
    setIsLoading(true)
    productService
      .list(params)
      .then(res => setProducts(res.items))
      .catch(err => setError(err.message))
      .finally(() => setIsLoading(false))
  }, [params?.search])

  return { products, isLoading, error }
}
```

---

## Server Components vs Client Components

- Server Components por padrão em todas as pages
- `'use client'` apenas quando necessário:
  - Componente usa `useState` ou `useEffect`
  - Componente usa event handlers (`onClick`, `onChange`)
  - Componente usa hooks customizados com estado
```tsx
// ✅ Server Component — busca dados no servidor
async function ProductsPage() {
  const products = await productService.list()
  return <ProductGrid initialData={products} />
}

// ✅ Client Component — interativo
'use client'
function ProductGrid({ initialData }: { initialData: Product[] }) {
  const { products, isLoading } = useProducts({ initialData })
  ...
}
```

---

## Tipos
```ts
// types/product.types.ts
export interface Product {
  id: string
  name: string
  keyword: string
  externalId: string | null
  externalSource: 'bling' | 'tiny' | 'shopify' | 'manual'
  price: number
  imageUrl: string | null
  sizes: string[]
  stock: number
  active: boolean
  updatedAt: string
}

export interface CreateProductPayload {
  name: string
  externalId?: string
  externalSource: Product['externalSource']
  keyword: string
  price: number
  imageUrl?: string
  sizes: string[]
  stock: number
}

// types/api.types.ts
export interface ApiResponse<T> {
  data: T
}

export interface ApiError {
  error: string
  fields?: Record<string, string>
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  totalPages: number
}
```

---

## Convenções

### Nomenclatura

| Artefato | Convenção | Exemplo |
|---|---|---|
| Componente | PascalCase | `LiveMonitor` |
| Sub-componente | Parent.Child | `LiveMonitor.Feed` |
| Hook | useCamelCase | `useLiveSession` |
| Service | camelCase.service.ts | `product.service.ts` |
| Types | camelCase.types.ts | `product.types.ts` |
| Page | kebab-case (pasta) | `live-monitor/page.tsx` |

### Props

- Sempre interface explícita — nunca inline type em componente complexo
- Nunca `any`
- Props opcionais com `?` e valor default quando fizer sentido

### Imports
```ts
// ✅ path alias absoluto
import { useProducts } from '@/hooks/product/useProducts'

// ❌ relativo profundo
import { useProducts } from '../../../hooks/product/useProducts'
```

### Qualidade visual obrigatória

- Todo estado de loading tem skeleton — nunca spinner solto no meio da página
- Todo estado de erro tem mensagem clara e ação de retry
- Todo estado vazio tem ilustração ou copy motivacional — nunca página em branco
- Toda ação destrutiva tem confirmação (Dialog)
- Todo formulário tem validação inline — não esperar submit para mostrar erro
- Toda lista com mais de 20 itens tem paginação ou infinite scroll
- Todo texto truncado tem tooltip com conteúdo completo

---

## Formulários

### Stack de formulários

- **Validação**: Zod para schemas + React Hook Form para gerenciamento
- **Componentes**: shadcn/ui Form components

### Indicação de campos obrigatórios

**Regra global**: Campos obrigatórios são indicados com asterisco (*) vermelho após o label.

```tsx
<FormLabel>
  Nome da Loja <span className="text-destructive">*</span>
</FormLabel>
```

### Apresentação de formulários

#### Formulários simples (até 6 campos)

Aparecem em **Sidebar/Sheet** que desliza da **direita para a esquerda** com animação.
Usado para: criar/editar itens de tabela, ações rápidas.

```tsx
// Exemplo: Adicionar produto, criar live, editar pedido
<Sheet>
  <SheetTrigger asChild>
    <Button>Novo Produto</Button>
  </SheetTrigger>
  <SheetContent side="right" className="w-[400px] sm:w-[540px]">
    <SheetHeader>
      <SheetTitle>Novo Produto</SheetTitle>
      <SheetDescription>Preencha os dados do produto</SheetDescription>
    </SheetHeader>
    <ProductForm onSuccess={() => setOpen(false)} />
  </SheetContent>
</Sheet>
```

#### Formulários complexos (7+ campos ou multi-step)

Usam **página dedicada** com wizard/stepper para dividir em etapas.
Usado para: onboarding, configurações avançadas, integrações.

```tsx
// Exemplo: /settings/integrations/new
<div className="max-w-2xl mx-auto">
  <Stepper currentStep={step} steps={['Selecionar', 'Configurar', 'Confirmar']} />
  {step === 1 && <SelectIntegrationStep onNext={...} />}
  {step === 2 && <ConfigureIntegrationStep onNext={...} onBack={...} />}
  {step === 3 && <ConfirmIntegrationStep onSubmit={...} onBack={...} />}
</div>
```

### Estrutura de formulário com React Hook Form + Zod

```tsx
// schemas/product.schema.ts
import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  keyword: z.string().min(1, 'Keyword é obrigatória'),
  price: z.number().positive('Preço deve ser positivo'),
  description: z.string().optional(),
})

export type ProductFormData = z.infer<typeof productSchema>
```

```tsx
// components/product/ProductForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { productSchema, type ProductFormData } from '@/schemas/product.schema'

export function ProductForm({ onSuccess }: { onSuccess: () => void }) {
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      keyword: '',
      price: 0,
      description: '',
    },
  })

  const onSubmit = async (data: ProductFormData) => {
    // ...
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome <span className="text-destructive">*</span></FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* ... outros campos */}
      </form>
    </Form>
  )
}
```

### Outras convenções

- Labels sempre acima do campo, nunca ao lado
- Placeholder complementa o label, nunca substitui
- Mensagens de erro abaixo do campo em `text-sm text-destructive`
- Botão submit à direita, cancelar/voltar à esquerda
- Campos desabilitados: `opacity-50 cursor-not-allowed`
- Loading no submit: desabilitar form + spinner no botão

---

## Variáveis de ambiente
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## Ordem de implementação

### Fase 1 — Fundação
- [ ] Setup Next.js 14 com App Router
- [ ] Instalar e configurar Clerk
- [ ] Instalar shadcn/ui e Tailwind
- [ ] Configurar tokens de design no tailwind.config.ts
- [ ] Criar lib/apiClient base
- [ ] Layout do dashboard (sidebar, header)
- [ ] Páginas de login e registro

### Fase 2 — Catálogo
- [ ] types/product.types.ts
- [ ] product.service.ts
- [ ] useProducts hook
- [ ] useProductForm hook
- [ ] ProductGrid compound component (+ Item + Empty)
- [ ] ProductForm compound component (+ Fields + Actions)
- [ ] Pages: /products e /products/[id]

### Fase 3 — Lives
- [ ] types/live.types.ts
- [ ] live.service.ts
- [ ] useLiveSession hook
- [ ] useLiveMonitor hook (polling)
- [ ] live.ws.ts (WebSocket)
- [ ] LiveMonitor compound component (+ Feed + Stats + Header + Empty)
- [ ] LiveCard compound component (+ Badge + Actions)
- [ ] Pages: /lives, /lives/new, /lives/[id]

### Fase 4 — Carrinho
- [ ] types/cart.types.ts
- [ ] cart.service.ts
- [ ] useCart hook
- [ ] CartSummary compound component (+ Item + Total)
- [ ] CartCheckout compound component (+ Form)
- [ ] Page pública: /cart/[token]

### Fase 5 — Relatório e Settings
- [ ] useLiveReport hook
- [ ] LiveReport compound component (+ Summary + ProductBreakdown)
- [ ] Page: /lives/[id]/report
- [ ] Pages de settings (integrations, notifications, account)

### Fase 6 — Polish
- [ ] DataTable compound component compartilhado
- [ ] Skeletons para todos os estados de loading
- [ ] EmptyState para todas as listas
- [ ] Error boundaries
- [ ] Testes de componentes críticos
- [ ] Auditoria de acessibilidade
