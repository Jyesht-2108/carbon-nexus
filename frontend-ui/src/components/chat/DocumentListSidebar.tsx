import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileText, CheckCircle2, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

interface DocumentListSidebarProps {
  documents: any[];
}

export function DocumentListSidebar({ documents }: DocumentListSidebarProps) {
  return (
    <Card className="w-80 flex-shrink-0">
      <CardHeader>
        <CardTitle className="text-base">Uploaded Documents</CardTitle>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No documents uploaded yet
          </p>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-3"
          >
            {documents.map((doc, index) => (
              <motion.div
                key={index}
                variants={fadeIn}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
              >
                <FileText className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {doc.name}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {doc.status === 'processed' ? (
                      <>
                        <CheckCircle2 className="w-3 h-3 text-green-500" />
                        <span className="text-xs text-green-600">Ready</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 text-yellow-500" />
                        <span className="text-xs text-yellow-600">Processing</span>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}
