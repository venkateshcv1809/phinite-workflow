'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { JobController } from '@/lib/db/controllers/job-controller';
import { WorkflowController } from '@/lib/db/controllers/workflow-controller';
import logger from '../logger';

export async function getJobs(workflowId?: string, status?: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return {
        success: false,
        error: 'Invalid authentication',
      };
    }

    let jobs;

    if (workflowId) {
      jobs = await JobController.findByWorkflowId(workflowId, payload.id);
    } else if (status) {
      jobs = await JobController.findByStatus(status as any, payload.id);
    } else {
      // Return status counts if no specific filter
      const counts = await JobController.getStatusCounts(payload.id);
      return {
        success: true,
        data: counts,
      };
    }

    return {
      success: true,
      data: jobs,
    };
  } catch (error) {
    logger.error('Get jobs action error:', error);
    return {
      success: false,
      error: 'Failed to fetch jobs',
    };
  }
}

export async function createJob(workflowId: string) {
  if (!workflowId) {
    return {
      success: false,
      error: 'Workflow ID is required',
    };
  }

  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return {
        success: false,
        error: 'Invalid authentication',
      };
    }

    // Get workflow to capture published version snapshot
    const workflowResult = await getWorkflow(workflowId);
    
    if (!workflowResult.success || !workflowResult.data) {
      return {
        success: false,
        error: 'Workflow not found',
      };
    }

    const workflow = workflowResult.data;

    if (
      !workflow.published ||
      !workflow.publishedNodes ||
      !workflow.publishedEdges
    ) {
      return {
        success: false,
        error: 'Workflow must be published before execution',
      };
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

    return {
      success: true,
      data: job,
      message: 'Job created and queued successfully',
    };
  } catch (error) {
    logger.error('Create job action error:', error);
    return {
      success: false,
      error: 'Failed to create job',
    };
  }
}

// Helper function to get workflow for job creation
async function getWorkflow(id: string) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return {
        success: false,
        error: 'Authentication required',
      };
    }

    const payload = await verifyToken(token);

    if (!payload) {
      return {
        success: false,
        error: 'Invalid authentication',
      };
    }

    const workflow = await WorkflowController.findById(id, payload.id);

    if (!workflow) {
      return {
        success: false,
        error: 'Workflow not found',
      };
    }

    return {
      success: true,
      data: workflow,
    };
  } catch (error) {
    logger.error('Get workflow action error:', error);
    return {
      success: false,
      error: 'Failed to fetch workflow',
    };
  }
}
