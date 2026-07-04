import { getDocumentEmbedding } from './embeddings';

/**
 * Fallback: Performs local keyword overlap similarity ranking on raw text chunks.
 * @param {string} query - User search string
 * @param {object[]} documents - Raw chunk documents { text, source }
 * @param {number} k - Number of top chunks to return
 * @returns {object[]} Ranked chunks
 */
export function localKeywordRetrieve(query, documents, k = 4) {
  const cleanTokens = (text) => {
    return text.toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter(w => w.length > 2);
  };
  
  const qTokens = cleanTokens(query);
  if (qTokens.length === 0) {
    return documents.slice(0, k).map(doc => ({ ...doc, similarity: 0.1 }));
  }
  
  const scored = documents.map(doc => {
    const docTokens = cleanTokens(doc.text);
    let matches = 0;
    
    qTokens.forEach(token => {
      if (docTokens.includes(token)) {
        matches++;
      }
    });
    
    // Compute simple Jaccard-like overlap coefficient
    const score = matches / (qTokens.length + Math.min(5, docTokens.length * 0.1));
    return {
      ...doc,
      similarity: score
    };
  });
  
  scored.sort((a, b) => b.similarity - a.similarity);
  return scored.slice(0, k);
}

/**
 * Retrieves the most relevant chunks from the vector store.
 * @param {string} query - User search query
 * @param {object} vectorStore - VectorStore class instance
 * @param {string} provider - 'gemini' | 'openai'
 * @param {string} apiKey - API key
 * @param {number} k - Top results limit
 * @returns {Promise<object[]>} Top matched source chunks
 */
export async function retrieveContext(query, vectorStore, provider, apiKey, k = 4) {
  if (!apiKey || !provider) {
    // Falls back to local keyword search
    return localKeywordRetrieve(query, vectorStore.documents, k);
  }
  
  try {
    const queryEmb = await getDocumentEmbedding(query, provider, apiKey);
    return vectorStore.similaritySearch(queryEmb, k);
  } catch (err) {
    console.error("Vector search failed. Falling back to local keyword search:", err);
    return localKeywordRetrieve(query, vectorStore.documents, k);
  }
}
