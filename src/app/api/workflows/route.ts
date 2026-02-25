import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { WorkflowController } from '@/lib/db/controllers/workflow-controller';

export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');

    const workflows = await WorkflowController.findByUserId(payload.id, limit);

    return NextResponse.json({
      success: true,
      data: workflows,
    });
  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { name, nodes, edges } = body;

    if (!name || !nodes || !edges) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields: name, nodes, edges',
        },
        { status: 400 }
      );
    }

    // Validate workflow structure
    const validation = WorkflowController.validateWorkflow(nodes, edges);

    if (!validation.isValid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid workflow',
          details: validation.errors,
        },
        { status: 400 }
      );
    }

    const workflow = await WorkflowController.create({
      name,
      nodes,
      edges,
      userId: payload.id,
      published: false,
    });

    return NextResponse.json({
      success: true,
      data: workflow,
    });
  } catch (error) {
    console.error('Error creating workflow:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
