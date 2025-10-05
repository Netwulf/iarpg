/**
 * Fetch with Authentication
 * Helper to make authenticated API calls with NextAuth JWT token
 *
 * Usage:
 *   const response = await fetchWithAuth('/api/characters');
 *   const data = await response.json();
 */

import { getSession } from 'next-auth/react';

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const session = await getSession();

  if (!session) {
    throw new Error('No session found - user not authenticated');
  }

  // Get the custom JWT token generated in auth.ts session callback
  // This token is signed with NEXTAUTH_SECRET and contains {id, email, name, tier}
  const token = (session as any).accessToken;

  if (!token) {
    throw new Error('No access token in session');
  }

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  return fetch(url, {
    ...options,
    headers,
  });
}
