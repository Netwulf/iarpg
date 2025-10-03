# 🚀 DEPLOY IARPG - GUIA RÁPIDO

**Seu código está 100% pronto no GitHub!**
**Repo:** https://github.com/Netwulf/iarpg

---

## ⚡ DEPLOY RÁPIDO (30min)

### **PASSO 1: Deploy API no Railway (10min)**

1. **Acesse:** https://railway.app/new
2. **Login** com GitHub
3. **Deploy from GitHub repo**
   - Selecione: `Netwulf/iarpg`
   - Root directory: `apps/api`

4. **Settings → Variables** (adicione TODAS essas):
   ```bash
   PORT=3001
   NODE_ENV=production
   CORS_ORIGIN=https://iarpg.netlify.app

   # Copie do seu .env local:
   SUPABASE_URL=https://ukxjmtdwgqiltrxglzda.supabase.co
   SUPABASE_ANON_KEY=<sua-key>
   SUPABASE_SERVICE_ROLE_KEY=<sua-key>
   ANTHROPIC_API_KEY=<sua-key>

   # Gere novo:
   NEXTAUTH_SECRET=<gere-com-openssl-rand-base64-32>
   ```

5. **Settings → Build**
   - Build Command: `pnpm install && pnpm --filter=api build`
   - Start Command: `cd apps/api && pnpm start`

6. **Deploy!** ✅

7. **Anote a URL:** `https://seu-projeto.up.railway.app`

---

### **PASSO 2: Deploy Frontend no Netlify (10min)**

Você já tem conta em: https://app.netlify.com (netwulf)

1. **New site from Git**
2. **Connect to GitHub** → Selecione `Netwulf/iarpg`
3. **Build settings:**
   - Base directory: `apps/web`
   - Build command: `pnpm install && pnpm build`
   - Publish directory: `apps/web/.next`

4. **Site settings → Environment variables** (adicione):
   ```bash
   # Copie do .env.local:
   NEXT_PUBLIC_SUPABASE_URL=https://ukxjmtdwgqiltrxglzda.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<sua-key>

   # URL da API do Railway (do passo 1):
   NEXT_PUBLIC_API_URL=https://seu-projeto.up.railway.app

   # URL do próprio Netlify:
   NEXTAUTH_URL=https://iarpg.netlify.app

   # Gere novo (mesmo do Railway):
   NEXTAUTH_SECRET=<mesmo-do-railway>
   ```

5. **Deploy!** ✅

---

### **PASSO 3: Ajustar CORS (5min)**

1. Volte no **Railway** (API)
2. **Settings → Variables**
3. **Edite** `CORS_ORIGIN`:
   ```bash
   CORS_ORIGIN=https://iarpg.netlify.app
   ```
4. Redeploy automático ✅

---

## ✅ CHECKLIST DE DEPLOY

### **Railway (API)**
- [ ] Projeto criado
- [ ] Variáveis de ambiente configuradas (8 vars)
- [ ] Build command configurado
- [ ] Start command configurado
- [ ] Deploy realizado com sucesso
- [ ] URL anotada

### **Netlify (Frontend)**
- [ ] Site criado
- [ ] Variáveis de ambiente configuradas (5 vars)
- [ ] Build configurado
- [ ] Deploy realizado com sucesso
- [ ] CORS atualizado no Railway

---

## 🧪 TESTES PÓS-DEPLOY

Depois que os 2 deploys terminarem, teste:

### **1. Abrir o site**
```
https://iarpg.netlify.app
✅ Deve carregar a homepage
```

### **2. Registrar usuário**
```
1. Click "Get Started"
2. Preencher formulário
3. Submit
✅ Deve criar usuário e fazer login
```

### **3. Criar personagem**
```
1. Dashboard → "Create Character"
2. Preencher dados
3. Submit
✅ Personagem deve aparecer na lista
```

### **4. API Health Check**
```
https://seu-projeto.up.railway.app/api/health
✅ Deve retornar: {"status":"ok","supabase":"connected"}
```

---

## 🐛 SE ALGO DER ERRADO

### **Problema: Build falhou no Netlify**
```
Solução:
1. Verificar logs do build
2. Checar se todas env vars estão corretas
3. Verificar se pnpm install funcionou
```

### **Problema: API não responde**
```
Solução:
1. Railway → Logs
2. Verificar se PORT=3001
3. Verificar se Supabase keys corretas
4. Restart manual se necessário
```

### **Problema: Socket.io não conecta**
```
Solução:
1. Verificar CORS_ORIGIN no Railway
2. Verificar NEXT_PUBLIC_API_URL no Netlify
3. Verificar se API está rodando
```

---

## 📊 MONITORAMENTO

### **Railway (API)**
- **Logs**: Railway Dashboard → Logs tab
- **Metrics**: Railway Dashboard → Metrics tab
- **Restart**: Settings → Redeploy

### **Netlify (Frontend)**
- **Logs**: Netlify Dashboard → Deploys → Click no deploy → Logs
- **Analytics**: Site settings → Analytics
- **Redeploy**: Deploys → Trigger deploy

---

## 🎉 PRONTO!

Seu IARPG está LIVE em:
- **Frontend**: https://iarpg.netlify.app
- **API**: https://seu-projeto.up.railway.app

### **Próximos Passos:**
1. ✅ Testar todos os fluxos
2. 🎯 Convidar beta testers
3. 📊 Monitorar erros/performance
4. 🚀 Iterar baseado em feedback

---

**Dúvidas?** Consulte DEPLOY-GUIDE.md para mais detalhes.

**Problemas?** Confira os logs em Railway/Netlify.

**Boa sorte! 🚀**
