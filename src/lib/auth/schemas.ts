import { z } from 'zod';

export const EmailSchema = z
  .email('Please enter a valid email address')
  .trim()
  .min(1, 'Email is required');

export const LoginRequestSchema = z.object({
  email: EmailSchema,
});

export type LoginRequest = z.infer<typeof LoginRequestSchema>;
export type EmailValidation = z.infer<typeof EmailSchema>;
