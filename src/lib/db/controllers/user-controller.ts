import { usersColl } from '../collections';
import { User } from '../models/users';

export class UserController {
  static async upsert(email: string): Promise<User> {
    const users = await usersColl();

    const user = await users.findOneAndUpdate(
      { email },
      {
        $setOnInsert: {
          email,
          createdAt: new Date(),
        }
      },
      {
        returnDocument: 'after',
        upsert: true
      }
    );

    if (!user) {
      throw new Error('Failed to upsert user');
    }

    return {
      id: user._id?.toString().substring(0, 12) || '',
      email: user.email,
      createdAt: user.createdAt,
    };
  }
}
