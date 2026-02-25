import { NextRequest, NextResponse } from 'next/server';

describe('Simple API Integration Tests', () => {
  describe('Basic API Response Handling', () => {
    it('should return JSON response', async () => {
      const response = NextResponse.json({ message: 'Hello World' });
      
      expect(response.status).toBe(200);
      expect(response.headers.get('content-type')).toBe('application/json');
      
      const data = await response.json();
      expect(data).toEqual({ message: 'Hello World' });
    });

    it('should handle different response types', async () => {
      // Test text response
      const textResponse = new NextResponse('Plain text', { status: 200 });
      expect(textResponse.status).toBe(200);
      expect(textResponse.headers.get('content-type')).toBe('text/plain; charset=utf-8');
      
      const text = await textResponse.text();
      expect(text).toBe('Plain text');
    });

    it('should handle error responses', async () => {
      const errorResponse = NextResponse.json(
        { error: 'Something went wrong' },
        { status: 500 }
      );
      
      expect(errorResponse.status).toBe(500);
      
      const errorData = await errorResponse.json();
      expect(errorData).toEqual({ error: 'Something went wrong' });
    });

    it('should handle different HTTP methods', async () => {
      const response = NextResponse.json({ message: 'Method test' });
      
      // Test GET request
      const getRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'GET',
      });
      
      // Test POST request
      const postRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: 'test' }),
      });
      
      // Test PUT request
      const putRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ data: 'updated' }),
      });
      
      // Test DELETE request
      const deleteRequest = new NextRequest('http://localhost:3000/api/test', {
        method: 'DELETE',
      });
      
      expect(getRequest.method).toBe('GET');
      expect(postRequest.method).toBe('POST');
      expect(putRequest.method).toBe('PUT');
      expect(deleteRequest.method).toBe('DELETE');
      
      expect(getRequest.body).toBeUndefined();
      expect(postRequest.body).toEqual(JSON.stringify({ data: 'test' }));
      expect(putRequest.body).toEqual(JSON.stringify({ data: 'updated' }));
      expect(deleteRequest.body).toBeUndefined();
    });
  });

  describe('Request Body Parsing', () => {
    it('should parse JSON body correctly', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: 'test@example.com' }),
      });
      
      const body = await request.json();
      expect(body).toEqual({ email: 'test@example.com' });
    });

    it('should handle invalid JSON gracefully', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid-json{',
      });
      
      await expect(request.json()).rejects.toThrow('Unexpected token');
    });

    it('should handle missing body', async () => {
      const request = new NextRequest('http://localhost:3000/api/test', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        // No body provided
      });
      
      const body = await request.json();
      expect(body).toEqual({});
    });
  });

  describe('Response Headers', () => {
    it('should set custom headers', async () => {
      const response = NextResponse.json(
        { message: 'Test' },
        { 
          status: 200,
          headers: {
            'x-custom-header': 'custom-value',
            'cache-control': 'no-cache',
          },
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('x-custom-header')).toBe('custom-value');
      expect(response.headers.get('cache-control')).toBe('no-cache');
    });

    it('should handle cookies', async () => {
      const response = NextResponse.json(
        { message: 'Test' },
        { 
          status: 200,
          headers: {
            'Set-Cookie': 'session=abc123; HttpOnly; Path=/',
          },
        }
      );
      
      expect(response.status).toBe(200);
      expect(response.headers.get('Set-Cookie')).toBe('session=abc123; HttpOnly; Path=/');
    });
  });
});
