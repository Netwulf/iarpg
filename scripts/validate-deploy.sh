#!/bin/bash
# Deployment Validation Script
# Purpose: Pre-deploy health check for IA-RPG
# Usage: ./scripts/validate-deploy.sh

set -e  # Exit on error

echo "🔍 IA-RPG Deployment Validation"
echo "================================"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0
WARNINGS=0

# Function to check command
check_step() {
    local step_name=$1
    local command=$2

    echo -n "⏳ $step_name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${RED}✗${NC}"
        ((ERRORS++))
        return 1
    fi
}

# Function for warnings
check_warning() {
    local step_name=$1
    local command=$2

    echo -n "⚠️  $step_name... "

    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}✓${NC}"
        return 0
    else
        echo -e "${YELLOW}⚠${NC}"
        ((WARNINGS++))
        return 1
    fi
}

echo "📦 Checking Build Environment"
echo "------------------------------"
check_step "Node.js installed" "node --version"
check_step "pnpm installed" "pnpm --version"
check_step "Git repository" "git rev-parse --git-dir"
echo ""

echo "🔨 Running Build Tests"
echo "----------------------"
check_step "TypeScript compilation" "pnpm typecheck"
check_step "ESLint validation" "pnpm lint"
check_step "Web app build" "cd apps/web && pnpm build && cd ../.."
echo ""

echo "🔐 Checking Environment Variables"
echo "----------------------------------"

# Check Vercel env vars
if command -v vercel &> /dev/null; then
    cd apps/web
    VERCEL_ENV_COUNT=$(vercel env ls 2>/dev/null | grep -c "Production" || echo "0")
    cd ../..

    if [ "$VERCEL_ENV_COUNT" -ge "6" ]; then
        echo -e "⏳ Vercel env vars (6+ required)... ${GREEN}✓${NC} ($VERCEL_ENV_COUNT found)"
    else
        echo -e "⏳ Vercel env vars (6+ required)... ${YELLOW}⚠${NC} ($VERCEL_ENV_COUNT found)"
        ((WARNINGS++))
    fi
else
    echo -e "⚠️  Vercel CLI not installed... ${YELLOW}⚠${NC}"
    ((WARNINGS++))
fi

# Check Railway env vars
if command -v railway &> /dev/null; then
    cd apps/api
    RAILWAY_STATUS=$(railway status 2>&1 || echo "not linked")
    cd ../..

    if echo "$RAILWAY_STATUS" | grep -q "Project:"; then
        echo -e "⏳ Railway project linked... ${GREEN}✓${NC}"
    else
        echo -e "⏳ Railway project linked... ${YELLOW}⚠${NC} (not linked)"
        ((WARNINGS++))
    fi
else
    echo -e "⚠️  Railway CLI not installed... ${YELLOW}⚠${NC}"
    ((WARNINGS++))
fi

echo ""

echo "🧪 Running Tests (if available)"
echo "--------------------------------"
check_warning "Unit tests" "pnpm test --passWithNoTests"
echo ""

echo "📊 Results"
echo "=========="
echo ""

if [ $ERRORS -eq 0 ] && [ $WARNINGS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL CHECKS PASSED!${NC}"
    echo "Ready to deploy 🚀"
    exit 0
elif [ $ERRORS -eq 0 ]; then
    echo -e "${YELLOW}⚠️  PASSED WITH WARNINGS${NC}"
    echo "Errors: $ERRORS | Warnings: $WARNINGS"
    echo "Review warnings before deploying"
    exit 0
else
    echo -e "${RED}❌ VALIDATION FAILED${NC}"
    echo "Errors: $ERRORS | Warnings: $WARNINGS"
    echo "Fix errors before deploying"
    exit 1
fi
