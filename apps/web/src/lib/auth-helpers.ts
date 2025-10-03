import { auth } from './auth';
import { redirect } from 'next/navigation';

/**
 * Get current session (server components only)
 */
export async function getServerSession() {
  return await auth();
}

/**
 * Require authentication - throws/redirects if not authenticated
 */
export async function requireAuth() {
  const session = await auth();
  if (!session) {
    redirect('/login');
  }
  return session;
}

/**
 * Get current user or null
 */
export async function getCurrentUser() {
  const session = await auth();
  return session?.user ?? null;
}
