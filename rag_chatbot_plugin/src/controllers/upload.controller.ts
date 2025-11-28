import { Request, Response } from 'express';
import { getDatabase } from '../config/database';
import { PDFService } from '../services/pdf.service';
import { ChunkingService } from '../services/chunking.service';
import { EmbeddingService } from '../services/embedding.service';
import { QdrantService } from '../services/qdrant.service';
import { logger } from '../config/logger';
import { config } from '../config/env';

export class UploadController {
  private pdfService = new PDFService();
  private chunkingService = new ChunkingService();
  private embeddingService = new EmbeddingService();
  private qdrantService = new QdrantService();
  
  upload = async (req: Request, res: Response) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }
      
      const db = getDatabase();
      const user = req.user!;
      
      // Save upload record to Supabase
      const { data: uploadData, error: uploadError } = await db
        .from('uploads')
        .insert({
          file_name: req.file.originalname,
          file_path: `temp/${Date.now()}_${req.file.originalname}`,
          student_id: user.id,
          class_id: user.classId || 0,
          qdrant_collection: config.qdrant.collection
        })
        .select()
        .single();
      
      if (uploadError) {
        throw uploadError;
      }
      
      const uploadId = uploadData.id;
      
      // Create ingestion job
      const { error: jobError } = await db
        .from('ingestion_jobs')
        .insert({
          upload_id: uploadId,
          status: 'pending'
        });
      
      if (jobError) {
        throw jobError;
      }
      
      // Process asynchronously
      this.processUpload(uploadId, req.file.buffer, req.file.originalname, user.id, user.classId || 0)
        .catch(err => logger.error('Upload processing failed', err));
      
      res.json({ uploadId, status: 'pending' });
    } catch (error) {
      logger.error('Upload failed', error);
      res.status(500).json({ error: 'Upload failed' });
    }
  };
  
  getStatus = async (req: Request, res: Response) => {
    try {
      const db = getDatabase();
      const { data, error } = await db
        .from('ingestion_jobs')
        .select('*')
        .eq('upload_id', req.params.id)
        .single();
      
      if (error || !data) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      
      res.json(data);
    } catch (error) {
      logger.error('Status check failed', error);
      res.status(500).json({ error: 'Failed to get status' });
    }
  };
  
  private async processUpload(
    uploadId: number,
    buffer: Buffer,
    fileName: string,
    studentId: number,
    classId: number
  ) {
    const db = getDatabase();
    
    try {
      // Update status to processing
      await db
        .from('ingestion_jobs')
        .update({ status: 'processing' })
        .eq('upload_id', uploadId);
      
      // Extract text from PDF
      const pages = await this.pdfService.extractText(buffer);
      
      // Chunk text
      const chunks = this.chunkingService.chunkPages(pages);
      
      // Generate embeddings
      const texts = chunks.map(c => c.text);
      const embeddings = await this.embeddingService.embedTexts(texts);
      
      // Prepare payloads
      const payloads = chunks.map((chunk, idx) => ({
        uploadId,
        studentId,
        classId,
        fileName,
        page: chunk.pageNumber,
        chunkIndex: chunk.chunkIndex,
        textExcerpt: chunk.text.substring(0, 500)
      }));
      
      // Upsert to Qdrant
      await this.qdrantService.upsertVectors(embeddings, payloads);
      
      // Mark as done
      await db
        .from('ingestion_jobs')
        .update({
          status: 'done',
          processed_at: new Date().toISOString(),
          chunks_count: chunks.length
        })
        .eq('upload_id', uploadId);
      
      logger.info(`Successfully processed upload ${uploadId}`);
    } catch (error) {
      logger.error(`Processing failed for upload ${uploadId}`, error);
      await db
        .from('ingestion_jobs')
        .update({
          status: 'failed',
          error_message: (error as Error).message
        })
        .eq('upload_id', uploadId);
    }
  }
}
