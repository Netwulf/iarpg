'use client';

import { useState, useEffect } from 'react';
import { Button, Textarea, Card } from '@iarpg/ui';
import { Bot, Copy, Send, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface AIAssistantProps {
  tableId: string;
}

const quickPrompts = [
  { label: 'Plot Twist', prompt: 'Suggest an exciting plot twist for the current situation' },
  { label: 'Encounter', prompt: 'Create a balanced combat encounter for the party' },
  { label: 'NPC', prompt: 'Generate an interesting NPC with personality and goals' },
  { label: 'Location', prompt: 'Describe a mysterious location the party could explore' },
];

export function AIAssistant({ tableId }: AIAssistantProps) {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [remaining, setRemaining] = useState<number | 'unlimited'>(10);

  useEffect(() => {
    fetchRemaining();
  }, []);

  const fetchRemaining = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/ai/remaining`, {
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setRemaining(data.remaining);
      }
    } catch (error) {
      console.error('Failed to fetch remaining requests:', error);
    }
  };

  const handleAskAI = async (customPrompt?: string) => {
    const finalPrompt = customPrompt || prompt;
    if (!finalPrompt.trim() || loading) return;

    setLoading(true);
    setResponse('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/ai/assist`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ prompt: finalPrompt }),
        }
      );

      if (!res.ok) {
        if (res.status === 429) {
          alert('Rate limit exceeded. Upgrade to premium for unlimited requests.');
          return;
        }
        throw new Error('AI request failed');
      }

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No reader available');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') break;

            try {
              const parsed = JSON.parse(data);
              if (parsed.chunk) {
                setResponse((prev) => prev + parsed.chunk);
              } else if (parsed.error) {
                alert('AI request failed: ' + parsed.error);
                break;
              }
            } catch (e) {
              // Skip invalid JSON
            }
          }
        }
      }

      // Update remaining requests
      fetchRemaining();
    } catch (error: any) {
      alert('Failed to get AI response: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = () => {
    navigator.clipboard.writeText(response);
    alert('Copied to clipboard!');
  };

  const handleSendToChat = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tables/${tableId}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ content: response }),
      });

      if (!res.ok) {
        throw new Error('Failed to send message');
      }

      alert('Sent to chat!');
    } catch (error: any) {
      alert('Failed to send to chat: ' + error.message);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5 text-purple-400" />
          <h3 className="text-lg font-bold">AI DM Assistant</h3>
          <Sparkles className="w-4 h-4 text-yellow-400" />
        </div>
      </div>

      {/* Quick Prompts */}
      <div className="flex flex-wrap gap-2">
        {quickPrompts.map((qp) => (
          <Button
            key={qp.label}
            variant="outline"
            size="sm"
            onClick={() => {
              setPrompt(qp.prompt);
              handleAskAI(qp.prompt);
            }}
            disabled={loading}
            className="text-xs"
          >
            {qp.label}
          </Button>
        ))}
      </div>

      {/* Prompt Input */}
      <div className="space-y-2">
        <Textarea
          placeholder="Ask the AI assistant for story ideas, encounters, NPCs, or locations..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px]"
          disabled={loading}
          maxLength={500}
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {remaining === 'unlimited'
              ? '✨ Unlimited requests'
              : `${remaining}/10 requests left this hour`}
          </span>
          <Button
            onClick={() => handleAskAI()}
            disabled={loading || !prompt.trim()}
            size="sm"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Thinking...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Ask AI
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Response */}
      {response && (
        <div className="space-y-2">
          <div className="p-4 bg-purple-950/20 rounded-lg border border-purple-900/30 max-h-[400px] overflow-y-auto prose prose-invert prose-sm max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-1">
            <ReactMarkdown>{response}</ReactMarkdown>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              className="flex-1"
            >
              <Copy className="w-4 h-4 mr-1" />
              Copy
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendToChat}
              className="flex-1"
            >
              <Send className="w-4 h-4 mr-1" />
              Send to Chat
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
}
