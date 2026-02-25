import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const JobSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string(),
  workflowId: z.string(),
  workflowSnapshot: z.object({
    name: z.string(),
    nodes: z.array(
      z.object({
        id: z.string(),
        type: z.enum(['start', 'end', 'process', 'condition', 'external']),
        position: z.object({ x: z.number(), y: z.number() }),
        data: z.object({
          label: z.string(),
          config: z.record(z.string(), z.unknown()).optional(),
        }),
      })
    ),
    edges: z.array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        sourceHandle: z.string().optional(),
        targetHandle: z.string().optional(),
      })
    ),
    publishedAt: z.date(),
  }),
  userId: z.string(),
  status: z.enum(['queued', 'active', 'completed', 'failed', 'paused']),
  currentNode: z.string().optional(),
  progress: z.number().default(0),
  logs: z.array(z.string()).default([]),
  startedAt: z.date().optional(),
  completedAt: z.date().optional(),
  error: z.string().optional(),
  result: z.record(z.string(), z.unknown()).optional(),
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Job = z.infer<typeof JobSchema>;

export type JobStatus = Job['status'];
