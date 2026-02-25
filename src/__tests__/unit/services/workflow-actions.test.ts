import { createWorkflow, getWorkflows } from '@/lib/services/workflow-actions';
import { mockUsers } from '../../fixtures/users';
import { mockWorkflows } from '../../fixtures/workflows';

// Mock dependencies
jest.mock('@/lib/db/controllers/workflow-controller');

const mockWorkflowController = {
  create: jest.fn(),
  findById: jest.fn(),
  findByUserId: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  publish: jest.fn(),
} as jest.MockedFunction<any>;

jest.mock('@/lib/db/collections', () => ({
  workflowsColl: jest.fn(),
}));

describe('Workflow Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    const { workflowsColl } = require('@/lib/db/collections');
    workflowsColl.mockReturnValue(mockWorkflowController);
  });

  describe('createWorkflow', () => {
    it('should create workflow successfully', async () => {
      const workflowName = 'Test Workflow';
      const mockWorkflow = mockWorkflows.simple;

      mockWorkflowController.create.mockResolvedValue(mockWorkflow);

      const result = await createWorkflow(workflowName);

      expect(mockWorkflowController.create).toHaveBeenCalledWith(
        expect.objectContaining({
          name: workflowName.trim(),
          nodes: [],
          edges: [],
          userId: mockUsers.valid.id,
          published: false,
        })
      );
      expect(result).toEqual({
        success: true,
        data: expect.objectContaining({
          id: expect.any(String),
          name: workflowName,
          userId: mockUsers.valid.id,
          published: false,
          nodes: [],
          edges: [],
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        }),
      });
    });

    it('should return error for empty workflow name', async () => {
      const result = await createWorkflow('');

      expect(mockWorkflowController.create).not.toHaveBeenCalled();
      expect(result).toEqual({
        success: false,
        error: 'Workflow name is required',
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database connection failed');
      mockWorkflowController.create.mockRejectedValue(dbError);

      const result = await createWorkflow('Test Workflow');

      expect(result).toEqual({
        success: false,
        error: 'Failed to create workflow',
      });
    });

    it('should handle controller errors', async () => {
      const controllerError = new Error('Controller error');
      mockWorkflowController.create.mockRejectedValue(controllerError);

      const result = await createWorkflow('Test Workflow');

      expect(result).toEqual({
        success: false,
        error: 'Failed to create workflow',
      });
    });
  });

  describe('getWorkflows', () => {
    it('should return user workflows', async () => {
      const mockWorkflows = [mockWorkflows.simple, mockWorkflows.complex];

      mockWorkflowController.findByUserId.mockResolvedValue(mockWorkflows);

      const result = await getWorkflows(5);

      expect(mockWorkflowController.findByUserId).toHaveBeenCalledWith(
        mockUsers.valid.id
      );
      expect(result).toEqual({
        success: true,
        data: mockWorkflows,
      });
    });

    it('should handle database errors', async () => {
      const dbError = new Error('Database query failed');
      mockWorkflowController.findByUserId.mockRejectedValue(dbError);

      const result = await getWorkflows(5);

      expect(result).toEqual({
        success: false,
        error: 'Failed to fetch workflows',
      });
    });

    it('should handle empty result', async () => {
      mockWorkflowController.findByUserId.mockResolvedValue([]);

      const result = await getWorkflows(5);

      expect(result).toEqual({
        success: true,
        data: [],
      });
    });
  });
});
