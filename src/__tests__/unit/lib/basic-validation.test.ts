import { z } from 'zod';

// Simple schema tests without importing complex models
describe('Basic Validation Tests', () => {
  describe('String Validation', () => {
    const stringSchema = z.string().min(1);

    it('should validate non-empty strings', () => {
      const result = stringSchema.safeParse('hello');
      expect(result.success).toBe(true);
    });

    it('should reject empty strings', () => {
      const result = stringSchema.safeParse('');
      expect(result.success).toBe(false);
    });

    it('should reject null values', () => {
      const result = stringSchema.safeParse(null);
      expect(result.success).toBe(false);
    });
  });

  describe('Email Validation', () => {
    const emailSchema = z.string().email();

    it('should validate valid email addresses', () => {
      const validEmails = [
        'test@example.com',
        'user.name@domain.co.uk',
        'user+tag@example.org',
      ];

      validEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(true);
      });
    });

    it('should reject invalid email addresses', () => {
      const invalidEmails = [
        'invalid-email',
        '@example.com',
        'user@',
        'user..name@example.com',
      ];

      invalidEmails.forEach(email => {
        const result = emailSchema.safeParse(email);
        expect(result.success).toBe(false);
      });
    });
  });

  describe('Object Validation', () => {
    const userSchema = z.object({
      id: z.string(),
      email: z.string().email(),
      createdAt: z.date().optional(),
    });

    it('should validate complete objects', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
        createdAt: new Date(),
      };

      const result = userSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it('should validate objects without optional fields', () => {
      const user = {
        id: 'user123',
        email: 'test@example.com',
      };

      const result = userSchema.safeParse(user);
      expect(result.success).toBe(true);
    });

    it('should reject objects with missing required fields', () => {
      const user = {
        id: 'user123',
        // Missing email
      };

      const result = userSchema.safeParse(user);
      expect(result.success).toBe(false);
    });

    it('should reject objects with invalid field types', () => {
      const user = {
        id: 'user123',
        email: 'not-an-email',
      };

      const result = userSchema.safeParse(user);
      expect(result.success).toBe(false);
    });
  });

  describe('Array Validation', () => {
    const nodeSchema = z.object({
      id: z.string(),
      type: z.enum(['start', 'end', 'process']),
      position: z.object({
        x: z.number(),
        y: z.number(),
      }),
    });

    const workflowSchema = z.object({
      nodes: z.array(nodeSchema),
      edges: z.array(z.object({
        id: z.string(),
        source: z.string(),
        target: z.string(),
      })),
    });

    it('should validate arrays with valid items', () => {
      const workflow = {
        nodes: [
          {
            id: 'node1',
            type: 'start',
            position: { x: 100, y: 100 },
          },
        ],
        edges: [
          {
            id: 'edge1',
            source: 'node1',
            target: 'node2',
          },
        ],
      };

      const result = workflowSchema.safeParse(workflow);
      expect(result.success).toBe(true);
    });

    it('should validate empty arrays', () => {
      const workflow = {
        nodes: [],
        edges: [],
      };

      const result = workflowSchema.safeParse(workflow);
      expect(result.success).toBe(true);
    });

    it('should reject arrays with invalid items', () => {
      const workflow = {
        nodes: [
          {
            id: 'node1',
            type: 'invalid-type', // Invalid enum value
            position: { x: 100, y: 100 },
          },
        ],
        edges: [],
      };

      const result = workflowSchema.safeParse(workflow);
      expect(result.success).toBe(false);
    });
  });
});
