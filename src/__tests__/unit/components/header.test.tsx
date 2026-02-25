import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import { useAuthStore } from '@/lib/stores/authStore';

// Mock the modules
jest.mock('next/navigation');
jest.mock('@/lib/stores/authStore');

describe('Header Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };
  
  const mockUseAuthStore = useAuthStore as jest.MockedFunction<typeof useAuthStore>;

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
  });

  it('renders logo and navigation', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoggedIn: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });

    render(<Header />);
    
    // Check logo
    const logo = screen.getByAltText('Phinite Logo');
    expect(logo).toBeInTheDocument();
    
    // Check brand name
    const brandName = screen.getByText('Phinite');
    expect(brandName).toBeInTheDocument();
  });

  it('shows login button when not authenticated', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoggedIn: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });

    render(<Header />);
    
    const loginButton = screen.getByRole('link', { name: 'Login' });
    expect(loginButton).toBeInTheDocument();
    expect(loginButton).toHaveAttribute('href', '/login');
  });

  it('shows logout button when authenticated', () => {
    const mockClearAuth = jest.fn();
    mockUseAuthStore.mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoggedIn: true,
      setAuth: jest.fn(),
      clearAuth: mockClearAuth,
    });

    render(<Header />);
    
    // Should not show login button
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
    
    // Should show logout button
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    expect(logoutButton).toBeInTheDocument();
  });

  it('hides login button on login page', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoggedIn: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });

    // Mock pathname to be login page
    jest.doMock('next/navigation', () => ({
      useRouter: () => ({
        push: jest.fn(),
      }),
      usePathname: () => '/login',
    }));

    render(<Header />);
    
    // Should not show login button even when not authenticated
    expect(screen.queryByRole('link', { name: 'Login' })).not.toBeInTheDocument();
  });

  it('handles logout correctly', async () => {
    const mockClearAuth = jest.fn();
    mockUseAuthStore.mockReturnValue({
      user: { id: 'user123', email: 'test@example.com' },
      isLoggedIn: true,
      setAuth: jest.fn(),
      clearAuth: mockClearAuth,
    });

    render(<Header />);
    
    const logoutButton = screen.getByRole('button', { name: 'Logout' });
    fireEvent.click(logoutButton);
    
    // Should call clearAuth
    expect(mockClearAuth).toHaveBeenCalledTimes(1);
    
    // Should navigate to home
    expect(mockRouter.push).toHaveBeenCalledWith('/');
  });

  it('has correct styling classes', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoggedIn: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });

    render(<Header />);
    
    const nav = screen.getByRole('navigation');
    expect(nav).toHaveClass(
      'h-16',
      'flex',
      'items-center',
      'justify-between',
      'px-8',
      'border-b',
      'border-slate-200',
      'bg-slate-50',
      'transition-colors',
      'shadow-md'
    );
  });

  it('logo has correct attributes', () => {
    mockUseAuthStore.mockReturnValue({
      user: null,
      isLoggedIn: false,
      setAuth: jest.fn(),
      clearAuth: jest.fn(),
    });

    render(<Header />);
    
    const logo = screen.getByAltText('Phinite Logo');
    expect(logo).toHaveAttribute('width', '24');
    expect(logo).toHaveAttribute('height', '24');
    expect(logo).toHaveClass('invert', 'dark:invert-0');
  });
});
