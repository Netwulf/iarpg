# IARPG Deployment Checklist

## Pre-Deployment Review

### ✅ Implemented Features (Stories 5.3, 6.1, 7.1)

#### Story 5.3: Combat Tracker (Real-Time Sync)
- ✅ Initiative tracker with turn order
- ✅ HP tracking for combatants
- ✅ Real-time combat state via Socket.io
- ✅ DM controls: Start/End combat, Next turn
- ✅ Visual indicators for current turn
- ✅ Files: combat.controller.ts, combat.routes.ts, combat-tracker.tsx

#### Story 6.1: AI DM Assistant
- ✅ Multi-provider AI support (Anthropic, OpenAI, Perplexity, Google)
- ✅ Context-aware suggestions
- ✅ Real-time streaming responses
- ✅ DM-only access control
- ✅ Files: ai.controller.ts, ai.routes.ts, ai-assistant.tsx

#### Story 7.1: Async Play Mode (Play-by-Post)
- ✅ Turn-based async gameplay
- ✅ Turn order sidebar with visual indicators
- ✅ Deadline countdown timer
- ✅ Chat restrictions (only current player can post)
- ✅ DM turn advancement controls
- ✅ Real-time turn updates via Socket.io
- ✅ "📝 Play-by-Post Mode" badge
- ✅ Files: asyncTurn.controller.ts, asyncTurn.routes.ts, async-turn-tracker.tsx, turn-order-sidebar.tsx

### 🔧 Environment Configuration

#### Required Environment Variables

**API Server (`/apps/api/.env`):**
```bash
# Database
DATABASE_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:5432/postgres"

# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-app.vercel.app

# AI API Keys (for DM Assistant)
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-proj-...
PERPLEXITY_API_KEY=pplx-...
GOOGLE_API_KEY=AIza...
```

**Web App (`/apps/web/.env.local`):**
```bash
NEXT_PUBLIC_API_URL=https://your-api.railway.app

# For local development
NEXT_PUBLIC_API_URL=http://localhost:3001
```

### 📋 Pre-Deployment Checks

#### Database
- [ ] All migrations executed in Supabase
- [ ] Initial schema (Table, User, Character, Message, TableMember, CombatEncounter)
- [ ] AsyncTurn model added
- [ ] Indexes created for performance
- [ ] Row Level Security (RLS) policies configured (if needed)

#### Backend API
- [ ] All endpoints tested
- [ ] Socket.io events working
- [ ] Error handling in place
- [ ] CORS configured for production domain
- [ ] Environment variables set
- [ ] Build succeeds: `pnpm build`
- [ ] Linting passes: `pnpm lint`
- [ ] TypeScript compiles: `pnpm typecheck`

#### Frontend Web
- [ ] All pages render correctly
- [ ] Socket.io connections stable
- [ ] Real-time updates working
- [ ] Mobile responsive
- [ ] Build succeeds: `pnpm build`
- [ ] No console errors in production build

### 🚀 Deployment Platforms

#### Recommended Setup:
- **API Server**: Railway.app or Render.com
  - Supports WebSockets (Socket.io)
  - Easy environment variable management
  - Auto-deploys from Git

- **Web App**: Vercel
  - Optimized for Next.js
  - Automatic deployments
  - Edge network CDN

- **Database**: Supabase (already configured)
  - PostgreSQL managed service
  - Connection pooling enabled

#### Railway Deployment (API)

1. **Create New Project**
   ```bash
   railway login
   railway init
   ```

2. **Set Environment Variables**
   - Go to Railway dashboard → Variables
   - Add all variables from `/apps/api/.env`
   - Set `NODE_ENV=production`
   - Set `FRONTEND_URL` to your Vercel domain

3. **Deploy**
   ```bash
   cd apps/api
   railway up
   ```

4. **Get API URL**
   - Railway will provide a URL like: `https://your-app.railway.app`
   - Copy this for Web app configuration

#### Vercel Deployment (Web)

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Deploy**
   ```bash
   cd apps/web
   vercel --prod
   ```

3. **Set Environment Variables**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_URL` with Railway URL
   - Redeploy after setting variables

4. **Configure CORS on API**
   - Update `FRONTEND_URL` in Railway to match Vercel domain
   - Redeploy API

### 🧪 Post-Deployment Testing

#### Smoke Tests
- [ ] Home page loads
- [ ] Create table works
- [ ] Join table with invite code works
- [ ] Chat messages send and receive
- [ ] Dice rolling works
- [ ] Combat tracker functions
- [ ] AI Assistant responds (DM only)
- [ ] Async turn order displays
- [ ] Turn advancement works
- [ ] Socket.io events fire correctly

#### Performance Tests
- [ ] Page load < 3 seconds
- [ ] Socket.io latency < 100ms
- [ ] API response time < 500ms
- [ ] No memory leaks in long sessions

### 🔒 Security Checklist

- [ ] Environment variables never committed to Git
- [ ] API keys stored securely
- [ ] CORS configured for production domain only
- [ ] Authentication middleware ready (commented out for now - Story 1.3)
- [ ] No sensitive data in console.log
- [ ] Database connection uses SSL
- [ ] Rate limiting configured (optional)

### 📊 Monitoring & Logs

#### API Monitoring
- Railway provides built-in logs
- Monitor:
  - Server crashes
  - Socket.io connection errors
  - Database query failures
  - AI API timeouts

#### Web Monitoring
- Vercel Analytics (built-in)
- Monitor:
  - Page load times
  - Client-side errors
  - API call failures

### 🐛 Known Issues / Limitations

1. **Authentication**: Story 1.3 not yet implemented
   - Currently no user authentication
   - All users can access all tables
   - Workaround: Use invite codes to restrict access

2. **Turn History**: Optional feature not implemented
   - Turn history endpoint exists
   - UI timeline not yet built

3. **Auto Turn Advancement**: Story 7.2 not implemented
   - Deadline countdown shows, but doesn't auto-advance
   - DM must manually end turns

4. **Notifications**: Story 7.2 not implemented
   - No email/push notifications for turn changes
   - Players must check manually

### 📝 Rollback Plan

If deployment fails:

1. **API Issues**
   - Railway: Click "Rollback" to previous deployment
   - Check logs for specific error

2. **Web Issues**
   - Vercel: Instant Rollback available in dashboard
   - Previous deployments preserved

3. **Database Issues**
   - Supabase SQL Editor: Run rollback migrations
   - Contact Supabase support if needed

### 🎯 Success Criteria

Deployment is successful when:
- ✅ Users can create and join tables
- ✅ Real-time chat works
- ✅ Dice rolling functions
- ✅ Combat tracker operates correctly
- ✅ AI Assistant responds (with API keys)
- ✅ Async mode displays turn order
- ✅ Turn advancement works
- ✅ No critical errors in production logs

---

## Quick Start Commands

### Local Development
```bash
# Root directory
pnpm install
pnpm dev

# API runs on http://localhost:3001
# Web runs on http://localhost:3000
```

### Production Build Test
```bash
# API
cd apps/api
pnpm build
pnpm start

# Web
cd apps/web
pnpm build
pnpm start
```

### Database Operations
```sql
-- Check AsyncTurn table exists
SELECT * FROM "AsyncTurn" LIMIT 1;

-- Check Table has async fields
SELECT "turnDeadlineHours", "currentTurnIndex", "turnOrder"
FROM "Table" LIMIT 1;
```

---

**Last Updated**: 2025-10-02
**Version**: 1.0
**Stories Completed**: 5.3, 6.1, 7.1
