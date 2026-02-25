import { NextRequest } from 'next/server';
import { POST } from '@/app/api/auth/login/route';
import { setupTestDatabase, cleanupTestDatabase, clearTestCollections, createMockCookies } from '../../utils/test-helpers';
import { mockUsers } from '../../fixtures/users';

// Mock dependencies
jest.mock('@/lib/db/collections');
jest.mock('@/lib/auth/jwt');
jest.mock('@/lib/auth/password');
jest.mock('next/headers');

describe('/api/auth/login', () => {
  let mockUsersColl: any;
  let mockVerifyPassword: jest.MockedFunction<any>;
  let mockSignToken: jest.MockedFunction<any>;

  beforeEach(async () => {
    await setupTestDatabase();
    
    mockUsersColl = {
      findOne: jest.fn(),
    };

    const { usersColl } = require('@/lib/db/collections');
    usersColl.mockReturnValue(mockUsersColl);

    mockVerifyPassword = require('@/lib/auth/password').verifyPassword;
    mockSignToken = require('@/lib/auth/jwt').signToken;

    const { cookies } = require('next/headers');
    cookies.mockReturnValue(createMockCookies());
  });

  afterEach(async () => {
    await clearTestCollections();
    jest.clearAllMocks();
  });

  afterAll(async () => {
    await cleanupTestDatabase();
  });

  it('should login successfully with valid credentials', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockUsersColl.findOne.mockResolvedValue(mockUsers.valid);
    mockVerifyPassword.mockResolvedValue(true);
    mockSignToken.mockReturnValue('mock-jwt-token');

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
    expect(data.data.user).toEqual({
      id: mockUsers.valid.id,
      email: mockUsers.valid.email,
    });
    expect(data.data.token).toBe('mock-jwt-token');
  });

  it('should return 400 for missing email', async () => {
    const loginData = {
      password: 'password123',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email and password are required');
  });

  it('should return 400 for missing password', async () => {
    const loginData = {
      email: 'test@example.com',
    };

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Email and password are required');
  });

  it('should return 401 for invalid email', async () => {
    const loginData = {
      email: 'nonexistent@example.com',
      password: 'password123',
    };

    mockUsersColl.findOne.mockResolvedValue(null);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should return 401 for invalid password', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'wrongpassword',
    };

    mockUsersColl.findOne.mockResolvedValue(mockUsers.valid);
    mockVerifyPassword.mockResolvedValue(false);

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Invalid credentials');
  });

  it('should handle database errors', async () => {
    const loginData = {
      email: 'test@example.com',
      password: 'password123',
    };

    mockUsersColl.findOne.mockRejectedValue(new Error('Database error'));

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(loginData),
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.success).toBe(false);
    expect(data.error).toBe('Login failed');
  });
});
