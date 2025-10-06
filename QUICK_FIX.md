# Quick Fix for Login Issue

## Problem
Login failing with "MissingCSRF" error - Vercel has NO environment variables configured.

## Solution (Pick One)

### Option 1: Automated (Fastest)
```bash
cd /Users/taypuri/iarpg-deploy
./fix-vercel-env.sh
cd apps/web
vercel --prod
```

### Option 2: Vercel Dashboard
1. Go to: https://vercel.com/tays-projects-cdc23402/web/settings/environment-variables
2. Copy from: `/Users/taypuri/iarpg-deploy/apps/web/.env.production.local`
3. Add all variables to "Production"
4. Redeploy

### Option 3: Manual CLI
```bash
cd apps/web
vercel env add NEXTAUTH_URL production
# Paste: https://iarpg-web.vercel.app

vercel env add NEXTAUTH_SECRET production
# Paste: iarpg-super-secret-key-change-in-production-123456789

vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://iarpg-production.up.railway.app

vercel env add NEXT_PUBLIC_SUPABASE_URL production
# Paste: https://ukxjmtdwgqiltrxglzda.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGptdGR3Z3FpbHRyeGdsemRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjIwNDYsImV4cCI6MjA3NDk5ODA0Nn0.DBxEmqwGHoNsbTYlNOae0-2xsLvwQuWDrOmn4zZD7BM

vercel env add SUPABASE_SERVICE_ROLE_KEY production
# Paste: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGptdGR3Z3FpbHRyeGdsemRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQyMjA0NiwiZXhwIjoyMDc0OTk4MDQ2fQ.-wApXnsq6TpoT28MBG-GFgLyESW7RkPwAnIGqmLMJTE

vercel --prod
```

## Test After Fix
```bash
# Visit in browser
https://iarpg-web.vercel.app/login

# Login with
Email: taynanmendes@gmail.com
Password: 12345678

# Should redirect to /dashboard ✅
```

## Why This Happened
Vercel deployment has zero env vars configured. NextAuth v5 needs `NEXTAUTH_URL` to validate CSRF tokens.

## Time to Fix
5 minutes
