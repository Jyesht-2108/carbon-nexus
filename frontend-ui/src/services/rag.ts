import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface RagDocument {
  id: string;
  name: string;
  status: 'processing' | 'processed' | 'failed';
  uploadedAt: string;
}

export interface RagQueryRequest {
  query: string;
  docIds?: string[];
}

export interface RagQueryResponse {
  text: string;
  sources: {
    docId: string;
    snippet: string;
    page?: number;
  }[];
}

export const ragApi = {
  uploadDocument: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axios.post(`${API_BASE_URL}/rag/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  getDocuments: async (): Promise<RagDocument[]> => {
    const response = await axios.get(`${API_BASE_URL}/rag/documents`);
    return response.data;
  },

  query: async (request: RagQueryRequest): Promise<RagQueryResponse> => {
    const response = await axios.post(`${API_BASE_URL}/rag/query`, request);
    return response.data;
  },

  deleteDocument: async (docId: string) => {
    await axios.delete(`${API_BASE_URL}/rag/documents/${docId}`);
  },
};
