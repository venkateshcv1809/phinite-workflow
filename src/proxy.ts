import { NextRequest, NextResponse } from 'next/server';
import logger from './lib/logger';
import { verifyToken } from './lib/auth/jwt';

export default async function proxy(request: NextRequest) {
  logger.info('Incoming request', {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
  });

  const { pathname } = new URL(request.url);

  if (pathname === '/login' || pathname.startsWith('/api/auth/login')) {
    return NextResponse.next();
  }

  const token = request.cookies.get('auth-token')?.value;

  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await verifyToken(token);

  if (!payload) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }

  if (pathname === '/login') {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
};
