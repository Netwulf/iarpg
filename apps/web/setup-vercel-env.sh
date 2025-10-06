#!/bin/bash

# Script to add all environment variables to Vercel production

echo "Adding environment variables to Vercel production..."

# NEXTAUTH_URL (critical for CSRF)
echo "iarpg-super-secret-key-change-in-production-123456789" | vercel env add NEXTAUTH_SECRET production

echo "https://iarpg-web.vercel.app" | vercel env add NEXTAUTH_URL production

echo "https://iarpg-production.up.railway.app" | vercel env add NEXT_PUBLIC_API_URL production

echo "https://ukxjmtdwgqiltrxglzda.supabase.co" | vercel env add NEXT_PUBLIC_SUPABASE_URL production

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGptdGR3Z3FpbHRyeGdsemRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk0MjIwNDYsImV4cCI6MjA3NDk5ODA0Nn0.DBxEmqwGHoNsbTYlNOae0-2xsLvwQuWDrOmn4zZD7BM" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production

echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVreGptdGR3Z3FpbHRyeGdsemRhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1OTQyMjA0NiwiZXhwIjoyMDc0OTk4MDQ2fQ.-wApXnsq6TpoT28MBG-GFgLyESW7RkPwAnIGqmLMJTE" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

echo "Done! Now redeploy with: vercel --prod"
