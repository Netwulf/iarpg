# IA-RPG Infrastructure as Code (IaC)

Este diretório contém toda a configuração de infraestrutura para o projeto IA-RPG, seguindo as práticas de **Infrastructure as Code (IaC)** documentadas no [ADR-005](../docs/adr/005-deployment-vercel-railway.md).

## Arquitetura de Deployment

```
Users
  ↓
Vercel Edge Network (CDN)
  ↓
Next.js App (Vercel)
  ↓ API calls
Railway (Express + Socket.io)
  ↓
Supabase (PostgreSQL)
```

## Arquivos de Configuração

### 1. Vercel (Frontend)

**Arquivo:** `vercel.json`

**Documentação:** [ADR-005 Section: Vercel Configuration](../docs/adr/005-deployment-vercel-railway.md#vercel-configuration)

**Comando de deploy:**
```bash
vercel deploy --prod
```

**Secrets necessários:**
```bash
vercel env add NEXTAUTH_SECRET
vercel env add DATABASE_URL
vercel env add GOOGLE_CLIENT_ID
vercel env add GOOGLE_CLIENT_SECRET
vercel env add DISCORD_CLIENT_ID
vercel env add DISCORD_CLIENT_SECRET
vercel env add OPENAI_API_KEY
```

**Validação:**
```bash
vercel env ls
vercel inspect deployment-url
```

---

### 2. Railway (Backend)

**Arquivo:** `railway.yaml`

**Documentação:** [ADR-005 Section: Railway Configuration](../docs/adr/005-deployment-vercel-railway.md#railway-configuration)

**Comando de deploy:**
```bash
railway up
```

**Secrets necessários:**
```bash
railway variables set DATABASE_URL="postgresql://..."
railway variables set NEXTAUTH_SECRET="..."
railway variables set GOOGLE_CLIENT_ID="..."
railway variables set GOOGLE_CLIENT_SECRET="..."
railway variables set DISCORD_CLIENT_ID="..."
railway variables set DISCORD_CLIENT_SECRET="..."
railway variables set OPENAI_API_KEY="..."
```

**Validação:**
```bash
railway status
railway logs
curl https://iarpg-api.railway.app/health
```

---

### 3. Supabase (Database)

**Arquivo:** `supabase/config.toml`

**Documentação:** [ADR-005 Section: Supabase Configuration](../docs/adr/005-deployment-vercel-railway.md#supabase-database)

**Comando de setup local:**
```bash
supabase init
supabase start
supabase db push
```

**Comando de deploy:**
```bash
supabase db push --project-id <PROJECT_ID>
```

**Validação:**
```bash
supabase status
psql $DATABASE_URL -c "SELECT version();"
```

---

## Deployment Workflow

### Development
```bash
# Local development
pnpm dev                    # Runs web + api locally

# Preview deploy (Vercel)
git push origin feature/*   # Auto-creates preview deploy
```

### Production
```bash
# Deploy to production
git push origin main

# GitHub Actions runs:
# 1. pnpm lint
# 2. pnpm typecheck
# 3. pnpm test
# 4. Vercel deploy (auto)
# 5. Railway deploy (auto)
```

### Rollback
```bash
# Frontend (Vercel)
vercel rollback deployment-url

# Backend (Railway)
railway redeploy deployment-id

# Database (Supabase)
supabase db reset --db-url $DATABASE_URL
```

---

## Custo Mensal

### MVP (<1K users)
| Service  | Plan    | Cost     |
|----------|---------|----------|
| Vercel   | Hobby   | $0       |
| Railway  | Starter | $5/mês   |
| Supabase | Free    | $0       |
| **Total**|         | **$5/mês** |

### Growth (1K-10K users)
| Service  | Plan     | Cost      |
|----------|----------|-----------|
| Vercel   | Pro      | $20/mês   |
| Railway  | Standard | $20/mês   |
| Supabase | Pro      | $25/mês   |
| **Total**|          | **$65/mês** |

**Triggers para revisão:**
- >10K users → Avaliar AWS/GCP migration
- >$200/mês → ROI analysis
- Performance issues → Profiling & optimization

---

## Monitoring & Health Checks

### Frontend (Vercel)
- **URL:** https://iarpg-web.vercel.app
- **Analytics:** Vercel Dashboard → Analytics
- **Logs:** Vercel Dashboard → Logs
- **Metrics:** TTFB, Core Web Vitals

### Backend (Railway)
- **URL:** https://iarpg-api.railway.app
- **Health Check:** `curl https://iarpg-api.railway.app/health`
- **Logs:** `railway logs`
- **Metrics:** Railway Dashboard → Metrics

### Database (Supabase)
- **URL:** Supabase Dashboard → Database
- **Backups:** 30-day retention (automatic)
- **Monitoring:** Query performance, connections

---

## Secrets Management

**⚠️ NUNCA commitar secrets!**

### Vercel Secrets
Gerenciados via Vercel CLI ou Dashboard:
```bash
vercel env add SECRET_NAME
vercel env pull .env.local
```

### Railway Secrets
Gerenciados via Railway CLI ou Dashboard:
```bash
railway variables set SECRET_NAME="value"
railway variables list
```

### Supabase Secrets
Configurados via Supabase Dashboard → Settings → API:
- Service Role Key (backend only)
- Anon Key (frontend safe)

---

## Troubleshooting

### Deploy Failed (Vercel)
```bash
# Check build logs
vercel logs deployment-url

# Common issues:
# - Missing environment variables → Add via `vercel env`
# - Build errors → Run `pnpm build` locally
# - Exceeded limits → Check Vercel Dashboard
```

### Deploy Failed (Railway)
```bash
# Check logs
railway logs --tail

# Common issues:
# - Port mismatch → Check PORT env variable
# - Database connection → Check DATABASE_URL
# - OOM (Out of Memory) → Increase memory limit
```

### Database Issues (Supabase)
```bash
# Check connection
psql $DATABASE_URL -c "SELECT 1;"

# Common issues:
# - Connection limit → Increase pool size
# - Slow queries → Check query performance
# - Missing RLS policies → Add via Supabase Dashboard
```

---

## Security Checklist

- [ ] HTTPS enabled em todos os serviços
- [ ] CORS configurado corretamente (Vercel ↔ Railway)
- [ ] RLS (Row Level Security) habilitado no Supabase
- [ ] Secrets rotacionados periodicamente (90 dias)
- [ ] Backups automáticos habilitados (Supabase)
- [ ] Health checks configurados (Railway)
- [ ] Rate limiting habilitado (API)
- [ ] Content Security Policy configurado (Vercel headers)

---

## Próximos Passos (Phase 3+)

**Enhancements planejados:**
- [ ] CDN para static assets (Cloudflare)
- [ ] Load balancer (se Railway múltiplas instâncias)
- [ ] Database replication (Supabase read replicas)
- [ ] Multi-region deployment (usuários internacionais)
- [ ] APM (Application Performance Monitoring)

**Triggers:**
- >10K concurrent users
- >$500/mês infra costs
- Compliance requirements (SOC 2, HIPAA)

---

## Referências

- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app/)
- [Supabase Docs](https://supabase.com/docs)
- [ADR-005: Deployment Architecture](../docs/adr/005-deployment-vercel-railway.md)
- [PRD Section 14: Deployment Architecture](../docs/prd.md)

---

**Status:** ✅ **COMPLETO** - IaC formalizado conforme PO-VALIDATION-REPORT
**Última atualização:** 2025-10-06
**Maintainer:** @architect (Winston)
