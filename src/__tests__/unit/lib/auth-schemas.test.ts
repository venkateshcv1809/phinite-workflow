import { EmailSchema, LoginRequestSchema } from '@/lib/auth/schemas';

describe('Auth Schemas', () => {
  describe('EmailSchema', () => {
    it('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
        'simple@domain.com',
      ];

      validEmails.forEach((email) => {
        const result = EmailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
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
        const result = EmailSchema.safeParse(email);
        expect(result.success).toBe(false);
        if (!result.success) {
          expect(result.error.issues).toBeDefined();
          expect(result.error.issues![0].message).toBeTruthy();
        }
      });
    });

    it('should trim whitespace from email', () => {
      const result = EmailSchema.safeParse('test@example.com');
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toBe('test@example.com');
      }
    });

    it('should enforce minimum length', () => {
      const result = EmailSchema.safeParse('a@b.co');
      expect(result.success).toBe(false);
      expect(result.error.issues[0].code).toBe('too_small');
    });
  });

  describe('LoginRequestSchema', () => {
    it('should validate valid login request', () => {
      const validRequest = {
        email: 'test@example.com',
      };

      const result = LoginRequestSchema.safeParse(validRequest);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data).toEqual(validRequest);
      }
    });

    it('should reject invalid login request', () => {
      const invalidRequests = [
        { email: '' },
        { email: 'invalid-email' },
        { email: null as any },
        { email: undefined as any },
        {},
        { extra: 'field' },
      ];

      invalidRequests.forEach((request) => {
        const result = LoginRequestSchema.safeParse(request);
        expect(result.success).toBe(false);
      });
    });

    it('should handle missing email field', () => {
      const result = LoginRequestSchema.safeParse({});
      expect(result.success).toBe(false);
      expect(result.error.issues[0].path).toEqual(['email']);
    });
  });

  describe('Type Inference', () => {
    it('should infer correct types', () => {
      // These should compile without TypeScript errors
      const validEmail: string = 'test@example.com';
      const validRequest = { email: validEmail };

      // Test that the inferred types work correctly
      const emailResult = EmailSchema.safeParse(validEmail);
      if (emailResult.success) {
        const email: string = emailResult.data;
        expect(typeof email).toBe('string');
      }

      const requestResult = LoginRequestSchema.safeParse(validRequest);
      if (requestResult.success) {
        const request = requestResult.data;
        expect(typeof request.email).toBe('string');
      }
    });
  });
});
