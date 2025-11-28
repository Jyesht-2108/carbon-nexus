/**
 * Configuration loader for RAG Chatbot Plugin
 * Loads environment variables from .env file
 */
import dotenv from 'dotenv';
import path from 'path';

// Load .env file from project root
dotenv.config({ path: path.join(__dirname, '../../.env') });

// Service URLs
export const ML_ENGINE_URL = process.env.ML_ENGINE_URL || 'http://localhost:8001';
export const DATA_CORE_URL = process.env.DATA_CORE_URL || 'http://localhost:8002';
export const ORCHESTRATION_URL = process.env.ORCHESTRATION_URL || 'http://localhost:8003';
export const RAG_URL = process.env.RAG_URL || 'http://localhost:8004';

// Database
export const SUPABASE_URL = process.env.SUPABASE_URL || '';
export const SUPABASE_KEY = process.env.SUPABASE_KEY || '';

// Validate required variables
function validateConfig(): void {
  if (!SUPABASE_URL) {
    console.warn('Warning: SUPABASE_URL not set');
  }
  if (!SUPABASE_KEY) {
    console.warn('Warning: SUPABASE_KEY not set');
  }
}

// Auto-validate on import
validateConfig();

// Export all config as default object
export default {
  ML_ENGINE_URL,
  DATA_CORE_URL,
  ORCHESTRATION_URL,
  RAG_URL,
  SUPABASE_URL,
  SUPABASE_KEY,
};
