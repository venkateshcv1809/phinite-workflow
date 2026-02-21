'use server';

import { EmailSchema } from '@/lib/auth/schemas';
import { UserController } from '@/lib/db/controllers/user-controller';

export async function loginUser(email: string) {
  const validationResult = EmailSchema.safeParse(email);

  if (!validationResult.success) {
    return {
      success: false,
      error: validationResult.error.issues[0]?.message || 'Invalid email'
    };
  }

  try {
    const user = await UserController.upsert(email);

    return {
      success: true,
      user: {
        id: user.id,
        email: user.email
      }
    };
  } catch (error) {
    console.error('Login action error:', error);
    return {
      success: false,
      error: 'Internal server error'
    };
  }
}
