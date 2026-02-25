'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { getJobs } from '@/lib/services/job-actions';

interface Job {
  id: string;
  workflowId: string;
  status: 'queued' | 'active' | 'completed' | 'failed' | 'paused';
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  createdAt: Date;
}

const statusColors = {
  queued: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-yellow-100 text-yellow-800',
};

export default function QueueStatus() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !params.status) return;

    const fetchJobs = async () => {
      try {
        const result = await getJobs(undefined, params.status as string);

        if (result.success && result.data && Array.isArray(result.data)) {
          setJobs(result.data);
        }
      } catch (error) {
        console.error('Error fetching jobs:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [user, params.status]);

  const handleJobClick = (job: Job) => {
    router.push(`/workflow/${job.workflowId}`);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  const getStatusTitle = (status: string) => {
    return status.charAt(0).toUpperCase() + status.slice(1) + ' Jobs';
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view queue.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">
          {getStatusTitle(params.status as string)}
        </h1>
        <Button variant="outline" onClick={() => router.push('/queue')}>
          Back to All Queues
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Jobs</CardTitle>
            <span className="text-sm text-muted-foreground">
              {jobs.length} jobs
            </span>
          </div>
        </CardHeader>
        <CardContent>
          {jobs.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No {params.status} jobs found.
            </p>
          ) : (
            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleJobClick(job)}
                >
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge
                        className={
                          statusColors[job.status as keyof typeof statusColors]
                        }
                      >
                        {job.status.charAt(0).toUpperCase() +
                          job.status.slice(1)}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        ID: {job.id}
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <div>Created: {formatDate(job.createdAt)}</div>
                      <div>Started: {formatDate(job.startedAt)}</div>
                      <div>Completed: {formatDate(job.completedAt)}</div>
                      {job.error && (
                        <div className="text-red-600">Error: {job.error}</div>
                      )}
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/workflow/${job.workflowId}`)}
                  >
                    View Workflow
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
