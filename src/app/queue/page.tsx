'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface JobCounts {
  queued: number;
  active: number;
  completed: number;
  failed: number;
  paused: number;
}

const statusColors = {
  queued: 'bg-blue-100 text-blue-800',
  active: 'bg-green-100 text-green-800',
  completed: 'bg-gray-100 text-gray-800',
  failed: 'bg-red-100 text-red-800',
  paused: 'bg-yellow-100 text-yellow-800',
};

export default function QueueManagement() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [jobs, setJobs] = useState<Job[]>([]);
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
        // Fetch job counts
        const countsResult = await getJobs();

        if (countsResult.success && countsResult.data) {
          // Check if the result is counts or jobs array
          if (
            typeof countsResult.data === 'object' &&
            'queued' in countsResult.data
          ) {
            setJobCounts(countsResult.data);
          }
        }

        // Fetch jobs based on selected status
        const jobsResult = await getJobs(
          undefined,
          selectedStatus === 'all' ? undefined : selectedStatus
        );

        if (jobsResult.success && jobsResult.data) {
          // Check if the result is jobs array
          if (Array.isArray(jobsResult.data)) {
            setJobs(jobsResult.data);
          }
        }
      } catch (error) {
        console.error('Error fetching queue data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, selectedStatus]);

  const handleStatusClick = (status: string) => {
    setSelectedStatus(status);
  };

  const handleJobClick = (job: Job) => {
    // Navigate to job details or workflow
    router.push(`/workflow/${job.workflowId}`);
  };

  const formatDate = (date?: Date) => {
    if (!date) return 'N/A';
    return date.toLocaleString();
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view queue management.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading queue data...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Queue Management</h1>

      {/* Job Status Summary */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Queued</CardTitle>
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

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Left Panel - Status Filter */}
        <Card>
          <CardHeader>
            <CardTitle>Filter by Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              {
                key: 'all',
                label: 'All Jobs',
                count: Object.values(jobCounts).reduce((a, b) => a + b, 0),
              },
              { key: 'queued', label: 'Queued', count: jobCounts.queued },
              { key: 'active', label: 'Active', count: jobCounts.active },
              {
                key: 'completed',
                label: 'Completed',
                count: jobCounts.completed,
              },
              { key: 'failed', label: 'Failed', count: jobCounts.failed },
              { key: 'paused', label: 'Paused', count: jobCounts.paused },
            ].map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => handleStatusClick(key)}
                className={`w-full text-left p-3 rounded border transition-colors ${
                  selectedStatus === key
                    ? 'bg-blue-50 border-blue-200 text-blue-700'
                    : 'hover:bg-gray-50 border-gray-200'
                }`}
              >
                <div className="flex justify-between items-center">
                  <span>{label}</span>
                  <Badge variant="outline" className="ml-2">
                    {count}
                  </Badge>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Right Panel - Jobs List */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>
                {selectedStatus === 'all'
                  ? 'All Jobs'
                  : `${selectedStatus.charAt(0).toUpperCase() + selectedStatus.slice(1)} Jobs`}
              </CardTitle>
              <span className="text-sm text-muted-foreground">
                {jobs.length} jobs
              </span>
            </div>
          </CardHeader>
          <CardContent>
            {jobs.length === 0 ? (
              <p className="text-muted-foreground text-center py-8">
                No jobs found for this status.
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
                            statusColors[
                              job.status as keyof typeof statusColors
                            ]
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
    </div>
  );
}
