# LiveCart Frontend - Design Patterns & Architecture

Este documento descreve os padrões de design e arquitetura do frontend da plataforma LiveCart.

---

## 1. Estrutura de Diretórios

```
src/
├── app/                  # Next.js App Router
│   ├── (auth)/           # Rotas de autenticação (login, register)
│   ├── (dashboard)/      # Rotas do dashboard (protegidas)
│   ├── cart/             # Páginas do carrinho (públicas)
│   └── onboarding/       # Fluxo de onboarding
├── components/           # Componentes React
│   ├── ui/               # shadcn/ui (não editar diretamente)
│   ├── shared/           # Componentes reutilizáveis
│   └── dashboard/        # Componentes específicos do dashboard
├── hooks/                # Custom hooks por domínio
│   ├── shared/           # Hooks compartilhados
│   └── [domain]/         # Hooks por domínio (product, order, etc.)
├── lib/                  # Utilitários
├── schemas/              # Schemas Zod para validação
├── services/             # Serviços de API
│   └── api/              # REST API clients
└── types/                # Tipos TypeScript
```

---

## 2. Tipos (types/)

### 2.1 Estrutura de um arquivo de tipos

```typescript
// types/[domain].types.ts

// 1. Tipos de status/enum
export type ProductStatus = "active" | "inactive"
export type ProductSource = "bling" | "tiny" | "shopify" | "manual"

// 2. Interface da entidade principal
export interface Product {
  id: string
  name: string
  keyword: string
  externalId: string | null
  externalSource: ProductSource
  price: number // price in cents
  imageUrl: string | null
  stock: number
  active: boolean
  createdAt: string
  updatedAt: string
}

// 3. Payloads de criação/atualização
export interface CreateProductPayload {
  name: string
  externalId?: string
  externalSource: ProductSource
  keyword?: string
  price: number
  imageUrl?: string
  stock: number
}

export interface UpdateProductPayload {
  name: string
  price: number
  imageUrl?: string
  stock: number
  active: boolean
}

// 4. Filtros para listagem
export interface ProductFilters {
  status?: ProductStatus[]
  externalSource?: ProductSource[]
  priceMin?: number
  priceMax?: number
}

// 5. Parâmetros de listagem
export interface ProductListParams {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: ProductFilters
}

// 6. Response de listagem
export type ProductListResponse = PaginatedResponse<Product>

// 7. Stats/agregações
export interface ProductStats {
  totalProducts: number
  activeCount: number
  lowStockCount: number
  stockValue: number
}
```

### 2.2 Convenções de Nomenclatura

| Tipo | Sufixo | Exemplo |
|------|--------|---------|
| Entidade | - | `Product`, `Order`, `Invitation` |
| Payload de criação | `CreateXPayload` | `CreateProductPayload` |
| Payload de atualização | `UpdateXPayload` | `UpdateProductPayload` |
| Filtros | `XFilters` | `ProductFilters` |
| Parâmetros de listagem | `XListParams` | `ProductListParams` |
| Response de listagem | `XListResponse` | `ProductListResponse` |
| Estatísticas | `XStats` | `ProductStats` |
| Detalhes expandidos | `XDetails` | `InvitationDetails` |

### 2.3 Tipos Base (api.types.ts)

```typescript
// Tipos reutilizáveis para paginação e ordenação
export interface Pagination {
  page: number
  limit: number
}

export interface PaginationResponse {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface Sorting {
  sortBy: string
  sortOrder: "asc" | "desc"
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationResponse
}

export interface ApiError {
  status: number
  message: string
  fields?: Record<string, string>
}
```

---

## 3. Serviços (services/api/)

### 3.1 Estrutura de um serviço

```typescript
// services/api/[domain].service.ts

import { apiClient } from "./client"
import { buildQueryString } from "@/lib/query"
import type {
  Product,
  CreateProductPayload,
  UpdateProductPayload,
  ProductListParams,
  ProductListResponse,
  ProductStats,
} from "@/types"

export const productService = {
  // Listagem com filtros
  list: (storeId: string, params?: ProductListParams, token?: string | null) => {
    const query = buildQueryString({
      search: params?.search,
      pagination: params?.pagination,
      sorting: params?.sorting,
      filters: params?.filters,
    })
    return apiClient.get<ProductListResponse>(`/stores/${storeId}/products${query}`, token)
  },

  // Buscar por ID
  getById: (storeId: string, id: string, token?: string | null) =>
    apiClient.get<Product>(`/stores/${storeId}/products/${id}`, token),

  // Criar
  create: (storeId: string, payload: CreateProductPayload, token?: string | null) =>
    apiClient.post<Product>(`/stores/${storeId}/products`, payload, token),

  // Atualizar
  update: (storeId: string, id: string, payload: UpdateProductPayload, token?: string | null) =>
    apiClient.put<Product>(`/stores/${storeId}/products/${id}`, payload, token),

  // Deletar
  delete: (storeId: string, id: string, token?: string | null) =>
    apiClient.delete<void>(`/stores/${storeId}/products/${id}`, token),

  // Estatísticas
  getStats: (storeId: string, token?: string | null) =>
    apiClient.get<ProductStats>(`/stores/${storeId}/products/stats`, token),
}
```

### 3.2 Convenções

- **Objeto constante**: `export const [domain]Service = { ... }`
- **Métodos padrão**: `list`, `getById`, `create`, `update`, `delete`, `getStats`
- **Parâmetros**: `(storeId, [id], [payload], token)`
- **Tipagem forte**: Sempre tipar input e output
- **Query string**: Usar `buildQueryString` do `lib/query.ts`

---

## 4. Hooks (hooks/)

### 4.1 Query Keys Factory

Cada domínio deve ter uma factory de query keys:

```typescript
// hooks/[domain]/use[Domain]s.ts

export const productKeys = {
  all: ["products"] as const,
  lists: () => [...productKeys.all, "list"] as const,
  list: (storeId: string, params?: ProductListParams) => [...productKeys.lists(), storeId, params] as const,
  details: () => [...productKeys.all, "detail"] as const,
  detail: (storeId: string, id: string) => [...productKeys.details(), storeId, id] as const,
  stats: (storeId: string) => [...productKeys.all, "stats", storeId] as const,
}
```

### 4.2 Hook de Listagem (Query)

```typescript
// hooks/[domain]/use[Domain]s.ts

"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import type { ProductListParams, ProductListResponse } from "@/types"

export function useProducts(params?: ProductListParams) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productKeys.list(storeId ?? "", params),
    queryFn: async (): Promise<ProductListResponse> => {
      const token = await getToken()
      return productService.list(storeId!, params, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId,
  })
}
```

### 4.3 Hook de Detalhe (Query)

```typescript
// hooks/[domain]/use[Domain].ts

"use client"

import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "./useProducts"
import type { Product } from "@/types"

export function useProduct(id: string) {
  const { getToken, isLoaded, isSignedIn } = useAuth()
  const { storeId, isLoading: storeLoading } = useStoreId()

  return useQuery({
    queryKey: productKeys.detail(storeId ?? "", id),
    queryFn: async (): Promise<Product> => {
      const token = await getToken()
      return productService.getById(storeId!, id, token)
    },
    enabled: isLoaded && isSignedIn && !storeLoading && !!storeId && !!id,
  })
}
```

### 4.4 Hook de Criação (Mutation)

```typescript
// hooks/[domain]/useCreate[Domain].ts

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "./useProducts"
import type { CreateProductPayload, Product } from "@/types"

export function useCreateProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (payload: CreateProductPayload): Promise<Product> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.create(storeId, payload, token)
    },
    onSuccess: () => {
      // Invalidar lista para refetch
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      // Invalidar stats se existir
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
}
```

### 4.5 Hook de Atualização (Mutation)

```typescript
// hooks/[domain]/useUpdate[Domain].ts

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "./useProducts"
import type { UpdateProductPayload, Product } from "@/types"

interface UpdateProductParams {
  id: string
  payload: UpdateProductPayload
}

export function useUpdateProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, payload }: UpdateProductParams): Promise<Product> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.update(storeId, id, payload, token)
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.detail(storeId, id) })
      }
    },
  })
}
```

### 4.6 Hook de Deleção (Mutation)

```typescript
// hooks/[domain]/useDelete[Domain].ts

"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"
import { productService } from "@/services/api/product.service"
import { useStoreId } from "@/hooks/useUser"
import { productKeys } from "./useProducts"

export function useDeleteProduct() {
  const { getToken } = useAuth()
  const { storeId } = useStoreId()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      if (!storeId) throw new Error("Store ID is required")
      const token = await getToken()
      return productService.delete(storeId, id, token)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKeys.lists() })
      if (storeId) {
        queryClient.invalidateQueries({ queryKey: productKeys.stats(storeId) })
      }
    },
  })
}
```

### 4.7 Index de Hooks

```typescript
// hooks/[domain]/index.ts

export { useProducts, productKeys } from "./useProducts"
export { useProduct } from "./useProduct"
export { useProductStats } from "./useProductStats"
export { useCreateProduct } from "./useCreateProduct"
export { useUpdateProduct } from "./useUpdateProduct"
export { useDeleteProduct } from "./useDeleteProduct"
```

---

## 5. Schemas (schemas/)

### 5.1 Estrutura de um schema

```typescript
// schemas/[domain].schema.ts

import { z } from "zod"

// Schema de criação
export const createProductSchema = z.object({
  name: z
    .string()
    .min(1, "Nome é obrigatório")
    .max(200, "Nome deve ter no máximo 200 caracteres"),
  price: z
    .number({ message: "Preço deve ser um número" })
    .min(1, "Preço deve ser maior que zero"),
  stock: z
    .number({ message: "Estoque deve ser um número" })
    .min(0, "Estoque não pode ser negativo"),
  imageUrl: z.string().url("URL inválida").optional().or(z.literal("")),
  externalSource: z.enum(["manual", "bling", "tiny", "shopify"], {
    message: "Selecione a origem do produto",
  }),
  externalId: z.string().optional(),
})

// Tipo inferido do schema
export type CreateProductFormData = z.infer<typeof createProductSchema>

// Schema de atualização (estende o de criação)
export const updateProductSchema = createProductSchema.extend({
  active: z.boolean().default(true),
})

export type UpdateProductFormData = z.infer<typeof updateProductSchema>
```

### 5.2 Uso com React Hook Form

```tsx
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { createProductSchema, type CreateProductFormData } from "@/schemas/product.schema"

const form = useForm<CreateProductFormData>({
  resolver: zodResolver(createProductSchema),
  defaultValues: {
    name: "",
    price: 0,
    stock: 0,
    externalSource: "manual",
  },
})
```

---

## 6. Lib (lib/)

### 6.1 Formatação (format.ts)

```typescript
// Centraliza todas as funções de formatação

// Moeda (centavos -> string)
export function formatCurrency(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100)
}

// Data
export function formatDate(dateString: string | null): string
export function formatDateTime(dateString: string | null): string
export function formatTime(dateString: string | null): string
export function formatRelativeTime(dateString: string): string

// Parsing
export function parseCurrency(value: string): number
```

### 6.2 Constantes (constants.ts)

```typescript
// Configurações de status para badges e labels

export type BadgeVariant = "outline" | "destructive" | "secondary" | "default"

export interface StatusConfig {
  label: string
  variant: BadgeVariant
}

export const ORDER_STATUS_CONFIG: Record<OrderStatus, StatusConfig> = {
  pending: { label: "Pendente", variant: "outline" },
  checkout: { label: "Checkout", variant: "secondary" },
  completed: { label: "Completo", variant: "default" },
  expired: { label: "Expirado", variant: "destructive" },
}

// Helper function
export function getStatusConfig<T extends string>(
  config: Record<T, StatusConfig>,
  status: string,
  fallback: T
): StatusConfig {
  return config[status as T] || config[fallback]
}
```

### 6.3 Query (query.ts)

```typescript
// Construção de query strings para API

export function buildQueryString(params: {
  search?: string
  pagination?: Pagination
  sorting?: Sorting
  filters?: Record<string, any>
}): string

export function parsePagination(searchParams: URLSearchParams): Pagination
export function parseSorting(searchParams: URLSearchParams, defaultSortBy?: string): Sorting
```

---

## 7. Componentes

### 7.1 Estrutura de Componentes

```
components/
├── ui/                   # shadcn/ui (gerado, não editar)
├── shared/               # Reutilizáveis em toda a aplicação
│   ├── table-states.tsx  # Loading, error, empty states para tabelas
│   └── ...
├── dashboard/            # Componentes do dashboard
│   ├── stat-card.tsx     # Card de estatísticas
│   └── ...
└── providers/            # Context providers
    └── user-provider.tsx
```

### 7.2 Padrão de Props

```tsx
interface StatCardProps {
  title: string
  value: string | number
  description?: string
  icon: LucideIcon
  loading?: boolean
}

export function StatCard({ title, value, description, icon: Icon, loading }: StatCardProps) {
  // ...
}
```

### 7.3 Estados de Tabela

```tsx
// components/shared/table-states.tsx

// Loading
<TableLoadingRows columns={5} rows={5} />

// Error
<TableErrorState columns={5} message="Erro ao carregar dados." />

// Empty
<TableEmptyState columns={5} message="Nenhum item encontrado." />
```

---

## 8. Providers

### 8.1 UserProvider

```tsx
// components/providers/user-provider.tsx

interface UserContextValue {
  user: User | null
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export const UserContext = createContext<UserContextValue | null>(null)

// Hook para usar
export function useUser() {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error("useUser must be used within a UserProvider")
  }
  return context
}

// Helper para storeId
export function useStoreId() {
  const { user, isLoading } = useUser()
  return {
    storeId: user?.storeId ?? null,
    isLoading,
  }
}
```

---

## 9. Páginas (app/)

### 9.1 Estrutura de Rotas

```
app/
├── layout.tsx              # Root layout
├── (auth)/                 # Route group sem autenticação
│   ├── login/
│   └── register/
├── (dashboard)/            # Route group com layout de dashboard
│   ├── layout.tsx          # Dashboard layout (sidebar, header)
│   ├── products/
│   │   ├── page.tsx        # Lista de produtos
│   │   ├── new/page.tsx    # Criar produto
│   │   └── [id]/page.tsx   # Editar produto
│   └── ...
├── cart/                   # Rotas públicas do carrinho
│   └── [storeSlug]/
└── onboarding/             # Fluxo de onboarding
```

### 9.2 Padrão de Página de Lista

```tsx
"use client"

import { useProducts } from "@/hooks/product"
import { ProductTable } from "./components/product-table"
import { ProductFilters } from "./components/product-filters"

export default function ProductsPage() {
  const [params, setParams] = useState<ProductListParams>({})
  const { data, isLoading, error } = useProducts(params)

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <Button asChild>
          <Link href="/products/new">Novo Produto</Link>
        </Button>
      </div>

      <ProductFilters onChange={setParams} />

      <ProductTable
        products={data?.data ?? []}
        pagination={data?.pagination}
        loading={isLoading}
        error={error}
      />
    </div>
  )
}
```

---

## 10. Convenções Gerais

### 10.1 Nomenclatura de Arquivos

| Tipo | Padrão | Exemplo |
|------|--------|---------|
| Tipo | `[domain].types.ts` | `product.types.ts` |
| Serviço | `[domain].service.ts` | `product.service.ts` |
| Hook de lista | `use[Domain]s.ts` | `useProducts.ts` |
| Hook de detalhe | `use[Domain].ts` | `useProduct.ts` |
| Hook de criação | `useCreate[Domain].ts` | `useCreateProduct.ts` |
| Hook de atualização | `useUpdate[Domain].ts` | `useUpdateProduct.ts` |
| Hook de deleção | `useDelete[Domain].ts` | `useDeleteProduct.ts` |
| Schema | `[domain].schema.ts` | `product.schema.ts` |
| Componente | `[component-name].tsx` | `stat-card.tsx` |
| Página | `page.tsx` | `page.tsx` |

### 10.2 Imports

```typescript
// Ordem de imports:
// 1. React/Next
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"

// 2. Libs externas
import { useQuery } from "@tanstack/react-query"
import { useAuth } from "@clerk/nextjs"

// 3. Componentes UI
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

// 4. Componentes locais
import { ProductTable } from "./components/product-table"

// 5. Hooks
import { useProducts } from "@/hooks/product"
import { useStoreId } from "@/hooks/useUser"

// 6. Serviços e lib
import { productService } from "@/services/api/product.service"
import { formatCurrency } from "@/lib/format"

// 7. Tipos (sempre no final)
import type { Product, ProductListParams } from "@/types"
```

### 10.3 Tratamento de Erros

```tsx
// Em hooks de mutation
const { mutate, isPending, error } = useCreateProduct()

// No componente
{error && (
  <Alert variant="destructive">
    <AlertDescription>
      {error instanceof Error ? error.message : "Erro ao criar produto"}
    </AlertDescription>
  </Alert>
)}
```

### 10.4 Loading States

```tsx
// Query
const { data, isLoading } = useProducts()

// Mutation
const { mutate, isPending } = useCreateProduct()

// No componente
<Button disabled={isPending}>
  {isPending ? "Salvando..." : "Salvar"}
</Button>
```

---

## 11. Padrões de Resposta da API

### 11.1 Listas Paginadas

Para endpoints com paginação (products, orders, customers, lives):

```typescript
// Tipo
export type ProductListResponse = PaginatedResponse<Product>

// Estrutura
{
  data: Product[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// No hook
queryFn: async (): Promise<ProductListResponse> => { ... }
```

### 11.2 Listas Simples

Para endpoints sem paginação (members, invitations - listas pequenas por natureza):

```typescript
// Tipo no service
apiClient.get<{ data: Member[] }>(`/stores/${storeId}/members`, token)

// No hook
queryFn: async (): Promise<{ data: Member[] }> => { ... }

// Uso no componente
const { data } = useMembers()
const members = data?.data ?? []
```

---

## 12. Checklist para Novo Domínio

Ao adicionar um novo domínio (ex: `notification`):

- [ ] Criar `types/notification.types.ts`
- [ ] Adicionar export em `types/index.ts`
- [ ] Criar `services/api/notification.service.ts`
- [ ] Adicionar export em `services/api/index.ts`
- [ ] Criar `hooks/notification/useNotifications.ts` (com query keys)
- [ ] Criar `hooks/notification/useNotification.ts`
- [ ] Criar `hooks/notification/useCreateNotification.ts`
- [ ] Criar `hooks/notification/useUpdateNotification.ts`
- [ ] Criar `hooks/notification/useDeleteNotification.ts`
- [ ] Criar `hooks/notification/index.ts`
- [ ] Criar `schemas/notification.schema.ts` (se tiver forms)
- [ ] Adicionar constantes em `lib/constants.ts` (se tiver status)

---

## 13. Notas de Manutenção

### 13.1 Arquivos para Consolidação Futura

- `hooks/user/` - Preparado para multi-store support, atualmente não utilizado
- `hooks/useUser.ts` - Hook principal para contexto de usuário (usado em toda aplicação)

### 13.2 Convenções de Nomenclatura de Arquivos de Tipos

Todos os arquivos de tipos devem seguir o padrão `[domain].types.ts`:
- `product.types.ts`
- `order.types.ts`
- `integration.types.ts` (não `integration.ts`)
