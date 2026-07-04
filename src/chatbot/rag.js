import { getDocumentEmbedding } from './embeddings';
import { retrieveContext } from './retriever';
import { buildRagPrompt } from './promptBuilder';
import { chatWithRAG } from '../services/llmService';

/**
 * Splits a document's text into overlapping chunks.
 * @param {string} text - Raw text content
 * @param {string} source - Source identifier (e.g. Candidate name or file name)
 * @param {number} chunkSize - Number of characters per chunk
 * @param {number} overlap - Character overlap between chunks
 * @returns {object[]} Array of chunks { text, source }
 */
export function chunkText(text, source, chunkSize = 600, overlap = 120) {
  if (!text) return [];
  
  const chunks = [];
  let index = 0;
  
  while (index < text.length) {
    const chunkText = text.substring(index, index + chunkSize);
    chunks.push({
      text: chunkText.trim(),
      source
    });
    
    index += chunkSize - overlap;
  }
  
  return chunks;
}

/**
 * Indexes a document (chunking + embedding + vector store insertion).
 * @param {string} text - Full text content
 * @param {string} source - Document source name
 * @param {string} provider - 'gemini' | 'openai'
 * @param {string} apiKey - API key
 * @param {object} vectorStore - VectorStore class instance
 */
export async function indexDocument(text, source, provider, apiKey, vectorStore) {
  const chunks = chunkText(text, source);
  if (chunks.length === 0) return;
  
  const indexedChunks = [];
  
  // Fetch embeddings for chunks.
  // If API key is available, fetch embedding vectors. If not, generate local TF-IDF weights.
  for (const chunk of chunks) {
    const embedding = await getDocumentEmbedding(chunk.text, provider, apiKey);
    indexedChunks.push({
      ...chunk,
      embedding
    });
  }
  
  vectorStore.addDocuments(indexedChunks);
}

/**
 * Resolves query locally using candidate stats if no API key is configured.
 */
function resolveQueryLocally(query, candidates) {
  const q = query.toLowerCase();
  
  if (candidates.length === 0) {
    return "Please upload resumes and JD first to start chatting.";
  }

  // 1. Who is the best candidate / highest score?
  if (q.includes('best') || q.includes('highest') || q.includes('top') || q.includes('rank')) {
    const top = [...candidates].sort((a, b) => b.scores.final - a.scores.final)[0];
    return `Based on the ATS scoring, the top candidate is **${top.name}** with an overall score of **${top.scores.final}/100**.\n\n` + 
           `- **Skills Score**: ${top.scores.skills}/100\n` +
           `- **Experience**: ${top.experience_years === 0 ? 'Fresher' : (top.experience_years ? `${top.experience_years} years` : 'Not specified')}\n` +
           `- **Justification**: ${top.justification}\n\n` +
           `*(To enable full conversational answers, please input an API key in settings.)*`;
  }
  
  // 2. Skill gaps or missing skills
  if (q.includes('gap') || q.includes('missing') || q.includes('weakness')) {
    const responseParts = ["Here is a summary of candidate skill gaps:"];
    candidates.forEach(c => {
      if (c.skillGap.missing.length > 0) {
        responseParts.push(`- **${c.name}** is missing: ${c.skillGap.missing.slice(0, 5).join(', ')}${c.skillGap.missing.length > 5 ? '...' : ''}`);
      } else {
        responseParts.push(`- **${c.name}** matches all required skills!`);
      }
    });
    return responseParts.join('\n') + `\n\n*(Input an API key for specific optimization tips.)*`;
  }
  
  // 3. Filter candidates by specific skill
  let matchedSkill = null;
  const tokens = q.split(/[^a-z0-9+#]+/i);
  for (const token of tokens) {
    if (token.length < 2) continue;
    // Check if the query asks about a technology we have on candidates
    for (const c of candidates) {
      const match = c.skills.find(s => s.toLowerCase() === token);
      if (match) {
        matchedSkill = match;
        break;
      }
    }
    if (matchedSkill) break;
  }
  
  if (matchedSkill) {
    const experts = candidates.filter(c => 
      c.skills.some(s => s.toLowerCase() === matchedSkill.toLowerCase())
    );
    if (experts.length > 0) {
      return `Found ${experts.length} candidate(s) mentioning **${matchedSkill}**:\n` + 
             experts.map(e => `- **${e.name}** (${e.experience_years === 0 ? 'Fresher' : (e.experience_years ? `${e.experience_years} yrs exp` : 'No exp specified')}, ${e.education})`).join('\n') +
             `\n\n*(Input an API key for deep project-level assessment.)*`;
    }
  }

  // 4. Default helpful info
  return `I have indexed the resumes of **${candidates.map(c => c.name).join(', ')}** against the job description.\n\n` +
         `You can ask me questions like:\n` +
         `- "Who is the top candidate?"\n` +
         `- "What skills are missing?"\n` +
         `- "Does anyone know Python?"\n\n` +
         `*Please configure your Gemini or OpenAI API key in the settings panel to activate the advanced RAG chatbot and receive natural language reasoning answers.*`;
}

/**
 * Executes a full RAG Chatbot loop (Retrieve + Prompt + Generate).
 * @param {string} query - User question
 * @param {object} vectorStore - VectorStore class instance
 * @param {object[]} candidates - Scored candidates array for local fallbacks
 * @param {string} provider - 'gemini' | 'openai'
 * @param {string} apiKey - API key
 * @returns {Promise<string>} Answer from LLM or local fallback
 */
export async function queryRAG(query, vectorStore, candidates, provider, apiKey) {
  if (!apiKey || !provider) {
    return resolveQueryLocally(query, candidates);
  }
  
  try {
    // 1. Retrieve top 4 relevant context chunks
    const chunks = await retrieveContext(query, vectorStore, provider, apiKey, 4);
    
    if (chunks.length === 0) {
      return "I could not retrieve any relevant candidate information. Please ensure resumes are processed.";
    }
    
    // 2. Format the prompt with context
    const prompt = buildRagPrompt(query, chunks);
    
    // 3. Generate answer using LLM
    const answer = await chatWithRAG(query, chunks, provider, apiKey);
    
    return answer;
  } catch (error) {
    console.error("RAG search query failed, falling back to local resolver:", error);
    return `*(RAG network error - falling back to local database)*\n\n` + resolveQueryLocally(query, candidates);
  }
}
