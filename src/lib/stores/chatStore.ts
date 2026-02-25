import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatState {
  messages: ChatMessage[];
  isLoading: boolean;
  suggestions: string[];
  addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  setLoading: (loading: boolean) => void;
  setSuggestions: (suggestions: string[]) => void;
  getSuggestions: (input: string) => void;
  clearMessages: () => void;
}

interface ChatCommand {
  command: string;
  description: string;
  example?: string;
}

const WORKFLOW_COMMANDS: ChatCommand[] = [
  {
    command: 'create workflow',
    description: 'Create a new workflow',
    example: 'create workflow named "My Workflow"',
  },
  {
    command: 'list workflows',
    description: 'List all workflows',
    example: 'list workflows',
  },
  {
    command: 'publish workflow',
    description: 'Publish a workflow',
    example: 'publish workflow "My Workflow"',
  },
  {
    command: 'execute workflow',
    description: 'Execute a workflow',
    example: 'execute workflow "My Workflow"',
  },
  {
    command: 'delete workflow',
    description: 'Delete a workflow',
    example: 'delete workflow "My Workflow"',
  },
  {
    command: 'show queue',
    description: 'Show job queue status',
    example: 'show queue',
  },
  {
    command: 'help',
    description: 'Show available commands',
    example: 'help',
  },
];

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      messages: [],
      isLoading: false,
      suggestions: [],

      addMessage: (message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
        const newMessage: ChatMessage = {
          ...message,
          id: Date.now().toString(),
          timestamp: new Date(),
        };

        set((state) => ({
          ...state,
          messages: [...state.messages, newMessage],
        }));
      },

      setLoading: (loading: boolean) => set({ isLoading: loading }),

      setSuggestions: (suggestions: string[]) => set({ suggestions }),

      clearMessages: () => set({ messages: [] }),

      getSuggestions: (input: string) => {
        const lowerInput = input.toLowerCase();
        const matchingCommands = WORKFLOW_COMMANDS.filter(
          (cmd) =>
            cmd.command.toLowerCase().includes(lowerInput) ||
            cmd.description.toLowerCase().includes(lowerInput)
        );

        set({ suggestions: matchingCommands.map((cmd) => cmd.command) });
      },
    }),
    {
      name: 'chat-storage',
      partialize: (state) => ({
        messages: state.messages,
        suggestions: state.suggestions,
      }),
    }
  )
);

export { WORKFLOW_COMMANDS };
