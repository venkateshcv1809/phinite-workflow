import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Header from '@/components/Header';
import { CONFIG } from '@/lib/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Phinite | Workflow Engine',
  description: 'Visual workflow design and execution.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const themeClass = CONFIG.THEME === 'dark' ? 'dark' : 'light';

  return (
    <html
      lang="en"
      className={`${inter.variable} h-full ${themeClass}`}
      style={{ colorScheme: themeClass }}
    >
      <body
        className={`h-full overflow-hidden flex flex-col bg-white dark:bg-black font-sans transition-colors duration-300`}
      >
        <Header />
        <main className="flex-1 overflow-y-auto relative">{children}</main>
      </body>
    </html>
  );
}
