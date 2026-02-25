import { z } from 'zod';

describe('Validation Utilities', () => {
  describe('String Validation', () => {
    it('should validate email format', () => {
      const emailSchema = z.string().email();

      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'simple@domain.com',
      ];

      validEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(email);
        }
      });
    });

    it('should reject invalid emails', () => {
      const emailSchema = z.string().email();

      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
        'user@.com',
        '',
        null as unknown,
        undefined as unknown,
      ];

      invalidEmails.forEach((email) => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toBeDefined();
          expect(result.error.issues![0].message).toBeTruthy();
        }
      });
    });
  });

  describe('Number Validation', () => {
    it('should validate positive numbers', () => {
      const positiveSchema = z.number().positive();

      const result = positiveSchema.safeParse(5);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe(5);
      }
    });

    it('should reject negative numbers', () => {
      const positiveSchema = z.number().positive();
      const result = positiveSchema.safeParse(-5);
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should validate range constraints', () => {
      const rangeSchema = z.number().min(1).max(100);

      expect(rangeSchema.safeParse(50)).toEqual({
        success: true,
        data: 50,
      });

      expect(rangeSchema.safeParse(0)).toEqual({
        success: false,
        error: expect.objectContaining({
          code: 'too_small',
          received: 0,
          inclusive: true,
          minimum: 1,
          message: 'Number must be greater than or equal to 1',
          path: [],
          issues: expect.any(Array),
          fatal: false,
          formErrors: [],
          stack: expect.any(Error),
        }),
      });

      expect(rangeSchema.safeParse(150)).toEqual({
        success: false,
        error: expect.objectContaining({
          code: 'too_big',
          received: 150,
          inclusive: true,
          maximum: 100,
          message: 'Number must be less than or equal to 100',
          path: [],
          issues: expect.any(Array),
          fatal: false,
          formErrors: [],
          stack: expect.any(Error),
        }),
      });
    });
  });

  describe('Object Validation', () => {
    it('should validate object schemas', () => {
      const userSchema = z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
      });

      const validUser = {
        id: 'user123',
        email: 'test@example.com',
      };

      const result = userSchema.safeParse(validUser);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validUser);
      }
    });

    it('should reject invalid objects', () => {
      const userSchema = z.object({
        id: z.string(),
        email: z.string().email(),
        name: z.string().optional(),
      });

      const invalidUsers = [
        { id: 'user123' }, // Missing email
        { email: 'test@example.com' }, // Missing id
        { id: 'user123', email: 'invalid-email' }, // Invalid email
        { extra: 'field' }, // Extra field
      ];

      invalidUsers.forEach((user) => {
        const result = userSchema.safeParse(user);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Array Validation', () => {
    it('should validate array schemas', () => {
      const tagsSchema = z.array(z.string().min(1));

      expect(tagsSchema.safeParse(['tag1', 'tag2'])).toEqual({
        success: true,
        data: ['tag1', 'tag2'],
      });

      expect(tagsSchema.safeParse([])).toEqual({
        success: true,
        data: [],
      });

      expect(tagsSchema.safeParse([''])).toEqual({
        success: false,
        error: expect.objectContaining({
          code: 'too_small',
        }),
      });
    });
  });

  describe('Enum Validation', () => {
    it('should validate enum values', () => {
      const statusSchema = z.enum(['pending', 'active', 'completed', 'failed']);

      const validStatuses = ['pending', 'active', 'completed', 'failed'];
      validStatuses.forEach((status) => {
        const result = statusSchema.safeParse(status);
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data).toBe(status);
        }
      });

      const invalidStatuses = ['invalid', 'unknown', null, undefined];
      invalidStatuses.forEach((status) => {
        const result = statusSchema.safeParse(status);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Type Inference', () => {
    it('should infer correct types', () => {
      const userSchema = z.object({
        id: z.string(),
        email: z.string().email(),
      });

      type User = z.infer<typeof userSchema>;

      // These should compile without TypeScript errors
      const validUser: User = {
        id: 'user123',
        email: 'test@example.com',
      };

      expect(typeof validUser.id).toBe('string');
      expect(typeof validUser.email).toBe('string');
    });
  });
});
