# 🎮 Manual de Teste Completo - IARPG Platform

## 🎯 Objetivo
Testar todas as features implementadas (Stories 5.3, 6.1, 7.1) em uma sessão completa de jogo.

**Tempo estimado**: 30-40 minutos

---

## ✅ Pré-requisitos

- [ ] Servidores rodando:
  - API: http://localhost:3001
  - Web: http://localhost:3000
- [ ] Banco de dados Supabase conectado
- [ ] 2 abas de navegador (simular 2 jogadores)
- [ ] Console do navegador aberto (F12) para ver Socket.io events

---

## 📋 Roteiro de Teste

### **FASE 1: Setup Inicial (5 min)**

#### 1.1 Criar Usuários de Teste no Supabase

Abra o Supabase SQL Editor e execute:

```sql
-- Criar 3 usuários de teste
INSERT INTO "User" (id, username, email, avatar, "createdAt", "updatedAt")
VALUES
  ('dm-test-001', 'Alice-DM', 'alice@test.com', null, NOW(), NOW()),
  ('player-test-001', 'Bob-Fighter', 'bob@test.com', null, NOW(), NOW()),
  ('player-test-002', 'Carol-Wizard', 'carol@test.com', null, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar criação
SELECT id, username FROM "User";
```

#### 1.2 Criar Mesa ASYNC para Teste

```sql
-- Criar mesa Play-by-Post
INSERT INTO "Table" (
  id,
  "ownerId",
  name,
  description,
  "playStyle",
  privacy,
  "inviteCode",
  "maxPlayers",
  tags,
  "turnDeadlineHours",
  "currentTurnIndex",
  "turnOrder",
  "createdAt",
  "updatedAt"
)
VALUES (
  'async-table-001',
  'dm-test-001',
  'Lost Mines Campaign (Async)',
  'Play-by-Post adventure in Phandelver',
  'async',
  'private',
  'ASYNC01',
  6,
  ARRAY['D&D 5e', 'Newbie Friendly', 'Play-by-Post'],
  48,
  0,
  '["player-test-001", "player-test-002"]'::json,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar membros à mesa
INSERT INTO "TableMember" (id, "tableId", "userId", "characterId", role, "joinedAt")
VALUES
  ('tm-001', 'async-table-001', 'dm-test-001', null, 'dm', NOW()),
  ('tm-002', 'async-table-001', 'player-test-001', null, 'player', NOW()),
  ('tm-003', 'async-table-001', 'player-test-002', null, 'player', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verificar
SELECT t.name, t."playStyle", tm.role, u.username
FROM "Table" t
JOIN "TableMember" tm ON tm."tableId" = t.id
JOIN "User" u ON u.id = tm."userId"
WHERE t.id = 'async-table-001';
```

#### 1.3 Criar Mesa SYNC para Teste

```sql
-- Criar mesa Live (Sync)
INSERT INTO "Table" (
  id,
  "ownerId",
  name,
  description,
  "playStyle",
  privacy,
  "inviteCode",
  "maxPlayers",
  tags,
  "createdAt",
  "updatedAt"
)
VALUES (
  'sync-table-001',
  'dm-test-001',
  'Dragon of Icespire Peak (Live)',
  'Live real-time D&D adventure',
  'sync',
  'private',
  'SYNC001',
  6,
  ARRAY['D&D 5e', 'Live Session', 'Hardcore'],
  NOW(),
  NOW()
)
ON CONFLICT (id) DO NOTHING;

-- Adicionar membros
INSERT INTO "TableMember" (id, "tableId", "userId", "characterId", role, "joinedAt")
VALUES
  ('tm-sync-001', 'sync-table-001', 'dm-test-001', null, 'dm', NOW()),
  ('tm-sync-002', 'sync-table-001', 'player-test-001', null, 'player', NOW()),
  ('tm-sync-003', 'sync-table-001', 'player-test-002', null, 'player', NOW())
ON CONFLICT (id) DO NOTHING;
```

---

### **FASE 2: Teste Mesa SYNC (Live Session) - 10 min**

#### 2.1 Acessar Mesa Sync
```
URL: http://localhost:3000/tables/sync-table-001
```

**✅ Verificar:**
- [ ] Header mostra: "Dragon of Icespire Peak (Live)"
- [ ] Badge mostra: "Live" (amarelo)
- [ ] Sidebar esquerda mostra 3 membros
- [ ] Alice-DM tem badge de DM (👑)
- [ ] Chat está habilitado

#### 2.2 Testar Chat em Tempo Real

**Aba 1 (Alice-DM):**
1. Enviar mensagem: "Welcome adventurers! You arrive at the tavern..."
2. **✅ Verificar:** Mensagem aparece instantaneamente

**Aba 2 (Bob-Fighter):**
1. Abrir mesma URL: http://localhost:3000/tables/sync-table-001
2. **✅ Verificar:** Vê a mensagem da Alice
3. Enviar: "Bob orders an ale and looks around"
4. **✅ Verificar:** Alice vê a mensagem do Bob em tempo real

**Console F12:**
```
✅ Buscar eventos Socket.io:
- message:new
- typing:start
- typing:stop
```

#### 2.3 Testar Indicador de "Digitando..."

**Aba Bob:**
1. Começar a digitar (não enviar)
2. **✅ Verificar:** Alice vê "Bob-Fighter is typing..." abaixo do chat

#### 2.4 Testar Dice Roller

**Aba Alice (DM):**
1. Clicar na aba "Dice" no painel direito
2. Rolar: d20 + 5
3. **✅ Verificar:**
   - Resultado aparece em "Recent Rolls"
   - Bob vê o mesmo roll em tempo real
   - Mensagem de sistema no chat

**Aba Bob:**
1. Rolar: 2d6
2. **✅ Verificar:** Alice vê o roll do Bob

---

### **FASE 3: Teste Combat Tracker (Story 5.3) - 10 min**

#### 3.1 Iniciar Combate

**Aba Alice (DM):**
1. Clicar na aba "Combat" no painel direito
2. Clicar "Start Combat"
3. Adicionar combatentes:
   - Bob-Fighter | Initiative: 15 | HP: 30/30
   - Carol-Wizard | Initiative: 12 | HP: 20/20
   - Goblin 1 | Initiative: 8 | HP: 7/7
   - Goblin 2 | Initiative: 6 | HP: 7/7
4. Clicar "Start Combat"

**✅ Verificar:**
- [ ] Combat tracker aparece para todos
- [ ] Ordem: Bob (15) → Carol (12) → Goblin 1 (8) → Goblin 2 (6)
- [ ] Bob está destacado (turno atual)
- [ ] Console mostra: `combat:started` event

**Aba Bob:**
- [ ] Vê o combat tracker sincronizado
- [ ] Bob está destacado como turno atual

#### 3.2 Atualizar HP Durante Combate

**Aba Alice:**
1. Goblin 1 ataca Bob
2. Reduzir HP do Bob: 30 → 22
3. **✅ Verificar:**
   - Bob vê HP atualizar em tempo real
   - Barra de HP fica amarela (damaged)
   - Console: `combat:hp-updated` event

#### 3.3 Avançar Turnos

**Aba Alice:**
1. Clicar "Next Turn"
2. **✅ Verificar:**
   - Carol-Wizard fica destacada
   - Bob não está mais destacado
   - Console: `combat:turn-changed` event

2. Clicar "Next Turn" novamente
3. **✅ Verificar:** Goblin 1 destacado

4. Clicar "Next Turn" 2x até voltar para Bob
5. **✅ Verificar:** Wrapping funciona (volta pro início)

#### 3.4 Finalizar Combate

**Aba Alice:**
1. Reduzir HP dos Goblins para 0
2. Clicar "End Combat"
3. **✅ Verificar:**
   - Combat tracker desaparece
   - Console: `combat:ended` event
   - Bob também não vê mais o tracker

---

### **FASE 4: Teste AI DM Assistant (Story 6.1) - 5 min**

**⚠️ Requer API keys configuradas no .env**

#### 4.1 Testar AI Suggestions

**Aba Alice (DM apenas):**
1. Clicar na aba "AI" no painel direito
2. Verificar dropdown de providers:
   - [ ] Anthropic (Claude)
   - [ ] OpenAI (GPT-4)
   - [ ] Perplexity
   - [ ] Google (Gemini)

3. Escrever prompt: "The players defeated the goblins. What happens next?"
4. Clicar "Get Suggestion"

**✅ Verificar:**
- [ ] Response começa a aparecer (streaming)
- [ ] Texto renderiza palavra por palavra
- [ ] Markdown funciona (listas, bold, etc)
- [ ] Context inclui mensagens recentes

#### 4.2 Testar Diferentes Providers

1. Mudar para "OpenAI"
2. Prompt: "Generate a random encounter for level 3 party"
3. **✅ Verificar:** Response diferente de Claude

**Aba Bob:**
- [ ] Aba "AI" NÃO aparece (only DM)

---

### **FASE 5: Teste Async Play Mode (Story 7.1) - 10 min**

#### 5.1 Acessar Mesa Async

**Aba Alice (DM):**
```
URL: http://localhost:3000/tables/async-table-001
```

**✅ Verificar UI:**
- [ ] Header: "📝 Play-by-Post Mode" badge (azul)
- [ ] Sidebar esquerda: **Turn Order Sidebar** (NÃO members list)
- [ ] Turn order mostra:
   - ► Bob-Fighter (Current Turn) - Verde
   - ○ Carol-Wizard (Next) - Azul
- [ ] Banner acima do chat: "Waiting for: Bob-Fighter"
- [ ] Chat input **DESABILITADO** com mensagem: "⏳ Wait for your turn"

#### 5.2 Iniciar Primeiro Turno

**SQL Editor:**
```sql
-- Iniciar turno do Bob
INSERT INTO "AsyncTurn" (
  id,
  "tableId",
  "userId",
  "startedAt",
  "endedAt",
  deadline,
  skipped
)
VALUES (
  'turn-001',
  'async-table-001',
  'player-test-001', -- Bob
  NOW(),
  null,
  NOW() + INTERVAL '48 hours',
  false
);
```

**Refresh página Alice:**

**✅ Verificar:**
- [ ] Banner: "Waiting for: Bob-Fighter"
- [ ] Countdown: "47h 59m" (aproximado)
- [ ] Botão DM: "End Turn & Advance"
- [ ] Console: `async:turn-started` event (se estava conectado)

#### 5.3 Testar Chat Restrito

**Aba Bob (player-test-001):**
1. Abrir: http://localhost:3000/tables/async-table-001
2. **✅ Verificar:**
   - Banner: "🎯 Your Turn!" (verde)
   - "Deadline: 47h 59m"
   - Chat **HABILITADO**
   - Pode digitar e enviar mensagens

3. Enviar: "Bob searches the room for traps [Rolling Perception]"
4. Rolar dado: d20+3

**Aba Carol (player-test-002):**
1. Abrir mesma URL
2. **✅ Verificar:**
   - Banner: "Waiting for: Bob-Fighter"
   - Chat **DESABILITADO**
   - Vê mensagens do Bob mas não pode responder

**Aba Alice (DM):**
- [ ] Chat **SEMPRE HABILITADO** (DM pode sempre postar)
- [ ] Vê todas as mensagens

#### 5.4 Testar Avanço de Turno (DM)

**Aba Alice:**
1. Clicar "End Turn & Advance"
2. **✅ Verificar:**
   - Turn order: Carol-Wizard agora tem ►
   - Bob-Fighter agora tem ○ (próximo)
   - Banner: "Waiting for: Carol-Wizard"
   - Chat fica **DESABILITADO** (não é turno da Alice)
   - Console: `async:turn-changed` event

**Aba Bob:**
- [ ] Refresh: Chat agora **DESABILITADO**
- [ ] Banner: "Waiting for: Carol-Wizard"

**Aba Carol:**
- [ ] Refresh: Banner: "🎯 Your Turn!"
- [ ] Chat **HABILITADO**

#### 5.5 Testar Wrapping de Turno

**Aba Alice:**
1. Avançar turno (Carol → Bob)
2. **✅ Verificar:** Volta para Bob (wrapping funciona)

#### 5.6 Testar Countdown Timer

**Aba Bob (turno dele):**
1. Aguardar 1-2 minutos
2. **✅ Verificar:** Countdown atualiza a cada 60s
   - De: "47h 59m"
   - Para: "47h 58m"

---

### **FASE 6: Teste Real-Time Socket.io - 5 min**

#### 6.1 Testar Sync Entre 3 Abas

**Setup:**
- Aba 1: Alice (DM)
- Aba 2: Bob (Player)
- Aba 3: Carol (Player)

**Mesa Sync:**

1. **Alice** envia mensagem
   - [ ] Bob vê instantaneamente
   - [ ] Carol vê instantaneamente

2. **Bob** rola dado
   - [ ] Alice vê roll
   - [ ] Carol vê roll

3. **Alice** inicia combate
   - [ ] Bob vê combat tracker
   - [ ] Carol vê combat tracker

4. **Alice** atualiza HP
   - [ ] Bob vê update
   - [ ] Carol vê update

**Console F12 - Buscar eventos:**
```
✅ Socket.io events disparados:
- message:new
- roll:new
- combat:started
- combat:hp-updated
- combat:turn-changed
- combat:ended
- typing:start
- typing:stop
```

---

### **FASE 7: Teste Mobile Responsive - 5 min**

#### 7.1 Testar em Mobile View

**Chrome DevTools:**
1. F12 → Toggle Device Toolbar (Ctrl+Shift+M)
2. Selecionar: iPhone 12 Pro

**Mesa Sync:**
- [ ] Header compacto
- [ ] Tabs: Chat | Members | Info
- [ ] Chat funciona
- [ ] Dice roller acessível

**Mesa Async:**
- [ ] Badge: "📝 PbP" (compacto)
- [ ] Turn tracker acima do chat
- [ ] Chat restriction funciona
- [ ] Layout não quebra

---

## 🐛 Problemas Conhecidos / Esperados

### ✅ Esperado (não é bug):
1. **Sem autenticação** - Qualquer um pode acessar qualquer mesa (Story 1.3 pendente)
2. **Sem validação de userId** - Precisa passar userId manualmente na URL
3. **Countdown não auto-avança** - DM precisa clicar "End Turn" manualmente (Story 7.2)
4. **Sem notificações** - Players não recebem email/push quando é seu turno (Story 7.2)

### ⚠️ Bugs Reais (reportar se encontrar):
- [ ] Socket.io não conecta
- [ ] Mensagens não sincronizam
- [ ] Combat tracker não atualiza
- [ ] Async turn order não aparece
- [ ] Countdown não atualiza
- [ ] Chat restriction não funciona

---

## 📊 Checklist Final

### Features Testadas:
- [ ] **Chat em tempo real** (Story base)
- [ ] **Dice Roller** (Story base)
- [ ] **Typing indicators** (Story base)
- [ ] **Combat Tracker** (Story 5.3)
  - [ ] Iniciar combate
  - [ ] Initiative order
  - [ ] HP tracking
  - [ ] Turn advancement
  - [ ] Finalizar combate
- [ ] **AI DM Assistant** (Story 6.1)
  - [ ] Multiple providers
  - [ ] Streaming responses
  - [ ] Context awareness
  - [ ] DM-only access
- [ ] **Async Play Mode** (Story 7.1)
  - [ ] Turn order sidebar
  - [ ] Current turn banner
  - [ ] Countdown timer
  - [ ] Chat restrictions
  - [ ] Turn advancement
  - [ ] Play-by-Post badge

### Socket.io Events Verificados:
- [ ] `message:new`
- [ ] `typing:start` / `typing:stop`
- [ ] `roll:new`
- [ ] `combat:started`
- [ ] `combat:turn-changed`
- [ ] `combat:hp-updated`
- [ ] `combat:ended`
- [ ] `async:turn-started`
- [ ] `async:turn-changed`

---

## 🎯 Resultado Esperado

Se TUDO funcionou:
✅ **APROVADO PARA DEPLOY STAGING**

Se encontrou bugs críticos:
⚠️ **REPORTAR BUGS** → Corrigir → Testar novamente

---

## 📝 Notas de Teste

**Usar este espaço para anotar bugs/observações:**

```
Bug #1: [Descrever]
Severity: Critical/High/Medium/Low
Steps to reproduce: [...]

Bug #2: [Descrever]
...
```

---

**Testado por**: _____________
**Data**: _____________
**Versão**: Stories 5.3, 6.1, 7.1
**Status**: [ ] Aprovado [ ] Com ressalvas [ ] Reprovado
