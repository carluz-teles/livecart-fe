---
name: list-url-state
description: Padrão OBRIGATÓRIO para toda tela de listagem do LiveCart (paginação, busca, abas, filtros) - o estado navegável vive na URL e o "Voltar" do detalhe preserva o lugar. Usar sempre que criar/alterar uma listagem, adicionar paginação/busca/aba/filtro, criar tela de detalhe com botão Voltar, ou revisar PR que toque nessas telas.
---

# Estado de listagem na URL

## A regra

**Todo estado que muda o que a listagem mostra vive na URL** — página, busca,
aba, filtro relevante. `useState` puro é proibido para esses valores: ele morre
na primeira navegação. Foi assim que nasceu a reclamação do cliente
(20/08/2026): página 3 de pedidos → abrir pedido → Voltar → página 1.

Com o estado na URL, três coisas funcionam de graça: o voltar do navegador, o
F5 e o compartilhamento de link.

## As duas metades (hooks prontos em `@/hooks/shared/useListUrlState`)

### 1. Na LISTA — `useListUrlMirror`

```tsx
const searchParams = useSearchParams() // estado INICIAL vem daqui, na montagem

const [searchInput, setSearchInput] = useState(searchParams.get("q") ?? "")
const { pagination, setPage, ... } = useListParams<T>({
  defaultPage: parseInt(searchParams.get("page") ?? "1", 10) || 1,
  defaultSearch: searchParams.get("q") ?? "",
})

useListUrlMirror("/orders", {
  page: pagination.page > 1 ? String(pagination.page) : null, // null = fora da query
  tab: activeTab !== DEFAULT_TAB ? activeTab : null,
  q: searchInput || null,
}, storeId ?? undefined)
```

Regras do mirror:
- **Valores padrão ficam FORA da query** (`null` remove a chave): `/orders`
  limpo continua limpo.
- O hook usa `window.history.replaceState` NATIVO (Next ≥14.1 integra com o
  router): sem navegação, sem entrada extra no histórico, sem round-trip RSC.
  Nunca troque por `router.push`/`router.replace` para isso.
- Estado inicial SEMPRE via `useSearchParams()` — nunca `window.location` no
  render (SSR não tem window; hidrataria errado).
- Valide valores vindos da URL (ex.: aba contra a lista de abas conhecidas).

### 2. No DETALHE — `useListReturnURL`

```tsx
const backHref = useListReturnURL("/orders", storeId ?? undefined)
// ...
<Link href={backHref} aria-label="Voltar">
```

- O mirror grava a URL exata da lista em sessionStorage; o Voltar aponta para
  ela. Acesso direto (deep link) cai no basePath puro.
- **`router.back()` é proibido no Voltar**: depois de navegar entre itens
  (prev/next do detalhe), "voltar" recuaria para o item anterior, não para a
  lista. `href` fixo (`/orders`) também: é o bug original.
- Chame o hook ANTES de qualquer early-return do componente (regra dos hooks).

## Implementação canônica (copiar daqui)

- Lista completa (página + aba + busca, com Provider):
  `src/components/order/OrderList/OrderList.Provider.tsx`
- Detalhe com Voltar: `src/components/order/OrderDetail/OrderDetail.Header.tsx`
- Lista com paginação sem rota de detalhe:
  `src/components/customer/CustomerList/CustomerList.Provider.tsx`
- Lista só com busca/aba: `src/app/(dashboard)/products/page.tsx`

## Checklist de revisão

1. Página/busca/aba/filtro em `useState` sem espelho na URL? → reprovar.
2. Query com valor padrão explícito (`?page=1`, `?tab=all`)? → limpar com null.
3. Botão Voltar com `href` fixo ou `router.back()`? → `useListReturnURL`.
4. Estado inicial lido de `window.location` no render? → `useSearchParams()`.
5. Tela nova com paginação? → conferir `defaultPage`/`defaultSearch` no
   `useListParams` (opções já existem).
