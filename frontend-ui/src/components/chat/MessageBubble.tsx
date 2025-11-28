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
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
    >
      <motion.div
        whileHover={{ scale: 1.1 }}
        className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg ${
          isUser
            ? 'bg-gradient-to-br from-primary to-primary-dark text-white'
            : 'glass text-primary dark:text-primary'
        }`}
      >
        {isUser ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
      </motion.div>

      <div className={`flex-1 max-w-2xl ${isUser ? 'flex justify-end' : ''}`}>
        <motion.div
          initial={{ scale: 0.95 }}
          animate={{ scale: 1 }}
          className={`rounded-2xl px-5 py-3 shadow-lg ${
            isUser
              ? 'bg-gradient-to-r from-primary to-primary-dark text-white'
              : 'glass-card dark:text-gray-100'
          }`}
        >
          {isTyping ? (
            <div className="flex gap-1.5 py-1">
              <motion.span
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ opacity: [0.4, 1, 0.4], y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0 }}
              />
              <motion.span
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ opacity: [0.4, 1, 0.4], y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              />
              <motion.span
                className="w-2.5 h-2.5 bg-primary rounded-full"
                animate={{ opacity: [0.4, 1, 0.4], y: [0, -5, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              />
            </div>
          ) : (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
          )}
        </motion.div>

        {message.sources && message.sources.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-3 space-y-2"
          >
            {message.sources.map((source, idx) => (
              <CiteCard key={idx} source={source} />
            ))}
          </motion.div>
        )}

        <p className="text-xs text-muted dark:text-gray-400 mt-2 px-2">
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}
