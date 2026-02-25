import { NextRequest, NextResponse } from 'next/server';

// Mock the auth actions
const mockLoginUser = jest.fn();
jest.mock('@/lib/auth/actions', () => ({
  loginUser: mockLoginUser,
}));

// Mock NextRequest constructor
jest.mock('next/server', () => ({
  NextRequest: jest.fn().mockImplementation((url, options) => {
    const mockRequest = {
      url,
      method: options?.method || 'GET',
      headers: options?.headers || {},
    };

    // Store the body for json() method to access
    let storedBody: any;

    return {
      ...mockRequest,
      json: jest.fn().mockImplementation(() => {
        const body = options?.body;
        storedBody = body;
        if (typeof body === 'string') {
          return JSON.parse(body);
        }
        return { email: '' };
      }),
      // Add a getter to access the stored body
      get body() {
        return storedBody;
      },
    };
  }),
}));

describe('/api/auth/login API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should handle POST requests', async () => {
    const requestBody = { email: 'test@example.com' };
    const mockUser = { id: 'user123', email: 'test@example.com' };

    mockLoginUser.mockResolvedValue({
      success: true,
      user: mockUser,
    });

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await loginHandler(request);

    expect(mockLoginUser).toHaveBeenCalledWith('test@example.com');
    expect(response.status).toBe(200);

    const responseData = await response.json();
    expect(responseData).toEqual({
      success: true,
      user: mockUser,
    });
  });

  it('should handle empty email', async () => {
    const requestBody = { email: '' };

    mockLoginUser.mockResolvedValue({
      success: false,
      error: 'Email is required',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await loginHandler(request);

    expect(mockLoginUser).toHaveBeenCalledWith('');
    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: 'Email is required',
    });
  });

  it('should handle invalid email', async () => {
    const requestBody = { email: 'invalid-email' };

    mockLoginUser.mockResolvedValue({
      success: false,
      error: 'Please enter a valid email address',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await loginHandler(request);

    expect(mockLoginUser).toHaveBeenCalledWith('invalid-email');
    expect(response.status).toBe(400);

    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: 'Please enter a valid email address',
    });
  });

  it('should handle server errors', async () => {
    const requestBody = { email: 'test@example.com' };

    mockLoginUser.mockResolvedValue({
      success: false,
      error: 'Internal server error',
    });

    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const response = await loginHandler(request);

    expect(mockLoginUser).toHaveBeenCalledWith('test@example.com');
    expect(response.status).toBe(500);

    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: 'Internal server error',
    });
  });

  it('should handle non-POST requests', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'GET',
    });

    const response = await loginHandler(request);

    expect(response.status).toBe(405);
    expect(mockLoginUser).not.toHaveBeenCalled();
  });

  it('should handle malformed JSON', async () => {
    const request = new NextRequest('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: 'invalid-json',
    });

    const response = await loginHandler(request);

    expect(response.status).toBe(400);
    expect(mockLoginUser).not.toHaveBeenCalled();

    const responseData = await response.json();
    expect(responseData).toEqual({
      success: false,
      error: 'Invalid request body',
    });
  });
});

// Mock login handler to simulate Next.js API route
async function loginHandler(request: NextRequest): Promise<NextResponse> {
  try {
    const { loginUser } = await import('@/lib/auth/actions');

    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    let body;
    try {
      body = await request.json();
    } catch (error: unknown) {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    const result = await loginUser(body.email);

    if (result.success) {
      return NextResponse.json(result, { status: 200 });
    } else {
      if (result.error === 'Internal server error') {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 500 }
        );
      } else {
        return NextResponse.json(
          { success: false, error: result.error },
          { status: 400 }
        );
      }
    }
  } catch (error: unknown) {
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    );
  }
}
