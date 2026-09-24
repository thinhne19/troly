import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow static assets, Next internal files, manifest, and public endpoints
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/icons') ||
    pathname.includes('.') ||
    pathname === '/manifest.webmanifest'
  ) {
    return NextResponse.next();
  }

  // Public auth pages
  const isAuthPage = pathname === '/login';

  // Check auth session from cookie
  const sessionToken =
    request.cookies.get('troly_session_token')?.value ||
    request.cookies.get('sb-access-token')?.value;
  const isExplicitlyLoggedOut = request.cookies.get('troly_logged_out')?.value === 'true';

  // If explicitly logged out and accessing protected route, redirect to login
  if (isExplicitlyLoggedOut && !isAuthPage) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If on login page and already has session token, redirect to dashboard
  if (isAuthPage && sessionToken && !isExplicitlyLoggedOut) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // Set default active session cookie on first visit to support seamless seed experience
  const response = NextResponse.next();
  if (!sessionToken && !isExplicitlyLoggedOut) {
    response.cookies.set('troly_session_token', 'seed_session_active', {
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      sameSite: 'lax',
    });
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};

