'use server';

import { SignJWT} from 'jose';
import { cookies } from 'next/headers';
import { CONFIG } from '../config';

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
