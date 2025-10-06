# Technical Debt - IA-RPG

**Status:** 🚧 Em Monitoramento
**Última atualização:** 2025-10-06
**Maintainer:** @architect (Winston)

---

## Índice

1. [Overview](#overview)
2. [Categorização de Dívidas](#categorização-de-dívidas)
3. [Dívidas Ativas](#dívidas-ativas)
4. [Dívidas Resolvidas](#dívidas-resolvidas)
5. [Processo de Gestão](#processo-de-gestão)
6. [Métricas](#métricas)

---

## Overview

Technical Debt (dívida técnica) refere-se a **decisões de implementação** que priorizam **velocidade** sobre **qualidade**, gerando **custos de manutenção futuros**.

Este documento rastreia dívidas técnicas ativas, priorizando-as por **impacto** e **esforço**, seguindo o framework AIOS-FULLSTACK.

---

## Categorização de Dívidas

### Por Severidade

| Nível | Descrição | Prazo para Resolver |
|-------|-----------|---------------------|
| 🔴 **Critical** | Bloqueia produção ou cria riscos de segurança | Imediato (<1 semana) |
| 🟠 **High** | Impacta performance ou DX significativamente | <1 mês |
| 🟡 **Medium** | Melhoria desejável mas não urgente | <3 meses |
| 🟢 **Low** | Nice-to-have, pode ser adiado | Backlog |

### Por Categoria

- **Architecture** - Decisões estruturais (monorepo, patterns)
- **Code Quality** - Refatoração, duplicação, complexidade
- **Performance** - Bundle size, latency, otimização
- **Testing** - Cobertura, flaky tests, E2E gaps
- **Documentation** - Docs desatualizados, falta de exemplos
- **DevOps** - CI/CD, monitoring, alerting
- **Security** - Vulnerabilities, secrets, RLS

---

## Dívidas Ativas

### 🟠 High Priority

#### 1. Refatorar SocketContext (Global State)

**Severidade:** 🟠 High
**Categoria:** Architecture
**Epic:** 11 (Critical Fixes)
**Issue:** [#TD-001]

**Descrição:**
O `SocketContext` está acoplado globalmente (`apps/web/src/contexts/SocketContext.tsx`), dificultando:
- Testes isolados (precisa mockar Socket.io)
- Multi-table support (1 conexão por user, não por mesa)
- Reconnection logic (reconecta todas as mesas)

**Impacto:**
- Developer Experience: 🔴 Alto (dificulta testes)
- Performance: 🟡 Médio (1 conexão = ok para MVP)
- Escalabilidade: 🔴 Alto (>10 mesas por user = problema)

**Solução Proposta:**
```typescript
// Antes (Global)
<SocketProvider>
  <App />
</SocketProvider>

// Depois (Per-table)
<TablePage tableId={id}>
  <SocketProvider tableId={id}>
    <ChatBox />
    <DiceRoller />
  </SocketProvider>
</TablePage>
```

**Esforço:** 2-3 dias (16-24h)
**Dono:** @dev
**Prazo:** Week 4.1 (próximo sprint)

**Referências:**
- [ADR-003: WebSocket Architecture](./adr/003-websocket-socketio.md)
- Story: `docs/stories/11.2.connect-websocket.md`

---

#### 2. Consolidar Error Handling Patterns

**Severidade:** 🟠 High
**Categoria:** Code Quality
**Epic:** 12 (Testing Infrastructure)
**Issue:** [#TD-002]

**Descrição:**
Error handling inconsistente entre frontend e backend:
- Frontend: `try/catch` + `toast.error()` (mix)
- Backend: `throw new Error()` + custom error classes (inconsistent)
- Sem error codes padronizados (dificulta troubleshooting)

**Impacto:**
- Developer Experience: 🟠 Alto (confuso para new devs)
- Debugging: 🔴 Alto (logs sem estrutura)
- User Experience: 🟡 Médio (mensagens inconsistentes)

**Solução Proposta:**
```typescript
// Criar error utility
// packages/shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public meta?: Record<string, any>
  ) {
    super(message)
  }
}

// Usage
throw new AppError('CHARACTER_NOT_FOUND', 'Character not found', 404, { id })
```

**Esforço:** 3-4 dias (24-32h)
**Dono:** @dev
**Prazo:** Week 4.2

**Referências:**
- Story: `docs/stories/12.4.unit-tests-critical-routes.md`

---

#### 3. Otimizar Bundle Size (280KB → 200KB)

**Severidade:** 🟠 High
**Categoria:** Performance
**Epic:** 13 (QA Validation)
**Issue:** [#TD-003]

**Descrição:**
Bundle size atual: **280KB gzipped** (target: 200KB)

**Principais culpados:**
1. `socket.io-client` (70KB) - Necessário
2. `@radix-ui/react-*` (50KB) - UI components
3. `zod` (30KB) - Validation
4. `date-fns` (25KB) - Date utilities
5. Outros (105KB)

**Impacto:**
- Performance: 🟠 Médio (TTFB ok, mas LCP +500ms)
- User Experience: 🟡 Médio (3G users sentem)
- SEO: 🟡 Médio (Core Web Vitals afetados)

**Solução Proposta:**
1. **Tree-shaking** - Remover imports não usados
2. **Code splitting** - Dynamic imports para rotas
3. **date-fns → date-fns-tz** - Apenas timezone utils
4. **Lazy load** - Componentes pesados (Character Sheet)

```typescript
// Antes
import { CharacterSheet } from '@/components/CharacterSheet'

// Depois
const CharacterSheet = dynamic(() => import('@/components/CharacterSheet'))
```

**Esforço:** 2 dias (16h)
**Dono:** @dev
**Prazo:** Week 4.3

**Referências:**
- [Vercel Analytics](https://vercel.com/taypuri/iarpg-web/analytics)
- Story: `docs/stories/13.1.validate-critical-flows.md`

---

### 🟡 Medium Priority

#### 4. Adicionar E2E Coverage (60% → 80%)

**Severidade:** 🟡 Medium
**Categoria:** Testing
**Epic:** 12 (Testing Infrastructure)
**Issue:** [#TD-004]

**Descrição:**
Cobertura E2E atual: **~60%** (12 tests de 20 flows críticos)

**Flows faltando:**
1. ❌ **Character Edit Flow** - Edit character → Save → Validate
2. ❌ **Table Leave Flow** - Join table → Leave → Validate
3. ❌ **Dice Advanced Rolls** - Roll 2d20kh1 (advantage) → Validate
4. ❌ **Chat Formatting** - Send markdown message → Render
5. ❌ **Multi-tab Sync** - Open 2 tabs → Send message → Validate sync
6. ❌ **Offline Handling** - Disconnect → Reconnect → Validate state
7. ❌ **Logout Flow** - Logout → Redirect → Validate session cleared
8. ❌ **OAuth Error Handling** - OAuth fail → Redirect → Show error

**Impacto:**
- Quality: 🟠 Alto (regressions não detectados)
- Confidence: 🟡 Médio (deploy com medo)
- Developer Experience: 🟢 Baixo (não bloqueia dev)

**Solução Proposta:**
```typescript
// Adicionar 8 testes faltando
// apps/web/e2e/characters-edit.spec.ts
test('user can edit character', async ({ page }) => {
  await page.goto('/characters/123')
  await page.click('button:has-text("Edit")')
  await page.fill('[name="characterName"]', 'Thorin Updated')
  await page.click('button:has-text("Save")')
  await expect(page.locator('h1')).toContainText('Thorin Updated')
})
```

**Esforço:** 2 dias (16h)
**Dono:** @qa
**Prazo:** Week 5.1

**Referências:**
- [ADR-004: Testing Strategy](./adr/004-testing-playwright-jest.md)
- Story: `docs/stories/12.3.e2e-critical-flows.md`

---

#### 5. Documentar OpenAI Prompt Library

**Severidade:** 🟡 Medium
**Categoria:** Documentation
**Epic:** 10 (AI Features)
**Issue:** [#TD-005]

**Descrição:**
Prompts de OpenAI estão hardcoded no código (`apps/api/src/services/openai.service.ts`):
- Prompt de geração de NPC (50 linhas)
- Prompt de sugestão de ação (30 linhas)
- Prompt de resumo de sessão (20 linhas)

Sem documentação:
- Não sabemos qual prompt gera qual output
- Difícil testar variações
- Prompts não versionados

**Impacto:**
- Developer Experience: 🟡 Médio (dificulta iteração)
- Quality: 🟡 Médio (sem A/B testing)
- Cost: 🟢 Baixo (não afeta custo)

**Solução Proposta:**
```markdown
# Criar docs/prompts/
├── npc-generation.md
├── action-suggestion.md
└── session-summary.md

# Cada arquivo:
## Prompt
[Prompt text]

## Input Variables
- {characterName}
- {context}

## Expected Output
[Example JSON]

## Performance Metrics
- Success rate: 95%
- Avg tokens: 500
- Cost: $0.01/request
```

**Esforço:** 1 dia (8h)
**Dono:** @dev
**Prazo:** Week 5.2

**Referências:**
- Story: `docs/stories/10.1.ai-npc-generation.md`

---

#### 6. Adicionar Health Check Metrics

**Severidade:** 🟡 Medium
**Categoria:** DevOps
**Epic:** 10 (Production Deployment)
**Issue:** [#TD-006]

**Descrição:**
Health check atual: `/health` retorna apenas `{ status: 'ok' }`

Falta:
- Database connection status
- WebSocket connections count
- Memory usage
- Response time (p50, p95, p99)
- Error rate (5xx)

**Impacto:**
- Monitoring: 🟠 Alto (não sabemos se serviço está saudável)
- Debugging: 🟡 Médio (dificulta troubleshooting)
- Alerting: 🔴 Alto (sem alertas automáticos)

**Solução Proposta:**
```typescript
// apps/api/src/routes/health.ts
app.get('/health', async (req, res) => {
  const health = {
    status: 'ok',
    timestamp: Date.now(),
    uptime: process.uptime(),
    database: await checkDatabaseConnection(),
    websocket: {
      connections: io.sockets.sockets.size,
    },
    memory: process.memoryUsage(),
    responseTime: {
      p50: metrics.p50(),
      p95: metrics.p95(),
      p99: metrics.p99(),
    },
  }
  res.json(health)
})
```

**Esforço:** 1 dia (8h)
**Dono:** @dev
**Prazo:** Week 5.3

**Referências:**
- [Railway Health Checks](https://docs.railway.app/deploy/healthchecks)
- [ADR-005: Deployment](./adr/005-deployment-vercel-railway.md)

---

### 🟢 Low Priority (Backlog)

#### 7. Migrar de Jest para Vitest

**Severidade:** 🟢 Low
**Categoria:** Testing
**Epic:** Backlog
**Issue:** [#TD-007]

**Descrição:**
Jest funciona, mas Vitest é ~10x mais rápido.

**Impacto:**
- Performance: 🟡 Médio (tests levam 3min, poderiam ser 30s)
- Developer Experience: 🟢 Baixo (acceptable)

**Esforço:** 2 dias (16h)
**Dono:** @dev
**Prazo:** Phase 4+ (se tests ficarem lentos)

---

#### 8. Adicionar Visual Regression Tests

**Severidade:** 🟢 Low
**Categoria:** Testing
**Epic:** Backlog
**Issue:** [#TD-008]

**Descrição:**
Não temos testes de regressão visual (UI changes não detectados).

**Solução:** Chromatic ou Percy

**Impacto:** 🟢 Baixo (UI stable)
**Esforço:** 1 dia (8h)
**Dono:** @qa
**Prazo:** Phase 4+

---

## Dívidas Resolvidas

### ✅ WEEK1: Auth Credentials Fix

**Issue:** [#TD-WEEK1.1]
**Severidade:** 🔴 Critical
**Resolvido em:** 2025-09-30
**Story:** `docs/stories/11.1.fix-auth-credentials.md`

**Descrição:**
Cookies de autenticação não enviados (CORS + credentials).

**Solução:**
```typescript
credentials: 'include'
```

---

### ✅ WEEK1: WebSocket Connection

**Issue:** [#TD-WEEK1.2]
**Severidade:** 🔴 Critical
**Resolvido em:** 2025-10-01
**Story:** `docs/stories/11.2.connect-websocket.md`

**Descrição:**
SocketContext não conectava (provider placement).

**Solução:**
Mover `<SocketProvider>` para dentro de `<SessionProvider>`.

---

### ✅ WEEK1: Database Schema Gaps

**Issue:** [#TD-WEEK1.4]
**Severidade:** 🟠 High
**Resolvido em:** 2025-10-02
**Story:** `docs/stories/11.4.prisma-schema-gaps.md`

**Descrição:**
4 tabelas faltando (AIUsage, AsyncTurn, Subscription, CampaignLog).

**Solução:**
Adicionadas via migration `20251002_complete_schema.sql`.

---

### ✅ WEEK3: MetaMask OAuth Errors

**Issue:** [#TD-WEEK3.2]
**Severidade:** 🟠 High
**Resolvido em:** 2025-10-05
**Story:** `docs/stories/13.2.edge-case-validation.md`

**Descrição:**
MetaMask bloqueava OAuth providers (CORS).

**Solução:**
Desabilitar providers no auth config (temporarily).

---

## Processo de Gestão

### Como Adicionar Nova Dívida

1. **Identificar dívida** durante development/review
2. **Criar issue** no GitHub: `[TD-XXX] Title`
3. **Adicionar a este doc** com template:
   ```markdown
   #### N. Título da Dívida
   **Severidade:** 🟠 High
   **Categoria:** Code Quality
   **Epic:** X
   **Issue:** [#TD-XXX]
   **Descrição:** ...
   **Impacto:** ...
   **Solução Proposta:** ...
   **Esforço:** X dias
   **Dono:** @agent
   **Prazo:** Week X.Y
   ```

### Como Priorizar

1. **Critical → High → Medium → Low**
2. Dentro de cada nível: **Impacto ÷ Esforço**
3. Revisar prioridades **weekly** (Sprint Planning)

### Como Resolver

1. **Criar story** em `docs/stories/`
2. **Assignar owner** (@dev, @qa, @architect)
3. **Implementar + testes**
4. **Review + merge**
5. **Mover para "Resolvidas"** neste doc

---

## Métricas

### Dívida Total

| Métrica | Valor | Target | Status |
|---------|-------|--------|--------|
| Dívidas Ativas | 8 | <10 | ✅ |
| Dívidas Critical | 0 | 0 | ✅ |
| Dívidas High | 3 | <5 | ✅ |
| Dívidas Medium | 3 | <10 | ✅ |
| Dívidas Low | 2 | Any | ✅ |
| **Tech Debt Score** | **87%** | >80% | ✅ |

**Tech Debt Score = 100% - (Critical×10 + High×3 + Medium×1 + Low×0.5)**

### Resolução ao Longo do Tempo

| Período | Adicionadas | Resolvidas | Net |
|---------|-------------|------------|-----|
| WEEK1   | 5           | 3          | +2  |
| WEEK2   | 2           | 0          | +2  |
| WEEK3   | 3           | 1          | +2  |
| **Total** | **10**    | **4**      | **+6** |

### Velocity (Dívidas Resolvidas/Semana)

- WEEK1: 3 dívidas
- WEEK2: 0 dívidas (focus em testing)
- WEEK3: 1 dívida
- **Média:** 1.3 dívidas/semana

**Target:** 2 dívidas/semana (para reduzir backlog)

---

## Próximos Passos

### Week 4 (Próximo Sprint)

1. ✅ **TD-001:** Refatorar SocketContext (@dev, 2-3 dias)
2. ✅ **TD-002:** Consolidar Error Handling (@dev, 3-4 dias)
3. ✅ **TD-003:** Otimizar Bundle Size (@dev, 2 dias)

**Total esforço:** 7-9 dias (1-1.5 sprints)

### Week 5-6

4. ✅ **TD-004:** Adicionar E2E Coverage (@qa, 2 dias)
5. ✅ **TD-005:** Documentar Prompts (@dev, 1 dia)
6. ✅ **TD-006:** Health Check Metrics (@dev, 1 dia)

**Total esforço:** 4 dias (0.5 sprint)

### Backlog (Phase 4+)

- **TD-007:** Migrar Jest → Vitest (se tests lentos)
- **TD-008:** Visual Regression Tests (se budget permitir)

---

## Triggers para Revisão

**Revisar este doc quando:**
- ✅ Weekly Sprint Planning (toda segunda-feira)
- ✅ Após cada release (validar se dívidas novas surgiram)
- ✅ Tech Debt Score <80% (ação imediata!)
- ✅ Dívidas Critical detectadas (drop everything!)

---

## Referências

- [AIOS Brownfield Workflow](../.aios-core/working-in-the-brownfield.md)
- [PO-VALIDATION-REPORT](./PO-VALIDATION-REPORT.md)
- [PRD Section 4.5: Quality Assurance](./prd.md)
- [ADR-004: Testing Strategy](./adr/004-testing-playwright-jest.md)

---

**Status:** ✅ **ATIVO** - Monitoramento contínuo
**Próxima revisão:** Sprint Planning Week 4 (2025-10-14)
**Maintainer:** @architect (Winston)
