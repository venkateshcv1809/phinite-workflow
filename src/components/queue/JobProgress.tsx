'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Job {
  id: string;
  workflowId: string;
  workflowSnapshot: {
    name: string;
  };
  status: 'queued' | 'active' | 'completed' | 'failed' | 'paused';
  currentNode?: string;
  progress: number;
  logs: string[];
  startedAt?: string;
  completedAt?: string;
  error?: string;
  createdAt: string;
}

interface JobProgressProps {
  job: Job;
  onRefresh?: () => void;
}

export default function JobProgress({ job, onRefresh }: JobProgressProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const statusColors = {
    queued: 'bg-blue-100 text-blue-800',
    active: 'bg-green-100 text-green-800',
    completed: 'bg-gray-100 text-gray-800',
    failed: 'bg-red-100 text-red-800',
    paused: 'bg-yellow-100 text-yellow-800',
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString();
  };

  const calculateDuration = () => {
    if (!job.startedAt) return 'N/A';

    const start = new Date(job.startedAt);
    const end = job.completedAt ? new Date(job.completedAt) : new Date();
    const duration = end.getTime() - start.getTime();

    const seconds = Math.floor(duration / 1000);
    const minutes = Math.floor(seconds / 60);

    if (minutes > 0) {
      return `${minutes}m ${seconds % 60}s`;
    }
    return `${seconds}s`;
  };

  return (
    <Card className="mb-4">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <CardTitle className="text-lg">
              {job.workflowSnapshot.name}
            </CardTitle>
            <div className="flex items-center space-x-2 mt-1">
              <Badge className={statusColors[job.status]}>
                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
              </Badge>
              <span className="text-sm text-muted-foreground">
                ID: {job.id}
              </span>
              {job.currentNode && (
                <span className="text-sm text-muted-foreground">
                  Current: {job.currentNode}
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">
              Duration: {calculateDuration()}
            </div>
            <div className="text-sm text-muted-foreground">
              Progress: {job.progress}%
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${
                job.status === 'failed'
                  ? 'bg-red-500'
                  : job.status === 'completed'
                    ? 'bg-green-500'
                    : job.status === 'active'
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
              }`}
              style={{ width: `${job.progress}%` }}
            />
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Created:</span>
            <div>{formatDate(job.createdAt)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Started:</span>
            <div>{formatDate(job.startedAt)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Completed:</span>
            <div>{formatDate(job.completedAt)}</div>
          </div>
          <div>
            <span className="text-muted-foreground">Status:</span>
            <div>{job.status}</div>
          </div>
        </div>

        {/* Error Message */}
        {job.error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <div className="text-sm font-medium text-red-800">Error:</div>
            <div className="text-sm text-red-600">{job.error}</div>
          </div>
        )}

        {/* Logs Section */}
        <div className="mt-4">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Execution Logs</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? 'Hide' : 'Show'} Logs ({job.logs.length})
            </Button>
          </div>

          {isExpanded && (
            <div className="mt-2 p-3 bg-gray-50 rounded-md max-h-40 overflow-y-auto">
              {job.logs.length === 0 ? (
                <div className="text-sm text-muted-foreground">
                  No logs available
                </div>
              ) : (
                job.logs.map((log, index) => (
                  <div key={index} className="text-sm mb-1">
                    <span className="text-muted-foreground">
                      [{new Date().toLocaleTimeString()}]
                    </span>{' '}
                    {log}
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="mt-4 flex space-x-2">
          {job.status === 'queued' && (
            <Button size="sm" onClick={onRefresh}>
              Refresh Status
            </Button>
          )}
          {job.status === 'active' && (
            <Button size="sm" variant="outline" onClick={onRefresh}>
              Refresh Progress
            </Button>
          )}
          {job.status === 'failed' && (
            <Button size="sm" variant="outline" onClick={onRefresh}>
              Retry
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
