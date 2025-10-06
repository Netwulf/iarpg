#!/bin/bash
# Script to fix Vercel environment variables for IA-RPG
# This script sets all required environment variables for production

set -e

echo "🔧 Setting up Vercel environment variables for IA-RPG..."
echo ""

cd apps/web

# Required environment variables
echo "Setting NEXTAUTH_URL..."
echo "https://iarpg-web.vercel.app" | vercel env add NEXTAUTH_URL production

echo "Setting NEXTAUTH_SECRET..."
echo "iarpg-super-secret-key-change-in-production-123456789" | vercel env add NEXTAUTH_SECRET production

echo "Setting NEXT_PUBLIC_API_URL..."
echo "https://iarpg-production.up.railway.app" | vercel env add NEXT_PUBLIC_API_URL production

echo "Setting NEXT_PUBLIC_SUPABASE_URL..."
echo "https://ukxjmtdwgqiltrxglzda.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGptdGR3Z3FpbHRyeGdsemRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjIwNDYsImV4cCI6MjA3NDk5ODA0Nn0.DBxEmqwGHoNsbTYlNOae0-2xsLvwQuWDrOmn4zZD7BM" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "Setting SUPABASE_SERVICE_ROLE_KEY..."
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGptdGR3Z3FpbHRyeGdsemRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQyMjA0NiwiZXhwIjoyMDc0OTk4MDQ2fQ.-wApXnsq6TpoT28MBG-GFgLyESW7RkPwAnIGqmLMJTE" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo ""
echo "✅ All environment variables set successfully!"
echo ""
echo "📦 Next steps:"
echo "1. Redeploy the application: vercel --prod"
echo "2. Test login at: https://iarpg-web.vercel.app/login"
echo "3. Use credentials: taynanmendes@gmail.com / 12345678"
echo ""
echo "⚠️  Security Note: Remember to change NEXTAUTH_SECRET to a unique value!"
