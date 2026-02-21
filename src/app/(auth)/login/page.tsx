'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { EmailSchema } from '@/lib/auth/schemas';
import { loginUser } from '@/lib/auth/actions';
import logger from '@/lib/logger';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationResult = EmailSchema.safeParse(email);

    if (!validationResult.success) {
      const error = validationResult.error;
      setFieldError(error.issues[0]?.message || 'Invalid email');
      return;
    }

    if (fieldError) {
      setFieldError('');
    }

    try {
      const result = await loginUser(email);

      if (!result.success) {
        setFieldError(result.error || 'Login failed');
        return;
      }

      router.push('/dashboard');
    } catch (error) {
      logger.error('Login error:', error);
      setFieldError('Network error. Please try again.');
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEmail = e.target.value;
    setEmail(newEmail);
    setFieldError('');
  };

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center bg-white dark:bg-black overflow-hidden">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-700 p-8">
        <div>
          <h2 className="text-center text-3xl font-extrabold text-slate-900 dark:text-white">
            Login to Phinite
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
          <div>
            <label htmlFor="email" className="sr-only">
              Email address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={handleEmailChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                fieldError
                  ? 'border-red-300 dark:border-red-700 focus:ring-red-500 focus:border-red-500'
                  : 'border-slate-300 dark:border-slate-700 focus:ring-blue-500 focus:border-blue-500'
              } placeholder-slate-500 dark:placeholder-slate-400 text-slate-900 dark:text-white bg-white dark:bg-slate-800 focus:outline-none focus:z-10 sm:text-sm`}
              placeholder="Enter your email"
            />
            {fieldError && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                {fieldError}
              </p>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Login
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
