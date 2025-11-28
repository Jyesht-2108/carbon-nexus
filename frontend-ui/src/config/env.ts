/**
 * Configuration loader for Frontend UI
 * Loads environment variables for Vite
 */

// Vite exposes env vars via import.meta.env
// Variables must be prefixed with VITE_ to be exposed to the client

// API Base URL (defaults to orchestration engine)
export const VITE_API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8003';

// Individual service URLs (if needed for direct access)
export const ML_ENGINE_URL = import.meta.env.VITE_ML_ENGINE_URL || 'http://localhost:8001';
export const DATA_CORE_URL = import.meta.env.VITE_DATA_CORE_URL || 'http://localhost:8002';
export const ORCHESTRATION_URL = import.meta.env.VITE_ORCHESTRATION_URL || 'http://localhost:8003';
export const RAG_URL = import.meta.env.VITE_RAG_URL || 'http://localhost:8004';

// Supabase (if frontend needs direct access)
export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_KEY || '';

// Validate configuration
function validateConfig(): void {
  if (!VITE_API_URL) {
    console.warn('Warning: VITE_API_URL not set, using default');
  }
}

// Auto-validate on import
validateConfig();

// Export all config as default object
export default {
  VITE_API_URL,
  ML_ENGINE_URL,
  DATA_CORE_URL,
  ORCHESTRATION_URL,
  RAG_URL,
  SUPABASE_URL,
  SUPABASE_KEY,
};
