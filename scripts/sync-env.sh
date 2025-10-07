#!/bin/bash
# Environment Variables Sync Script
# Purpose: Keep Vercel and Railway env vars in sync
# Usage: ./scripts/sync-env.sh [--dry-run]

set -e

DRY_RUN=false
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo "🔍 DRY RUN MODE - No changes will be made"
fi

echo "🔄 IA-RPG Environment Sync"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Check if CLIs are installed
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI not found. Install with: npm i -g vercel"
    exit 1
fi

if ! command -v railway &> /dev/null; then
    echo "❌ Railway CLI not found. Install with: npm i -g @railway/cli"
    exit 1
fi

echo -e "${BLUE}📋 Shared Environment Variables:${NC}"
echo "--------------------------------"
echo "These vars should exist in both Vercel and Railway:"
echo ""
echo "  • NEXTAUTH_SECRET"
echo "  • DATABASE_URL (Supabase)"
echo "  • SUPABASE_URL"
echo "  • SUPABASE_ANON_KEY"
echo "  • SUPABASE_SERVICE_ROLE_KEY"
echo "  • OPENAI_API_KEY"
echo ""

echo -e "${YELLOW}⚠️  Manual Sync Required${NC}"
echo "------------------------"
echo "This script provides a checklist. Due to security,"
echo "you must manually verify and sync sensitive env vars."
echo ""

# Get Vercel env vars
echo -e "${BLUE}🔵 Vercel Environment (apps/web):${NC}"
cd apps/web
vercel env ls 2>/dev/null | grep "Production" || echo "No vars found"
cd ../..
echo ""

# Get Railway env vars
echo -e "${BLUE}🟣 Railway Environment (apps/api):${NC}"
cd apps/api
railway vars 2>/dev/null | grep -E "NEXTAUTH|DATABASE|SUPABASE|OPENAI" || echo "Project not linked"
cd ../..
echo ""

echo -e "${GREEN}✅ Sync Checklist:${NC}"
echo "-------------------"
echo "[ ] NEXTAUTH_SECRET matches in both platforms"
echo "[ ] DATABASE_URL (Supabase) exists in both"
echo "[ ] SUPABASE_URL matches"
echo "[ ] SUPABASE_ANON_KEY matches"
echo "[ ] SUPABASE_SERVICE_ROLE_KEY exists in both"
echo "[ ] OPENAI_API_KEY exists in Railway"
echo "[ ] NEXTAUTH_URL set correctly in Vercel (https://iarpg-web.vercel.app)"
echo "[ ] CORS_ORIGIN set in Railway (https://iarpg-web.vercel.app)"
echo ""

echo "💡 To update vars:"
echo "  Vercel:  cd apps/web && vercel env add VARIABLE_NAME"
echo "  Railway: cd apps/api && railway vars set VARIABLE_NAME=value"
echo ""

if [ "$DRY_RUN" == false ]; then
    echo "✨ Sync complete! Review checklist above."
else
    echo "✨ Dry run complete! No changes made."
fi
