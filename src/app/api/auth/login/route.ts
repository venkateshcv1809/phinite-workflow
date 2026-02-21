import { NextRequest, NextResponse } from 'next/server';
import { loginUser } from '@/lib/auth/actions';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));

    if (!body || typeof body.email !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: 'Email is required'
        },
        { status: 400 }
      );
    }

    const result = await loginUser(body.email);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: result.user?.id,
        email: result.user?.email
      }
    });

  } catch (error) {
    console.error('Login API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error'
      },
      { status: 500 }
    );
  }
}
