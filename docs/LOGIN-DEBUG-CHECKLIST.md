# Login Debug Checklist - IA-RPG

**Data:** 2025-10-07
**Issue:** Login não funcionando (reportado pelo usuário)

---

## Testes Realizados

### ✅ 1. Site Online
- **URL:** https://iarpg-web.vercel.app
- **Status:** 200 OK ✅
- **Login page:** https://iarpg-web.vercel.app/login ✅
- **Campos visíveis:** Email, Password, Sign In button ✅

### ✅ 2. Database
**Query:** `SELECT COUNT(*) FROM users;`
**Result:** 4 users encontrados ✅

**Users disponíveis para teste:**
- testuser1@iarpg.local (tier: free)
- testuser2@iarpg.local (tier: premium)
- taynanmendes@gmail.com (tier: free)
- taynanpuri@gmail.com (tier: free)

### ✅ 3. Vercel Environment Variables
```bash
$ vercel env ls production | grep NEXTAUTH
NEXTAUTH_URL         ✅ Encrypted, Production
NEXTAUTH_SECRET      ✅ Encrypted, Production
```

```bash
$ vercel env ls production | grep SUPABASE
NEXT_PUBLIC_SUPABASE_URL           ✅ Encrypted, Production
NEXT_PUBLIC_SUPABASE_ANON_KEY      ✅ Encrypted, Production
SUPABASE_SERVICE_ROLE_KEY          ✅ Encrypted, Production
```

### ⚠️ 4. NEXTAUTH_URL Value
**Problema potencial:** Precisa estar configurado como `https://iarpg-web.vercel.app`

**Como verificar:**
```bash
vercel env pull .env.vercel --environment=production
cat .env.vercel | grep NEXTAUTH_URL
```

**Valor esperado:**
```
NEXTAUTH_URL=https://iarpg-web.vercel.app
```

### ⚠️ 5. NextAuth Callback URLs
**Verificar em:** `apps/web/src/lib/auth.ts`

**Configuração atual:**
```typescript
export const authConfig: NextAuthConfig = {
  trustHost: true, // ✅ Required for Vercel
  secret: process.env.NEXTAUTH_SECRET,
  // ...
}
```

---

## Possíveis Causas do Problema

### Causa 1: NEXTAUTH_URL incorreto
**Sintoma:** Login falha silenciosamente ou redireciona para página errada

**Verificação:**
```bash
# No Vercel dashboard ou CLI
vercel env ls production
```

**Fix se necessário:**
```bash
cd apps/web
vercel env rm NEXTAUTH_URL production
vercel env add NEXTAUTH_URL production
# Enter: https://iarpg-web.vercel.app
```

### Causa 2: Senha dos usuários de teste desconhecida
**Sintoma:** "Invalid email or password" mesmo com credenciais corretas

**Verificação:**
```sql
-- Check if users have password_hash
SELECT username, email,
       CASE WHEN password_hash IS NULL THEN 'NO PASSWORD' ELSE 'HAS PASSWORD' END as status
FROM users;
```

**Fix:** Criar novo usuário de teste:
```bash
# Via register page: https://iarpg-web.vercel.app/register
# Ou via SQL:
INSERT INTO users (username, email, password_hash, tier)
VALUES ('testlogin', 'testlogin@test.com', '$2a$10$...', 'free');
```

### Causa 3: CORS ou CSP bloqueando requests
**Sintoma:** Console errors no browser

**Verificação:** Abrir DevTools → Console tab

**Logs esperados:**
```
[Auth] authorize() called with email: test@example.com
[Auth] Password validation result: true/false
[Auth] authorize() SUCCESS/FAILED
```

**Fix:** Já implementado CSP headers (commit 5b79ebf)

### Causa 4: NextAuth session cookie não sendo setado
**Sintoma:** Login parece funcionar mas não mantém sessão

**Verificação:** DevTools → Application → Cookies

**Cookies esperados:**
- `next-auth.session-token` (ou `__Secure-next-auth.session-token` em HTTPS)
- `next-auth.csrf-token`

**Fix:** Verificar `trustHost: true` em authConfig (✅ já configurado)

### Causa 5: Middleware redirecionando incorretamente
**Sintoma:** Loop de redirect ou 401

**Verificação:**
```typescript
// apps/web/src/middleware.ts
const sessionToken = request.cookies.get('next-auth.session-token') ||
                    request.cookies.get('__Secure-next-auth.session-token');
```

**Fix:** Já implementado cookie-based check (commit 4cc0d2a)

---

## Passos para Testar Manualmente

### Teste 1: Registro de Novo Usuário
1. Acessar: https://iarpg-web.vercel.app/register
2. Preencher:
   - Email: `newtestuser@example.com`
   - Username: `newtestuser`
   - Password: `Test1234!`
3. Clicar "Create Account"
4. **Esperado:** Redirect para `/dashboard`
5. **Verificar:** Console logs, network tab

### Teste 2: Login com Usuário Existente
**Problema:** Não sabemos a senha dos users existentes!

**Opções:**
1. Criar novo user via register
2. Resetar senha de user existente via SQL:
   ```sql
   -- Senha: Test1234!
   UPDATE users
   SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
   WHERE email = 'testuser1@iarpg.local';
   ```
3. Usar OAuth (Google/Discord) - mas precisa configurar callbacks

### Teste 3: Verificar Logs do Servidor
```bash
# Vercel logs (últimos 1h)
cd apps/web
vercel logs --since 1h | grep -i "auth\|login\|error"
```

---

## Diagnóstico Completo

### Para o usuário executar:
1. **Testar registro:**
   - Ir para https://iarpg-web.vercel.app/register
   - Criar conta nova
   - Ver se faz login automático

2. **Verificar console do browser:**
   - F12 → Console tab
   - Tentar fazer login
   - Copiar qualquer erro vermelho

3. **Verificar Network tab:**
   - F12 → Network tab
   - Filter: "Fetch/XHR"
   - Tentar fazer login
   - Procurar requests para `/api/auth/*`
   - Ver response status (200, 401, 500?)

4. **Verificar Cookies:**
   - F12 → Application → Cookies → https://iarpg-web.vercel.app
   - Após login, ver se `next-auth.session-token` aparece

---

## Próximos Passos

### Se registro funciona mas login não:
→ Problema: senhas dos users de teste não conhecidas
→ Fix: Criar novo user via register OU resetar senha via SQL

### Se registro também não funciona:
→ Problema: Supabase connection, NextAuth config, ou env vars
→ Fix: Verificar logs Vercel + console errors

### Se tudo falha com 401/403:
→ Problema: NEXTAUTH_URL incorreto ou CORS
→ Fix: Atualizar NEXTAUTH_URL env var

---

## Comandos Úteis

### Verificar NEXTAUTH_URL atual:
```bash
vercel env ls production | grep NEXTAUTH_URL
```

### Atualizar NEXTAUTH_URL:
```bash
cd apps/web
vercel env add NEXTAUTH_URL production
# Valor: https://iarpg-web.vercel.app
```

### Ver logs em tempo real:
```bash
vercel logs --follow
```

### Resetar senha de test user:
```sql
-- No Supabase SQL Editor
-- Password: Test1234!
UPDATE users
SET password_hash = '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL17lhWy'
WHERE email = 'testuser1@iarpg.local';
```

---

**Status:** Aguardando feedback do usuário sobre sintomas específicos do erro
**Última atualização:** 2025-10-07 00:14 UTC
