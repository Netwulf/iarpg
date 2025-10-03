# 🚀 Dev Handoff - Database Integration Sprint

**PO**: Sarah
**Date**: 2025-01-02
**Sprint**: Database Integration (21 points)

---

## 📊 Estado Atual

### ✅ Completado: Épico 4 - Synchronous Play
- **Story 4.1**: Table Page & Chat Interface ✅
- **Story 4.2**: Real-time Messaging (Socket.io) ✅
- **Story 4.3**: Typing Indicators & Presence ✅

**Status**: Todo o Épico 4 está funcionalmente completo com Socket.io e mock data. Pronto para integração com database real.

### ✅ Completado: Story DB.1 - Database Setup
- **Points**: 5
- **Status**: Código completo, aguardando setup manual do Tay

**Entregáveis**:
- ✅ Supabase client instalado e configurado
- ✅ Schema completo com 6 tabelas + RLS policies
- ✅ TypeScript types gerados
- ✅ Health check endpoints atualizados
- ✅ Documentação completa em `packages/db/README.md`

**Bloqueador**: Tay precisa criar projeto Supabase e rodar migration (ver `HUMAN-TASKS.md`)

---

## 🎯 Próximas Stories - Prontas para Implementação

### Story DB.2: Message Persistence Integration
**Points**: 8
**Status**: Ready for Dev (após setup do Tay)
**Priority**: High
**Story File**: `docs/stories/DB.2.message-persistence.md`

**Objetivo**: Substituir mock data de mensagens por Supabase

**Escopo**:
- Atualizar `POST /api/tables/:id/messages` para salvar no Supabase
- Atualizar `GET /api/tables/:id/messages` para carregar do Supabase
- Implementar paginação (50 mensagens por página)
- Manter Socket.io broadcasts funcionando
- Carregar histórico ao entrar na mesa

**Arquivos Principais**:
- `apps/api/src/routes/tables.routes.ts` - Atualizar endpoints
- `apps/web/src/app/tables/[id]/table-page-client.tsx` - Carregar mensagens da API

**Acceptance Criteria**: Ver arquivo completo da story

**Tempo Estimado**: 7 horas

---

### Story DB.3: Table & Member Persistence
**Points**: 8
**Status**: Ready for Dev (após setup do Tay)
**Priority**: High
**Story File**: `docs/stories/DB.3.table-member-persistence.md`

**Objetivo**: Implementar CRUD completo de tables e members

**Escopo**:
- Criar endpoint `POST /api/tables` (criar mesa)
- Atualizar `GET /api/tables/:id` (carregar mesa + members)
- Criar `POST /api/tables/:id/join` (entrar via invite code)
- Implementar geração de invite codes únicos
- Tracking de presença online/offline
- Socket.io broadcasts de presence

**Arquivos Principais**:
- `apps/api/src/routes/tables.routes.ts` - Novos endpoints
- `apps/api/src/socket/index.ts` - Presence tracking
- `apps/web/src/app/tables/[id]/table-page-client.tsx` - UI updates

**Acceptance Criteria**: Ver arquivo completo da story

**Tempo Estimado**: 8 horas

---

## 🔀 Ordem de Execução Recomendada

### Opção 1: Sequencial (Mais Seguro)
```
DB.1 Setup (Tay) → DB.2 (Dev) → DB.3 (Dev)
```
**Vantagem**: Menor risco, testa cada peça antes de avançar
**Timeline**: ~15 horas dev time após setup

### Opção 2: Paralela (Mais Rápido)
```
DB.1 Setup (Tay)
    ├─→ DB.2 (Dev 1 ou sprint 1)
    └─→ DB.3 (Dev 2 ou sprint 2)
```
**Vantagem**: DB.2 e DB.3 são independentes após DB.1
**Timeline**: ~8 horas dev time (se paralelo real)

### ⚠️ Dependências Críticas
- DB.2 e DB.3 **AMBAS** dependem de DB.1 setup estar completo
- DB.2 e DB.3 **NÃO** dependem uma da outra (podem ser paralelas)

---

## 📐 Padrão de Integração Socket.io + Supabase

**Pattern Estabelecido** (seguir em DB.2 e DB.3):

```typescript
// 1. Salvar no Supabase primeiro
const { data, error } = await supabase
  .from('messages')
  .insert({ ... })
  .select(`
    *,
    user:users!user_id (id, username, avatar_url)
  `)
  .single();

// 2. Broadcast via Socket.io com ID do database
const io = getIO();
io.to(`table:${tableId}`).emit('message:new', data);

// 3. Retornar resposta HTTP
res.status(201).json({ message: data });
```

**Vantagens**:
- ID único gerado pelo database (UUID)
- Sem race conditions
- Broadcast sempre tem dados completos
- Fácil de debugar

---

## 🧪 Testing Strategy

### Durante DB.2 (Messages)
1. Enviar mensagem → Verificar persist no Supabase (Table Editor)
2. Refresh browser → Mensagens devem recarregar
3. Abrir 2+ abas → Real-time deve funcionar
4. Criar 100+ mensagens → Testar paginação

### Durante DB.3 (Tables/Members)
1. Criar mesa → Verificar no Supabase
2. Copiar invite code → Entrar em outra conta
3. Connect/disconnect → Presence deve atualizar
4. Mesa cheia (6+ players) → Deve bloquear entrada

### Regression Testing
- Socket.io real-time continua funcionando
- Typing indicators continuam funcionando
- UI responsiva (mobile/desktop) continua ok
- Nenhum erro no console

---

## 🚨 Riscos e Mitigações

### Risco 1: RLS Policies Bloqueando Operações
**Sintoma**: `403 Forbidden` ou `PGRST` errors
**Solução**:
- Usar `createSupabaseAdmin()` no servidor (bypassa RLS)
- Ou ajustar policies no SQL (já estão definidas, mas podem precisar ajuste)

### Risco 2: Race Conditions em Broadcasts
**Sintoma**: Mensagens duplicadas ou ordem errada
**Solução**:
- Sempre salvar DB primeiro, depois broadcast
- Usar UUIDs do database (não client-side IDs)
- Deduplicar no client usando message.id

### Risco 3: Performance com Muitas Mensagens
**Sintoma**: Load lento, UI travando
**Solução**:
- Paginação obrigatória (limite 50)
- Lazy load ao scroll up
- Considerar React Query para cache

---

## 📝 Checklist de Aceitação

### DB.2 - Messages
- [ ] POST /api/tables/:id/messages salva no Supabase
- [ ] GET /api/tables/:id/messages retorna do Supabase
- [ ] Paginação funciona (`?before=` query param)
- [ ] Mensagens carregam ao entrar na mesa
- [ ] Real-time Socket.io continua funcionando
- [ ] Username e avatar aparecem nas mensagens
- [ ] Timestamps corretos
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] Story marcada como completa ✅

### DB.3 - Tables/Members
- [ ] POST /api/tables cria mesa no Supabase
- [ ] GET /api/tables/:id retorna mesa + members
- [ ] POST /api/tables/:id/join funciona com invite code
- [ ] Invite codes são únicos (6 chars alphanumeric)
- [ ] Member list mostra online/offline status
- [ ] Presence tracking via Socket.io funciona
- [ ] Character info aparece nos members
- [ ] Mesa cheia bloqueia novos joins
- [ ] `pnpm typecheck` passa
- [ ] `pnpm lint` passa
- [ ] Story marcada como completa ✅

---

## 📚 Referências Técnicas

### Documentação Supabase
- [JS Client Docs](https://supabase.com/docs/reference/javascript/introduction)
- [Select with Joins](https://supabase.com/docs/reference/javascript/select)
- [Insert Data](https://supabase.com/docs/reference/javascript/insert)
- [RLS Policies](https://supabase.com/docs/guides/auth/row-level-security)

### Código de Referência
- Supabase client: `packages/db/src/supabase.ts`
- Types: `packages/db/src/types.ts`
- Schema: `packages/db/supabase/migrations/20250102000000_initial_schema.sql`
- Health check (exemplo de uso): `apps/api/src/routes/health.routes.ts`

### Socket.io Existente
- Setup: `apps/api/src/socket/index.ts`
- Hook client: `apps/web/src/hooks/useTableSocket.ts`
- Context: `apps/web/src/contexts/SocketContext.tsx`

---

## 💬 Comunicação

### Para Dev que Pegar DB.2 ou DB.3
1. Ler story completa em `docs/stories/DB.X.xxx.md`
2. Verificar HUMAN-TASKS.md → Setup do Tay está completo?
3. Testar health check: `curl http://localhost:3001/health/db`
4. Seguir acceptance criteria da story
5. Marcar checkboxes conforme avança
6. Atualizar File List na story ao modificar arquivos
7. Rodar `pnpm typecheck && pnpm lint` antes de finalizar

### Para Reportar Issues
- Erros de RLS → incluir query e user ID
- Erros de Socket.io → incluir room name e event
- Erros de types → incluir arquivo e linha

### Definition of Done (Cada Story)
- [ ] Todos os acceptance criteria completos
- [ ] File List atualizado na story
- [ ] Tests passando (typecheck + lint)
- [ ] Testado manualmente (checklist na story)
- [ ] Status da story → "Completed ✅"
- [ ] PO notificado para review (se necessário)

---

## 🎉 Visão Geral do Sprint

**Meta**: Migrar de mock data para Supabase persistence

**Entregável Final**:
- Mensagens persistem no database
- Tables e members persistem no database
- Presence tracking funcional
- Real-time via Socket.io mantido
- Foundation para features futuras (characters, combat, etc.)

**Valor de Negócio**:
- Usuários não perdem mensagens ao refresh
- Mesas persistem entre sessões
- Base sólida para crescimento do produto
- Pronto para deploy em produção

**Próximos Passos Após Sprint**:
- Épico 5 (Async Play) ou
- Character Management ou
- Combat System

---

**Handoff Preparado por**: Sarah (PO)
**Data**: 2025-01-02
**Status**: ✅ Pronto para Dev (após setup Tay)
