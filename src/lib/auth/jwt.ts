'use server';

import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { CONFIG } from '../config';
import logger from '../logger';

const JWT_SECRET = new TextEncoder().encode(CONFIG.JWT);

export interface TokenPayload {
  id: string;
  email: string;
  iat: number;
  exp: number;
}

export async function generateToken(payload: { id: string; email: string }): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + 24 * 60 * 60; // 24 hours

  const jwtPayload = {
    ...payload,
    iat: now,
    exp,
  };

  const jwt = await new SignJWT(jwtPayload)
    .setProtectedHeader({ alg: 'HS256' })
    .sign(JWT_SECRET);

  return jwt;
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      algorithms: ['HS256'],
    });

    return {
      id: String(payload.id),
      email: String(payload.email),
      iat: Number(payload.iat),
      exp: Number(payload.exp),
    };
  } catch (error) {
    logger.error('JWT verification failed:', error);
    return null;
  }
}

export async function setAuthCookie(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 24 * 60 * 60, // 24 hours
    path: '/',
  });
}

export async function clearAuthCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
