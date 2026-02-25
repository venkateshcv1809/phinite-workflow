import { WorkflowController } from '@/lib/db/controllers/workflow-controller';
import {
  setupTestDatabase,
  cleanupTestDatabase,
  clearTestCollections,
} from '../../utils/test-helpers';
import { mockWorkflows, createMockWorkflow } from '../../fixtures/workflows';
import { ObjectId } from 'mongodb';

// Mock the collections module
jest.mock('@/lib/db/collections');

describe('WorkflowController', () => {
  let mockCollection: {
    insertOne: jest.Mock;
    findOne: jest.Mock;
    find: jest.Mock;
    updateOne: jest.Mock;
    deleteOne: jest.Mock;
    aggregate: jest.Mock;
  };

  beforeEach(async () => {
    await setupTestDatabase();
    mockCollection = {
      insertOne: jest.fn(),
      findOne: jest.fn(),
      find: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
      aggregate: jest.fn(),
    };

    // Mock the collections function to return our mock
    const collections = await import('@/lib/db/collections');
    (collections.workflowsColl as jest.Mock).mockReturnValue(mockCollection);
  });

  afterEach(async () => {
    await clearTestCollections();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('create', () => {
    it('should create a workflow successfully', async () => {
      const mockWorkflow = createMockWorkflow();
      const mockResult = { insertedId: new ObjectId() };

      mockCollection.insertOne.mockResolvedValue(mockResult);

      const result = await WorkflowController.create(mockWorkflow);

      expect(mockCollection.insertOne).toHaveBeenCalledWith(
        expect.objectContaining({
          ...mockWorkflow,
          id: expect.stringMatching(/^[a-f0-9]{12}$/),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          published: false,
          nodes: [],
          edges: [],
        })
      );

      expect(result).toEqual(
        expect.objectContaining({
          ...mockWorkflow,
          id: expect.stringMatching(/^[a-f0-9]{12}$/),
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
          published: false,
        })
      );
    });

    it('should throw error when insert fails', async () => {
      mockCollection.insertOne.mockResolvedValue({ insertedId: null });

      await expect(
        WorkflowController.create(createMockWorkflow())
      ).rejects.toThrow('Failed to create workflow');
    });

    it('should handle database errors', async () => {
      mockCollection.insertOne.mockRejectedValue(new Error('Database error'));

      await expect(
        WorkflowController.create(createMockWorkflow())
      ).rejects.toThrow('Database error');
    });
  });

  describe('findById', () => {
    it('should find workflow by id and userId', async () => {
      const mockWorkflow = mockWorkflows.simple;
      mockCollection.findOne.mockResolvedValue(mockWorkflow);

      const result = await WorkflowController.findById(
        mockWorkflow.id,
        mockWorkflow.userId
      );

      expect(mockCollection.findOne).toHaveBeenCalledWith({
        id: mockWorkflow.id,
        userId: mockWorkflow.userId,
      });
      expect(result).toEqual(mockWorkflow);
    });

    it('should return null when workflow not found', async () => {
      mockCollection.findOne.mockResolvedValue(null);

      const result = await WorkflowController.findById(
        'nonexistent',
        'user123'
      );

      expect(result).toBeNull();
    });

    it('should handle database errors', async () => {
      mockCollection.findOne.mockRejectedValue(new Error('Database error'));

      await expect(
        WorkflowController.findById('workflow123', 'user123')
      ).rejects.toThrow('Database error');
    });
  });

  describe('findByUserId', () => {
    it('should find all workflows for a user', async () => {
      const userWorkflows = [mockWorkflows.simple, mockWorkflows.complex];
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue(userWorkflows),
      };

      mockCollection.find.mockResolvedValue(mockCursor);

      const result = await WorkflowController.findByUserId('user123');

      expect(mockCollection.find).toHaveBeenCalledWith({ userId: 'user123' });
      expect(result).toEqual(userWorkflows);
    });

    it('should return empty array when no workflows found', async () => {
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
      };

      mockCollection.find.mockResolvedValue(mockCursor);

      const result = await WorkflowController.findByUserId('user123');

      expect(result).toEqual([]);
    });
  });

  describe('update', () => {
    it('should update workflow successfully', async () => {
      const mockWorkflow = mockWorkflows.simple;
      const updates = { name: 'Updated Workflow' };

      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      mockCollection.findOne.mockResolvedValue({ ...mockWorkflow, ...updates });

      const result = await WorkflowController.update(
        mockWorkflow.id,
        mockWorkflow.userId,
        updates
      );

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { id: mockWorkflow.id, userId: mockWorkflow.userId },
        {
          $set: {
            ...updates,
            updatedAt: expect.any(Date),
          },
        }
      );
      expect(result).toEqual(expect.objectContaining(updates));
    });

    it('should throw error when workflow not found for update', async () => {
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 0 });

      await expect(
        WorkflowController.update('nonexistent', 'user123', { name: 'Updated' })
      ).rejects.toThrow('Workflow not found');
    });
  });

  describe('delete', () => {
    it('should delete workflow successfully', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 1 });

      await WorkflowController.delete('workflow123', 'user123');

      expect(mockCollection.deleteOne).toHaveBeenCalledWith({
        id: 'workflow123',
        userId: 'user123',
      });
    });

    it('should throw error when workflow not found for deletion', async () => {
      mockCollection.deleteOne.mockResolvedValue({ deletedCount: 0 });

      await expect(
        WorkflowController.delete('nonexistent', 'user123')
      ).rejects.toThrow('Workflow not found');
    });
  });

  describe('publish', () => {
    it('should publish workflow successfully', async () => {
      const mockWorkflow = mockWorkflows.simple;
      mockCollection.updateOne.mockResolvedValue({ matchedCount: 1 });
      mockCollection.findOne.mockResolvedValue({
        ...mockWorkflow,
        published: true,
      });

      const result = await WorkflowController.publish(
        mockWorkflow.id,
        mockWorkflow.userId
      );

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { id: mockWorkflow.id, userId: mockWorkflow.userId },
        {
          $set: {
            published: true,
            publishedNodes: mockWorkflow.nodes,
            publishedEdges: mockWorkflow.edges,
            updatedAt: expect.any(Date),
          },
        }
      );
      expect(result).toEqual(expect.objectContaining({ published: true }));
    });
  });
});
