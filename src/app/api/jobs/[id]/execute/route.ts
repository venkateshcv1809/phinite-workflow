import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { JobController } from '@/lib/db/controllers/job-controller';
import { addJobToQueue } from '@/lib/services/workflow-executor';

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

    // Check if job exists and is in queued state
    const job = await JobController.findById(params.id, payload.id);

    if (!job) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      );
    }

    if (job.status !== 'queued') {
      return NextResponse.json(
        {
          success: false,
          error: `Job cannot be executed. Current status: ${job.status}`,
        },
        { status: 400 }
      );
    }

    // Add job to execution queue
    addJobToQueue(params.id);

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job added to execution queue',
    });
  } catch (error) {
    console.error('Error executing job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
