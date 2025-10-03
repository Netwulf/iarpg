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
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }

    // Redirect unauthenticated users to login
    if (isProtectedRoute && !session) {
      return NextResponse.redirect(new URL('/login', request.url));
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
