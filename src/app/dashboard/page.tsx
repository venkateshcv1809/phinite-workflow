'use client';

import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Dashboard() {
  const router = useRouter();

  return (
    <div className="container mx-auto p-6 space-y-12">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Workflows</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-fr">
            <div
              onClick={() => router.push('/workflow')}
              className="flex items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-gray-400 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors h-48"
            >
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400 dark:text-gray-500 mb-2">
                  +
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Create Workflow
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
