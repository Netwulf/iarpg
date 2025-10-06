# 🧪 WEEK2 Testing Stories - Sprint de Testes

**Product Owner:** Sarah
**Data:** 5 de Outubro, 2025
**Sprint:** WEEK2 - QA & Testing Infrastructure
**Total Stories:** 4
**Total Story Points:** 15

---

## 📋 VISÃO GERAL DO SPRINT

Este sprint estabelece a fundação completa de testes automatizados para o IA-RPG MVP, garantindo qualidade e prevenindo regressões.

### Objetivos do Sprint
✅ Configurar infraestrutura de testes E2E (Playwright)
✅ Configurar infraestrutura de testes unitários (Jest)
✅ Implementar 10 testes E2E críticos
✅ Implementar 38+ testes unitários críticos
✅ Atingir >70% de cobertura em código crítico

### Métricas de Sucesso
- **48+ testes automatizados** (10 E2E + 38 unit)
- **Execution time < 6 min** (5 min E2E + 30s unit)
- **Pass rate > 95%** (testes consistentes, sem flakiness)
- **Coverage > 70%** em rotas críticas

---

## 📦 STORIES CRIADAS

### Story 1: WEEK2.1 - Setup Playwright E2E
**Arquivo:** `/docs/stories/WEEK2.1.setup-playwright-e2e.md`
**Story Points:** 3
**Status:** Pending
**Prioridade:** Alta (bloqueador para WEEK2.3)

#### Objetivo
Configurar Playwright para testes end-to-end automatizados com suporte a múltiplos browsers.

#### Acceptance Criteria (12)
- ✅ Playwright instalado e configurado em `/apps/web`
- ✅ Suporte a 3 browsers (chromium, firefox, webkit)
- ✅ Base URL configurável (localhost + staging)
- ✅ Test users criados em Supabase
- ✅ Auth fixture para auto-login
- ✅ Test helpers e data generators
- ✅ Smoke test passando
- ✅ Screenshots/videos em falhas
- ✅ HTML report gerado
- ✅ Parallel execution (3-4 workers)
- ✅ Retry mechanism (2x em CI)
- ✅ CI-ready (headless mode)

#### Entregáveis
```
/apps/web/
  ├── playwright.config.ts
  ├── e2e/
  │   ├── fixtures/auth.fixture.ts
  │   ├── utils/test-helpers.ts
  │   └── example.spec.ts
  ├── .env.test
  └── package.json (scripts: test:e2e, test:e2e:ui, test:e2e:debug)
```

#### Tempo Estimado
3-4 dias

---

### Story 2: WEEK2.2 - Setup Jest Unit Tests
**Arquivo:** `/docs/stories/WEEK2.2.setup-jest-unit-tests.md`
**Story Points:** 2
**Status:** Pending
**Prioridade:** Alta (bloqueador para WEEK2.4)

#### Objetivo
Configurar Jest para testes unitários em ambos workspaces (web + api).

#### Acceptance Criteria (12)
- ✅ Jest configurado em `/apps/web` (React + Next.js)
- ✅ Jest configurado em `/apps/api` (Express + Node.js)
- ✅ React Testing Library setup
- ✅ Supertest setup (API testing)
- ✅ Mocks configurados (Supabase, NextAuth, Socket.io)
- ✅ Test coverage reporting (>70% target)
- ✅ `pnpm test` funcional em ambos workspaces
- ✅ Coverage reports em HTML
- ✅ Fast execution (<10s inicialmente)
- ✅ Watch mode para desenvolvimento
- ✅ CI-ready (headless)
- ✅ TypeScript types funcionam em testes

#### Entregáveis
```
/apps/web/
  ├── jest.config.js
  ├── jest.setup.js
  ├── __tests__/
  │   ├── components/dashboard-content.test.tsx (exemplo)
  │   ├── utils/test-utils.tsx
  │   └── mocks/ (next-auth, supabase, socket)
  └── package.json (scripts: test, test:watch, test:coverage)

/apps/api/
  ├── jest.config.js
  ├── jest.setup.js
  ├── __tests__/
  │   ├── routes/characters.routes.test.ts (exemplo)
  │   └── mocks/ (supabase, express)
  └── package.json (scripts: test, test:watch, test:coverage)
```

#### Tempo Estimado
2-3 dias

---

### Story 3: WEEK2.3 - E2E Critical User Flows
**Arquivo:** `/docs/stories/WEEK2.3.e2e-critical-flows.md`
**Story Points:** 5
**Status:** Pending
**Prioridade:** Alta
**Dependência:** WEEK2.1 (Playwright Setup)

#### Objetivo
Implementar 10 testes E2E para os fluxos críticos de usuário mais importantes.

#### Acceptance Criteria (14)
**Testes Implementados:**
1. ✅ Auth flow (register → login → logout)
2. ✅ Character creation (quick + guided)
3. ✅ Table creation (create → join via code)
4. ✅ Real-time messaging (2 browser contexts)
5. ✅ Dice rolling (roll → result in chat)
6. ✅ Combat tracker (start → turns → end)
7. ✅ Dashboard stats (create → count increment)
8. ✅ Table browser filter (search works)
9. ✅ WebSocket reconnect (offline/online)
10. ✅ Mobile character sheet (responsive)

**Qualidade:**
- ✅ Todos testes passam consistentemente (>95%)
- ✅ Execution time < 5 min
- ✅ Tests isolados (ordem independente)
- ✅ Screenshots em falhas

#### Entregáveis
```
/apps/web/e2e/
  ├── auth.spec.ts
  ├── character-creation.spec.ts
  ├── table-creation.spec.ts
  ├── real-time-messaging.spec.ts
  ├── dice-rolling.spec.ts
  ├── combat-tracker.spec.ts
  ├── dashboard-stats.spec.ts
  ├── table-browser.spec.ts
  ├── websocket-reconnect.spec.ts
  └── mobile-character-sheet.spec.ts
```

#### Cobertura de Fluxos
- 🔐 **Auth:** 100% (register, login, logout, OAuth)
- 👤 **Characters:** 100% (create quick, create guided, list, edit)
- 🎲 **Tables:** 100% (create, browse, join, member list)
- 💬 **Real-time:** 100% (messages, typing, presence)
- ⚔️ **Combat:** 100% (start, turns, HP, end)
- 🎯 **Dashboard:** 100% (stats, navigation)

#### Tempo Estimado
4-5 dias

---

### Story 4: WEEK2.4 - Unit Tests Critical Routes
**Arquivo:** `/docs/stories/WEEK2.4.unit-tests-critical-routes.md`
**Story Points:** 5
**Status:** Pending
**Prioridade:** Alta
**Dependência:** WEEK2.2 (Jest Setup)

#### Objetivo
Implementar testes unitários para as 10 rotas/componentes mais críticos.

#### Acceptance Criteria (14)
**Backend API Tests (21 tests):**
1. ✅ Characters API (5 tests: CRUD + validation)
2. ✅ Tables API (5 tests: CRUD + invite codes)
3. ✅ Messages API (3 tests: create + pagination)
4. ✅ Combat API (4 tests: start + turns + update)
5. ✅ Dice API (4 tests: validation + calculation)

**Frontend Component Tests (17 tests):**
6. ✅ DashboardContent (4 tests: fetch + error + retry)
7. ✅ CharacterCreation (4 tests: validation + submit)
8. ✅ TableBrowser (3 tests: filter + pagination)
9. ✅ DiceRoller (3 tests: input + result)
10. ✅ CombatTracker (3 tests: initiative + turns)

**Qualidade:**
- ✅ Total: 38+ unit tests
- ✅ All isolated (mocked dependencies)
- ✅ Fast execution (<30s total)
- ✅ Coverage >70% para arquivos testados

#### Entregáveis
```
/apps/api/__tests__/routes/
  ├── characters.routes.test.ts (5 tests)
  ├── tables.routes.test.ts (5 tests)
  ├── messages.routes.test.ts (3 tests)
  ├── combat.routes.test.ts (4 tests)
  └── dice.routes.test.ts (4 tests)

/apps/web/__tests__/components/
  ├── dashboard-content.test.tsx (4 tests)
  ├── character-creation.test.tsx (4 tests)
  ├── table-browser.test.tsx (3 tests)
  ├── dice-roller.test.tsx (3 tests)
  └── combat-tracker.test.tsx (3 tests)
```

#### Cobertura de Código
- **Backend API Routes:** >70%
- **Frontend Components:** >70%
- **Utilities:** >60%
- **Overall Target:** >65%

#### Tempo Estimado
4-5 dias

---

## 📅 CRONOGRAMA SUGERIDO

### Abordagem Paralela (Mais Rápida - 7 dias)
```
Dias 1-2: WEEK2.1 (Playwright Setup) + WEEK2.2 (Jest Setup) em paralelo
Dias 3-5: WEEK2.3 (E2E Tests) + WEEK2.4 (Unit Tests) em paralelo
Dias 6-7: Bug fixes, otimização, documentação
```

### Abordagem Sequencial (Mais Segura - 10 dias)
```
Dias 1-3: WEEK2.1 (Playwright Setup)
Dias 4-5: WEEK2.2 (Jest Setup)
Dias 6-8: WEEK2.3 (E2E Tests)
Dias 9-10: WEEK2.4 (Unit Tests)
```

**Recomendação:** **Abordagem Paralela** se tivermos 2 devs disponíveis, **Sequencial** se apenas 1 dev.

---

## 🎯 DEFINITION OF DONE - SPRINT WEEK2

### Infraestrutura
- [x] Playwright configurado e funcional
- [x] Jest configurado em web + api
- [x] Todos scripts npm funcionando
- [x] CI-ready (pode rodar em GitHub Actions)

### Testes
- [x] 10 E2E tests passando
- [x] 38+ unit tests passando
- [x] Pass rate >95% (consistente)
- [x] Execution time <6 min total

### Qualidade
- [x] Code coverage >70% em código crítico
- [x] Zero testes flaky (após 10 runs)
- [x] Screenshots/traces configurados
- [x] HTML reports gerados

### Documentação
- [x] README atualizado com comandos de teste
- [x] Troubleshooting guide para testes
- [x] Contributing guide menciona testes

---

## 🚨 RISCOS E MITIGAÇÕES

### Risco 1: Testes Flaky (WebSocket, Timing)
**Probabilidade:** Alta
**Impacto:** Médio (testes não confiáveis)
**Mitigação:**
- Usar Playwright auto-wait (não setTimeout)
- Timeout maior para WebSocket (10s)
- Retry mechanism (max 2x em CI)
- Desabilitar animations em modo test

### Risco 2: Mocks Desatualizados
**Probabilidade:** Média
**Impacto:** Alto (testes passam, código quebrado)
**Mitigação:**
- E2E tests complementam (testam integração real)
- Review mocks periodicamente
- Usar tipos TypeScript nos mocks
- Integration tests contra staging ocasionalmente

### Risco 3: Slow Test Execution
**Probabilidade:** Média
**Impacto:** Médio (feedback loop lento)
**Mitigação:**
- Parallel execution (3-4 workers)
- Mock todas chamadas externas
- Otimizar setup/teardown
- CI cache de node_modules

### Risco 4: Test Data Pollution
**Probabilidade:** Baixa
**Impacto:** Alto (testes falhando aleatoriamente)
**Mitigação:**
- Test users com domínio específico (@iarpg.local)
- Cleanup hooks (afterEach, afterAll)
- Database isolado para testes
- Unique IDs por test run

---

## 📊 MÉTRICAS DE PROGRESSO

### Tracking Durante Sprint
```bash
# Executar todos testes
pnpm test:e2e          # E2E tests
pnpm test              # Unit tests (all workspaces)
pnpm test:coverage     # Coverage report

# Verificar métricas
Total Tests: 48+
Pass Rate: >95%
Execution Time: <6 min
Coverage: >70%
```

### Daily Checklist
- [ ] Todos novos testes passam localmente
- [ ] Nenhum teste flaky detectado (run 3x)
- [ ] Coverage não diminuiu
- [ ] Execution time não aumentou >20%
- [ ] CI build passing (se configurado)

---

## 🎓 RECURSOS E REFERÊNCIAS

### Documentação
- [Playwright Docs](https://playwright.dev/docs/intro)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Supertest](https://github.com/ladjs/supertest)

### Tutoriais Recomendados
- [Testing Next.js Apps](https://nextjs.org/docs/app/building-your-application/testing)
- [Playwright Best Practices](https://playwright.dev/docs/best-practices)
- [Jest Best Practices](https://jestjs.io/docs/en/best-practices)

### Templates de Código
- Auth Fixture: `e2e/fixtures/auth.fixture.ts`
- Test Utils: `__tests__/utils/test-utils.tsx`
- Mock Supabase: `__tests__/mocks/supabase.mock.ts`

---

## ✅ PRÓXIMOS PASSOS IMEDIATOS

### Hoje (5 Out)
1. ✅ Revisar estas 4 stories criadas
2. ⏭️ Iniciar WEEK2.1 (Playwright Setup)
3. ⏭️ Iniciar WEEK2.2 (Jest Setup) - pode ser paralelo

### Amanhã (6 Out)
4. ⏭️ Completar setup Playwright
5. ⏭️ Completar setup Jest
6. ⏭️ Escrever primeiros 3 testes E2E

### Esta Semana (até 12 Out)
7. ⏭️ Completar todos 10 E2E tests
8. ⏭️ Completar todos 38+ unit tests
9. ⏭️ Atingir >70% coverage
10. ⏭️ Fix any flaky tests

---

## 🎬 COMANDOS RÁPIDOS

```bash
# Setup (executar uma vez)
cd apps/web
pnpm add -D @playwright/test
npx playwright install

cd ../api
pnpm add -D jest ts-jest supertest

# Desenvolvimento
pnpm test:e2e:ui       # Playwright UI mode (visual debugger)
pnpm test:watch        # Jest watch mode (auto-rerun)
pnpm test:coverage     # Coverage report

# CI / Validação
pnpm test:e2e          # Run all E2E tests
pnpm test              # Run all unit tests
pnpm test:e2e --reporter=html  # Generate HTML report
```

---

**Preparado por:** Sarah (Product Owner)
**Data:** 5 de Outubro, 2025
**Próxima Revisão:** 12 de Outubro (fim do sprint)

**Status:** 🟢 Pronto para Execução

---

## 🚀 Let's Build Quality In!

Estas 4 stories estabelecem a fundação de qualidade do IA-RPG. Com 48+ testes automatizados, teremos confiança para deployar features rapidamente sem quebrar funcionalidades existentes.

**MVP Production-Ready em 3 semanas!** 🎯
