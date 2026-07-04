import { cosineSimilarity } from '../utils/semanticMatcher';

export class VectorStore {
  constructor() {
    this.documents = []; // array of { id, text, source, embedding }
  }

  /**
   * Adds parsed text chunk documents with their embeddings into the store.
   * @param {object[]} docs - Array of { text, source, embedding }
   */
  addDocuments(docs) {
    docs.forEach((doc, idx) => {
      this.documents.push({
        id: `chunk-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
        text: doc.text,
        source: doc.source,
        embedding: doc.embedding
      });
    });
  }

  /**
   * Clears the store.
   */
  clear() {
    this.documents = [];
  }

  /**
   * Performs cosine similarity search against stored embeddings.
   * @param {number[]} queryEmbedding - The embedding vector of the search query
   * @param {number} k - Number of top documents to return
   * @returns {object[]} Top k matched chunks with similarity score
   */
  similaritySearch(queryEmbedding, k = 4) {
    if (!queryEmbedding || this.documents.length === 0) {
      return [];
    }

    const results = this.documents.map(doc => {
      const similarity = cosineSimilarity(queryEmbedding, doc.embedding);
      return {
        ...doc,
        similarity
      };
    });

    // Sort descending by similarity
    results.sort((a, b) => b.similarity - a.similarity);

    return results.slice(0, k);
  }
}
