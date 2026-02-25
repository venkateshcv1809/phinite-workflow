import { renderHook, act } from '@testing-library/react';
import { useAuthStore } from '@/lib/stores/authStore';

describe('Auth Store', () => {
  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should set authentication state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    act(() => {
      result.current.setAuth(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('should clear authentication state', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    // First set auth
    act(() => {
      result.current.setAuth(mockUser);
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);

    // Then clear auth
    act(() => {
      result.current.clearAuth();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should persist auth state to localStorage', () => {
    const { result } = renderHook(() => useAuthStore());
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    act(() => {
      result.current.setAuth(mockUser);
    });

    const storedData = localStorage.getItem('auth-storage');
    expect(storedData).toBeTruthy();
    
    const parsedData = JSON.parse(storedData!);
    expect(parsedData.state.user).toEqual(mockUser);
    expect(parsedData.state.isLoggedIn).toBe(true);
  });

  it('should load auth state from localStorage on initialization', () => {
    const mockUser = {
      id: 'user123',
      email: 'test@example.com',
    };

    // Pre-populate localStorage
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: mockUser,
        isLoggedIn: true,
      },
      version: 0,
    }));

    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isLoggedIn).toBe(true);
  });

  it('should handle invalid localStorage data gracefully', () => {
    // Populate localStorage with invalid data
    localStorage.setItem('auth-storage', 'invalid-json');

    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toBeNull();
    expect(result.current.isLoggedIn).toBe(false);
  });

  it('should handle partial localStorage data', () => {
    // Populate localStorage with partial data
    localStorage.setItem('auth-storage', JSON.stringify({
      state: {
        user: { id: 'user123', email: 'test@example.com' },
        // Missing isLoggedIn
      },
      version: 0,
    }));

    const { result } = renderHook(() => useAuthStore());
    
    expect(result.current.user).toEqual({
      id: 'user123',
      email: 'test@example.com',
    });
    expect(result.current.isLoggedIn).toBe(false); // Should default to false
  });
});
