# 🎯 MVP Readiness Plan - IA-RPG

**Product Owner:** Sarah
**Data:** 5 de Outubro, 2025
**Versão:** 1.0
**Status:** 🟢 Em Execução

---

## 📊 EXECUTIVE SUMMARY

### Estado Atual (Pós-WEEK1)
- ✅ **Bloqueadores P0 Resolvidos** - Auth, Dashboard, WebSocket, Database Tables
- ✅ **Sprint WEEK1 Completo** - Todas 5 stories executadas
- ⚠️ **Gaps Remanescentes** - API routes, testes, error handling, CI/CD
- 🎯 **Meta:** MVP production-ready em 3-4 semanas

### Cobertura Atual do PRD
```
Epic 1 (Auth & Onboarding):     ████████████████████ 100% ✅
Epic 2 (Character Management):  █████████████████░░░  85%
Epic 3 (Payments/Stripe):       ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ (Post-MVP)
Epic 4 (Table Creation):        ████████████████████ 100% ✅
Epic 5 (Real-time Gameplay):    ████████████████████ 100% ✅
Epic 6 (Profile Management):    ████░░░░░░░░░░░░░░░░  20%
Epic 7 (Async Play):            ████████████░░░░░░░░  60%
Epic 8 (Advanced Characters):   ██░░░░░░░░░░░░░░░░░░  10% ⏸️ (Post-MVP)
Epic 9 (Session Management):    ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ (Post-MVP)
Epic 10 (Analytics/Master):     ░░░░░░░░░░░░░░░░░░░░   0% ⏸️ (Post-MVP)

MVP Core Ready: 75% | Total Product: 48%
```

---

## 🚀 ROADMAP PARA MVP PRODUCTION-READY

### FASE 1: QA & Testing Infrastructure (Semana 1) ✅ EM ANDAMENTO
**Objetivo:** Estabelecer baseline de qualidade e detectar bugs críticos

#### Sprint 1.1: Setup de Testes Automatizados
- [ ] **Configurar Playwright para E2E**
  - Instalar `@playwright/test`
  - Criar `playwright.config.ts`
  - Setup de browsers (chromium, firefox, webkit)
  - Configurar base URL (localhost:3000 e staging)

- [ ] **Configurar Jest/Vitest para Unit Tests**
  - Setup para monorepo (web + api)
  - Mocks de Supabase, NextAuth, Socket.io
  - Coverage thresholds (>70% para rotas críticas)

- [ ] **Criar Test Data Seeds**
  - Script de seed para usuários de teste
  - Characters, tables, messages de teste
  - Isolamento de ambiente de teste

**Entregável:** Estrutura de testes funcionando + 5 testes exemplo
**Tempo:** 3-4 dias

#### Sprint 1.2: Testes Críticos de Fluxo
- [ ] **E2E: Fluxo Completo de Auth**
  - Register → Login → Dashboard
  - OAuth Google/Discord
  - Session persistence
  - Logout

- [ ] **E2E: Fluxo de Criação de Character**
  - Quick start vs Guided flow
  - Character sheet display
  - Edit character

- [ ] **E2E: Fluxo de Table + Real-time**
  - Create table
  - Join table via invite code
  - Send messages (2 browsers)
  - Real-time updates via WebSocket
  - Combat tracker

- [ ] **Unit Tests: API Routes**
  - `/api/characters` CRUD
  - `/api/tables` CRUD
  - `/api/combat` actions
  - `/api/dice` roll validation

**Entregável:** 20+ testes E2E + 30+ testes unitários
**Tempo:** 4-5 dias

---

### FASE 2: Bug Fixes & Polish (Semana 2)
**Objetivo:** Corrigir bugs encontrados, implementar error handling robusto

#### Sprint 2.1: QA Manual Completo
- [ ] **Executar Checklist de QA Completo** (50+ casos)
  - Auth flow (login, register, OAuth, logout)
  - Character creation (quick + guided)
  - Table creation/join/browse
  - Real-time messaging (2+ usuários)
  - Dice rolling + combat tracker
  - Dashboard stats
  - Mobile responsiveness

- [ ] **Testar Edge Cases**
  - Invalid credentials
  - Expired sessions
  - WebSocket disconnection/reconnection
  - Network errors (offline mode)
  - Large datasets (100+ characters, 1000+ messages)
  - Concurrent users na mesma table

- [ ] **Cross-Browser Testing**
  - Chrome, Firefox, Safari
  - Mobile (iOS Safari, Android Chrome)
  - Tablet (iPad)

**Entregável:** Bug list priorizado (P0, P1, P2)
**Tempo:** 3 dias

#### Sprint 2.2: Bug Fixes Críticos
- [ ] **Corrigir Todos Bugs P0**
  - Bloqueadores de funcionalidade
  - Crashes/errors não tratados
  - Problemas de segurança (RLS, auth)

- [ ] **Implementar Error Handling Global**
  - Error boundary no React (frontend)
  - Error middleware no Express (backend)
  - Mensagens user-friendly
  - Retry mechanisms

- [ ] **Implementar Logging**
  - Backend: Winston/Pino para logs estruturados
  - Frontend: Console.error para desenvolvimento
  - Considerar Sentry (opcional para MVP)

**Entregável:** Zero bugs P0, error handling robusto
**Tempo:** 4 dias

---

### FASE 3: Implementação de Features Faltantes (Semana 3)
**Objetivo:** Completar features essenciais para MVP

#### Sprint 3.1: Profile Management (Epic 6 - 20→80%)
- [ ] **Story: User Profile Page**
  - GET `/api/users/profile` (backend)
  - Profile page UI (frontend)
  - Display username, email, avatar, tier
  - Edit bio/display name

- [ ] **Story: Avatar Upload**
  - Supabase Storage bucket para avatars
  - Upload component (drag-drop ou file picker)
  - Image optimization (resize para 256x256)
  - POST `/api/users/profile/avatar`

- [ ] **Story: User Stats Display**
  - Total characters created
  - Tables joined
  - Total sessions played
  - AI usage stats (free tier tracking)

**Entregável:** Profile management funcional
**Tempo:** 4 dias
**Points:** 8

#### Sprint 3.2: Async Play Enhancements (Epic 7 - 60→90%)
- [ ] **Story: Turn Deadline Notifications**
  - Email notifications quando deadline se aproxima
  - In-app notification badge
  - POST `/api/tables/:id/turns/:turnId/notify`

- [ ] **Story: Auto-Skip on Deadline**
  - Cron job (ou serverless function) para check deadlines
  - Auto-skip turn se não submetido
  - Notification para outros players

- [ ] **Story: Async Turn History**
  - GET `/api/tables/:id/turns/history`
  - Timeline UI com todas turns submetidas
  - Filter por player/character

**Entregável:** Async mode completo e funcional
**Tempo:** 3 dias
**Points:** 5

---

### FASE 4: CI/CD & Deploy Infrastructure (Semana 4)
**Objetivo:** Automação de deploy e monitoramento

#### Sprint 4.1: CI/CD Pipeline
- [ ] **GitHub Actions Workflow**
  - Trigger on: push to main, PR
  - Jobs:
    - Lint (ESLint, Prettier)
    - TypeCheck (tsc --noEmit)
    - Unit Tests (Jest/Vitest)
    - E2E Tests (Playwright - apenas em PRs)
    - Build (apps/web + apps/api)

- [ ] **Ambiente de Staging**
  - Deploy automático de `main` → staging
  - Vercel para frontend (staging.iarpg.app)
  - Railway para backend (api-staging.iarpg.app)
  - Supabase: branch separado ou projeto staging

- [ ] **Deploy Monitoring**
  - Health check endpoints (`/health`, `/health/db`)
  - Uptime monitoring (UptimeRobot ou similar)
  - Error tracking (Sentry free tier - opcional)

**Entregável:** CI/CD funcional, staging environment
**Tempo:** 3 dias

#### Sprint 4.2: Production Deploy Preparation
- [ ] **Security Audit**
  - RLS policies review (todas tabelas)
  - Environment variables check (nenhum secret hardcoded)
  - CORS configuration review
  - Rate limiting on API routes (express-rate-limit)

- [ ] **Performance Optimization**
  - Database indexes verificados (ver queries lentas)
  - Image optimization (Next.js Image component)
  - Bundle size analysis (next-bundle-analyzer)
  - API response caching (Redis - opcional)

- [ ] **Documentation Update**
  - README.md atualizado
  - DEPLOYMENT.md com instruções
  - API documentation (Swagger/OpenAPI - opcional)
  - User guide básico

**Entregável:** MVP pronto para deploy em produção
**Tempo:** 2 dias

#### Sprint 4.3: Production Deploy & Validation
- [ ] **Deploy em Produção**
  - Frontend: Vercel production (iarpg.app)
  - Backend: Railway production (api.iarpg.app)
  - Database: Supabase production (migrations aplicadas)

- [ ] **Smoke Tests em Produção**
  - Login/register funciona
  - Create character funciona
  - Create table funciona
  - Send message funciona
  - Real-time updates funcionam
  - Dashboard mostra dados corretos

- [ ] **Monitoring Setup**
  - Logs estruturados funcionando
  - Health checks retornando 200
  - Uptime monitoring ativo
  - Error tracking (se configurado)

**Entregável:** MVP em produção e funcional
**Tempo:** 1-2 dias

---

## 📋 CHECKLIST DE QA COMPLETO

### 1. Autenticação & Onboarding
- [ ] Registro com email/senha funciona
- [ ] Login com credenciais corretas funciona
- [ ] Login com credenciais incorretas mostra erro
- [ ] OAuth Google funciona
- [ ] OAuth Discord funciona
- [ ] Logout funciona e limpa sessão
- [ ] Session persiste após refresh
- [ ] Session expira após timeout (se configurado)
- [ ] Redirect para login se não autenticado

### 2. Character Management
- [ ] Quick Start character creation funciona
- [ ] Guided flow character creation funciona
- [ ] Character aparece na lista após criação
- [ ] Character sheet mostra dados corretos
- [ ] Edit character funciona
- [ ] Delete character funciona (com confirmação)
- [ ] Limite de characters respeitado por tier (se aplicável)
- [ ] Character validation (nome obrigatório, stats válidos)

### 3. Table/Campaign System
- [ ] Create table funciona (sync/async/solo)
- [ ] Table aparece na lista de tables
- [ ] Browse tables mostra tables públicas
- [ ] Search/filter tables funciona
- [ ] Join table via invite code funciona
- [ ] Invite code é único e funcional
- [ ] Table detail page carrega dados corretos
- [ ] Member list mostra players corretos
- [ ] Leave table funciona

### 4. Real-Time Gameplay
- [ ] Send message aparece para todos players (WebSocket)
- [ ] Typing indicator funciona
- [ ] Dice roll mostra resultado correto
- [ ] Dice roll aparece no chat
- [ ] Combat tracker inicia combat
- [ ] Initiative order correta
- [ ] HP updates refletem em real-time
- [ ] Next turn avança corretamente
- [ ] End combat funciona

### 5. AI Features
- [ ] AI DM Assistant responde prompts
- [ ] Streaming SSE funciona (resposta gradual)
- [ ] AI tem contexto da table (messages, characters)
- [ ] Rate limiting funciona (free tier: 10/hora)
- [ ] AI usage salva em `ai_usage` table
- [ ] Error handling se API key inválida

### 6. Async Play Mode
- [ ] Async table permite turn submission
- [ ] Deadline é respeitado
- [ ] Turn skipping funciona (se deadline passar)
- [ ] Turn history mostra todas turns
- [ ] Notifications funcionam (se implementado)

### 7. Dashboard & Profile
- [ ] Dashboard mostra character count correto
- [ ] Dashboard mostra active tables count
- [ ] Dashboard quick actions funcionam
- [ ] Profile page mostra dados do usuário
- [ ] Edit profile funciona
- [ ] Avatar upload funciona (se implementado)
- [ ] Stats display correto

### 8. Error Handling & Edge Cases
- [ ] Network error mostra mensagem user-friendly
- [ ] 401 Unauthorized redireciona para login
- [ ] 404 Not Found mostra página de erro
- [ ] 500 Server Error mostra mensagem genérica (não expõe stack trace)
- [ ] WebSocket disconnection + reconnection funciona
- [ ] Large datasets (1000+ messages) não travam UI
- [ ] Concurrent edits não causam race conditions

### 9. Mobile & Responsiveness
- [ ] Login/register funciona no mobile
- [ ] Character creation funciona no mobile
- [ ] Character sheet legível no mobile
- [ ] Table chat funciona no mobile
- [ ] Dice roller funciona no mobile
- [ ] Combat tracker funciona no mobile
- [ ] Touch gestures funcionam (scroll, tap, swipe)

### 10. Performance & Security
- [ ] Page load < 3s em 4G
- [ ] API responses < 500ms (p95)
- [ ] No credentials em URLs ou logs
- [ ] CORS configurado corretamente
- [ ] RLS policies impedem acesso não autorizado
- [ ] XSS/CSRF protections ativas
- [ ] Rate limiting previne abuse

---

## 🧪 TESTES PRIORITÁRIOS (Quick Wins)

### Testes E2E Críticos (10 testes - 2h de trabalho)
1. **Auth Flow Completo** - Register → Login → Dashboard → Logout
2. **Create Character (Quick)** - Quick start → Character appears in list
3. **Create Table** - Create → Verify in browse → Join via invite code
4. **Send Message Real-Time** - 2 browsers → Message appears instantly
5. **Dice Roll** - Roll d20 → Result appears in chat
6. **Combat Start** - Start combat → Initiative order correct
7. **Dashboard Stats** - Create character → Count increments
8. **Table Browser Filter** - Search "dragon" → Only matching tables
9. **WebSocket Reconnect** - Disconnect network → Reconnect → Messages sync
10. **Mobile Character Sheet** - Open on mobile → All fields visible

### Testes Unitários Críticos (20 testes - 4h de trabalho)
**Backend API:**
1. `POST /api/characters` - Creates character with valid data
2. `POST /api/characters` - Rejects invalid data (missing name)
3. `GET /api/characters` - Returns only user's characters
4. `DELETE /api/characters/:id` - Only owner can delete
5. `POST /api/tables` - Creates table with invite code
6. `GET /api/tables/:id` - Returns table with members
7. `POST /api/tables/:id/messages` - Creates message
8. `GET /api/tables/:id/messages` - Pagination works
9. `POST /api/dice/:tableId/roll` - Validates dice formula
10. `POST /api/combat/:tableId/start` - Initializes combat

**Frontend:**
11. `DashboardContent` - Fetches and displays stats
12. `DashboardContent` - Shows loading state
13. `DashboardContent` - Shows error state with retry
14. `CharacterCreation` - Form validation works
15. `CharacterSheet` - Displays all character data
16. `TableBrowser` - Filters work correctly
17. `TablePageClient` - Sends message via API
18. `DiceRoller` - Calculates result correctly
19. `CombatTracker` - Next turn increments correctly
20. `SocketContext` - Connects to backend on mount

---

## 🎯 DEFINITION OF DONE - MVP PRODUCTION

### Funcionalidades Obrigatórias (Checklist Final)
- ✅ Auth completo (email + 2 OAuth providers)
- ✅ Character CRUD (quick + guided flows)
- ✅ Table CRUD (sync/async/solo modes)
- ✅ Real-time messaging (WebSocket)
- ✅ Dice rolling + combat tracker
- ✅ AI DM Assistant (basic, rate limited)
- ✅ Dashboard com stats reais
- ⚠️ Profile management (avatar upload opcional)
- ⚠️ Async play (notifications opcionais)

### Qualidade & Testes
- [ ] **80+ testes automatizados** (50 E2E + 30 unit)
- [ ] **Zero bugs P0** (bloqueadores)
- [ ] **<5 bugs P1** (issues não críticos conhecidos e documentados)
- [ ] **>70% code coverage** em rotas críticas (auth, characters, tables)
- [ ] **Todos fluxos principais testados manualmente** (QA checklist completo)

### Infraestrutura & DevOps
- [ ] **CI/CD pipeline** funcionando (lint + test + build)
- [ ] **Staging environment** espelhando produção
- [ ] **Health checks** (`/health`, `/health/db`) retornando 200
- [ ] **Monitoring** básico (uptime, logs)
- [ ] **Error handling** robusto (user-friendly messages)

### Segurança
- [ ] **RLS policies** em todas tabelas Supabase
- [ ] **CORS** configurado corretamente
- [ ] **Rate limiting** em endpoints críticos (AI, auth)
- [ ] **Secrets** em env vars (nenhum hardcoded)
- [ ] **HTTPS** obrigatório em produção

### Performance
- [ ] **Lighthouse score >80** (Performance, Accessibility)
- [ ] **Page load <3s** em 4G
- [ ] **API p95 <500ms**
- [ ] **Database queries otimizadas** (indexes verificados)
- [ ] **Bundle size <500KB** (inicial, gzipped)

### Documentação
- [ ] **README.md** atualizado com setup instructions
- [ ] **DEPLOYMENT.md** com deploy guide
- [ ] **Changelog** com features implementadas
- [ ] **Known Issues** documentados
- [ ] **User Guide** básico (opcional)

---

## 📅 TIMELINE CONSOLIDADO

| Fase | Duração | Entregas Principais |
|------|---------|---------------------|
| **WEEK 1 (Completa ✅)** | 5 dias | P0 fixes: Auth, Dashboard, WebSocket, DB Tables |
| **WEEK 2: QA & Testing** | 7 dias | Testes automatizados + Bug fixes |
| **WEEK 3: Features** | 7 dias | Profile, Async enhancements |
| **WEEK 4: Deploy** | 7 dias | CI/CD, Staging, Production |
| **TOTAL** | **26 dias** | **MVP Production-Ready** |

### Milestone Dates (Estimados)
- ✅ **05 Out** - WEEK1 Completo (P0 fixes)
- 🎯 **12 Out** - QA & Testing Infrastructure
- 🎯 **19 Out** - Features Faltantes Implementadas
- 🎯 **26 Out** - CI/CD Configurado
- 🚀 **31 Out** - **DEPLOY EM PRODUÇÃO**

---

## 🚨 RISCOS E MITIGAÇÕES

### Riscos Técnicos

**1. WebSocket Instabilidade em Produção**
- **Probabilidade:** Média
- **Impacto:** Alto (real-time features quebradas)
- **Mitigação:**
  - Testes de stress com 50+ usuários simultâneos
  - Fallback para polling se WebSocket falhar
  - Monitoring de connection drops

**2. Supabase RLS Policies Bloqueando Operações**
- **Probabilidade:** Média
- **Impacto:** Alto (funcionalidades quebradas)
- **Mitigação:**
  - Testar TODAS policies em staging antes de produção
  - Usar `createSupabaseAdmin()` server-side para bypass quando apropriado
  - Logs detalhados de erros RLS

**3. Performance com Large Datasets**
- **Probabilidade:** Alta (se produto der certo)
- **Impacto:** Médio (lentidão, não quebra)
- **Mitigação:**
  - Paginação obrigatória em todas listas
  - Indexes em colunas frequently queried
  - Considerar Redis cache (post-MVP)

### Riscos de Prazo

**4. Bugs Críticos Descobertos Tarde**
- **Probabilidade:** Alta (sempre acontece)
- **Impacto:** Alto (atraso no deploy)
- **Mitigação:**
  - QA manual ANTES de começar features faltantes
  - Buffer de 3-5 dias no timeline
  - Priorização rigorosa (MVP mínimo aceitável)

**5. Scope Creep (Features Extras)**
- **Probabilidade:** Média
- **Impacto:** Alto (nunca lançamos)
- **Mitigação:**
  - Lista clara de "Post-MVP Features" (Epic 3, 8, 9, 10)
  - PO (Sarah) rejeita qualquer feature não essencial
  - Foco em "done is better than perfect"

---

## 📊 METRICS & SUCCESS CRITERIA

### Pre-Launch Metrics (MVP Readiness)
- [ ] **100% dos fluxos principais funcionando** (auth, character, table, messaging)
- [ ] **>95% uptime** em staging por 3 dias consecutivos
- [ ] **Zero errors críticos** nos logs por 24h
- [ ] **<2s average response time** (backend APIs)
- [ ] **Lighthouse >80** em todas páginas principais

### Post-Launch Metrics (Semana 1)
- 🎯 **10+ usuários reais** testando (beta testers)
- 🎯 **50+ characters criados**
- 🎯 **10+ tables ativas**
- 🎯 **Zero downtime** não planejado
- 🎯 **<5 bugs reportados** (severity P1+)

### Sucesso do MVP (Mês 1)
- 🌟 **100+ usuários cadastrados**
- 🌟 **500+ characters criados**
- 🌟 **50+ tables ativas**
- 🌟 **10+ usuários retornando >3x/semana** (engagement)
- 🌟 **NPS >40** (satisfação)

---

## 🎓 LESSONS LEARNED (Pós-WEEK1)

### ✅ O Que Funcionou Bem
1. **Stories detalhadas** com acceptance criteria claros aceleraram dev
2. **Gap Analysis** upfront identificou todos bloqueadores
3. **Fix de auth primeiro** desbloqueou todas outras features
4. **Supabase migration** foi mais simples que esperado

### ⚠️ O Que Melhorar
1. **Testes deveriam vir ANTES** de implementação (TDD light)
2. **QA manual contínuo** preveniria bugs acumulados
3. **Documentação durante** (não depois) economiza tempo
4. **Staging environment** deveria estar desde dia 1

### 🔄 Mudanças de Processo
1. **Introduzir testes E2E** para cada nova feature (não batch no final)
2. **Daily health checks** em staging (smoke tests automatizados)
3. **Weekly review** de bugs acumulados (não deixar acumular)
4. **Definition of Done** inclui testes + documentação

---

## 📚 APPENDIX: RESOURCES

### Documentação Chave
- [PRD Completo](/docs/prd.md)
- [Gap Analysis](/GAP-ANALYSIS.md)
- [Dev Handoff](/docs/DEV-HANDOFF.md)
- [Deployment Guide](/DEPLOY-GUIDE.md)
- [Stories WEEK1](/docs/stories/WEEK1.*)

### Ferramentas & Stack
- **Frontend:** Next.js 14, React 18, TypeScript, Tailwind
- **Backend:** Express.js, Socket.io, Node.js 20
- **Database:** Supabase (PostgreSQL 15+)
- **Auth:** NextAuth v5
- **AI:** Anthropic Claude API
- **Testing:** Playwright (E2E), Jest/Vitest (Unit)
- **CI/CD:** GitHub Actions
- **Deploy:** Vercel (web) + Railway (api)
- **Monitoring:** UptimeRobot, Logs (Winston/Pino)

### Comandos Úteis
```bash
# Development
pnpm dev                 # Start all apps
pnpm build               # Build for production
pnpm lint                # Run ESLint
pnpm typecheck           # TypeScript check

# Database
pnpm db:migrate          # Run migrations
pnpm db:generate         # Generate Prisma types
pnpm db:studio           # Open Supabase Studio

# Testing
pnpm test                # Run all tests
pnpm test:e2e            # Run E2E tests (Playwright)
pnpm test:unit           # Run unit tests (Jest)
pnpm test:coverage       # Coverage report

# Deploy
vercel --prod            # Deploy frontend
railway up --environment production  # Deploy backend
```

---

**Preparado por:** Sarah (Product Owner)
**Última Atualização:** 5 de Outubro, 2025
**Próxima Revisão:** Após cada sprint (semanal)

---

## 🎬 PRÓXIMOS PASSOS IMEDIATOS

1. **[HOJE]** Revisar e aprovar este plano
2. **[HOJE]** Configurar Playwright + Jest (Sprint 1.1 start)
3. **[Segunda]** Escrever primeiros 10 testes E2E
4. **[Terça]** Executar QA manual completo (checklist 50+ items)
5. **[Quarta]** Começar bug fixes P0
6. **[Quinta-Sexta]** Implementar error handling global
7. **[Próxima Semana]** Features faltantes (Profile, Async)

**Let's ship this! 🚀**
