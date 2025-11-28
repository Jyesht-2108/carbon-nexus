import { useState, useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { MessageBubble } from './MessageBubble';
import { Send, Paperclip } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { docId: string; snippet: string; page?: number }[];
  timestamp: Date;
}

interface ChatWindowProps {
  documents: any[];
  onDocumentUpload: (doc: any) => void;
}

export function ChatWindow({ documents, onDocumentUpload }: ChatWindowProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I can help you analyze your carbon data and answer questions about your documents. How can I assist you today?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const queryMutation = useMutation({
    mutationFn: async (query: string) => {
      const response = await axios.post('/api/rag/query', {
        query,
        docIds: documents.map((d) => d.id),
      });
      return response.data;
    },
    onSuccess: (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: data.text,
          sources: data.sources,
          timestamp: new Date(),
        },
      ]);
    },
  });

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    queryMutation.mutate(input);
    setInput('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/api/rag/upload', formData);
      onDocumentUpload({ ...response.data, name: file.name });
    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Card className="flex-1 flex flex-col h-[calc(100vh-200px)]">
      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <AnimatePresence>
            {messages.map((message) => (
              <motion.div
                key={message.id}
                variants={fadeIn}
                initial="hidden"
                animate="show"
                exit="hidden"
              >
                <MessageBubble message={message} />
              </motion.div>
            ))}
          </AnimatePresence>
          {queryMutation.isPending && (
            <motion.div variants={fadeIn} initial="hidden" animate="show">
              <MessageBubble
                message={{
                  id: 'typing',
                  role: 'assistant',
                  content: 'Thinking...',
                  timestamp: new Date(),
                }}
                isTyping
              />
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <input
              type="file"
              ref={fileInputRef}
              className="hidden"
              accept=".pdf,.txt,.docx"
              onChange={handleFileUpload}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-4 h-4" />
            </Button>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask a question about your carbon data..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button onClick={handleSend} disabled={!input.trim() || queryMutation.isPending}>
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
