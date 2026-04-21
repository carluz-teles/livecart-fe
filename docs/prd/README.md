# PRDs - LiveCart Frontend

Os PRDs completos estao no repositorio do backend em:
```
/home/carluz_teles/livecart-be/docs/prd/
```

## Features CORE e Impacto no Frontend

### 1. Resposta Automatica em Tempo Real
**PRD:** `../../../livecart-be/docs/prd/001-resposta-automatica.md`

**Impacto Frontend:**
- [ ] Nova secao em `/settings/cart` para configurar notificacoes
- [ ] Toggle para habilitar DM automatico
- [ ] Editor de template de mensagem
- [ ] Preview da mensagem

---

### 2. Checkout Durante a Live
**PRD:** `../../../livecart-be/docs/prd/002-checkout-durante-live.md`

**Impacto Frontend:**
- [ ] Aceitar status `active` na pagina de checkout `/cart/[token]`
- [ ] Adicionar indicador visual de "live em andamento"
- [ ] Implementar polling para atualizacoes de carrinho
- [ ] Mostrar toast quando carrinho for atualizado
- [ ] Desabilitar edicao quando carrinho estiver em lock

**Componentes afetados:**
- `src/app/cart/[token]/page.tsx`
- `src/components/checkout/*`

---

### 3. Carrinho Incremental
**PRD:** `../../../livecart-be/docs/prd/003-carrinho-incremental.md`

**Impacto Frontend:**
- Nenhuma mudanca necessaria no frontend
- Comportamento ja suportado pela pagina de checkout

---

### 4. Modo Live (Controle de Contexto)
**PRD:** `../../../livecart-be/docs/prd/004-modo-live.md`

**Impacto Frontend:**
- [ ] NOVA PAGINA: `/events/[id]/live` - Painel Modo Live
- [ ] Componente `LiveModePanel` com layout full-screen
- [ ] Componente `ActiveProductSelector` para escolher produto ativo
- [ ] Componente `LiveCommentFeed` com WebSocket
- [ ] Componente `QuickProductButtons` para troca rapida
- [ ] Componente `LiveMetrics` com metricas em tempo real
- [ ] Hook `useLiveFeed` para WebSocket

**Novos arquivos:**
```
src/app/(dashboard)/events/[id]/live/
  page.tsx
  components/
    LiveModePanel.tsx
    ActiveProductSelector.tsx
    LiveCommentFeed.tsx
    QuickProductButtons.tsx
    LiveMetrics.tsx
    PauseButton.tsx

src/hooks/live/
  useLiveFeed.ts
  useLiveContext.ts

src/services/api/
  live.service.ts (atualizar)

src/types/
  live.types.ts (atualizar)
```

---

### 5. Atribuicao de Receita
**PRD:** `../../../livecart-be/docs/prd/005-atribuicao-receita.md`

**Impacto Frontend:**
- [ ] Componente `EventAnalytics` para pagina de detalhes do evento
- [ ] Componente `ConversionFunnel` com visualizacao de funil
- [ ] Novos cards de metricas na pagina do evento
- [ ] Hooks `useEventAnalytics`, `useEventFunnel`

**Novos arquivos:**
```
src/components/event/
  EventAnalytics.tsx
  ConversionFunnel.tsx

src/hooks/analytics/
  useEventAnalytics.ts
  useEventFunnel.ts
  useStoreAnalytics.ts

src/services/api/
  analytics.service.ts

src/types/
  analytics.types.ts
```

---

## Resumo de Impacto

| Feature | Novas Paginas | Novos Componentes | Complexidade |
|---------|---------------|-------------------|--------------|
| Resposta Automatica | 0 | 2 | Baixa |
| Checkout Durante Live | 0 | 1 | Media |
| Carrinho Incremental | 0 | 0 | Nenhuma |
| Modo Live | 1 | 6 | Alta |
| Atribuicao Receita | 0 | 4 | Media |

---

## Ordem de Implementacao Sugerida

1. **Checkout Durante a Live** - Mudanca pequena, alto impacto
2. **Atribuicao de Receita** - Independente, pode ser paralelo
3. **Resposta Automatica** - Depende de configuracoes
4. **Modo Live** - Mais complexo, requer WebSocket

---

## Stack Frontend

- **Framework:** Next.js 14 (App Router)
- **UI:** Radix UI + Tailwind + shadcn/ui
- **State:** React Query (TanStack Query)
- **Forms:** React Hook Form + Zod
- **WebSocket:** Native WebSocket API
- **Charts:** Recharts
