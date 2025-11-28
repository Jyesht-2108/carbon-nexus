import { motion } from 'framer-motion';
import { User, Bot, FileText } from 'lucide-react';
import { CiteCard } from './CiteCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: { docId: string; snippet: string; page?: number }[];
  timestamp: Date;
}

interface MessageBubbleProps {
  message: Message;
  isTyping?: boolean;
}

export function MessageBubble({ message, isTyping }: MessageBubbleProps) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
          isUser ? 'bg-primary text-white' : 'bg-gray-200 text-gray-700'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      <div className={`flex-1 max-w-2xl ${isUser ? 'flex justify-end' : ''}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-primary text-white'
              : 'bg-gray-100 text-gray-900'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1">
              <motion.span
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="w-2 h-2 bg-gray-400 rounded-full"
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : (
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          )}
        </div>

        {message.sources && message.sources.length > 0 && (
          <div className="mt-2 space-y-2">
            {message.sources.map((source, idx) => (
              <CiteCard key={idx} source={source} />
            ))}
          </div>
        )}

        <p className="text-xs text-gray-500 mt-1 px-1">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </div>
  );
}
