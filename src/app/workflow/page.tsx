'use client';

import { Button } from '@/components/ui/button';
import { CONSTANTS } from '@/lib/constants';
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

export default function WorkflowEditor() {
  return (
    <div className="h-[calc(100vh-4rem)] grid grid-cols-12 gap-4 p-4">
      <div className="col-span-3 bg-white dark:bg-[#141414] border border-gray-800 rounded-lg overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="p-4 space-y-4 overflow-y-auto">
            <Button className="w-full h-12 text-lg">Create Workflow</Button>

            <div className="border-t border-gray-200 dark:border-gray-600 pt-4"></div>
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
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
