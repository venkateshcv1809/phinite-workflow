'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthStore } from '@/lib/stores/authStore';
import { CONSTANTS } from '@/lib/constants';
import { createWorkflow, getWorkflows } from '@/lib/services/workflow-actions';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface Workflow {
  id: string;
  name: string;
  userId: string;
  published: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  createdAt: Date;
  updatedAt: Date;
  publishedNodes?: WorkflowNode[];
  publishedEdges?: WorkflowEdge[];
}

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

export default function WorkflowEditor() {
  const router = useRouter();
  const { user } = useAuthStore();
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [workflowName, setWorkflowName] = useState('');
  const [createError, setCreateError] = useState('');

  useEffect(() => {
    const fetchWorkflows = async () => {
      try {
        const result = await getWorkflows();

        if (result.success && result.data) {
          setWorkflows(result.data);
        }
      } catch (error) {
        console.error('Error fetching workflows:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchWorkflows();
  }, [user]);

  const handleCreateNew = async () => {
    if (!workflowName.trim()) return;

    setIsCreating(true);
    setCreateError('');

    try {
      const result = await createWorkflow(workflowName);

      if (!result.success || !result.data) {
        setCreateError(result.error || 'Failed to create workflow');
        return;
      }

      const newWorkflow = result.data;
      setWorkflows([newWorkflow, ...workflows]);
      setWorkflowName('');
      setShowCreateInput(false);
      router.push(`/workflow/${newWorkflow.id}`);
    } catch (error) {
      console.error('Error creating workflow:', error);
      setCreateError('Network error. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateClick = () => {
    setShowCreateInput(true);
  };

  const handleCancelCreate = () => {
    setShowCreateInput(false);
    setWorkflowName('');
    setCreateError('');
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleCreateNew();
    } else if (e.key === 'Escape') {
      handleCancelCreate();
    }
  };

  const handleSelectWorkflow = (workflow: Workflow) => {
    router.push(`/workflow/${workflow.id}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p>Loading workflows...</p>
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-12 gap-4 p-4">
      <div className="col-span-3 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-4 overflow-y-auto">
            <Button
              onClick={handleCreateClick}
              disabled={isCreating}
              className="w-full h-12 text-lg cursor-pointer hover:shadow-md transition-all"
            >
              Create Workflow
            </Button>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4"></div>

            {showCreateInput && (
              <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between p-3 border-2 border-blue-500 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                  <input
                    type="text"
                    value={workflowName}
                    onChange={(e) => {
                      setWorkflowName(e.target.value);
                      setCreateError('');
                    }}
                    onKeyDown={handleKeyPress}
                    placeholder="Enter workflow name..."
                    className={`flex-1 px-2 py-1 bg-transparent border-none outline-none text-sm placeholder-gray-500 dark:placeholder-gray-400 ${
                      createError
                        ? 'text-red-600 dark:text-red-400'
                        : 'text-gray-900 dark:text-gray-100'
                    }`}
                    autoFocus
                  />
                  <button
                    onClick={handleCancelCreate}
                    className="ml-2 p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                    disabled={isCreating}
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </div>
                {createError && (
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {createError}
                  </p>
                )}
              </div>
            )}

            {workflows.length === 0 ? null : (
              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    onClick={() => handleSelectWorkflow(workflow)}
                  >
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate text-gray-900 dark:text-gray-100">
                        {workflow.name}
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        {workflow.updatedAt.toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={workflow.published ? 'default' : 'secondary'}
                      className="text-xs ml-2"
                    >
                      {workflow.published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="col-span-6 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full">
          <ReactFlow
            nodes={[]}
            edges={[]}
            fitView
            attributionPosition="bottom-left"
            panOnDrag={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            preventScrolling={true}
            className="opacity-50"
            colorMode={CONSTANTS.DARK_MODE ? 'dark' : 'light'}
            style={{ background: 'transparent' }}
          >
            <Background
              color={CONSTANTS.DARK_MODE ? '#ffffff' : '#000000'}
              gap={16}
            />
            <Controls
              className="opacity-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600"
              showInteractive={false}
            />
            <MiniMap className="opacity-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600" />
          </ReactFlow>
        </div>
      </div>

      <div className="col-span-3 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {/* Chat messages will appear here */}
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 bg-gray-50 dark:bg-[#141414]">
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer hover:shadow-md transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
