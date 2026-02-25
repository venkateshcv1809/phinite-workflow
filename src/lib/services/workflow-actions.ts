'use server';

import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/jwt';
import { WorkflowController } from '@/lib/db/controllers/workflow-controller';
import logger from '../logger';

export async function createWorkflow(name: string) {
  if (!name || !name.trim()) {
    return {
      success: false,
      error: 'Workflow name is required',
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

    const workflow = await WorkflowController.create({
      name: name.trim(),
      nodes: [],
      edges: [],
      userId: payload.id,
      published: false,
    });

    return {
      success: true,
      data: workflow,
    };
  } catch (error) {
    logger.error('Create workflow action error:', error);
    return {
      success: false,
      error: 'Failed to create workflow',
    };
  }
}

export async function getWorkflows(limit?: number) {
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

    const workflows = await WorkflowController.findByUserId(
      payload.id,
      limit || 10
    );

    return {
      success: true,
      data: workflows,
    };
  } catch (error) {
    logger.error('Get workflows action error:', error);
    return {
      success: false,
      error: 'Failed to fetch workflows',
    };
  }
}

export async function getWorkflow(id: string) {
  if (!id) {
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

export async function updateWorkflow(
  id: string,
  updates: {
    name?: string;
    nodes?: any[];
    edges?: any[];
    published?: boolean;
  }
) {
  if (!id) {
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

    // Validate workflow structure if nodes/edges are provided
    if (updates.nodes && updates.edges) {
      const validation = WorkflowController.validateWorkflow(
        updates.nodes,
        updates.edges
      );

      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid workflow',
          details: validation.errors,
        };
      }
    }

    const workflow = await WorkflowController.update(id, payload.id, updates);

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
    logger.error('Update workflow action error:', error);
    return {
      success: false,
      error: 'Failed to update workflow',
    };
  }
}

export async function publishWorkflow(id: string) {
  if (!id) {
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

    const workflow = await WorkflowController.publish(id, payload.id);

    if (!workflow) {
      return {
        success: false,
        error: 'Workflow not found',
      };
    }

    return {
      success: true,
      data: workflow,
      message: 'Workflow published successfully',
    };
  } catch (error) {
    logger.error('Publish workflow action error:', error);
    return {
      success: false,
      error: 'Failed to publish workflow',
    };
  }
}

export async function revertWorkflow(id: string) {
  if (!id) {
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

    const workflow = await WorkflowController.revertToPublished(id, payload.id);

    if (!workflow) {
      return {
        success: false,
        error: 'Workflow not found or no published version to revert to',
      };
    }

    return {
      success: true,
      data: workflow,
      message: 'Workflow reverted to last published version',
    };
  } catch (error) {
    logger.error('Revert workflow action error:', error);
    return {
      success: false,
      error: 'Failed to revert workflow',
    };
  }
}

export async function deleteWorkflow(id: string) {
  if (!id) {
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

    const deleted = await WorkflowController.delete(id, payload.id);

    if (!deleted) {
      return {
        success: false,
        error: 'Workflow not found',
      };
    }

    return {
      success: true,
      message: 'Workflow deleted successfully',
    };
  } catch (error) {
    logger.error('Delete workflow action error:', error);
    return {
      success: false,
      error: 'Failed to delete workflow',
    };
  }
}
