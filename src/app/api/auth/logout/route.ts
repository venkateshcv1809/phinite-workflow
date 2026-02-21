import { NextResponse } from 'next/server';
import logger from '@/lib/logger';
import { logoutUser } from '@/lib/auth/actions';

export async function POST() {
  try {
    const result = await logoutUser();

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('Logout API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
