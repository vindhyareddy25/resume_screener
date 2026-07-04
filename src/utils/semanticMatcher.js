/**
 * Calculates the cosine similarity between two numeric vectors.
 * @param {number[]} vecA - Vector A
 * @param {number[]} vecB - Vector B
 * @returns {number} Cosine similarity (value between -1 and 1, usually 0 to 1 for embeddings)
 */
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length === 0 || vecA.length !== vecB.length) {
    return 0;
  }
  
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  
  if (normA === 0 || normB === 0) {
    return 0;
  }
  
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Common English stopwords to ignore in local vector overlap calculation
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves',
  'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their',
  'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was',
  'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the',
  'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against',
  'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in',
  'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
  'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only',
  'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now'
]);

/**
 * Heuristic fallback: Calculates local cosine similarity between two texts
 * based on term-frequency vectors (Bag of Words) with stop-words removed.
 * @param {string} textA 
 * @param {string} textB 
 * @returns {number} Score from 0 to 100
 */
export function calculateLocalSemanticMatch(textA, textB) {
  if (!textA || !textB) return 0;
  
  const tokenize = (text) => {
    return text.toLowerCase()
      .split(/[^a-z0-9+#]+/i) // Keep symbols like C++, C#
      .filter(word => word.length > 1 && !STOP_WORDS.has(word));
  };
  
  const tokensA = tokenize(textA);
  const tokensB = tokenize(textB);
  
  if (tokensA.length === 0 || tokensB.length === 0) return 0;
  
  // Calculate term frequencies
  const getFrequencies = (tokens) => {
    const freqs = {};
    tokens.forEach(token => {
      freqs[token] = (freqs[token] || 0) + 1;
    });
    return freqs;
  };
  
  const freqsA = getFrequencies(tokensA);
  const freqsB = getFrequencies(tokensB);
  
  // Create unique vocabulary
  const vocab = new Set([...Object.keys(freqsA), ...Object.keys(freqsB)]);
  
  // Build vectors
  const vecA = [];
  const vecB = [];
  
  vocab.forEach(word => {
    vecA.push(freqsA[word] || 0);
    vecB.push(freqsB[word] || 0);
  });
  
  const similarity = cosineSimilarity(vecA, vecB);
  
  // Map similarity to a 0-100 range.
  // Term frequency overlap of natural language documents typically sits between 0.1 and 0.6.
  // We apply a soft sigmoid-like scaling to make it a user-friendly score.
  const scaledScore = Math.round(Math.min(1.0, similarity * 2.2) * 100);
  
  // Ensure it stays between 10 and 100 if there's any text
  return Math.max(10, scaledScore);
}
