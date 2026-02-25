import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const WorkflowSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string(),
  name: z.string(),
  userId: z.string(),
  published: z.boolean().default(false),
  publishedNodes: z
    .array(
      z.object({
        id: z.string(),
        type: z.enum(['start', 'end', 'process', 'condition', 'external']),
        position: z.object({ x: z.number(), y: z.number() }),
        data: z.object({
          label: z.string(),
          config: z.record(z.string(), z.unknown()).optional(),
        }),
      })
    )
    .optional(),
  publishedEdges: z
    .array(
      z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
        sourceHandle: z.string().optional(),
        targetHandle: z.string().optional(),
      })
    )
    .optional(),
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
  createdAt: z.date().default(() => new Date()),
  updatedAt: z.date().default(() => new Date()),
});

export type Workflow = z.infer<typeof WorkflowSchema>;

export type WorkflowNode = Workflow['nodes'][number];
export type WorkflowEdge = Workflow['edges'][number];
