'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { logoutUser } from '@/lib/auth/actions';
import { useAuthStore } from '@/lib/stores/authStore';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { isLoggedIn, clearAuth } = useAuthStore();
  const isLoginPage = pathname === '/login';

  const handleLogout = async () => {
    await logoutUser();
    clearAuth();
    router.push('/');
  };

  return (
    <nav className="h-16 flex items-center justify-between px-8 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#141414] transition-colors shadow-md">
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/vercel.svg"
          alt="Phinite Logo"
          width={24}
          height={24}
          className="invert dark:invert-0"
        />
        <span className="text-xl font-bold text-slate-900 dark:text-white">
          Phinite
        </span>
      </Link>

      <div className="flex items-center gap-4">
        {!isLoginPage && (
          <>
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="text-sm font-bold text-blue-700 dark:text-blue-300 hover:text-blue-900 dark:hover:text-blue-100 hover:bg-blue-100 dark:hover:bg-blue-900 px-4 py-2 rounded-md transition-colors cursor-pointer border border-blue-300 dark:border-blue-600"
              >
                Logout
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
              >
                Login
              </Link>
            )}
          </>
        )}
      </div>
    </nav>
  );
}
