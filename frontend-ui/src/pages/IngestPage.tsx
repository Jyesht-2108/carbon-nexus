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
      className="space-y-6"
    >
      <motion.div variants={fadeIn}>
        <h1 className="text-2xl font-bold text-gray-900">Data Upload</h1>
        <p className="text-gray-600 mt-1">
          Upload CSV or XLSX files to feed the carbon tracking pipeline
        </p>
      </motion.div>

      <FileUploadCard onUploadComplete={handleUploadComplete} />

      <Card>
        <CardHeader>
          <CardTitle>Upload History</CardTitle>
        </CardHeader>
        <CardContent>
          <UploadHistoryList history={uploadHistory} />
        </CardContent>
      </Card>
    </motion.div>
  );
}
