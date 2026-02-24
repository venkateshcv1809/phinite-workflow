'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/authStore';

export default function HomePage() {
  const { isLoggedIn } = useAuthStore();

  const buttonHref = isLoggedIn ? '/dashboard' : '/login';
  const buttonText = isLoggedIn ? 'Go to Dashboard' : 'Get Started';

  return (
    <div className="h-[calc(100vh-4rem)] flex items-center justify-center px-4 text-center bg-white dark:bg-black transition-colors duration-300 overflow-hidden">
      <div className="max-w-3xl">
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-6">
          Phinite <span className="text-blue-600">Workflow</span>
        </h1>

        <p className="text-lg md:text-xl text-slate-600 dark:text-slate-400 mb-10 leading-relaxed max-w-2xl mx-auto">
          Design, automate, and scale your visual workflows with a lightweight
          engine built for modern performance.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <Link
            href={buttonHref}
            className="px-8 py-4 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all"
          >
            {buttonText}
          </Link>

          <Link
            href="/docs"
            className="px-8 py-4 bg-slate-100 dark:bg-slate-900 text-slate-900 dark:text-slate-100 rounded-xl font-bold"
          >
            Documentation
          </Link>
        </div>
      </div>
    </div>
  );
}
