import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { auth } from '@/lib/auth';

export async function middleware(request: NextRequest) {
  try {
    const session = await auth();

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                       request.nextUrl.pathname.startsWith('/register');

    const isProtectedRoute =
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/tables') ||
      request.nextUrl.pathname.startsWith('/characters') ||
      request.nextUrl.pathname.startsWith('/profile');

    // Redirect authenticated users away from auth pages
    if (isAuthPage && session) {
      const url = new URL('/dashboard', request.nextUrl.origin);
      return NextResponse.redirect(url);
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !session) {
      const url = new URL('/login', request.nextUrl.origin);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // Allow request to continue on error to prevent breaking the app
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!api/|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
