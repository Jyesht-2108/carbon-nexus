import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
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
      <Card>
        <CardHeader>
          <CardTitle>Upload Data File</CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-2xl p-12 text-center transition-colors ${
              dragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {!file ? (
              <>
                <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">
                  Drag and drop your CSV or XLSX file here
                </p>
                <p className="text-sm text-gray-500 mb-4">or</p>
                <label>
                  <input
                    type="file"
                    className="hidden"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileChange}
                  />
                  <Button as="span" className="cursor-pointer">
                    Browse Files
                  </Button>
                </label>
                <p className="text-xs text-gray-500 mt-4">
                  Supported formats: CSV, XLSX (max 50MB)
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <FileSpreadsheet className="w-12 h-12 mx-auto text-primary" />
                <div>
                  <p className="font-medium text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-500">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
                {uploadMutation.isPending && (
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 2, ease: 'easeInOut' }}
                      />
                    </div>
                    <p className="text-sm text-gray-600">Uploading...</p>
                  </div>
                )}
                {uploadMutation.isSuccess && (
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle2 className="w-5 h-5" />
                    <span className="font-medium">Upload successful!</span>
                  </div>
                )}
                {uploadMutation.isError && (
                  <div className="flex items-center justify-center gap-2 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Upload failed</span>
                  </div>
                )}
                {!uploadMutation.isPending && !uploadMutation.isSuccess && (
                  <div className="flex gap-2 justify-center">
                    <Button onClick={handleUpload}>Upload</Button>
                    <Button variant="outline" onClick={() => setFile(null)}>
                      Cancel
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
