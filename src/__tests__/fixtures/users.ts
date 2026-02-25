import { User } from '@/lib/db/models/users';

export const mockUsers = {
  valid: {
    id: 'user123',
    email: 'test@example.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  } as User,

  admin: {
    id: 'admin123',
    email: 'admin@example.com',
    createdAt: new Date('2024-01-01T00:00:00.000Z'),
  } as User,

  unauthenticated: null,
} as const;

export const createMockUser = (overrides: Partial<User> = {}): User => ({
  id: 'test-user-id',
  email: 'test@example.com',
  createdAt: new Date(),
  ...overrides,
});
