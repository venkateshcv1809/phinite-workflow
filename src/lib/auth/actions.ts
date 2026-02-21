'use server';

import { EmailSchema } from '@/lib/auth/schemas';
import { UserController } from '@/lib/db/controllers/user-controller';
import { generateToken, setAuthCookie } from './jwt';

export async function loginUser(email: string) {
  const validationResult = EmailSchema.safeParse(email);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || 'Invalid email'
    };
  }

  try {
    const response = await UserController.upsert(email);
    const user = {
      id: response.id,
      email: response.email
    };

    // Generate JWT token and set cookie
    const token = await generateToken(user);
    await setAuthCookie(token);

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}
