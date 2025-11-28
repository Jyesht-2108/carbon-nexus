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
      
      // Save upload record
      const [result] = await db.execute(
        'INSERT INTO uploads (file_name, file_path, student_id, class_id, qdrant_collection) VALUES (?, ?, ?, ?, ?)',
        [req.file.originalname, `temp/${Date.now()}_${req.file.originalname}`, user.id, user.classId || 0, config.qdrant.collection]
      );
      
      const uploadId = (result as any).insertId;
      
      // Create ingestion job
      await db.execute(
        'INSERT INTO ingestion_jobs (upload_id, status) VALUES (?, ?)',
        [uploadId, 'pending']
      );
      
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
      const [rows] = await db.execute(
        'SELECT * FROM ingestion_jobs WHERE upload_id = ?',
        [req.params.id]
      );
      
      const jobs = rows as any[];
      if (jobs.length === 0) {
        return res.status(404).json({ error: 'Upload not found' });
      }
      
      res.json(jobs[0]);
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
      await db.execute(
        'UPDATE ingestion_jobs SET status = ? WHERE upload_id = ?',
        ['processing', uploadId]
      );
      
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
      await db.execute(
        'UPDATE ingestion_jobs SET status = ?, processed_at = NOW(), chunks_count = ? WHERE upload_id = ?',
        ['done', chunks.length, uploadId]
      );
      
      logger.info(`Successfully processed upload ${uploadId}`);
    } catch (error) {
      logger.error(`Processing failed for upload ${uploadId}`, error);
      await db.execute(
        'UPDATE ingestion_jobs SET status = ?, error_message = ? WHERE upload_id = ?',
        ['failed', (error as Error).message, uploadId]
      );
    }
  }
}
