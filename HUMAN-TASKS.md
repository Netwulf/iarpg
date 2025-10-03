# 🔧 Tarefas Manuais para Tay (Humano)

## 🚨 Tarefas Prioritárias - Bloqueando Desenvolvimento

### 1. Setup do Supabase (BLOQUEADOR para DB.2 e DB.3)

**Status**: ⏳ Aguardando
**Tempo Estimado**: 15-20 minutos
**Prioridade**: CRÍTICA

**Passos**:

1. **Criar Projeto Supabase**
   - Ir para [supabase.com](https://supabase.com)
   - Fazer login ou criar conta
   - Clicar em "New Project"
   - Nome do projeto: "iarpg" (ou o que preferir)
   - Escolher região mais próxima (ex: São Paulo)
   - Definir senha do database (GUARDAR ESSA SENHA!)
   - Aguardar provisionamento (~2 minutos)

2. **Copiar Credenciais**
   - Ir para Settings > API no dashboard do Supabase
   - Copiar:
     - Project URL (ex: `https://xxxxx.supabase.co`)
     - `anon` `public` key
     - `service_role` `secret` key (⚠️ NUNCA commitar isso!)

3. **Configurar Environment Variables**

   Criar/editar os seguintes arquivos:

   **`apps/web/.env.local`** (criar se não existir):
   ```bash
   NEXT_PUBLIC_SUPABASE_URL="https://[SEU-PROJETO].supabase.co"
   NEXT_PUBLIC_SUPABASE_ANON_KEY="[SUA-ANON-KEY]"
   NEXT_PUBLIC_API_URL="http://localhost:3001"
   ```

   **`apps/api/.env`** (criar se não existir):
   ```bash
   SUPABASE_URL="https://[SEU-PROJETO].supabase.co"
   SUPABASE_ANON_KEY="[SUA-ANON-KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[SUA-SERVICE-ROLE-KEY]"
   PORT=3001
   ```

   **`packages/db/.env`** (criar se não existir):
   ```bash
   SUPABASE_URL="https://[SEU-PROJETO].supabase.co"
   SUPABASE_ANON_KEY="[SUA-ANON-KEY]"
   SUPABASE_SERVICE_ROLE_KEY="[SUA-SERVICE-ROLE-KEY]"
   ```

4. **Rodar Migration SQL**
   - No dashboard do Supabase, ir para "SQL Editor"
   - Abrir arquivo: `packages/db/supabase/migrations/20250102000000_initial_schema.sql`
   - Copiar TODO o conteúdo
   - Colar no SQL Editor do Supabase
   - Clicar em "Run" (canto inferior direito)
   - Aguardar execução (deve ver "Success")

5. **Verificar Setup**
   - Ainda no dashboard, ir para "Table Editor"
   - Deve ver 6 tabelas criadas:
     - users
     - characters
     - tables
     - table_members
     - messages
     - combat_encounters

   - Rodar os servidores:
     ```bash
     pnpm dev
     ```

   - Testar health check:
     ```bash
     curl http://localhost:3001/health/db
     ```

   - Deve retornar: `{"status":"ok",...,"database":{"connected":true,"backend":"supabase"}}`

**Quando Completar**: ✅ Marcar "DB.1 - User Setup Complete" e notificar o Dev para prosseguir com DB.2

---

## 📋 Tarefas Futuras (Não Bloqueantes)

### 2. Configurar Supabase Auth (Opcional - Fase 2)
- Habilitar email/password auth no Supabase
- Configurar OAuth providers (Google, Discord)
- Atualizar redirect URLs

### 3. Configurar Variáveis de Produção
- Adicionar environment variables no Vercel/hosting
- Configurar domínio customizado no Supabase
- Atualizar CORS origins

---

## 📝 Notas Importantes

### ⚠️ Segurança
- **NUNCA** commitar `SERVICE_ROLE_KEY` no Git
- Adicionar `.env*` no `.gitignore` (já deve estar)
- `SERVICE_ROLE_KEY` bypassa todas as RLS policies - usar apenas no servidor!

### 🔍 Troubleshooting

**Problema**: "Missing SUPABASE_URL environment variable"
- Verificar se criou todos os 3 arquivos `.env`
- Verificar se os nomes das variáveis estão corretos (incluindo prefixo `NEXT_PUBLIC_`)

**Problema**: Health check retorna "disconnected"
- Verificar se a migration SQL rodou com sucesso
- Verificar se as credenciais estão corretas
- Verificar se o projeto Supabase está ativo (não pausado)

**Problema**: RLS policy errors ao tentar acessar dados
- Temporariamente desabilitar RLS para teste:
  ```sql
  ALTER TABLE table_name DISABLE ROW LEVEL SECURITY;
  ```
- Ou usar `SERVICE_ROLE_KEY` no servidor (que bypassa RLS)

### 📚 Recursos
- [Supabase Quickstart](https://supabase.com/docs/guides/getting-started)
- [Environment Variables no Next.js](https://nextjs.org/docs/basic-features/environment-variables)
- Setup completo: `packages/db/README.md`

---

## ✅ Checklist de Setup

- [ ] Projeto Supabase criado
- [ ] Credenciais copiadas
- [ ] `apps/web/.env.local` configurado
- [ ] `apps/api/.env` configurado
- [ ] `packages/db/.env` configurado
- [ ] Migration SQL executada no Supabase
- [ ] 6 tabelas visíveis no Table Editor
- [ ] `pnpm dev` rodando sem erros
- [ ] Health check `/health/db` retornando OK
- [ ] Dev notificado para prosseguir ✨

---

**Última Atualização**: 2025-01-02
**Status Geral**: 🟡 Aguardando Setup Supabase
