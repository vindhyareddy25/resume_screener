/**
 * Builds the structured RAG prompt containing source candidate text chunks and the user's question.
 * @param {string} query - User search question
 * @param {object[]} chunks - Array of { text, source, similarity } context chunks
 * @returns {string} The formatted prompt
 */
export function buildRagPrompt(query, chunks) {
  const formattedChunks = chunks.map((chunk, idx) => {
    return `[Source ${idx + 1}] Candidate File: ${chunk.source} (Match score: ${Math.round(chunk.similarity * 100)}%)\n${chunk.text}`;
  }).join('\n\n---\n\n');

  return `You are a recruitment assistant agent. Analyze the resumes and job descriptions provided in the context below to answer the query.

Context Information:
---------------------
${formattedChunks}
---------------------

Instructions:
1. Provide a professional, concise, and structured answer.
2. Rely ONLY on clear facts mentioned in the context above.
3. If the context does not contain the answer, state: "Based on the uploaded resumes, I could not find information about that."
4. ALWAYS cite your sources using bracketed notation like "[Source 1]" or "[Source 2]" when presenting facts.
5. If comparing candidates, create a brief comparison breakdown.

User Query:
${query}`;
}
