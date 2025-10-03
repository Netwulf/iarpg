# IA-RPG: PROJECT BRIEFING
**Version 1.0 | September 30, 2025**

---

## EXECUTIVE SUMMARY

**Product:** IA-RPG - Plataforma web de RPG por texto onde você joga quando, como e onde quiser - com amigos (sync/async) ou solo com IA.

**Problem:** 30M+ pessoas querem jogar RPG mas não conseguem comprometer 4 horas semanais no mesmo horário. Ferramentas são fragmentadas (Discord + Roll20 + D&D Beyond).

**Solution:** Plataforma integrada onde você joga quando e como quiser - 20min com IA no almoço, mesa assíncrona com amigos, ou sessão live quando todos podem. Tudo num lugar: chat, fichas, dados, IA.

**Market:** TAM $1B, SAM $1.6B, SOM $5M ARR (Year 5)

**Go-to-Market:** Bootstrap, launch em 2 semanas, PMF em 3 meses, profitable Year 2.

---

## 1. PRODUCT VISION

### Visão (10 anos):
"Ser o lugar definitivo onde qualquer pessoa, em qualquer lugar, com qualquer agenda, pode jogar RPG do jeito que sua vida permite."

### Missão (3 anos):
"Eliminar as barreiras de tempo e coordenação que impedem milhões de pessoas de jogar RPG."

### North Star Metric:
**Weekly Active Tables** (mesas com 3+ posts ou 1+ sessão nos últimos 7 dias)

---

## 2. CORE VALUE PROPOSITIONS

### Para Jogadores:
1. **Jogue no seu ritmo** - Async, sync, ou solo com IA
2. **Tudo integrado** - Chat + fichas + dados + IA num lugar
3. **Mobile-first** - Joga no celular, no ônibus
4. **Barreira baixa** - Tutorial com IA, aprende jogando

### Para Mestres:
1. **Ferramentas melhores** - IA ajuda com NPCs, regras, prep
2. **Flexibilidade** - Mesa adapta quando vida muda
3. **Menos pressão** - Async permite pensar antes de narrar
4. **Monetização** (futuro) - Cobra por mesas, vende aventuras

### Diferencial vs Competição:
- **Roll20:** Eles são síncrono + mapas. Nós somos flexível + IA.
- **AI Dungeon:** Eles são solo narrative. Nós somos multiplayer structured.
- **Play-by-Post forums:** Eles são UX dos anos 2000. Nós somos mobile-first 2025.

---

## 3. PRODUCT DEFINITION

### Três Modos de Jogo:

#### 1. Síncrono (Live Text)
- Chat realtime (websockets)
- Todos online ao mesmo tempo
- Sessões 2-4h com início/fim
- Experiência: Discord text mas focado em RPG

#### 2. Assíncrono (Play-by-Post)
- Posts estilo fórum moderno
- Cada um posta quando pode
- Turnos com deadline (24-48h)
- Experiência: Reddit threads + Substack + IRPG

#### 3. Solo com IA (AI Dungeon Master)
- IA como mestre completo
- Joga literalmente quando quiser
- Tutorial guiado ou free play
- Experiência: AI Dungeon + D&D rules

### Features Core (MVP):

**Autenticação:**
- Email/password + Google/Discord OAuth
- Onboarding: 3 perguntas → CTA personalizado

**Mesas:**
- Criar (nome, tipo, privacidade, schedule)
- Join (código ou browse público)
- Netflix UI para discovery
- 3 níveis privacidade: Private / Public / Spectator

**Personagens:**
- Quick Start (6 pre-made) ou Guided (step-by-step)
- D&D 5e: raças PHB, 12 classes, Point Buy/Standard Array
- Ficha completa: stats, skills, spells, combat, inventory
- **Portável:** Cria uma vez, usa em múltiplas mesas
- Profile mostra seus personagens

**Chat/Posts:**
- Sync: Realtime messages, typing indicators, reactions
- Async: Rich text (markdown), threading, email notifications
- Sistema de turnos (flexible ou strict initiative)

**Dados:**
- Notação padrão: `1d20+5`, `2d6+3`
- Advantage/disadvantage: `adv`, `dis`
- Visual: Resultado grande, breakdown de cálculo
- Críticos destacados (green/red)
- Integrado: rolls da ficha automáticos

**IA Assistant:**
- Rules helper (dúvidas de regras)
- NPC generator (cria NPCs on-demand)
- DM suggestions (consequências de ações)
- Solo DM (narrativa completa com IA)
- Rate limit: 10/dia (free), ilimitado (premium)

**Combate:**
- Initiative tracker (ordem automática)
- HP tracking (+/- rápido)
- Conditions (toggle badges)
- Death saves (roll + track)
- Turn actions (Action, Bonus, Reaction)

---

## 4. DESIGN SYSTEM

### Brand:
- **Nome:** IA-RPG (homenagem ao IRPG)
- **Tagline:** "Play RPG on your terms"
- **Personality:** Clean, inteligente, flexível, nostálgico-moderno

### Visual Identity:

**Cores:**
```
Primary: Monochrome base
  - Black (#0A0A0A)
  - Grays (#1A1A1A → #DADADA)
  - White (#FFFFFF)

Accent: Verde limão (usado sparingly)
  - Neon Green (#39FF14) - CTAs, hovers, links
  - Usage: <10% visual weight (como Netflix usa vermelho)

Dark mode: Default
Light mode: Available
```

**Tipografia:**
```
Sans: Inter (UI, headers, chat)
Mono: JetBrains Mono (dice, code)

Scale:
  Display: 48px (hero)
  H1: 32px (page titles)
  Body: 15-16px (readable)
  Caption: 11px (labels)
  
Line height: 1.6 (reading comfort)
Max width: 680px (posts/chat)
```

**Filosofia:**
- Content first, UI second
- Whitespace é feature
- Green usado pontualmente (não dominante)
- Inspiração: Substack (typography) + Netflix (browse) + Linear (speed)
- **NÃO:** Roll20 (cluttered), Discord (noisy), gamification excessiva

---

## 5. TECHNICAL ARCHITECTURE

### Stack:

**Frontend:**
```
Framework: Next.js 14+ (App Router)
Language: TypeScript (strict)
Styling: TailwindCSS + shadcn/ui
State: Zustand + TanStack Query
Realtime: Socket.io client
Rich Text: Tiptap (markdown)
Hosting: Vercel
```

**Backend:**
```
Runtime: Node.js 20+
Framework: Express (ou Fastify)
Language: TypeScript
Database: PostgreSQL (Supabase)
ORM: Prisma
Realtime: Socket.io server
Cache: Redis (Upstash)
Jobs: BullMQ
Hosting: Railway ou Render
```

**Integrações:**
```
Auth: NextAuth.js (Credentials, Google, Discord)
AI: OpenAI (GPT-4o), Anthropic (Claude 3.5)
Email: Resend
Payments: Stripe (Phase 2)
Storage: Supabase Storage (avatars, images)
Monitoring: Sentry + Vercel Analytics
Analytics: PostHog
```

### Database Schema (Core Tables):

```
users
  - id, email, username, passwordHash
  - tier (free/premium/master)
  - onboarded, preferences
  
characters
  - id, userId (owner)
  - name, race, class, level
  - ability scores, HP, AC
  - skills, spells, inventory
  - portable (belongs to user, not table)
  
tables
  - id, ownerId
  - name, description, playStyle
  - privacy, inviteCode
  - state, settings
  
table_members (pivot)
  - tableId, userId, characterId
  - role (gm/player/spectator)
  - experiencePoints, characterLevel
  
messages (sync)
  - tableId, userId, content
  - type (text/system/dice)
  - reactions, edited
  
posts (async)
  - tableId, userId, content (markdown)
  - type (ic/ooc/dm)
  - parentId (threading)
  
dice_rolls
  - tableId, userId, notation
  - result, breakdown
  
combat_state
  - tableId, round, currentTurnIndex
  - combatants (JSON)
  
ai_interactions
  - userId, tableId, type
  - prompt, response, model
  - cost tracking
```

### API Design:

**REST:**
```
POST   /auth/signup
POST   /auth/login
GET    /auth/me

GET    /tables
POST   /tables
GET    /tables/:id
PATCH  /tables/:id
POST   /tables/:id/join

GET    /characters
POST   /characters
GET    /characters/:id
PATCH  /characters/:id

POST   /ai/query
POST   /ai/dm/narrate

POST   /tables/:id/dice-rolls
GET    /tables/:id/messages
POST   /tables/:id/messages
```

**WebSocket:**
```
Events client → server:
  - table:join
  - message:send
  - dice:roll
  - typing:start/stop
  
Events server → client:
  - message:new
  - dice:rolled
  - user:joined/left
  - combat:updated
```

---

## 6. DEVELOPMENT PHILOSOPHY

### MVP Principles:

**1. Function over Form**
- Dados: Números aparecem (sem 3D physics)
- Fichas: Texto limpo organizado (sem ilustrações fancy)
- Polish vem depois de PMF

**2. Data-First**
- PostgreSQL desde linha 1
- Salva tudo: mensagens, rolls, mudanças em fichas
- Backup diário (30-day retention)
- Export capability (GDPR)

**3. Single System Focus**
- D&D 5e only no MVP
- Outros sistemas: Phase 2+ (se demanda)
- Rationale: IA quality, market size, complexity

**4. Progressive Enhancement**
- Semana 1-2: Web responsivo
- Mês 2: PWA (install, offline, push)
- Mês 6+: Native apps (se dados justificam)

### O Que NÃO Fazer no MVP:

❌ Dados 3D (Three.js)
❌ Fichas ilustradas fancy
❌ Voice/video integration
❌ Suporte a múltiplos sistemas
❌ Marketplace
❌ Advanced VTT (fog of war, dynamic lighting)
❌ Achievements/gamification
❌ Native mobile apps

**Decisão:** Se não ajuda validar "pessoas querem jogar RPG flexível com IA?", deixa pra depois.

---

## 7. GO-TO-MARKET

### Phase 1: MVP (Semana 1-2)

**Objetivo:** Produto funcional que você e amigos podem jogar

**Semana 1:**
- Dia 1-2: Auth + Database + Create/Join table
- Dia 3-4: Character creation + Dice roller + Chat realtime
- Dia 5-7: IA assistant + Solo AI play + Mobile responsive

**Semana 2:**
- Dia 8-10: Async tables + Combat system + Character sheet complete
- Dia 11-12: UI polish + Performance + Accessibility
- Dia 13-14: Private beta (30 users) + Onboarding + Docs

**Sucesso:** Você joga 3+ sessões completas com amigos. NPS >30. <5 bugs críticos.

### Phase 2: Public Beta (Mês 2-3)

**Objetivo:** 1000 usuários, refinar PMF

**Features:**
- Browse tables (Netflix UI)
- Matchmaking (filters, search)
- AI improvements (NPC generation, images)
- Markdown, threading

**Marketing:**
- Reddit: r/rpg, r/DnD, r/lfg
- Product Hunt
- Discord communities
- Blog content (SEO)

**Sucesso:** 1000 signups, 100 mesas ativas, 50+ sessões/semana.

### Phase 3: Premium Launch (Mês 3-4)

**Objetivo:** Monetização, sustainable growth

**Features:**
- Premium tier ($8/mês): IA ilimitada, imagens, mesas ilimitadas
- Billing (Stripe)
- Referral program

**Marketing:**
- Email campaigns
- Community building
- Partnerships (creators)

**Sucesso:** 5000 users, 500 mesas ativas, $500 MRR, 10% conversion.

### Phase 4-5: Scale (Mês 4-12)

**Objetivo:** 10K users, $5K MRR

- Mobile apps (PWA → Native se necessário)
- Pathfinder 2e, Call of Cthulhu
- Marketplace (campaigns)
- Spectator mode
- Paid ads, influencers, SEO content

---

## 8. MONETIZATION

### Free Tier (Forever):
```
Limits:
  - 1 mesa simultânea
  - 3 personagens
  - IA: 10 queries/dia
  - Sem geração de imagens

Access:
  - Todos os modos (sync/async/IA)
  - Features básicas completas
  - Mobile app
```

### Premium ($8/mês ou $80/ano):
```
Unlocks:
  - Mesas ilimitadas
  - Personagens ilimitados
  - IA ilimitada
  - Imagens: 20/dia (DALL-E)
  - Priority support
  - Export features
```

### Master ($15/mês ou $150/ano):
```
Tudo do Premium +
  - Custom IA training
  - Analytics de mesa
  - Session prep tools (IA)
  - Marketplace revenue share (futuro)
  - API access (futuro)
```

**Target Conversion:**
- Free → Premium: 10%
- Free → Master: 1%

**Unit Economics:**
- LTV Premium: $120 (20 meses)
- CAC: <$30
- LTV/CAC: >3:1

---

## 9. SUCCESS METRICS

### MVP (Week 2):
- [ ] 30 beta users play 1+ full session
- [ ] NPS >30
- [ ] <5 critical bugs
- [ ] You play 5+ sessions personally

### Month 3 (Public Beta):
- [ ] 1,000 users
- [ ] 100 active tables
- [ ] $500 MRR
- [ ] 30% Day 30 retention

### Month 6:
- [ ] 5,000 users
- [ ] 500 active tables  
- [ ] $3K MRR
- [ ] Product Hunt top 5

### Year 1:
- [ ] 10,000 users
- [ ] 1,000 active tables
- [ ] $10K MRR
- [ ] Profitable or near

### Year 2:
- [ ] 100,000 users
- [ ] 10,000 active tables
- [ ] $100K MRR
- [ ] Team of 5

### Year 5:
- [ ] 2M users
- [ ] 200K active tables
- [ ] $5M ARR
- [ ] Market leader in niche

---

## 10. KEY RISKS & MITIGATIONS

### Technical:

**AI Costs Explode**
- Mitigate: Rate limiting, caching, model switching (GPT-4o-mini), monitoring

**AI Quality Insufficient**
- Mitigate: Prompt engineering, model comparison, human override, feedback loop

**Performance Degrades**
- Mitigate: Proper indexes, caching (Redis), load testing, monitoring

### Business:

**Low Conversion (<5%)**
- Mitigate: Test pricing ($5/$8/$10), improve value prop, contextual prompts

**High Churn (>10%)**
- Mitigate: Onboarding optimization, engagement loops, exit surveys, community

**Competition Copies**
- Mitigate: Speed (12-18mo head start), network effects, execution quality, niche dominance

---

## 11. IMMEDIATE NEXT STEPS

### Hoje:
1. [ ] Create GitHub repo
2. [ ] Setup Next.js + Supabase + Prisma
3. [ ] Deploy "hello world" to Vercel
4. [ ] Buy domain (ia-rpg.com)

### Esta Semana:
1. [ ] Landing page + waitlist
2. [ ] Database schema deployed
3. [ ] Auth flow (signup/login)
4. [ ] Basic table CRUD

### Week 1-2:
Execute MVP roadmap (see Phase 1 above)

---

## 12. DECISION LOG

**✅ Decided:**

1. **Name:** IA-RPG
2. **Colors:** Black/gray base + neon green accent (sparingly)
3. **System:** D&D 5e only in MVP
4. **Database:** Supabase PostgreSQL from day 1
5. **Platform:** Web responsive → PWA → Native (if needed)
6. **MVP Scope:** Functional, not fancy (polish post-PMF)
7. **Timeline:** 2 weeks to MVP, 3 months to 1K users
8. **Business Model:** Freemium (free generous, premium $8, master $15)

**⏸️ To Decide Later:**

1. Visual polish (3D dice, fancy sheets) - post-PMF
2. Additional systems (Pathfinder, CoC) - if demand
3. Voice/video integration - Month 6+
4. Native mobile apps - if data justifies
5. Marketplace features - Year 1+

**❌ Not Doing:**

1. Multi-system support in MVP
2. VTT features (fog of war, dynamic lighting)
3. Voice/video in MVP
4. Over-engineering "generic" system
5. Perfect before launch

---

## 13. CONTACT & RESOURCES

**Documentation:**
- Full PRD: [Link when hosted]
- Design System: [Figma when created]
- API Docs: [When deployed]

**Repositories:**
- Frontend: github.com/[org]/ia-rpg-web
- Backend: github.com/[org]/ia-rpg-api

**Environments:**
- Production: ia-rpg.com
- Staging: staging.ia-rpg.com
- Local: localhost:3000

**Team:**
- Product/Dev: [Your name]
- (Expand as you hire)

**Philosophy:**
This is a living document. Update as you learn. Ship fast, iterate based on users. Function over form. Validate fast, polish later.

---

# TL;DR

**What:** Plataforma web pra jogar RPG por texto - sync, async, ou solo com IA. Tudo integrado.

**Why:** 30M pessoas querem jogar RPG mas não conseguem commitment semanal. Ferramentas são fragmentadas.

**How:** Next.js + Supabase + IA (GPT-4o). D&D 5e only. Clean design. Mobile-first. Launch em 2 semanas.

**Success:** 1K users em 3 meses, $5K MRR em 1 ano, profitable Year 2.

**Next:** Cria repo. Constrói MVP. Ship em 2 semanas. Iterate based on users.

---