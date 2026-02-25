'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/stores/authStore';
import {
  getWorkflow,
  updateWorkflow,
  publishWorkflow,
  revertWorkflow,
} from '@/lib/services/workflow-actions';
import { createJob } from '@/lib/services/job-actions';
import ChatInterface from '@/components/chat/ChatInterface';

interface WorkflowNode {
  id: string;
  type: 'start' | 'end' | 'process' | 'condition' | 'external';
  position: { x: number; y: number };
  data: {
    label: string;
    config?: Record<string, unknown>;
  };
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
}

interface Workflow {
  id: string;
  name: string;
  userId: string;
  published: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  publishedNodes?: WorkflowNode[];
  publishedEdges?: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
}

export default function WorkflowEditor() {
  const router = useRouter();
  const params = useParams();
  const { user } = useAuthStore();
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!user || !params.id) return;

    const fetchWorkflow = async () => {
      try {
        const result = await getWorkflow(params.id as string);
        
        if (result.success && result.data) {
          setWorkflow(result.data);
        }
      } catch (error) {
        console.error('Error fetching workflow:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflow();
  }, [user, params.id]);

  const handleSave = async () => {
    if (!workflow) return;

    setSaving(true);
    try {
      const result = await updateWorkflow(workflow.id, {
        name: workflow.name,
        nodes: workflow.nodes,
        edges: workflow.edges,
      });

      if (result.success && result.data) {
        setWorkflow(result.data);
      }
    } catch (error) {
      console.error('Error saving workflow:', error);
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!workflow) return;

    try {
      const result = await publishWorkflow(workflow.id);

      if (result.success && result.data) {
        setWorkflow(result.data);
      }
    } catch (error) {
      console.error('Error publishing workflow:', error);
    }
  };

  const handleRevert = async () => {
    if (!workflow) return;

    try {
      const result = await revertWorkflow(workflow.id);

      if (result.success && result.data) {
        setWorkflow(result.data);
      }
    } catch (error) {
      console.error('Error reverting workflow:', error);
    }
  };

  const handleExecute = async () => {
    if (!workflow) return;

    try {
      const result = await createJob(workflow.id);

      if (result.success) {
        router.push('/queue');
      }
    } catch (error) {
      console.error('Error executing workflow:', error);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Please log in to view workflow editor.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading workflow...</p>
      </div>
    );
  }

  if (!workflow) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Workflow not found.</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-12 gap-4 p-4">
      {/* Left Panel - Actions */}
      <div className="col-span-2 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-3">
            <Button
              onClick={() => router.push('/workflow')}
              variant="outline"
              className="w-full"
              size="sm"
            >
              ← Back to List
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="w-full"
              size="sm"
            >
              {saving ? 'Saving...' : 'Save Draft'}
            </Button>
            <Button
              onClick={handlePublish}
              variant="outline"
              className="w-full"
              size="sm"
            >
              Publish
            </Button>
            {workflow.published && workflow.publishedNodes && (
              <Button
                onClick={handleRevert}
                variant="secondary"
                className="w-full"
                size="sm"
              >
                Revert to Published
              </Button>
            )}
            <Button
              onClick={handleExecute}
              variant="default"
              className="w-full"
              size="sm"
            >
              Execute Workflow
            </Button>
          </div>
        </div>
      </div>

      {/* Middle Panel - React Flow Canvas */}
      <div className="col-span-8 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full flex items-center justify-center">
          <div className="text-center">
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
              React Flow Canvas
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
              Editing: {workflow.name}
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Nodes: {workflow.nodes.length} | Edges: {workflow.edges.length}
            </p>
          </div>
        </div>
      </div>

      {/* Right Panel - Workflow Chat */}
      <div className="col-span-2 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 border-t border-gray-200 bg-gray-50 dark:bg-[#141414]">
            <h3 className="text-lg font-medium">Workflow Chat</h3>
          </div>
          <div className="flex-1 p-4">
            <ChatInterface />
          </div>
        </div>
      </div>
    </div>
  );
}
