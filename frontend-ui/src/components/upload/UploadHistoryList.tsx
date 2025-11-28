import { motion } from 'framer-motion';
import { fadeIn } from '@/lib/animations';
import { CheckCircle2, XCircle, Clock, FileSpreadsheet } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface UploadHistoryListProps {
  history: any[];
}

export function UploadHistoryList({ history }: UploadHistoryListProps) {
  if (history.length === 0) {
    return (
      <p className="text-center text-gray-500 py-8">No uploads yet</p>
    );
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-500" />;
      case 'processing':
        return <Clock className="w-5 h-5 text-yellow-500 animate-spin" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  return (
    <div className="space-y-3">
      {history.map((item, index) => (
        <motion.div
          key={index}
          variants={fadeIn}
          initial="hidden"
          animate="show"
          className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet className="w-5 h-5 text-primary" />
            <div>
              <div className="font-medium text-gray-900">{item.fileName}</div>
              <div className="text-sm text-gray-500">
                {item.rowsProcessed ? `${item.rowsProcessed} rows processed` : 'Processing...'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(item.timestamp), { addSuffix: true })}
            </span>
            {getStatusIcon(item.status)}
          </div>
        </motion.div>
      ))}
    </div>
  );
}
