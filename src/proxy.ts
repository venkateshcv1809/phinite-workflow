import { NextRequest, NextResponse } from 'next/server';
import logger from './lib/logger';

export default function proxy(request: NextRequest) {
  logger.info('Incoming request', {
    method: request.method,
    url: request.url,
    userAgent: request.headers.get('user-agent'),
  });

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
