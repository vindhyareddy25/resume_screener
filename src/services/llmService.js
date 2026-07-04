import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import { cosineSimilarity } from '../utils/semanticMatcher';

/**
 * Cleans markdown formatting from LLM string output and parses it as JSON.
 * @param {string} rawText - Response from LLM
 * @returns {object} Parsed JSON object
 */
function cleanAndParseJSON(rawText) {
  const trimmed = rawText.trim();
  try {
    return JSON.parse(trimmed);
  } catch (e) {
    // Remove markdown code blocks if present
    const cleanPattern = /^```(?:json)?\s*([\s\S]*?)\s*```$/i;
    const match = trimmed.match(cleanPattern);
    const cleaned = match ? match[1].trim() : trimmed;
    try {
      return JSON.parse(cleaned);
    } catch (err) {
      console.error("Failed parsing JSON from LLM content: ", trimmed, err);
      throw new Error("Invalid JSON structure returned by the LLM. Fallback parser applied.");
    }
  }
}

/**
 * Call Gemini API for text generation.
 */
async function callGeminiText(apiKey, prompt, systemInstruction = '', jsonMode = false) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const config = jsonMode 
    ? { 
        model: 'gemini-1.5-flash',
        generationConfig: { responseMimeType: 'application/json' }
      }
    : { model: 'gemini-1.5-flash' };
    
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  
  const model = genAI.getGenerativeModel(config);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Call OpenAI API for text generation.
 */
async function callOpenAIText(apiKey, prompt, systemInstruction = '', jsonMode = false) {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const messages = [];
  
  if (systemInstruction) {
    messages.push({ role: 'system', content: systemInstruction });
  }
  messages.push({ role: 'user', content: prompt });
  
  const responseFormat = jsonMode ? { type: 'json_object' } : undefined;
  
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages,
    response_format: responseFormat,
    temperature: 0.1
  });
  
  return completion.choices[0].message.content;
}

/**
 * Generate Gemini embeddings.
 */
async function getGeminiEmbedding(apiKey, text) {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'text-embedding-004' });
  const result = await model.embedContent(text);
  return result.embedding.values;
}

/**
 * Generate OpenAI embeddings.
 */
async function getOpenAIEmbedding(apiKey, text) {
  const openai = new OpenAI({ apiKey, dangerouslyAllowBrowser: true });
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text
  });
  return response.data[0].embedding;
}

// ============================================
// PUBLIC SERVICES
// ============================================

/**
 * Structured Resume Parser via LLM.
 */
export async function parseResumeWithLLM(text, fileName, provider, apiKey) {
  const prompt = `You are an expert ATS (Applicant Tracking System) parser. Parse the following resume text and output a JSON object containing the exact structure below. If any section is missing, default to an empty array/string or 0.

Required JSON Structure:
{
  "name": "Candidate Full Name",
  "email": "candidate@example.com",
  "phone": "+1-555-555-5555",
  "skills": ["Skill 1", "Skill 2", "Skill 3"],
  "experience_years": 5,
  "education": "Degree details (e.g. Master's in CS, MIT)",
  "projects": [
    "Project Title: Brief 1-sentence description detailing technologies used"
  ],
  "certifications": ["AWS Certified Solutions Architect", "Scrum Master"],
  "achievements": ["Reduced server latency by 40%", "Won university hackathon first place"]
}

Resume Text:
${text}`;

  const systemInstruction = "You are a professional recruiting coordinator. You must only return valid JSON matching the schema.";
  
  let resultText = '';
  if (provider === 'gemini') {
    resultText = await callGeminiText(apiKey, prompt, systemInstruction, true);
  } else {
    resultText = await callOpenAIText(apiKey, prompt, systemInstruction, true);
  }
  
  const parsed = cleanAndParseJSON(resultText);
  // Guarantee the raw content is included
  return { ...parsed, content: text };
}

/**
 * Generates Embeddings for semantic matching.
 */
export async function getEmbedding(text, provider, apiKey) {
  // Truncate text to avoid model limits (~3000 words)
  const truncatedText = text.substring(0, 15000);
  if (provider === 'gemini') {
    return await getGeminiEmbedding(apiKey, truncatedText);
  } else {
    return await getOpenAIEmbedding(apiKey, truncatedText);
  }
}

/**
 * Computes semantic similarity between resume and job description using embeddings.
 */
export async function calculateSemanticMatchWithLLM(resumeText, jdText, provider, apiKey) {
  try {
    const resumeEmb = await getEmbedding(resumeText, provider, apiKey);
    const jdEmb = await getEmbedding(jdText, provider, apiKey);
    const similarity = cosineSimilarity(resumeEmb, jdEmb);
    
    // Scale similarity (often ranges 0.3 - 0.9 for embeddings) to a user-friendly 0-100 score
    const score = Math.round(Math.min(1.0, Math.max(0, (similarity - 0.25) / 0.65)) * 100);
    return Math.max(15, score);
  } catch (error) {
    console.error("Embedding API failed, using fallback similarity:", error);
    throw error;
  }
}

/**
 * Generates Resume Improvement Suggestions.
 */
export async function generateResumeInsights(resumeText, jdText, provider, apiKey) {
  const prompt = `You are a Senior Technical Recruiter. Compare the candidate's resume against the Job Description. Provide a JSON object containing resume optimization advice.

JD:
${jdText}

Resume:
${resumeText}

Output must be in JSON format matching this schema:
{
  "missingKeywords": ["keyword1", "keyword2"],
  "actionVerbs": ["Implement...", "Pioneer..."],
  "formattingSuggestions": ["formatting advice 1", "formatting advice 2"],
  "weakSections": [
    {
      "section": "Experience",
      "critique": "Your experience doesn't highlight scale. Rephrase using quantitative results."
    }
  ],
  "atsTips": ["ATS optimization tip 1"]
}`;

  const systemInstruction = "You are a professional resume advisor. You must only return JSON matching the schema.";
  
  let resultText = '';
  if (provider === 'gemini') {
    resultText = await callGeminiText(apiKey, prompt, systemInstruction, true);
  } else {
    resultText = await callOpenAIText(apiKey, prompt, systemInstruction, true);
  }
  
  return cleanAndParseJSON(resultText);
}

/**
 * Generates Tailored Interview Questions.
 */
export async function generateInterviewQuestions(resumeText, jdText, provider, apiKey) {
  const prompt = `You are a Lead Software Engineer interviewing a candidate for a role. Based on the candidate's resume and the job description, generate tailored interview questions.

JD:
${jdText}

Resume:
${resumeText}

Output must be in JSON format matching this schema:
{
  "technical": [
    { "question": "Question", "topic": "PyTorch", "purpose": "Tests deep learning coding skills" }
  ],
  "hr": [
    { "question": "Question", "topic": "Leadership", "purpose": "Assess collaboration under pressure" }
  ],
  "projectBased": [
    { "question": "Question", "topic": "Recommendation Engine", "purpose": "Deep dive into candidate's claim on resume" }
  ],
  "systemDesign": [
    { "question": "Question", "topic": "Scaling inference", "purpose": "Evaluates architectural experience" }
  ]
}`;

  const systemInstruction = "You are a technical interviewer. You must only return JSON matching the schema.";
  
  let resultText = '';
  if (provider === 'gemini') {
    resultText = await callGeminiText(apiKey, prompt, systemInstruction, true);
  } else {
    resultText = await callOpenAIText(apiKey, prompt, systemInstruction, true);
  }
  
  return cleanAndParseJSON(resultText);
}

/**
 * Executes a Chatbot answer using retrieved context.
 */
export async function chatWithRAG(query, contextChunks, provider, apiKey) {
  const contextText = contextChunks
    .map((chunk, index) => `Source [${index + 1}] (${chunk.source}):\n${chunk.text}`)
    .join('\n\n---\n\n');
    
  const prompt = `You are an AI recruiting assistant. Answer the user's query about the candidates and their resumes.
You must base your answer ONLY on the provided context source chunks. If the answer cannot be found in the context, state that you do not have that information.
Always cite the candidate names and source references (e.g. "[Source 1]", "[Source 2]") when presenting facts. Keep your answer professional and concise.

Context:
${contextText}

Query:
${query}`;

  const systemInstruction = "You are a professional recruitment assistant. Be precise, concise, and always cite candidate data sources.";
  
  if (provider === 'gemini') {
    return await callGeminiText(apiKey, prompt, systemInstruction, false);
  } else {
    return await callOpenAIText(apiKey, prompt, systemInstruction, false);
  }
}
