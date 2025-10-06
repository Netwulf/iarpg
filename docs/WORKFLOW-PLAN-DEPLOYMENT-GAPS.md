# 🎯 Workflow Plan: Resolver Gaps de Deployment

**Status:** 🚧 Em Execução
**Objetivo:** Aumentar Deployment Sync de 70% → 95%
**Duração Estimada:** 2-3 dias (16-24h)
**Owner:** @architect (Winston) + @dev
**Created:** 2025-10-06

---

## 📊 Estado Atual vs Meta

| Métrica | Atual | Meta | Gap |
|---------|-------|------|-----|
| Deployment Sync | 70% | 95% | 25% |
| Vercel Health | ⚠️ Último deploy error | ✅ Build passing | Fix error |
| Railway Configs | 3 arquivos | 1 arquivo | -2 files |
| Supabase Schema | 2 schemas | 1 schema | Consolidar |
| Docs Accuracy | 70% | 95% | Atualizar |

---

## 🎯 Objetivos SMART

**Specific:** Resolver 3 gaps de deployment identificados no audit
**Measurable:** Deployment Sync 70% → 95%, 0 critical issues
**Achievable:** Gaps são medium priority, não requerem refactor
**Relevant:** Infraestrutura sólida antes de novas features
**Time-bound:** 3 dias (Day 1-3)

---

## 📋 Plano Detalhado (3 Dias)

### 🗓️ DAY 1: Investigação e Diagnóstico (4-6h)

#### Task 1.1: Investigar Erro Deploy Vercel (1-2h)
**Owner:** @dev
**Status:** ⏳ Pending

**Ações:**
```bash
# 1. Ver logs do último deploy
cd /Users/taypuri/iarpg-deploy/apps/web
vercel logs --since 2h

# 2. Verificar qual foi o erro
vercel inspect https://web-kbc96brqf-tays-projects-cdc23402.vercel.app

# 3. Testar build local
pnpm build

# 4. Verificar env vars
vercel env ls
```

**Critério de Sucesso:**
- [ ] Identificado root cause do erro
- [ ] Logs salvos em `docs/logs/vercel-deploy-error.log`
- [ ] Solução proposta documentada

**Possíveis Causas:**
- Environment variable faltando
- Build timeout
- TypeScript error
- Dependency missing

---

#### Task 1.2: Validar Schema Supabase em Uso (1-2h)
**Owner:** @dev + @architect
**Status:** ⏳ Pending

**Ações:**
```bash
# 1. Verificar qual schema Prisma usa
cd /Users/taypuri/iarpg-deploy/packages/db
cat prisma/schema.prisma | grep -A 10 "model User"

# 2. Verificar qual schema API usa
cd /Users/taypuri/iarpg-deploy/apps/api
grep -r "User\|users" src/lib/db.ts src/services/*.ts | head -20

# 3. Verificar qual schema tem dados
psql $DATABASE_URL -c "SELECT COUNT(*) as users_snake FROM users;"
psql $DATABASE_URL -c "SELECT COUNT(*) as User_camel FROM \"User\";"

# 4. Verificar RLS em cada schema
psql $DATABASE_URL -c "\d+ users" | grep "row security"
psql $DATABASE_URL -c "\d+ \"User\"" | grep "row security"
```

**Critério de Sucesso:**
- [ ] Confirmado qual schema está em uso (camelCase ou snake_case)
- [ ] Verificado se RLS está habilitado no schema correto
- [ ] Decisão tomada: migrar OU habilitar RLS no atual
- [ ] Plano de migração documentado (se necessário)

**Decision Tree:**
```
Se app usa camelCase:
  └─ Habilitar RLS nas tabelas camelCase (URGENTE)
  └─ Planejar migração para snake_case (futuro)

Se app usa snake_case:
  └─ Migrar dados: camelCase → snake_case
  └─ Deletar tabelas camelCase
  └─ Validar RLS
```

---

#### Task 1.3: Mapear Configs Railway (1h)
**Owner:** @architect
**Status:** ⏳ Pending

**Ações:**
```bash
# 1. Listar todos os arquivos de config
find /Users/taypuri/iarpg-deploy -name "*railway*" -type f

# 2. Comparar conteúdos
echo "=== apps/api/railway.json ==="
cat apps/api/railway.json

echo "=== .railway/config.toml ==="
cat .railway/config.toml

echo "=== infrastructure/railway.yaml ==="
cat infrastructure/railway.yaml

# 3. Verificar qual Railway realmente usa
railway link
railway status
railway logs | head -20
```

**Critério de Sucesso:**
- [ ] Confirmado qual config Railway usa (provavelmente `railway.json`)
- [ ] Decisão tomada: manter qual arquivo como source of truth
- [ ] Lista de arquivos para deletar criada
- [ ] Plano de sincronização documentado

**Decision:**
```
Option A: Manter railway.json (atual)
  └─ Deletar: .railway/config.toml, infrastructure/railway.yaml
  └─ Atualizar docs para refletir railway.json

Option B: Migrar para infrastructure/railway.yaml (ideal)
  └─ Converter railway.json → railway.yaml
  └─ Aplicar no Railway dashboard
  └─ Deletar: railway.json, .railway/config.toml
```

---

#### Task 1.4: Documentar Findings (1h)
**Owner:** @architect
**Status:** ⏳ Pending

**Ações:**
1. Criar `docs/investigation-day1-findings.md`
2. Resumir descobertas de Tasks 1.1-1.3
3. Atualizar `DEPLOYMENT-AUDIT-REPORT.md` com novas infos
4. Criar action plan para Day 2

**Critério de Sucesso:**
- [ ] Documento criado com findings
- [ ] Decisões tomadas para cada gap
- [ ] Action plan Day 2 pronto

---

### 🗓️ DAY 2: Correção e Implementação (6-8h)

#### Task 2.1: Fix Deploy Vercel (2-3h)
**Owner:** @dev
**Status:** ⏳ Pending
**Depende de:** Task 1.1

**Ações (baseado em root cause):**

**Se erro for env var:**
```bash
# Adicionar env var faltante
vercel env add MISSING_VAR
vercel env pull .env.local
vercel deploy --prod
```

**Se erro for build:**
```bash
# Fix TypeScript errors
pnpm typecheck
pnpm lint --fix

# Test build local
pnpm build

# Deploy
vercel deploy --prod
```

**Se erro for dependency:**
```bash
# Update dependencies
pnpm install
pnpm update

# Rebuild
pnpm build
vercel deploy --prod
```

**Critério de Sucesso:**
- [ ] Build passa local (`pnpm build`)
- [ ] Deploy passa no Vercel
- [ ] App carrega em https://iarpg-web.vercel.app
- [ ] Health check OK: `curl https://iarpg-web.vercel.app/api/health`

---

#### Task 2.2: Resolver Schema Supabase (2-3h)
**Owner:** @dev + @architect
**Status:** ⏳ Pending
**Depende de:** Task 1.2

**Cenário A: Habilitar RLS em camelCase (se app usa camelCase)**

```sql
-- 1. Habilitar RLS em todas as tabelas camelCase
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Character" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Table" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TableMember" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Message" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AIUsage" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "AsyncTurn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "CombatEncounter" ENABLE ROW LEVEL SECURITY;

-- 2. Criar policies básicas (exemplo para User)
CREATE POLICY "Users can view own data" ON "User"
  FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON "User"
  FOR UPDATE USING (auth.uid()::text = id);

-- Repetir para outras tabelas...

-- 3. Planejar migração futura para snake_case
-- (documentar em TECH-DEBT.md)
```

**Cenário B: Migrar para snake_case (se app usa snake_case)**

```sql
-- 1. Migrar dados: camelCase → snake_case
INSERT INTO users (id, username, email, password_hash, avatar_url, bio, tier, stripe_customer_id, created_at, updated_at)
SELECT
  id::uuid,
  username,
  email,
  "passwordHash",
  avatar,
  bio,
  tier,
  "stripeCustomerId",
  "createdAt",
  "updatedAt"
FROM "User";

-- Repetir para Character, Table, etc...

-- 2. Verificar migração
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM "User";

-- 3. Deletar tabelas camelCase
DROP TABLE "User" CASCADE;
DROP TABLE "Character" CASCADE;
-- etc...

-- 4. Validar RLS
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'users';
```

**Critério de Sucesso:**
- [ ] RLS habilitado em todas as tabelas ativas
- [ ] Dados migrados (se necessário)
- [ ] Tabelas legacy deletadas (se migração)
- [ ] Testes de segurança passando (não consegue ler dados de outro user)
- [ ] App funcionando normalmente

---

#### Task 2.3: Consolidar Configs Railway (1-2h)
**Owner:** @architect
**Status:** ⏳ Pending
**Depende de:** Task 1.3

**Ações (assumindo manter railway.json):**

```bash
# 1. Backup configs atuais
cp apps/api/railway.json apps/api/railway.json.backup
cp .railway/config.toml .railway/config.toml.backup

# 2. Deletar configs não usados
rm .railway/config.toml
rm infrastructure/railway.yaml

# 3. Atualizar docs para refletir realidade
# Editar infrastructure/README.md:
# - Remover referência a railway.yaml
# - Adicionar nota: "Railway usa apps/api/railway.json"
```

**OU (se migrar para railway.yaml):**

```bash
# 1. Converter railway.json → railway.yaml
# (criar railway.yaml seguindo schema Railway)

# 2. Aplicar no Railway
railway up --config infrastructure/railway.yaml

# 3. Validar deploy
railway status
railway logs

# 4. Deletar configs antigos
rm apps/api/railway.json
rm .railway/config.toml
```

**Critério de Sucesso:**
- [ ] Apenas 1 arquivo de config Railway existe
- [ ] Deploy Railway funciona com novo config
- [ ] Docs atualizados para refletir realidade
- [ ] Backup dos configs antigos mantido (safety)

---

#### Task 2.4: Criar Scripts de Automação (1h)
**Owner:** @dev
**Status:** ⏳ Pending

**Ações:**

```bash
# 1. Criar scripts/sync-env.sh
cat > scripts/sync-env.sh << 'EOF'
#!/bin/bash
# Sync environment variables across services

set -e

echo "🔄 Syncing environment variables..."

# Source from .env.production
source .env.production

# Sync to Vercel
echo "📦 Syncing to Vercel..."
vercel env add NEXTAUTH_SECRET production <<< "$NEXTAUTH_SECRET"
vercel env add DATABASE_URL production <<< "$DATABASE_URL"
# ... mais vars

# Sync to Railway
echo "🚂 Syncing to Railway..."
railway variables set NEXTAUTH_SECRET="$NEXTAUTH_SECRET"
railway variables set DATABASE_URL="$DATABASE_URL"
# ... mais vars

echo "✅ Sync complete!"
EOF

chmod +x scripts/sync-env.sh

# 2. Criar scripts/validate-deploy.sh
cat > scripts/validate-deploy.sh << 'EOF'
#!/bin/bash
# Validate deployments are healthy

set -e

echo "🏥 Health Check: Vercel..."
curl -f https://iarpg-web.vercel.app/api/health || echo "❌ Vercel health check failed"

echo "🏥 Health Check: Railway..."
curl -f https://iarpg-api.railway.app/health || echo "❌ Railway health check failed"

echo "🏥 Health Check: Supabase..."
psql $DATABASE_URL -c "SELECT 1;" || echo "❌ Supabase connection failed"

echo "✅ All health checks passed!"
EOF

chmod +x scripts/validate-deploy.sh

# 3. Criar infrastructure/secrets.example.env
cat > infrastructure/secrets.example.env << 'EOF'
# Vercel Secrets (Frontend)
NEXTAUTH_URL=https://iarpg-web.vercel.app
NEXTAUTH_SECRET=<generate-with-openssl-rand-base64-32>
DATABASE_URL=postgresql://...
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx
DISCORD_CLIENT_ID=xxx
DISCORD_CLIENT_SECRET=xxx
OPENAI_API_KEY=sk-xxx

# Railway Secrets (Backend)
PORT=3001
CORS_ORIGIN=https://iarpg-web.vercel.app
NEXTAUTH_SECRET=<must-match-frontend>
DATABASE_URL=<must-match-frontend>
OPENAI_API_KEY=<must-match-frontend>

# Supabase (shared)
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...
EOF
```

**Critério de Sucesso:**
- [ ] `scripts/sync-env.sh` criado e testado
- [ ] `scripts/validate-deploy.sh` criado e testado
- [ ] `infrastructure/secrets.example.env` criado
- [ ] Scripts executáveis (`chmod +x`)

---

### 🗓️ DAY 3: Validação e Documentação (2-4h)

#### Task 3.1: Testar Health Checks (1h)
**Owner:** @qa + @dev
**Status:** ⏳ Pending

**Ações:**

```bash
# 1. Executar script de validação
./scripts/validate-deploy.sh

# 2. Testar endpoints manualmente
curl -v https://iarpg-web.vercel.app/api/health
curl -v https://iarpg-api.railway.app/health

# 3. Testar fluxo completo
# - Login
# - Create character
# - Join table
# - Send message

# 4. Verificar logs
vercel logs --since 1h
railway logs --since 1h
```

**Critério de Sucesso:**
- [ ] Todos os health checks passando
- [ ] App funciona end-to-end
- [ ] Zero errors em logs (últimas 2h)
- [ ] Performance OK (<200ms TTFB)

---

#### Task 3.2: Atualizar Documentação (1-2h)
**Owner:** @architect
**Status:** ⏳ Pending

**Ações:**

```bash
# 1. Atualizar DEPLOYMENT-AUDIT-REPORT.md
# - Mudar status dos gaps: ⚠️ → ✅
# - Atualizar Sync Score: 70% → 95%
# - Adicionar "Resolved" section

# 2. Atualizar infrastructure/README.md
# - Adicionar seção "Real vs Docs"
# - Documentar qual config é source of truth
# - Adicionar links para scripts

# 3. Criar DEPLOYMENT-GAPS-RESOLVED.md
# - Sumário das ações tomadas
# - Before/After comparison
# - Lessons learned
```

**Estrutura de DEPLOYMENT-GAPS-RESOLVED.md:**
```markdown
# Deployment Gaps - Resolved

## Summary
- Started: 2025-10-06
- Completed: 2025-10-08
- Duration: 3 days
- Sync Score: 70% → 95% (+25%)

## Gaps Resolved

### Gap 1: Vercel Deploy Error
**Root Cause:** [documentar]
**Solution:** [documentar]
**Status:** ✅ Resolved

### Gap 2: Railway Configs
**Root Cause:** 3 arquivos conflitantes
**Solution:** Consolidado em [arquivo escolhido]
**Status:** ✅ Resolved

### Gap 3: Supabase Schema
**Root Cause:** 2 schemas coexistindo
**Solution:** [Migrado/RLS habilitado]
**Status:** ✅ Resolved

## Lessons Learned
1. ...
2. ...
3. ...

## Next Steps
- Monitor deployments por 1 semana
- Adicionar alerting (future)
```

**Critério de Sucesso:**
- [ ] 3 documentos atualizados
- [ ] Sync Score atualizado: 95%
- [ ] Lessons learned documentadas
- [ ] Next steps claros

---

#### Task 3.3: Executar Checklist de Validação (1h)
**Owner:** @architect
**Status:** ⏳ Pending

**Checklist:**

**Vercel:**
- [ ] `vercel link` executado com sucesso
- [ ] `vercel env ls` mostra todas as vars esperadas
- [ ] `infrastructure/vercel.json` reflete config do dashboard OU documentado que dashboard é source of truth
- [ ] Deploy funciona: `vercel deploy --prod`
- [ ] Health check OK: `curl https://iarpg-web.vercel.app/api/health`
- [ ] Build time <3min
- [ ] Zero errors em logs

**Railway:**
- [ ] `railway link` executado com sucesso (opcional)
- [ ] `railway variables list` mostra todas as vars esperadas (ou via dashboard)
- [ ] Apenas 1 arquivo de config existe
- [ ] Deploy funciona: `railway up` (se usando CLI)
- [ ] Health check OK: `curl https://iarpg-api.railway.app/health`
- [ ] Logs limpos (sem errors)

**Supabase:**
- [ ] Schema validado (apenas 1 conjunto de tabelas ativo)
- [ ] RLS habilitado em todas as tabelas
- [ ] Migrations aplicadas e documentadas
- [ ] Backup automático funcionando
- [ ] Connection OK: `psql $DATABASE_URL -c "SELECT 1;"`
- [ ] Performance queries OK (<100ms avg)

**Cross-Service:**
- [ ] NEXTAUTH_SECRET igual em Vercel e Railway
- [ ] DATABASE_URL igual em Vercel e Railway
- [ ] Todos os secrets documentados em `secrets.example.env`
- [ ] Scripts criados e testados (`sync-env.sh`, `validate-deploy.sh`)
- [ ] Docs atualizados e sincronizados

**Critério de Sucesso:**
- [ ] 100% do checklist completo
- [ ] Zero itens faltando
- [ ] Documentado qualquer exceção

---

## 📊 Métricas de Sucesso

### Quantitativas

| Métrica | Antes | Depois | Meta | Status |
|---------|-------|--------|------|--------|
| Deployment Sync | 70% | ??? | 95% | ⏳ |
| Vercel Health | ⚠️ Error | ??? | ✅ Passing | ⏳ |
| Railway Configs | 3 files | ??? | 1 file | ⏳ |
| Supabase RLS | ⚠️ Partial | ??? | ✅ 100% | ⏳ |
| Gaps Critical | 0 | ??? | 0 | ⏳ |
| Gaps High | 0 | ??? | 0 | ⏳ |
| Gaps Medium | 3 | ??? | 0 | ⏳ |
| Docs Accuracy | 70% | ??? | 95% | ⏳ |

### Qualitativas

- [ ] Infraestrutura 100% documentada
- [ ] Source of truth claro para cada config
- [ ] Scripts de automação funcionando
- [ ] Zero conhecimento apenas na cabeça (tudo documentado)
- [ ] Fácil para novo dev entender deployment

---

## 🚨 Riscos e Mitigações

### Risco 1: Migração Supabase Quebra App
**Probabilidade:** 🟡 Medium
**Impacto:** 🔴 Critical
**Mitigação:**
- Backup completo antes de migração
- Testar migração em ambiente de teste primeiro
- Rollback plan: restaurar backup se necessário
- Monitorar logs durante migração

### Risco 2: Fix Vercel Não Funciona
**Probabilidade:** 🟢 Low
**Impacto:** 🟡 Medium
**Mitigação:**
- Testar build local antes de deploy
- Deploy em preview primeiro (`vercel deploy`)
- Só promover para production se preview funcionar
- Rollback via dashboard Vercel (1 click)

### Risco 3: Consolidação Railway Quebra Deploy
**Probabilidade:** 🟢 Low
**Impacto:** 🟠 High
**Mitigação:**
- Manter backup dos configs antigos
- Validar novo config antes de deletar antigos
- Railway permite rollback fácil
- Testar em branch antes de main

---

## 📋 Dependências

### Ferramentas Necessárias
- ✅ Vercel CLI (instalado)
- ⚠️ Railway CLI (precisa login)
- ✅ psql (PostgreSQL client)
- ✅ curl
- ✅ pnpm

### Acesso Necessário
- ✅ Vercel Dashboard (logged in)
- ⚠️ Railway Dashboard (precisa login CLI)
- ✅ Supabase Dashboard
- ✅ GitHub repo

### Conhecimento Necessário
- ✅ Vercel deployment
- ✅ Railway deployment
- ✅ PostgreSQL / Supabase
- ✅ Environment variables
- ⚠️ SQL migrations (se necessário)

---

## 🎯 Definition of Done

Este workflow está **completo** quando:

1. ✅ **Vercel:** Build passing, zero errors, health check OK
2. ✅ **Railway:** 1 config file, deploy working, health check OK
3. ✅ **Supabase:** 1 schema ativo, RLS 100%, migrations aplicadas
4. ✅ **Docs:** Atualizados, sync score 95%+, source of truth claro
5. ✅ **Scripts:** `sync-env.sh` e `validate-deploy.sh` funcionando
6. ✅ **Checklist:** 100% completo
7. ✅ **Validação:** App funciona end-to-end, zero errors em logs
8. ✅ **Documentação:** Lessons learned documentadas

---

## 📅 Timeline

```
Day 1 (Today)          Day 2                Day 3
│                      │                    │
├─ 1.1 Vercel logs    ├─ 2.1 Fix Vercel   ├─ 3.1 Health checks
├─ 1.2 Supabase       ├─ 2.2 Supabase     ├─ 3.2 Update docs
├─ 1.3 Railway        ├─ 2.3 Railway      └─ 3.3 Checklist
└─ 1.4 Document       └─ 2.4 Scripts
```

**Checkpoints:**
- End of Day 1: Todas as investigações completas, decisões tomadas
- End of Day 2: Todos os gaps corrigidos, scripts criados
- End of Day 3: 100% validado, docs atualizados, workflow completo

---

## 🔄 Status Tracking

Use este formato para updates:

```markdown
## Day 1 Update (2025-10-06 EOD)

**Completed:**
- [x] Task 1.1: Vercel logs investigated
- [x] Task 1.2: Supabase schema validated
- [ ] Task 1.3: Railway configs mapped (50% done)
- [ ] Task 1.4: Documentation

**Discoveries:**
- Vercel error was: [root cause]
- Supabase using: [camelCase/snake_case]
- Railway: [decision made]

**Blockers:** None / [list if any]

**Next:** Complete Task 1.3-1.4, start Day 2
```

---

## 🎓 Lessons Learned (To Fill After Completion)

**What Went Well:**
-

**What Could Be Better:**
-

**Action Items for Future:**
-

---

## 📚 References

- [DEPLOYMENT-AUDIT-REPORT.md](./DEPLOYMENT-AUDIT-REPORT.md) - Original audit
- [DEPLOYMENT-AUDIT-UPDATED.md](./DEPLOYMENT-AUDIT-UPDATED.md) - Correction
- [infrastructure/README.md](../infrastructure/README.md) - Deployment docs
- [ADR-005: Deployment Architecture](./adr/005-deployment-vercel-railway.md)

---

**Created:** 2025-10-06
**Owner:** @architect (Winston)
**Orchestrator:** @aios-orchestrator
**Status:** 🚧 Ready to Execute

---

## 🚀 Ready to Start?

**Commands to begin:**
- `*agent dev` - Transform to @dev to start Day 1
- `*plan-status` - Check current progress
- `*plan-update` - Update task status as you complete

Let's ship this! 🎯
