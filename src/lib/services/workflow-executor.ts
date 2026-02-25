import PQueue from 'p-queue';
import { JobController } from '@/lib/db/controllers/job-controller';
import { Job } from '@/lib/db/models/job';

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'condition' | 'external';
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

// Create queue with concurrency limit
const workflowQueue = new PQueue({
  concurrency: 3, // Max 3 workflows running simultaneously
  autoStart: true,
});

// Active jobs tracking
const activeJobs = new Map<string, AbortController>();

interface NodeExecutor {
  execute: (
    node: WorkflowNode,
    job: Job
  ) => Promise<{
    success: boolean;
    result?: Record<string, unknown>;
    error?: string;
  }>;
}

// Node executors for different types
const nodeExecutors: Record<string, NodeExecutor> = {
  start: {
    execute: async (node: WorkflowNode, job: Job) => {
      await JobController.update(job.id, job.userId, {
        logs: [...job.logs, `Starting workflow: ${job.workflowSnapshot.name}`],
      });
      return { success: true };
    },
  },

  process: {
    execute: async (node: WorkflowNode, job: Job) => {
      const config = node.data.config || {};
      const delay = (config.delay as number) || 1000;
      const message =
        (config.message as string) || `Processing node: ${node.data.label}`;

      await JobController.update(job.id, job.userId, {
        logs: [...job.logs, message],
      });

      // Simulate processing time
      await new Promise((resolve) => setTimeout(resolve, delay));

      return { success: true, result: { processed: true } };
    },
  },

  condition: {
    execute: async (node: WorkflowNode, job: Job) => {
      const config = node.data.config || {};
      const condition = (config.condition as string) || 'true';

      await JobController.update(job.id, job.userId, {
        logs: [...job.logs, `Evaluating condition: ${condition}`],
      });

      // Simple condition evaluation (in real implementation, this would be more sophisticated)
      const result = condition === 'true' || Math.random() > 0.5;

      return { success: true, result: { conditionMet: result } };
    },
  },

  external: {
    execute: async (node: WorkflowNode, job: Job) => {
      const config = node.data.config || {};
      const url = config.url as string;
      const method = (config.method as string) || 'GET';

      await JobController.update(job.id, job.userId, {
        logs: [...job.logs, `Calling external API: ${method} ${url}`],
      });

      // Simulate external API call
      await new Promise((resolve) => setTimeout(resolve, 500));

      return {
        success: true,
        result: {
          status: 200,
          data: { message: 'External call successful' },
        },
      };
    },
  },

  end: {
    execute: async (node: WorkflowNode, job: Job) => {
      await JobController.update(job.id, job.userId, {
        logs: [...job.logs, `Workflow completed: ${job.workflowSnapshot.name}`],
      });
      return { success: true };
    },
  },
};

export async function executeWorkflow(jobId: string) {
  const job = await JobController.findById(jobId, '');
  if (!job) {
    throw new Error(`Job ${jobId} not found`);
  }

  // Create abort controller for this job
  const abortController = new AbortController();
  activeJobs.set(jobId, abortController);

  try {
    // Update job status to active
    await JobController.update(jobId, job.userId, {
      status: 'active',
      startedAt: new Date(),
      progress: 0,
    });

    const nodes = job.workflowSnapshot.nodes;
    const edges = job.workflowSnapshot.edges;

    // Find start node
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) {
      throw new Error('No start node found in workflow');
    }

    // Execute workflow step by step
    let currentNode = startNode;
    let completedNodes = 0;
    const totalNodes = nodes.length;

    while (currentNode && !abortController.signal.aborted) {
      // Update current node and progress
      await JobController.update(jobId, job.userId, {
        currentNode: currentNode.id,
        progress: Math.round((completedNodes / totalNodes) * 100),
      });

      // Execute current node
      const executor = nodeExecutors[currentNode.type];
      if (!executor) {
        throw new Error(`No executor found for node type: ${currentNode.type}`);
      }

      const result = await executor.execute(currentNode, job);

      if (!result.success) {
        throw new Error(
          result.error || `Node execution failed: ${currentNode.data.label}`
        );
      }

      completedNodes++;

      // Find next node based on edges
      const nextEdge = edges.find((e) => e.source === currentNode.id);
      if (!nextEdge) {
        break; // No more edges, workflow ends
      }

      currentNode = nodes.find((n) => n.id === nextEdge.target);
      if (!currentNode) break; // Safety check
    }

    // Mark job as completed
    await JobController.update(jobId, job.userId, {
      status: 'completed',
      completedAt: new Date(),
      progress: 100,
      currentNode: undefined,
      result: { message: 'Workflow completed successfully' },
    });
  } catch (error) {
    // Mark job as failed
    await JobController.update(jobId, job.userId, {
      status: 'failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      completedAt: new Date(),
    });
  } finally {
    // Clean up
    activeJobs.delete(jobId);
  }
}

export function addJobToQueue(jobId: string, priority: number = 0) {
  return workflowQueue.add(() => executeWorkflow(jobId), { priority });
}

export function pauseJob(jobId: string) {
  const abortController = activeJobs.get(jobId);
  if (abortController) {
    abortController.abort();
    return JobController.update(jobId, '', {
      status: 'paused',
    });
  }
  return Promise.resolve(null);
}

export function getQueueStatus() {
  return {
    size: workflowQueue.size,
    pending: workflowQueue.pending,
    running: workflowQueue.running,
    activeJobs: Array.from(activeJobs.keys()),
  };
}
