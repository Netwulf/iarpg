# 🚀 IARPG Deploy Guide

## 📦 **O QUE VOCÊ PRECISA**

### **1. Contas Necessárias**
- ✅ Supabase (já configurado)
- ✅ Netlify (já tem conta netwulf/iarpg)
- 🔄 Railway/Render (para API) - **escolha um:**
  - Railway: https://railway.app (recomendado - mais fácil)
  - Render: https://render.com (alternativa gratuita)

### **2. Chaves que Você Já Tem**
- ✅ Supabase URL e Keys
- ✅ Anthropic API Key (Claude)
- ✅ OpenAI API Key
- ✅ Perplexity API Key
- ✅ Google API Key

---

## 🎯 **DEPLOY EM 3 PASSOS (30min)**

### **PASSO 1: Deploy da API (Railway - 10min)**

#### **Opção A: Via Railway CLI (Recomendado)**
```bash
# 1. Instalar Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Criar novo projeto
railway init

# 4. Adicionar variáveis de ambiente (copie do seu .env local)
railway variables set PORT=3001
railway variables set NODE_ENV=production
railway variables set SUPABASE_URL="your-supabase-url"
railway variables set SUPABASE_ANON_KEY="your-supabase-anon-key"
railway variables set SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-key"
railway variables set ANTHROPIC_API_KEY="your-anthropic-key"
railway variables set NEXTAUTH_SECRET="$(openssl rand -base64 32)"
railway variables set CORS_ORIGIN="https://iarpg.netlify.app"

# 5. Deploy!
railway up
```

#### **Opção B: Via Railway Dashboard**
1. Vá para https://railway.app/new
2. Conecte seu GitHub repo
3. Selecione root directory: `apps/api`
4. Build Command: `pnpm install && pnpm --filter=api build`
5. Start Command: `cd apps/api && pnpm start`
6. Adicione variáveis de ambiente (copie do .env)
7. Deploy!

**Anote a URL da API**: `https://seu-projeto.railway.app`

---

### **PASSO 2: Deploy do Frontend (Netlify - 10min)**

#### **Via Netlify Dashboard**
1. Vá para https://app.netlify.com
2. **New site from Git**
3. Conecte seu GitHub repo
4. Configurações:
   - **Base directory**: `apps/web`
   - **Build command**: `pnpm install && pnpm build`
   - **Publish directory**: `apps/web/.next`
   - **Node version**: 20

5. **Variáveis de Ambiente** (Site settings → Environment variables):
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   NEXT_PUBLIC_API_URL=https://seu-projeto.railway.app
   NEXTAUTH_URL=https://iarpg.netlify.app
   NEXTAUTH_SECRET=generate-a-new-secret-32-chars-min
   ```

   **📝 Nota:** Copie as chaves do seu `.env.local` local

6. **Deploy!**

---

### **PASSO 3: Configurar CORS (5min)**

Depois que os 2 deploys terminarem:

1. **Volte no Railway** (API)
2. Adicione variável:
   ```
   CORS_ORIGIN=https://iarpg.netlify.app
   ```

3. **Redeploy API** (Railway vai fazer automaticamente)

---

## ✅ **CHECKLIST DE DEPLOY**

### **Pré-Deploy**
- [x] Código commitado no GitHub
- [x] Supabase configurado
- [x] Chaves de API disponíveis

### **Durante Deploy**
- [ ] API deployada no Railway
- [ ] Frontend deployado no Netlify
- [ ] Variáveis de ambiente configuradas
- [ ] CORS configurado

### **Pós-Deploy**
- [ ] Testar login/register
- [ ] Testar criar personagem
- [ ] Testar criar mesa
- [ ] Testar chat real-time
- [ ] Testar AI assistant

---

## 🧪 **SMOKE TESTS**

Depois do deploy, teste esses fluxos:

### **1. Authentication Flow**
```
1. Ir para https://iarpg.netlify.app
2. Clicar em "Get Started"
3. Registrar novo usuário
4. Login com credenciais
✅ Deve redirecionar para dashboard
```

### **2. Character Creation**
```
1. Dashboard → "Create Character"
2. Preencher formulário
3. Submit
✅ Personagem deve aparecer na lista
```

### **3. Table Creation**
```
1. Dashboard → "Create Table"
2. Configurar mesa
3. Submit
✅ Mesa criada com invite code
```

### **4. Real-time Chat** (precisa 2 usuários)
```
1. User A cria mesa
2. User B entra com invite code
3. User A envia mensagem
✅ User B deve ver mensagem instantaneamente
```

---

## 🐛 **TROUBLESHOOTING**

### **Problema: API não conecta**
```bash
# Verificar logs no Railway
railway logs

# Checklist:
- [ ] Variáveis de ambiente corretas?
- [ ] CORS_ORIGIN configurado?
- [ ] PORT=3001 setado?
```

### **Problema: Frontend não carrega**
```bash
# Verificar logs no Netlify
netlify logs

# Checklist:
- [ ] NEXT_PUBLIC_API_URL correto?
- [ ] NEXTAUTH_URL correto?
- [ ] Build passou sem erros?
```

### **Problema: Socket.io não conecta**
```
# Verificar:
1. API está rodando?
2. CORS configurado corretamente?
3. Frontend aponta para URL correta?
```

---

## 📊 **MONITORAMENTO**

### **Railway (API)**
- Logs: https://railway.app/project/seu-projeto/service/api/logs
- Metrics: https://railway.app/project/seu-projeto/service/api/metrics

### **Netlify (Frontend)**
- Logs: https://app.netlify.com/sites/iarpg/logs
- Analytics: https://app.netlify.com/sites/iarpg/analytics

---

## 🎉 **PRONTO!**

Seu IARPG está no ar em:
- **Frontend**: https://iarpg.netlify.app
- **API**: https://seu-projeto.railway.app

**Próximos passos:**
1. Testar todos os fluxos críticos
2. Convidar beta testers
3. Coletar feedback
4. Iterar!

---

**Dúvidas?** Consulte MVP-READY.md para mais detalhes técnicos.
