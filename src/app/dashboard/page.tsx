'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { getWorkflows } from '@/lib/services/workflow-actions';
import { getJobs } from '@/lib/services/job-actions';

interface Workflow {
  id: string;
  name: string;
  userId: string;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface JobCounts {
  queued: number;
  active: number;
  completed: number;
  failed: number;
  paused: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [jobCounts, setJobCounts] = useState<JobCounts>({
    queued: 0,
    active: 0,
    completed: 0,
    failed: 0,
    paused: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        const workflowsResult = await getWorkflows(5);

        if (workflowsResult.success && workflowsResult.data) {
          setWorkflows(workflowsResult.data);
        }

        const jobsResult = await getJobs();

        if (jobsResult.success && jobsResult.data) {
          setJobCounts(jobsResult.data);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-12">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Workflows</CardTitle>
            {workflows.length > 0 && (
              <Button size="sm" onClick={() => router.push('/workflows')}>
                Show All
              </Button>
            )}
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

            {workflows.map((workflow) => (
              <div
                key={workflow.id}
                className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                onClick={() => router.push(`/workflow/${workflow.id}`)}
              >
                <div className="flex flex-col h-full">
                  <h3 className="font-medium mb-2 truncate">{workflow.name}</h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    Last updated: {workflow.updatedAt.toLocaleDateString()}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <Badge
                      variant={workflow.published ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {workflow.published ? 'Published' : 'Draft'}
                    </Badge>
                    <div className="flex space-x-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workflow/${workflow.id}`);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          router.push(`/workflow/${workflow.id}`);
                        }}
                      >
                        Execute
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Job Status Overview</CardTitle>
            <Button size="sm" onClick={() => router.push('/queue')}>
              View Jobs
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Queued</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {jobCounts.queued}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {jobCounts.active}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Completed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-600">
                  {jobCounts.completed}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {jobCounts.failed}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Paused</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {jobCounts.paused}
                </div>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
