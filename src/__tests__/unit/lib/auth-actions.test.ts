import { loginUser, logoutUser } from '@/lib/auth/actions';
import { EmailSchema } from '@/lib/auth/schemas';
import { UserController } from '@/lib/db/controllers/user-controller';
import { generateToken, setAuthCookie, clearAuthCookie } from '@/lib/auth/jwt';
import logger from '@/lib/logger';

// Mock dependencies
jest.mock('@/lib/db/controllers/user-controller');
jest.mock('@/lib/auth/jwt');
jest.mock('@/lib/logger');

const mockUserController = UserController as jest.MockedFunction<
  typeof UserController
>;
const mockJwt = {
  generateToken: jest.fn().mockResolvedValue('mock-token'),
  setAuthCookie: jest.fn().mockResolvedValue(undefined),
  clearAuthCookie: jest.fn().mockResolvedValue(undefined),
};
const mockLogger = {
  error: jest.fn(),
};

jest.mock('@/lib/auth/jwt', () => mockJwt);
jest.mock('@/lib/logger', () => mockLogger);

describe('Auth Actions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loginUser', () => {
    it('should login successfully with valid email', async () => {
      const email = 'test@example.com';
      const mockUser = { id: 'user123', email };

      (mockUserController.upsert as jest.Mock).mockResolvedValue(mockUser);

      const result = await loginUser(email);

      expect(EmailSchema.safeParse).toHaveBeenCalledWith(email);
      expect(mockUserController.upsert).toHaveBeenCalledWith(email);
      expect(mockJwt.generateToken).toHaveBeenCalledWith(mockUser);
      expect(mockJwt.setAuthCookie).toHaveBeenCalledWith('mock-token');
      expect(result).toEqual({
        success: true,
        user: mockUser,
      });
    });

    it('should return error for invalid email', async () => {
      const email = 'invalid-email';

      const result = await loginUser(email);

      expect(EmailSchema.safeParse).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        success: false,
        error: 'Please enter a valid email address',
      });
    });

    it('should return error for empty email', async () => {
      const email = '';

      const result = await loginUser(email);

      expect(EmailSchema.safeParse).toHaveBeenCalledWith(email);
      expect(result).toEqual({
        success: false,
        error: 'Email is required',
      });
    });

    it('should handle database errors', async () => {
      const email = 'test@example.com';
      const dbError = new Error('Database connection failed');

      mockUserController.upsert.mockRejectedValue(dbError as any);

      const result = await loginUser(email);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Login action error:',
        dbError
      );
      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should handle token generation errors', async () => {
      const email = 'test@example.com';
      const tokenError = new Error('Token generation failed');

      mockUserController.upsert.mockResolvedValue({ id: 'user123', email });
      mockJwt.generateToken.mockRejectedValue(tokenError as any);

      const result = await loginUser(email);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Login action error:',
        tokenError
      );
      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });

    it('should handle cookie setting errors', async () => {
      const email = 'test@example.com';
      const cookieError = new Error('Cookie setting failed');

      mockUserController.upsert.mockResolvedValue({
        id: 'user123',
        email,
      } as any);
      mockJwt.generateToken.mockResolvedValue('mock-token');
      mockJwt.setAuthCookie.mockRejectedValue(cookieError as any);

      const result = await loginUser(email);

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Login action error:',
        cookieError
      );
      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });
  });

  describe('logoutUser', () => {
    it('should logout successfully', async () => {
      mockJwt.clearAuthCookie.mockResolvedValue(undefined);

      const result = await logoutUser();

      expect(mockJwt.clearAuthCookie).toHaveBeenCalled();
      expect(result).toEqual({
        success: true,
      });
    });

    it('should handle cookie clearing errors', async () => {
      const cookieError = new Error('Cookie clearing failed');

      mockJwt.clearAuthCookie.mockRejectedValue(cookieError as any);

      const result = await logoutUser();

      expect(mockLogger.error).toHaveBeenCalledWith(
        'Logout action error:',
        cookieError
      );
      expect(result).toEqual({
        success: false,
        error: 'Internal server error',
      });
    });
  });
});
