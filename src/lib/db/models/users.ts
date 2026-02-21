import { z } from 'zod';
import { ObjectId } from 'mongodb';

export const UserSchema = z.object({
  _id: z.instanceof(ObjectId).optional(),
  id: z.string(),
  email: z.email().trim().toLowerCase(),
  createdAt: z.date().default(() => new Date()),
});

export type User = z.infer<typeof UserSchema>;
