import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { WorkflowController } from '@/lib/db/controllers/workflow-controller';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    
    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const payload = await verifyToken(token);
    
    if (!payload) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication' },
        { status: 401 }
      );
    }

    const workflow = await WorkflowController.revertToPublished(params.id, payload.id);

    if (!workflow) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found or no published version to revert to' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: workflow,
      message: 'Workflow reverted to last published version',
    });
  } catch (error) {
    console.error('Error reverting workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
