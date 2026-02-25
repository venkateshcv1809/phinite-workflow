'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useChatStore, WORKFLOW_COMMANDS } from '@/lib/stores/chatStore';

export default function ChatInterface() {
  const [input, setInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const {
    messages,
    isLoading,
    suggestions,
    addMessage,
    setLoading,
    getSuggestions,
  } = useChatStore();

  useEffect(() => {
    // Scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setInput(value);

    if (value.length > 0) {
      getSuggestions(value);
      setShowSuggestions(true);
    } else {
      setShowSuggestions(false);
    }
  };

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = {
      role: 'user' as const,
      content: input.trim(),
    };

    addMessage(userMessage);
    setInput('');
    setShowSuggestions(false);
    setLoading(true);

    try {
      // Simulate AI response (in real implementation, this would call your AI service)
      setTimeout(() => {
        const response = generateResponse(input.trim());
        const assistantMessage = {
          role: 'assistant' as const,
          content: response,
        };

        addMessage(assistantMessage);
        setLoading(false);
      }, 1000);
    } catch (error) {
      console.error('Error sending message:', error);
      setLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    setShowSuggestions(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const generateResponse = (userInput: string): string => {
    const lowerInput = userInput.toLowerCase();

    // Check for commands
    for (const cmd of WORKFLOW_COMMANDS) {
      if (lowerInput.includes(cmd.command.toLowerCase())) {
        return `I can help you ${cmd.description.toLowerCase()}. For example: ${cmd.example}`;
      }
    }

    // Default responses
    if (lowerInput.includes('hello') || lowerInput.includes('hi')) {
      return 'Hello! I can help you manage workflows. Try "help" to see available commands.';
    }

    if (lowerInput.includes('help')) {
      const commandList = WORKFLOW_COMMANDS.map(
        (cmd) => `• ${cmd.command}: ${cmd.description}`
      ).join('\n');
      return `Available commands:\n${commandList}`;
    }

    return 'I understand you want to work with workflows. You can ask me to create, edit, publish, or execute workflows.';
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle>Workflow Assistant</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-0">
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8">
              <p className="mb-2">👋 Welcome to Workflow Assistant!</p>
              <p className="text-sm">
                I can help you manage workflows through commands.
              </p>
              <p className="text-sm">Type "help" to see available commands.</p>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                } mb-3`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-3 py-2 rounded-lg ${
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="text-xs font-medium mb-1">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm">{message.content}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start mb-3">
              <div className="bg-gray-100 text-gray-900 max-w-xs lg:max-w-md px-3 py-2 rounded-lg">
                <div className="text-xs font-medium mb-1">Assistant</div>
                <div className="text-sm">Thinking...</div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="border-t p-3">
            <p className="text-xs text-muted-foreground mb-2">Suggestions:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map((suggestion) => (
                <Button
                  key={suggestion}
                  size="sm"
                  variant="outline"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion}
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t p-3">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type your message or command..."
              className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              disabled={isLoading}
            />
            <Button
              onClick={handleSendMessage}
              disabled={isLoading || input.trim() === ''}
            >
              Send
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
