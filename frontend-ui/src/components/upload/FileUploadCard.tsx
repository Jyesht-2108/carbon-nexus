import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { scaleIn } from '@/lib/animations';
import { useMutation } from '@tanstack/react-query';
import axios from 'axios';

interface FileUploadCardProps {
  onUploadComplete: (result: any) => void;
}

export function FileUploadCard({ onUploadComplete }: FileUploadCardProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('file', file);
      const response = await axios.post('/api/ingest/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return response.data;
    },
    onSuccess: (data) => {
      onUploadComplete({
        ...data,
        fileName: file?.name,
        timestamp: new Date().toISOString(),
        status: 'completed',
      });
      setFile(null);
    },
  });

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (file) {
      uploadMutation.mutate(file);
    }
  };

  return (
    <motion.div variants={scaleIn} initial="hidden" animate="show">
      <Card className="overflow-hidden">
        <CardHeader className="border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle className="font-heading">Upload Data File</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <motion.div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
              dragActive
                ? 'border-primary bg-primary/10 dark:bg-primary/20 scale-105'
                : 'border-gray-300 dark:border-gray-600 hover:border-primary/50 dark:hover:border-primary/50'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            whileHover={{ scale: dragActive ? 1.05 : 1.01 }}
          >
            <AnimatePresence mode="wait">
              {!file ? (
                <motion.div
                  key="upload-prompt"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                >
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    <Upload className="w-16 h-16 mx-auto text-primary mb-4" />
                  </motion.div>
                  <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">
                    Drag and drop your CSV or XLSX file here
                  </p>
                  <p className="text-sm text-muted dark:text-gray-400 mb-6">or</p>
                  <label>
                    <input
                      type="file"
                      className="hidden"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                    <Button size="lg" className="cursor-pointer">
                      <Upload className="w-4 h-4 mr-2" />
                      Browse Files
                    </Button>
                  </label>
                  <p className="text-xs text-muted dark:text-gray-400 mt-6">
                    Supported formats: CSV, XLSX (max 50MB)
                  </p>
                </motion.div>
              ) : (
                <motion.div
                  key="file-preview"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="space-y-6"
                >
                  <motion.div
                    animate={{ rotate: uploadMutation.isPending ? 360 : 0 }}
                    transition={{ duration: 2, repeat: uploadMutation.isPending ? Infinity : 0 }}
                  >
                    <FileSpreadsheet className="w-16 h-16 mx-auto text-primary" />
                  </motion.div>
                  <div>
                    <p className="font-heading font-semibold text-gray-900 dark:text-gray-100 text-lg">
                      {file.name}
                    </p>
                    <p className="text-sm text-muted dark:text-gray-400 mt-1">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                  {uploadMutation.isPending && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="space-y-3"
                    >
                      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-gradient-to-r from-primary to-accent1"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 2, ease: 'easeInOut' }}
                          style={{ boxShadow: '0 0 10px rgba(14, 165, 160, 0.5)' }}
                        />
                      </div>
                      <p className="text-sm text-muted dark:text-gray-400 font-medium">
                        Uploading and processing...
                      </p>
                    </motion.div>
                  )}
                  {uploadMutation.isSuccess && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400 p-4 rounded-2xl bg-green-50 dark:bg-green-900/20"
                    >
                      <CheckCircle2 className="w-6 h-6" />
                      <span className="font-semibold">Upload successful!</span>
                    </motion.div>
                  )}
                  {uploadMutation.isError && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400 p-4 rounded-2xl bg-red-50 dark:bg-red-900/20"
                    >
                      <AlertCircle className="w-6 h-6" />
                      <span className="font-semibold">Upload failed</span>
                    </motion.div>
                  )}
                  {!uploadMutation.isPending && !uploadMutation.isSuccess && (
                    <motion.div
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className="flex gap-3 justify-center"
                    >
                      <Button size="lg" onClick={handleUpload}>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload
                      </Button>
                      <Button size="lg" variant="outline" onClick={() => setFile(null)}>
                        Cancel
                      </Button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
