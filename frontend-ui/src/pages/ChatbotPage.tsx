import { useState } from 'react';
import { ChatWindow } from '@/components/chat/ChatWindow';
import { DocumentListSidebar } from '@/components/chat/DocumentListSidebar';
import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';

export function ChatbotPage() {
  const [documents, setDocuments] = useState<any[]>([]);

  const handleDocumentUpload = (doc: any) => {
    setDocuments((prev) => [...prev, doc]);
  };

  return (
    <motion.div
      variants={fadeIn}
      initial="hidden"
      animate="show"
      className="h-full flex gap-6"
    >
      <div className="flex-1 flex flex-col">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="mb-6 glass-card p-6 rounded-2xl border-l-4 border-l-accent1"
        >
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-accent1 to-primary bg-clip-text text-transparent">
            RAG Assistant
          </h1>
          <p className="text-muted dark:text-gray-400 mt-2 text-lg">
            Upload documents and ask questions about your carbon data
          </p>
        </motion.div>
        <ChatWindow documents={documents} onDocumentUpload={handleDocumentUpload} />
      </div>
      <DocumentListSidebar documents={documents} />
    </motion.div>
  );
}
