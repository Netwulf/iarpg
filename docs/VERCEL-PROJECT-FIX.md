# Vercel Project Configuration Fix

**Data:** 2025-10-13
**Problema:** Deploys indo para projeto errado + builds falhando
**Status:** Parcialmente resolvido (linkage corrigido, builds ainda falhando)

---

## Problema Identificado

### Projetos Duplicados
Você tem **3 projetos** no Vercel:
1. **`iarpg-web`** ✅ - Projeto oficial (https://iarpg-web.vercel.app)
2. **`iarpg-deploy`** ❌ - Projeto duplicado/antigo
3. **`web`** ❌ - Projeto duplicado/antigo

### Linkage Incorreto
O repositório local estava linkado ao `iarpg-deploy` ao invés do `iarpg-web`.

---

## Correções Aplicadas

### 1. Relink para Projeto Correto ✅
```bash
# Relinked ambos os diretórios
cd /Users/taypuri/iarpg-deploy
vercel link --project iarpg-web --yes

cd apps/web
vercel link --project iarpg-web --yes
```

**Resultado:**
- `.vercel/project.json` (raiz): `projectName: "iarpg-web"` ✅
- `apps/web/.vercel/project.json`: `projectName: "iarpg-web"` ✅

### 2. Atualizado vercel.json ✅
```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm --filter=web build",
  "outputDirectory": "apps/web/.next",
  "installCommand": "pnpm install --no-frozen-lockfile",
  "framework": null
}
```

---

## Problemas Pendentes

### Build Failures ❌
Os deploys continuam falhando após 2 minutos de build.

**Possíveis Causas:**
1. **Root Directory incorreto no Vercel Dashboard**
   - Projeto `iarpg-web` pode estar configurado com Root Directory = `apps/web`
   - Isso faz o build command tentar `cd apps/web` de dentro de `apps/web`

2. **Framework Detection**
   - Vercel pode estar tentando auto-detectar framework
   - Conflitando com configurações manuais do vercel.json

3. **Environment Variables**
   - Podem estar faltando vars no projeto `iarpg-web`
   - Copiar de `iarpg-deploy` ou `web`

---

## Recomendações de Fix Manual

### Fix 1: Ajustar Root Directory no Dashboard

**Ir para:** https://vercel.com/tays-projects-cdc23402/iarpg-web/settings

**General → Root Directory:**
- ❌ Se estiver: `apps/web`
- ✅ Mudar para: `.` (root do repo)

**Build & Development Settings:**
- Build Command: `pnpm --filter=web build`
- Output Directory: `apps/web/.next`
- Install Command: `pnpm install --no-frozen-lockfile`
- Framework Preset: `Other` ou `Next.js`

### Fix 2: Copiar Environment Variables

**De:** `iarpg-deploy` project
**Para:** `iarpg-web` project

Variables críticas:
```
NEXTAUTH_SECRET
NEXTAUTH_URL=https://iarpg-web.vercel.app
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
```

**Como copiar:**
```bash
# Ver variáveis do projeto antigo
vercel env ls --project iarpg-deploy production

# Adicionar no novo projeto
vercel env add NEXTAUTH_SECRET --project iarpg-web production
# (Repetir para cada variável)
```

### Fix 3: Deletar Projetos Duplicados (Opcional)

Após confirmar que `iarpg-web` está funcionando:

1. Ir para https://vercel.com/tays-projects-cdc23402/iarpg-deploy/settings
2. Scroll até "Delete Project"
3. Repetir para projeto `web`

---

## Verificação de Deploy

### URLs para Monitorar
- **Production:** https://iarpg-web.vercel.app
- **Latest Deployment:** Ver com `vercel ls`
- **Dashboard:** https://vercel.com/tays-projects-cdc23402/iarpg-web

### Comandos de Teste
```bash
# Ver status de deploys
vercel ls

# Ver logs de deployment específico
vercel logs <deployment-url>

# Forçar novo deploy
vercel --prod --yes
```

### Teste de Login em Produção
```bash
# Criar usuário de teste
curl -X POST https://iarpg-web.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","username":"testuser","password":"Test1234!"}'

# Testar com Playwright
export BASE_URL=https://iarpg-web.vercel.app
npx playwright test e2e/login-manual-test.spec.ts
```

---

## Commits Relacionados

- `1de97a6` - fix(vercel): adjust filter syntax and lockfile handling
- `5a211f3` - fix(vercel): use pnpm workspace filter for build command
- (Plus relink operations not tracked in git)

---

## Próximos Passos

1. ☐ Ajustar Root Directory no dashboard do Vercel para `.`
2. ☐ Verificar/copiar environment variables
3. ☐ Triggar novo deploy e monitorar logs
4. ☐ Testar login em produção após deploy bem-sucedido
5. ☐ Deletar projetos duplicados do Vercel

---

**Status Atual:** Aguardando configuração manual no Vercel Dashboard
**Última Atualização:** 2025-10-13 18:15 UTC
