# Deployment Audit Report - IA-RPG

**Status:** ⚠️ **GAPS IDENTIFICADOS**
**Data:** 2025-10-06
**Auditor:** @architect (Winston)

---

## Sumário Executivo

Realizei auditoria completa dos deployments em produção (Vercel, Railway, Supabase) comparando com a documentação criada em `infrastructure/`. Identifiquei **gaps significativos** que precisam ser resolvidos para manter sincronização entre docs e realidade.

### Score de Sincronização

| Serviço | Config Real | Config Docs | Sincronização | Status |
|---------|-------------|-------------|---------------|--------|
| **Vercel** | ❓ Não linkado | ✅ Documentado | ⚠️ 40% | 🟠 Dessincrono |
| **Railway** | ✅ Deployado | ✅ Documentado | ⚠️ 60% | 🟠 Parcial |
| **Supabase** | ✅ Ativo | ✅ Documentado | ⚠️ 50% | 🟠 Parcial |
| **Overall** | | | **⚠️ 50%** | **🟠 NEEDS WORK** |

---

## 1. Vercel (Frontend)

### ✅ Documentação Criada

**Arquivo:** `infrastructure/vercel.json` (70 linhas)

Configuração documentada:
- ✅ Build command: `pnpm build`
- ✅ Environment variables schema completo
- ✅ Headers de segurança
- ✅ Redirects para API (Railway)
- ✅ Regions configuradas (iad1)

### ❌ Realidade no Ambiente

**Descoberta:** Projeto **NÃO está linkado** ao Vercel CLI

```bash
$ vercel env ls
Error: Your codebase isn't linked to a project on Vercel.
Run `vercel link` to begin.
```

**Evidências:**
- `.vercel/project.json` existe mas aponta para projeto diferente:
  - `projectId`: "prj_qnQUOJsyedoJNNPIvnJygstBPwyP"
  - `projectName`: "iarpg-deploy"
- Tentativa de listar env vars falhou

### 🔴 Gaps Identificados

#### Gap 1.1: Vercel Project Não Linkado
**Severidade:** 🔴 Critical
**Impacto:** Não conseguimos gerenciar env vars via CLI

**Ação Necessária:**
```bash
cd /Users/taypuri/iarpg-deploy/apps/web
vercel link
# Selecionar projeto correto
vercel env pull .env.local
```

#### Gap 1.2: Config Real vs Docs
**Severidade:** 🟡 Medium
**Impacto:** `infrastructure/vercel.json` nunca foi usado em deploy

**Arquivo Real:** Vercel usa config do dashboard, não do `vercel.json`

**Ação Necessária:**
1. Verificar config no dashboard Vercel
2. Atualizar `infrastructure/vercel.json` para refletir realidade
3. OU aplicar `infrastructure/vercel.json` no dashboard

#### Gap 1.3: Arquivos de Env Múltiplos
**Descoberta:** `apps/web/` tem múltiplos `.env*`:
```
.env.local           (1028 bytes)
.env.local.example   (481 bytes)
.env.production.local (2420 bytes)
.env.vercel          (2420 bytes)
.env.test            (422 bytes)
```

**Problema:** Não documentado qual é usado em produção

**Ação Necessária:** Documentar em `infrastructure/README.md` qual env é usado quando

---

## 2. Railway (Backend)

### ✅ Documentação Criada

**Arquivo:** `infrastructure/railway.yaml` (100 linhas)

Configuração documentada:
- ✅ Build: NIXPACKS
- ✅ Start command: `pnpm start`
- ✅ Health check: `/health` endpoint
- ✅ Resources: 512MB RAM, 1 vCPU
- ✅ Restart policy: ON_FAILURE

### ⚠️ Realidade no Ambiente

**Descoberta:** 2 arquivos de config conflitantes:

#### Config 1: `apps/api/railway.json` (REAL - usado em deploy)
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "npm run start",  ⚠️ npm, não pnpm!
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### Config 2: `.railway/config.toml` (legacy?)
```toml
[build]
builder = "dockerfile"
dockerfilePath = "Dockerfile"

[deploy]
startCommand = "pnpm --filter=api start"
restartPolicyType = "on_failure"
restartPolicyMaxRetries = 10
```

#### Config 3: `infrastructure/railway.yaml` (DOCS - nunca usado)
```yaml
build:
  builder: NIXPACKS
  buildCommand: pnpm build
  startCommand: pnpm start  ⚠️ Diferente do real!
```

### 🟠 Gaps Identificados

#### Gap 2.1: Configs Conflitantes
**Severidade:** 🟠 High
**Impacto:** 3 arquivos diferentes, não sabemos qual é usado

**Realidade:**
- Railway usa `apps/api/railway.json` (confirmado)
- `.railway/config.toml` parece legacy (dockerfile builder)
- `infrastructure/railway.yaml` nunca foi aplicado

**Ação Necessária:**
1. ✅ Confirmar qual config Railway realmente usa (provavelmente `railway.json`)
2. ⚠️ Deletar ou marcar `.railway/config.toml` como legacy
3. ⚠️ Atualizar `infrastructure/railway.yaml` para refletir `railway.json`
4. ⚠️ OU mover `railway.json` para seguir `infrastructure/railway.yaml`

#### Gap 2.2: Start Command Discrepância
**Severidade:** 🟡 Medium
**Impacto:** Docs dizem "pnpm", real usa "npm"

**Real:** `npm run start` (railway.json)
**Docs:** `pnpm start` (infrastructure/railway.yaml)

**Ação Necessária:** Decidir qual usar e sincronizar

#### Gap 2.3: Railway CLI Não Linkado
**Descoberta:** `railway status` falha:
```bash
No linked project found. Run railway link to connect to a project
```

**Mas:** Railway MCP conseguiu listar projeto:
- **Project:** "precious-unity" (ID: 5a15728b-740f-4dd3-a780-6b50826e3dc1)
- **Service:** "iarpg"
- **Status:** production (deployed)

**Ação Necessária:**
```bash
railway link
# Selecionar "precious-unity"
railway status
```

---

## 3. Supabase (Database)

### ✅ Documentação Criada

**Arquivo:** `infrastructure/supabase/config.toml` (120 linhas)

Configuração documentada:
- ✅ Auth settings (OAuth providers)
- ✅ Database settings (pool size, timeout)
- ✅ Storage buckets (avatars, maps)
- ✅ Backup retention (30 dias)
- ✅ RLS enabled

### ✅ Realidade no Ambiente

**Descoberta:** Projeto Supabase **ATIVO** e **SAUDÁVEL**

**Detalhes:**
- **Project:** "IARPG" (ID: ukxjmtdwgqiltrxglzda)
- **Region:** sa-east-1 (Brasil!)
- **Status:** ACTIVE_HEALTHY
- **DB Version:** PostgreSQL 17.6.1.011
- **Created:** 2025-10-02

**Schema Real:** 14 tabelas identificadas (conforme esperado!)

### 🟡 Gaps Identificados

#### Gap 3.1: Schema Duplicado (Prisma vs SQL)
**Severidade:** 🟡 Medium
**Impacto:** 2 schemas coexistindo (camelCase vs snake_case)

**Descoberta:** Supabase tem **2 conjuntos de tabelas**:

**Conjunto 1: snake_case (novo, correto)**
- `users` (4 rows) ✅
- `characters` (0 rows)
- `tables` (0 rows)
- `messages` (0 rows)
- `table_members` (0 rows)
- `combat_encounters` (0 rows)

**Conjunto 2: camelCase (legacy, Prisma antigo)**
- `User` (3 rows) ⚠️
- `Character` (2 rows) ⚠️
- `Table` (2 rows) ⚠️
- `Message` (0 rows)
- `TableMember` (6 rows) ⚠️
- `AIUsage` (0 rows)
- `AsyncTurn` (0 rows)
- `CombatEncounter` (0 rows)

**Problema:**
- Dados estão no schema **camelCase** (legacy)
- App provavelmente espera **snake_case** (novo)
- RLS habilitado apenas no snake_case

**Ação Necessária:**
1. ⚠️ Confirmar qual schema o app usa (provavelmente camelCase ainda)
2. ⚠️ Migrar dados: camelCase → snake_case
3. ⚠️ Deletar tabelas camelCase após migração
4. ⚠️ Habilitar RLS nas tabelas camelCase enquanto não migra

#### Gap 3.2: Migrations Não Aplicadas?
**Descoberta:** 2 migrations SQL no repositório:

**Migration 1:** `20250102000000_initial_schema.sql` (8731 bytes)
- Cria schema snake_case
- Provavelmente **JÁ APLICADA** (tabelas existem)

**Migration 2:** `20250104000000_create_missing_tables.sql` (5786 bytes)
- Cria `AsyncTurn`, `AIUsage`, etc.
- Provavelmente **NÃO APLICADA** ou aplicada com camelCase

**Ação Necessária:**
```bash
# Verificar qual schema Prisma usa
cat packages/db/prisma/schema.prisma | grep -A 5 "model User"

# Se usar camelCase, precisamos migrar para snake_case
# Se usar snake_case, precisamos migrar dados
```

#### Gap 3.3: Config.toml Nunca Usado
**Severidade:** 🟢 Low
**Impacto:** `infrastructure/supabase/config.toml` não está aplicado

**Descoberta:** Config.toml é para **Supabase CLI local**, não production

**Realidade:** Production usa config do **Supabase Dashboard**

**Ação Necessária:**
1. Documentar em `infrastructure/README.md` que config.toml é para dev local
2. Criar script para sincronizar dashboard → config.toml

---

## 4. Gaps Cross-Service

### Gap 4.1: Environment Variables Não Sincronizadas

**Problema:** Cada serviço tem .env separado, sem fonte única de verdade

**Arquivos Encontrados:**
```
apps/web/.env.local           (dev)
apps/web/.env.production.local (prod?)
apps/web/.env.vercel          (vercel specific)
apps/api/.env                 (dev)
packages/db/.env              (db only)
```

**Não documentado:**
- Qual .env é usado em produção?
- Como sincronizar secrets entre Vercel/Railway?
- Como rodar `railway variables set` para todas as vars?

**Ação Necessária:** Criar `scripts/sync-env.sh` para sincronizar

---

### Gap 4.2: Health Checks Não Documentados

**Descoberta:** Docs dizem `/health` endpoint, mas não validamos

**Ação Necessária:**
```bash
# Testar endpoints
curl https://iarpg-api.railway.app/health
curl https://iarpg-web.vercel.app/api/health
```

**Atualizar docs com:**
- Response esperado
- Timeout configurado
- O que cada health check valida

---

### Gap 4.3: Secrets Management Não Automatizado

**Problema:** Docs explicam `vercel env add` e `railway variables set` mas:
- ❌ Não temos lista de secrets necessários
- ❌ Não temos script para aplicar todos
- ❌ Não sabemos se secrets estão completos

**Ação Necessária:** Criar `infrastructure/secrets.example.env` com:
```bash
# Vercel Secrets (Frontend)
NEXTAUTH_URL=
NEXTAUTH_SECRET=
DATABASE_URL=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
DISCORD_CLIENT_ID=
DISCORD_CLIENT_SECRET=
OPENAI_API_KEY=

# Railway Secrets (Backend)
PORT=3001
CORS_ORIGIN=
NEXTAUTH_SECRET=  # Must match frontend!
DATABASE_URL=     # Must match frontend!
OPENAI_API_KEY=   # Must match frontend!
```

---

## 5. Recomendações Prioritizadas

### 🔴 Critical (Resolver Imediatamente)

1. **Link Vercel Project**
   ```bash
   cd apps/web && vercel link
   ```

2. **Link Railway Project**
   ```bash
   railway link
   ```

3. **Validar Schema Supabase**
   ```bash
   # Confirmar qual schema app usa
   psql $DATABASE_URL -c "\dt public.*"
   ```

---

### 🟠 High (Resolver esta semana)

4. **Sincronizar Configs Railway**
   - Decidir: manter `railway.json` ou migrar para `railway.yaml`?
   - Atualizar docs para refletir realidade
   - Deletar `.railway/config.toml` se legacy

5. **Documentar Env Vars**
   - Criar `infrastructure/secrets.example.env`
   - Documentar qual .env é usado quando
   - Criar script `scripts/sync-env.sh`

6. **Testar Health Checks**
   ```bash
   curl https://iarpg-api.railway.app/health
   curl https://iarpg-web.vercel.app/api/health
   ```
   - Documentar responses esperados

---

### 🟡 Medium (Resolver próximas 2 semanas)

7. **Migrar Schema Supabase (se necessário)**
   - Se app usa camelCase: OK, habilitar RLS
   - Se app usa snake_case: Migrar dados camelCase → snake_case

8. **Atualizar infrastructure/README.md**
   - Adicionar seção "Real vs Docs"
   - Documentar processos de sincronização
   - Adicionar troubleshooting

9. **Criar Scripts de Deploy**
   ```bash
   scripts/
   ├── deploy-vercel.sh      # vercel deploy --prod
   ├── deploy-railway.sh     # railway up
   ├── sync-env.sh           # Sync env vars
   └── validate-deploy.sh    # Test health checks
   ```

---

### 🟢 Low (Backlog)

10. **CI/CD Integration**
    - GitHub Actions para sync docs → reality
    - Alertas se configs divergirem

11. **Monitoring Dashboard**
    - Grafana/Datadog para métricas
    - Alertas automáticos

---

## 6. Action Plan

### Week 4 (Imediato)

**Day 1:**
- [ ] Link Vercel project (`vercel link`)
- [ ] Link Railway project (`railway link`)
- [ ] Testar health checks (curl endpoints)

**Day 2:**
- [ ] Validar schema Supabase (qual está em uso?)
- [ ] Listar env vars Vercel (`vercel env ls`)
- [ ] Listar env vars Railway (`railway variables list`)

**Day 3:**
- [ ] Criar `infrastructure/secrets.example.env`
- [ ] Atualizar `infrastructure/README.md` com "Real vs Docs"
- [ ] Decidir: railway.json vs railway.yaml

**Day 4-5:**
- [ ] Sincronizar configs (escolher source of truth)
- [ ] Deletar configs legacy
- [ ] Migrar dados Supabase se necessário

---

## 7. Matriz de Sincronização

| Config | Source of Truth | Status | Ação |
|--------|----------------|--------|------|
| **Vercel Build** | Dashboard | ⚠️ Docs desatualizados | Atualizar `vercel.json` |
| **Vercel Env Vars** | Dashboard | ❓ Não verificado | Run `vercel env ls` |
| **Railway Build** | `railway.json` | ⚠️ Docs diferentes | Atualizar `railway.yaml` |
| **Railway Env Vars** | Dashboard | ❓ Não verificado | Run `railway variables list` |
| **Supabase Schema** | Production DB | ⚠️ 2 schemas coexistem | Migrar ou habilitar RLS |
| **Supabase Config** | Dashboard | 🟢 Config.toml é dev-only | Documentar diferença |

---

## 8. Riscos Identificados

### Risco 1: Schema Duplicado (Supabase)
**Probabilidade:** 🔴 High
**Impacto:** 🔴 Critical
**Descrição:** App pode estar usando schema camelCase sem RLS, expondo dados

**Mitigação:**
1. Confirmar qual schema é usado HOJE
2. Habilitar RLS no schema correto IMEDIATAMENTE
3. Planejar migração se necessário

---

### Risco 2: Secrets Desincronizados
**Probabilidade:** 🟡 Medium
**Impacto:** 🟠 High
**Descrição:** NEXTAUTH_SECRET pode diferir entre Vercel/Railway, quebrando auth

**Mitigação:**
1. Listar todos os secrets em Vercel/Railway
2. Comparar valores (NEXTAUTH_SECRET, DATABASE_URL)
3. Sincronizar se necessário

---

### Risco 3: Configs Conflitantes (Railway)
**Probabilidade:** 🟡 Medium
**Impacto:** 🟡 Medium
**Descrição:** 3 arquivos de config podem causar comportamento inesperado

**Mitigação:**
1. Confirmar qual Railway realmente usa
2. Deletar configs não usados
3. Documentar choice

---

## 9. Checklist de Validação

Use este checklist após resolver gaps:

### Vercel
- [ ] `vercel link` executado com sucesso
- [ ] `vercel env ls` mostra todas as vars esperadas
- [ ] `infrastructure/vercel.json` reflete config do dashboard
- [ ] Deploy funciona: `vercel deploy --prod`
- [ ] Health check OK: `curl https://iarpg-web.vercel.app/api/health`

### Railway
- [ ] `railway link` executado com sucesso
- [ ] `railway variables list` mostra todas as vars esperadas
- [ ] Apenas 1 arquivo de config (deletar os outros)
- [ ] `infrastructure/railway.yaml` reflete `railway.json`
- [ ] Deploy funciona: `railway up`
- [ ] Health check OK: `curl https://iarpg-api.railway.app/health`

### Supabase
- [ ] Schema validado (apenas 1 conjunto de tabelas ativo)
- [ ] RLS habilitado em todas as tabelas
- [ ] Migrations aplicadas e documentadas
- [ ] Backup automático funcionando
- [ ] Connection OK: `psql $DATABASE_URL -c "SELECT 1;"`

### Cross-Service
- [ ] NEXTAUTH_SECRET igual em Vercel e Railway
- [ ] DATABASE_URL igual em Vercel e Railway
- [ ] Todos os secrets documentados em `secrets.example.env`
- [ ] Scripts de sync criados e testados

---

## 10. Conclusão

### Sumário

✅ **Boas Notícias:**
- Documentação `infrastructure/` foi criada e é abrangente
- Supabase está saudável e funcionando
- Railway está deployado e ativo

⚠️ **Más Notícias:**
- **50% de sincronização** entre docs e realidade
- Vercel project não está linkado
- Railway tem 3 configs conflitantes
- Supabase tem schema duplicado (RLS risk!)

### Próximos Passos

1. ✅ **Imediato (Day 1):** Link Vercel + Railway projects
2. ✅ **Imediato (Day 1):** Validar health checks
3. ⚠️ **Urgente (Day 2):** Confirmar schema Supabase e habilitar RLS se necessário
4. ⚠️ **Importante (Week 4):** Sincronizar configs e criar source of truth

### Status Final

**Compliance Score:** ⚠️ **50% (NEEDS WORK)**

**Recomendação:** Dedicar **Week 4** para sincronização completa antes de avançar.

---

## Referências

- [Infrastructure as Code Docs](../infrastructure/README.md)
- [ADR-005: Deployment Architecture](./adr/005-deployment-vercel-railway.md)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Supabase Docs](https://supabase.com/docs)

---

**Status:** ⚠️ **AUDIT COMPLETO - AÇÃO REQUERIDA**
**Próxima revisão:** Após resolver gaps críticos (Week 4)
**Auditor:** @architect (Winston)
