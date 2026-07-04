import { getEmbedding } from '../services/llmService';

/**
 * Gets the embedding representation of a text block.
 * Falls back to a dummy vector if API parameters are missing.
 * @param {string} text 
 * @param {string} provider 
 * @param {string} apiKey 
 * @returns {Promise<number[]>} Embedding vector (size 1536 for OpenAI or 768 for Gemini)
 */
export async function getDocumentEmbedding(text, provider, apiKey) {
  if (!apiKey || !provider) {
    // Generate a dummy vector of size 128 for local TF-IDF / keyword similarity fallback
    const vector = new Array(128).fill(0);
    // Simple hash-based vector generation for fallback search
    const clean = text.toLowerCase().replace(/[^a-z]/g, '');
    for (let i = 0; i < clean.length; i++) {
      const idx = clean.charCodeAt(i) % 128;
      vector[idx] += 1;
    }
    const magnitude = Math.sqrt(vector.reduce((sum, v) => sum + v * v, 0));
    return magnitude > 0 ? vector.map(v => v / magnitude) : vector;
  }
  
  return await getEmbedding(text, provider, apiKey);
}
