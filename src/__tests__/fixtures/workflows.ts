import { Workflow, WorkflowNode, WorkflowEdge } from '@/lib/db/models/workflow';

export const mockWorkflowNodes: WorkflowNode[] = [
  {
    id: 'start-1',
    type: 'start',
    position: { x: 100, y: 100 },
    data: {
      label: 'Start',
      config: {},
    },
  },
  {
    id: 'process-1',
    type: 'process',
    position: { x: 300, y: 100 },
    data: {
      label: 'Process Data',
      config: {
        action: 'transform',
        parameters: { format: 'json' },
      },
    },
  },
  {
    id: 'end-1',
    type: 'end',
    position: { x: 500, y: 100 },
    data: {
      label: 'End',
      config: {},
    },
  },
];

export const mockWorkflowEdges: WorkflowEdge[] = [
  {
    id: 'edge-1',
    source: 'start-1',
    target: 'process-1',
  },
  {
    id: 'edge-2',
    source: 'process-1',
    target: 'end-1',
  },
];

export const mockWorkflows = {
  simple: {
    id: 'workflow-123',
    name: 'Simple Test Workflow',
    userId: 'user123',
    published: false,
    nodes: mockWorkflowNodes,
    edges: mockWorkflowEdges,
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  } as Workflow,

  complex: {
    id: 'workflow-456',
    name: 'Complex Test Workflow',
    userId: 'user123',
    published: true,
    nodes: [
      ...mockWorkflowNodes,
      {
        id: 'condition-1',
        type: 'condition',
        position: { x: 300, y: 300 },
        data: {
          label: 'Check Condition',
          config: {
            condition: 'status === "completed"',
          },
        },
      } as WorkflowNode,
    ],
    edges: [
      ...mockWorkflowEdges,
      {
        id: 'edge-3',
        source: 'process-1',
        target: 'condition-1',
      },
    ],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  } as Workflow,

  empty: {
    id: 'workflow-789',
    name: 'Empty Workflow',
    userId: 'user123',
    published: false,
    nodes: [],
    edges: [],
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
    updatedAt: new Date('2024-01-01T00:00:00.000Z'),
  } as Workflow,
} as const;

export const createMockWorkflow = (overrides: Partial<Workflow> = {}): Workflow => ({
  id: 'test-workflow-id',
  name: 'Test Workflow',
  userId: 'test-user-id',
  published: false,
  nodes: [],
  edges: [],
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});
