import { FileText } from 'lucide-react';
import { motion } from 'framer-motion';
import { scaleIn } from '@/lib/animations';

interface CiteCardProps {
  source: {
    docId: string;
    snippet: string;
    page?: number;
  };
}

export function CiteCard({ source }: CiteCardProps) {
  return (
    <motion.div
      variants={scaleIn}
      className="flex gap-2 p-3 bg-white border border-gray-200 rounded-lg text-sm"
    >
      <FileText className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-gray-700 text-xs line-clamp-2">{source.snippet}</p>
        <p className="text-gray-500 text-xs mt-1">
          {source.page ? `Page ${source.page}` : 'Source document'}
        </p>
      </div>
    </motion.div>
  );
}
