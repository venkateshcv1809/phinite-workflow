import {
  WorkflowSchema,
  WorkflowNode,
  WorkflowEdge,
} from '@/lib/db/models/workflow';
import { mockWorkflows } from '../../fixtures/workflows';

describe('Workflow Validation', () => {
  describe('WorkflowSchema', () => {
    it('should validate a valid workflow', () => {
      const result = WorkflowSchema.safeParse(mockWorkflows.simple);
      expect(result.success).toBe(true);
    });

    it('should validate a workflow with no nodes', () => {
      const result = WorkflowSchema.safeParse(mockWorkflows.empty);
      expect(result.success).toBe(true);
    });

    it('should reject a workflow with invalid ID', () => {
      const invalidWorkflow = {
        ...mockWorkflows.simple,
        id: '', // Empty ID should be invalid
      };
      const result = WorkflowSchema.safeParse(invalidWorkflow);
      expect(result.success).toBe(false);
    });

    it('should reject a workflow with invalid email format for userId', () => {
      const invalidWorkflow = {
        ...mockWorkflows.simple,
        userId: 'invalid-email', // Should be email format
      };
      const result = WorkflowSchema.safeParse(invalidWorkflow);
      expect(result.success).toBe(false);
    });

    it('should validate workflow with published nodes and edges', () => {
      const workflowWithPublished = {
        ...mockWorkflows.simple,
        publishedNodes: mockWorkflows.simple.nodes,
        publishedEdges: mockWorkflows.simple.edges,
      };
      const result = WorkflowSchema.safeParse(workflowWithPublished);
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowNode Validation', () => {
    const validNode: WorkflowNode = {
      id: 'test-node',
      type: 'process',
      position: { x: 100, y: 100 },
      data: {
        label: 'Test Node',
        config: { action: 'test' },
      },
    };

    it('should validate a valid node', () => {
      const result = WorkflowSchema.shape.nodes.element.safeParse(validNode);
      expect(result.success).toBe(true);
    });

    it('should reject a node with invalid type', () => {
      const invalidNode = {
        ...validNode,
        type: 'invalid-type' as
          | 'start'
          | 'end'
          | 'process'
          | 'condition'
          | 'external',
      };
      const result = WorkflowSchema.shape.nodes.element.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });

    it('should reject a node with invalid position', () => {
      const invalidNode = {
        ...validNode,
        position: { x: 'invalid' as unknown as number, y: 100 },
      };
      const result = WorkflowSchema.shape.nodes.element.safeParse(invalidNode);
      expect(result.success).toBe(false);
    });

    it('should validate a node without config', () => {
      const nodeWithoutConfig = {
        ...validNode,
        data: {
          label: 'Test Node',
        },
      };
      const result =
        WorkflowSchema.shape.nodes.element.safeParse(nodeWithoutConfig);
      expect(result.success).toBe(true);
    });
  });

  describe('WorkflowEdge Validation', () => {
    const validEdge: WorkflowEdge = {
      id: 'test-edge',
      source: 'node-1',
      target: 'node-2',
    };

    it('should validate a valid edge', () => {
      const result = WorkflowSchema.shape.edges.element.safeParse(validEdge);
      expect(result.success).toBe(true);
    });

    it('should validate an edge with handles', () => {
      const edgeWithHandles = {
        ...validEdge,
        sourceHandle: 'source-output',
        targetHandle: 'target-input',
      };
      const result =
        WorkflowSchema.shape.edges.element.safeParse(edgeWithHandles);
      expect(result.success).toBe(true);
    });

    it('should reject an edge with empty source', () => {
      const invalidEdge = {
        ...validEdge,
        source: '',
      };
      const result = WorkflowSchema.shape.edges.element.safeParse(invalidEdge);
      expect(result.success).toBe(false);
    });
  });

  describe('Node Types', () => {
    const validNodeTypes = ['start', 'end', 'process', 'condition', 'external'];

    validNodeTypes.forEach((type) => {
      it(`should validate node type: ${type}`, () => {
        const node = {
          id: 'test-node',
          type,
          position: { x: 100, y: 100 },
          data: { label: 'Test Node' },
        };
        const result = WorkflowSchema.shape.nodes.element.safeParse(node);
        expect(result.success).toBe(true);
      });
    });
  });
});
