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
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">RAG Assistant</h1>
          <p className="text-gray-600 mt-1">
            Upload documents and ask questions about your carbon data
          </p>
        </div>
        <ChatWindow documents={documents} onDocumentUpload={handleDocumentUpload} />
      </div>
      <DocumentListSidebar documents={documents} />
    </motion.div>
  );
}
