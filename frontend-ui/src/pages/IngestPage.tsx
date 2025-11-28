import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { FileUploadCard } from '@/components/upload/FileUploadCard';
import { UploadHistoryList } from '@/components/upload/UploadHistoryList';
import { motion } from 'framer-motion';
import { fadeIn, staggerContainer } from '@/lib/animations';

export function IngestPage() {
  const [uploadHistory, setUploadHistory] = useState<any[]>([]);

  const handleUploadComplete = (result: any) => {
    setUploadHistory((prev) => [result, ...prev]);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-8"
    >
      <motion.div
        variants={fadeIn}
        className="glass-card p-6 rounded-2xl border-l-4 border-l-primary"
      >
        <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-primary to-accent1 bg-clip-text text-transparent">
          Data Upload
        </h1>
        <p className="text-muted dark:text-gray-400 mt-2 text-lg">
          Upload CSV or XLSX files to feed the carbon tracking pipeline
        </p>
      </motion.div>

      <FileUploadCard onUploadComplete={handleUploadComplete} />

      <Card>
        <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
          <CardTitle className="font-heading flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
            >
              📊
            </motion.div>
            Upload History
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <UploadHistoryList history={uploadHistory} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
