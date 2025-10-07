import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Edge Runtime-compatible middleware
 * Authentication checks are delegated to page-level auth() calls
 * This middleware only handles basic routing logic
 */
export async function middleware(request: NextRequest) {
  try {
    // Check for session cookie (lightweight check without importing auth)
    const sessionToken = request.cookies.get('next-auth.session-token') ||
                        request.cookies.get('__Secure-next-auth.session-token');

    const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                       request.nextUrl.pathname.startsWith('/register');

    const isProtectedRoute =
      request.nextUrl.pathname.startsWith('/dashboard') ||
      request.nextUrl.pathname.startsWith('/tables') ||
      request.nextUrl.pathname.startsWith('/characters') ||
      request.nextUrl.pathname.startsWith('/profile');

    // Clone response to add headers
    const response = isAuthPage && sessionToken
      ? NextResponse.redirect(new URL('/dashboard', request.nextUrl.origin))
      : isProtectedRoute && !sessionToken
      ? NextResponse.redirect(new URL('/login', request.nextUrl.origin))
      : NextResponse.next();

    // Add security headers
    response.headers.set(
      'Content-Security-Policy',
      [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://vercel.live",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob:",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co https://*.railway.app wss://*.supabase.co",
        "frame-src 'self' https://vercel.live",
      ].join('; ')
    );
    response.headers.set('X-Frame-Options', 'SAMEORIGIN');
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    return response;
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
