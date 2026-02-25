import { NextRequest } from 'next/server';
import { POST, GET } from '@/app/api/workflows/route';
import { setupTestDatabase, cleanupTestDatabase, clearTestCollections, createMockCookies, generateMockJWT } from '../../utils/test-helpers';
import { mockWorkflows, createMockWorkflow } from '../../fixtures/workflows';
import { mockUsers } from '../../fixtures/users';

// Mock dependencies
jest.mock('@/lib/db/collections');
jest.mock('@/lib/auth/jwt');
jest.mock('next/headers');

describe('/api/workflows', () => {
  let mockWorkflowsColl: any;
  let mockVerifyToken: jest.MockedFunction<any>;

  beforeEach(async () => {
    await setupTestDatabase();
    
    mockWorkflowsColl = {
      insertOne: jest.fn(),
      find: jest.fn(),
      findOne: jest.fn(),
    };

    const { workflowsColl } = require('@/lib/db/collections');
    workflowsColl.mockReturnValue(mockWorkflowsColl);

    mockVerifyToken = require('@/lib/auth/jwt').verifyToken;
    mockVerifyToken.mockResolvedValue(mockUsers.valid);

    const { cookies } = require('next/headers');
    cookies.mockReturnValue(createMockCookies(generateMockJWT(mockUsers.valid)));
  });

  afterEach(async () => {
    await clearTestCollections();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  describe('POST /api/workflows', () => {
    it('should create a workflow successfully', async () => {
      const workflowData = { name: 'Test Workflow' };
      const mockResult = { insertedId: 'mock-id' };
      mockWorkflowsColl.insertOne.mockResolvedValue(mockResult);

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify(workflowData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toMatchObject({
        name: workflowData.name,
        userId: mockUsers.valid.id,
        published: false,
        nodes: [],
        edges: [],
      });
      expect(mockWorkflowsColl.insertOne).toHaveBeenCalled();
    });

    it('should return 400 for missing workflow name', async () => {
      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Workflow name is required');
    });

    it('should return 401 for unauthenticated request', async () => {
      const { cookies } = require('next/headers');
      cookies.mockReturnValue(createMockCookies());

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Workflow' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should return 401 for invalid token', async () => {
      mockVerifyToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Workflow' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Invalid authentication');
    });

    it('should handle database errors', async () => {
      mockWorkflowsColl.insertOne.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/workflows', {
        method: 'POST',
        body: JSON.stringify({ name: 'Test Workflow' }),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to create workflow');
    });
  });

  describe('GET /api/workflows', () => {
    it('should return user workflows', async () => {
      const userWorkflows = [mockWorkflows.simple, mockWorkflows.complex];
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue(userWorkflows),
      };
      mockWorkflowsColl.find.mockReturnValue(mockCursor);

      const request = new NextRequest('http://localhost:3000/api/workflows');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual(userWorkflows);
      expect(mockWorkflowsColl.find).toHaveBeenCalledWith({
        userId: mockUsers.valid.id,
      });
    });

    it('should return empty array for user with no workflows', async () => {
      const mockCursor = {
        toArray: jest.fn().mockResolvedValue([]),
      };
      mockWorkflowsColl.find.mockReturnValue(mockCursor);

      const request = new NextRequest('http://localhost:3000/api/workflows');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toEqual([]);
    });

    it('should return 401 for unauthenticated request', async () => {
      const { cookies } = require('next/headers');
      cookies.mockReturnValue(createMockCookies());

      const request = new NextRequest('http://localhost:3000/api/workflows');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Authentication required');
    });

    it('should handle database errors', async () => {
      mockWorkflowsColl.find.mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/workflows');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to fetch workflows');
    });
  });
});
