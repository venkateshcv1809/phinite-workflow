import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/auth/jwt';
import { JobController } from '@/lib/db/controllers/job-controller';
import { Job } from '@/lib/db/models/job';

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
    const workflowId = searchParams.get('workflowId');
    const status = searchParams.get('status') as Job['status'];

    let jobs;

    if (workflowId) {
      jobs = await JobController.findByWorkflowId(workflowId, payload.id);
    } else if (status) {
      jobs = await JobController.findByStatus(status, payload.id);
    } else {
      // Return status counts if no specific filter
      const counts = await JobController.getStatusCounts(payload.id);
      return NextResponse.json({
        success: true,
        data: counts,
      });
    }

    return NextResponse.json({
      success: true,
      data: jobs,
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
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
    const { workflowId } = body;

    if (!workflowId) {
      return NextResponse.json(
        { success: false, error: 'Missing required field: workflowId' },
        { status: 400 }
      );
    }

    // Get workflow to capture published version snapshot
    const workflowRes = await fetch(
      `${request.nextUrl.origin}/api/workflows/${workflowId}`
    );
    const workflowData = await workflowRes.json();

    if (!workflowData.success) {
      return NextResponse.json(
        { success: false, error: 'Workflow not found' },
        { status: 404 }
      );
    }

    const workflow = workflowData.data;

    if (
      !workflow.published ||
      !workflow.publishedNodes ||
      !workflow.publishedEdges
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Workflow must be published before execution',
        },
        { status: 400 }
      );
    }

    const job = await JobController.create({
      workflowId,
      workflowSnapshot: {
        name: workflow.name,
        nodes: workflow.publishedNodes,
        edges: workflow.publishedEdges,
        publishedAt: workflow.updatedAt,
      },
      userId: payload.id,
      status: 'queued',
      progress: 0,
      logs: [],
    });

    return NextResponse.json({
      success: true,
      data: job,
      message: 'Job created and queued successfully',
    });
  } catch (error) {
    console.error('Error creating job:', error);
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
