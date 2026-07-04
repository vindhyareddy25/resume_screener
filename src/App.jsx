import React, { useState, useEffect, useRef } from 'react';
import { Brain, FileUp, BarChart3, MessageSquare, Settings, Key, HelpCircle, Loader2 } from 'lucide-react';
import UploadJD from './components/UploadJD';
import UploadResume from './components/UploadResume';
import Dashboard from './components/Dashboard';
import ChatbotPanel from './components/ChatbotPanel';

import { parseFile } from './utils/parser';
import { extractResumeDataHeuristically } from './utils/skillsExtractor';
import { extractJdSkillsHeuristically } from './utils/gapAnalyzer';
import { scoreCandidateATS } from './utils/scorer';
import { calculateLocalSemanticMatch } from './utils/semanticMatcher';
import { rankCandidates } from './utils/ranker';

import { parseResumeWithLLM, calculateSemanticMatchWithLLM, generateResumeInsights, generateInterviewQuestions } from './services/llmService';
import { VectorStore } from './chatbot/vectorStore';
import { indexDocument, queryRAG } from './chatbot/rag';

export default function ResumeScreenerApp() {
  const [activeTab, setActiveTab] = useState('upload');
  
  // Settings / Keys State
  const [provider, setProvider] = useState(() => localStorage.getItem('screener_provider') || 'gemini');
  const [geminiKey, setGeminiKey] = useState(() => localStorage.getItem('screener_gemini_key') || import.meta.env.VITE_GEMINI_API_KEY || '');
  const [openaiKey, setOpenaiKey] = useState(() => localStorage.getItem('screener_openai_key') || import.meta.env.VITE_OPENAI_API_KEY || '');
  const [showWeights, setShowWeights] = useState(false);
  const [weights, setWeights] = useState({ semantic: 0.40, skills: 0.35, experience: 0.25 });

  // JD and Resumes State
  const [jdText, setJdText] = useState('');
  const [jdFile, setJdFile] = useState(null);
  const [resumes, setResumes] = useState([]);
  
  // Processing States
  const [isProcessing, setIsProcessing] = useState(false);
  const [processedCandidates, setProcessedCandidates] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  
  // AI Additional Data State
  const [insights, setInsights] = useState({}); // candidateId -> insights
  const [questions, setQuestions] = useState({}); // candidateId -> questions

  // RAG Chat State
  const [chatMessages, setChatMessages] = useState([
    { role: 'assistant', content: "Hello! I am your AI recruiting assistant. Once your candidates are screened, you can ask me questions about their skills, experience, or system architecture capabilities." }
  ]);
  const [isChatLoading, setIsChatLoading] = useState(false);

  // References
  const vectorStoreRef = useRef(new VectorStore());

  // Save keys to localStorage
  useEffect(() => {
    localStorage.setItem('screener_provider', provider);
  }, [provider]);

  useEffect(() => {
    localStorage.setItem('screener_gemini_key', geminiKey);
  }, [geminiKey]);

  useEffect(() => {
    localStorage.setItem('screener_openai_key', openaiKey);
  }, [openaiKey]);

  const activeApiKey = provider === 'gemini' ? geminiKey : openaiKey;

  const handleJdChange = (text, fileName) => {
    setJdText(text);
    setJdFile(fileName);
  };

  const handleAnalyze = async () => {
    if (!jdText || resumes.length === 0) return;

    setIsProcessing(true);
    setProcessedCandidates([]);
    setSelectedCandidate(null);
    setInsights({});
    setQuestions({});
    setChatMessages([
      { role: 'assistant', content: "Candidates have been re-indexed. Ask me anything about their backgrounds!" }
    ]);
    
    // Clear the vector store
    vectorStoreRef.current.clear();

    // 1. Extract required skills from Job Description
    let jdSkills = extractJdSkillsHeuristically(jdText);

    const scoredCandidatesList = [];
    const tempInsights = {};
    const tempQuestions = {};

    try {
      // Loop through and parse each resume sequentially to manage rate limits cleanly
      for (let i = 0; i < resumes.length; i++) {
        const resumeItem = resumes[i];
        
        // Update individual file status
        setResumes(prev => prev.map(r => r.id === resumeItem.id ? { ...r, status: 'parsing' } : r));

        try {
          // Extract text from raw file (PDF, DOCX, TXT)
          const text = await parseFile(resumeItem.fileObject);
          
          let parsedResume = null;
          let semanticMatchScore = 50;

          // Parse and score candidate using API (if key available) or Local fallbacks
          if (activeApiKey) {
            try {
              parsedResume = await parseResumeWithLLM(text, resumeItem.fileName, provider, activeApiKey);
              semanticMatchScore = await calculateSemanticMatchWithLLM(text, jdText, provider, activeApiKey);
              
              // Run insights & questions generation concurrently in background
              const insightsPromise = generateResumeInsights(text, jdText, provider, activeApiKey);
              const questionsPromise = generateInterviewQuestions(text, jdText, provider, activeApiKey);

              const [candInsights, candQuestions] = await Promise.all([insightsPromise, questionsPromise]);
              tempInsights[resumeItem.id] = candInsights;
              tempQuestions[resumeItem.id] = candQuestions;

            } catch (llmErr) {
              console.error("LLM parser failed, falling back to local parsing:", llmErr);
              parsedResume = extractResumeDataHeuristically(text, resumeItem.fileName);
              semanticMatchScore = calculateLocalSemanticMatch(text, jdText);
            }
          } else {
            // Heuristic fallbacks
            parsedResume = extractResumeDataHeuristically(text, resumeItem.fileName);
            semanticMatchScore = calculateLocalSemanticMatch(text, jdText);
          }

          // Index chunk document in Vector Store for RAG Chatbot
          await indexDocument(text, parsedResume.name, provider, activeApiKey, vectorStoreRef.current);

          // Calculate composite ATS Score
          const scoreResult = scoreCandidateATS(parsedResume, jdText, jdSkills, semanticMatchScore, weights);

          scoredCandidatesList.push({
            id: resumeItem.id,
            name: parsedResume.name || 'Unknown Candidate',
            email: parsedResume.email || 'N/A',
            phone: parsedResume.phone || 'N/A',
            degree: parsedResume.degree || parsedResume.education || 'Not found',
            experience: parsedResume.experience !== null ? parsedResume.experience : parsedResume.experience_years,
            score: scoreResult.finalScore,
            confidence: parsedResume.confidence !== undefined ? parsedResume.confidence : 100,
            fileName: resumeItem.fileName,
            skills: parsedResume.skills || [],
            experience_years: parsedResume.experience !== null ? parsedResume.experience : parsedResume.experience_years,
            education: parsedResume.degree && parsedResume.institution && parsedResume.degree !== 'Not found' && parsedResume.institution !== 'Not found'
              ? `${parsedResume.degree}, ${parsedResume.institution}`
              : (parsedResume.degree || parsedResume.education || 'Not found'),
            projects: parsedResume.projects || [],
            certifications: parsedResume.certifications || [],
            achievements: parsedResume.achievements || [],
            justification: scoreResult.skillGap.missing.length > 0 
              ? `Demonstrates match in ${scoreResult.skillGap.matched.slice(0, 3).join(', ')}. Gaps identified in ${scoreResult.skillGap.missing.slice(0, 2).join(', ')}.`
              : `Strong alignment across all criteria. Deep experience matching Job Description.`,
            scores: {
              ...scoreResult.breakdown,
              final: scoreResult.finalScore
            },
            semantic: {
              score: scoreResult.breakdown.semantic || 0
            },
            skillGap: scoreResult.skillGap,
            content: text
          });

          // Mark complete
          setResumes(prev => prev.map(r => r.id === resumeItem.id ? { ...r, status: 'complete' } : r));
        } catch (fileErr) {
          console.error(`Failed parsing resume ${resumeItem.fileName}:`, fileErr);
          setResumes(prev => prev.map(r => r.id === resumeItem.id ? { ...r, status: 'error' } : r));
        }
      }

      // Aggregate and Rank Candidates
      if (scoredCandidatesList.length > 0) {
        const ranking = rankCandidates(scoredCandidatesList);
        setProcessedCandidates(ranking.ranked);
        setSelectedCandidate(ranking.bestFit);
        setInsights(tempInsights);
        setQuestions(tempQuestions);
        setActiveTab('results');
      }
    } catch (err) {
      console.error("General analysis process failed:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSendMessage = async (userText) => {
    if (!userText.trim() || isChatLoading) return;
    
    setChatMessages(prev => [...prev, { role: 'user', content: userText }]);
    setIsChatLoading(true);

    try {
      const response = await queryRAG(
        userText,
        vectorStoreRef.current,
        processedCandidates,
        provider,
        activeApiKey
      );
      setChatMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (err) {
      console.error(err);
      setChatMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I hit an error trying to search our candidates database." }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  const tabs = [
    { id: 'upload', label: 'Upload Files', icon: FileUp },
    { id: 'results', label: 'Dashboard Results', icon: BarChart3 },
    { id: 'chat', label: 'RAG Chatbot', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Clean Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  Resume Screener & Parser
                </h1>
                <p className="text-xs text-slate-550 font-semibold">LLM-powered Resume Screening with Semantic Matching</p>
              </div>
            </div>

            <nav className="flex items-center gap-1.5">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                    activeTab === tab.id 
                      ? 'bg-blue-50 text-blue-600 border border-blue-200' 
                      : 'text-slate-650 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                  {tab.id === 'results' && processedCandidates.length > 0 && (
                    <span className="bg-blue-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                      {processedCandidates.length}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 flex flex-col">
        
        {/* UPLOAD FILES TAB */}
        {activeTab === 'upload' && (
          <div className="space-y-6">
            {/* API Warning/Status Banner */}
            {!activeApiKey && (
              <div className="bg-slate-100 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-yellow-50 rounded-lg text-yellow-600 border border-yellow-250">
                    <Key className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Analysis Mode: Local Parsing Enabled</h4>
                    <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed font-semibold">
                      You are running offline. Resume parsing, skill gap mapping, and RAG chat will use local algorithms. Add a **Gemini** or **OpenAI** API key in Settings to activate GPT-level parsing and RAG reasoning.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setActiveTab('settings')}
                  className="px-3.5 py-1.5 bg-white hover:bg-slate-50 rounded-lg text-[10px] font-bold text-slate-700 border border-slate-300 transition-colors whitespace-nowrap shadow-sm"
                >
                  Connect LLM
                </button>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              <UploadJD 
                jdText={jdText} 
                jdFile={jdFile} 
                onJdChange={handleJdChange} 
              />
              <UploadResume 
                resumes={resumes} 
                onResumesChange={setResumes} 
                onAnalyze={handleAnalyze} 
                isProcessing={isProcessing}
                canAnalyze={Boolean(jdText && resumes.length > 0)}
              />
            </div>
            
            {isProcessing && (
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center gap-3">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <div>
                  <h4 className="text-xs font-bold text-slate-800">Analyzing Resumes & Computing Embeddings</h4>
                  <p className="text-[10px] text-slate-500 mt-1 max-w-sm font-semibold">
                    Reading documents line-by-line, calculating skill overlap matrix and saving semantic context chunks to the vector database.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DASHBOARD RESULTS TAB */}
        {activeTab === 'results' && (
          <Dashboard 
            candidates={processedCandidates} 
            selectedCandidate={selectedCandidate} 
            onSelectCandidate={setSelectedCandidate}
            hasApiKey={Boolean(activeApiKey)}
            insights={insights}
            questions={questions}
          />
        )}

        {/* RAG CHATBOT TAB */}
        {activeTab === 'chat' && (
          <ChatbotPanel 
            messages={chatMessages} 
            onSendMessage={handleSendMessage} 
            isChatLoading={isChatLoading}
            hasCandidates={processedCandidates.length > 0}
          />
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && (
          <div className="max-w-2xl mx-auto w-full bg-white rounded-xl p-6 border border-slate-200 shadow-sm space-y-6">
            <div>
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <Settings className="w-5 h-5 text-slate-400" />
                API Settings & Keys Configuration
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Configure your API key to activate natural language processing and semantic embeddings. Keys are saved locally in your browser storage and never sent to external servers.
              </p>
            </div>

            <div className="space-y-4">
              {/* Provider Selection */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-500">LLM Provider</label>
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { id: 'gemini', label: 'Google Gemini' },
                    { id: 'openai', label: 'OpenAI GPT' }
                  ].map(item => (
                    <button
                      key={item.id}
                      onClick={() => setProvider(item.id)}
                      className={`py-3 rounded-lg text-xs font-semibold border transition-all ${
                        provider === item.id
                          ? 'bg-blue-50 border-blue-300 text-blue-600 shadow-sm'
                          : 'bg-slate-50 border-slate-200 text-slate-650 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Gemini Key Input */}
              {provider === 'gemini' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">Gemini API Key</label>
                  <input
                    type="password"
                    value={geminiKey}
                    onChange={(e) => setGeminiKey(e.target.value)}
                    placeholder="Enter your Gemini API key (e.g. AIzaSy...)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                    Uses the free-tier or pay-as-you-go **gemini-1.5-flash** model for text and **text-embedding-004** for cosine similarity. Get one at Google AI Studio.
                  </p>
                </div>
              )}

              {/* OpenAI Key Input */}
              {provider === 'openai' && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-500">OpenAI API Key</label>
                  <input
                    type="password"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                    placeholder="Enter your OpenAI API key (e.g. sk-...)"
                    className="w-full bg-white border border-slate-300 rounded-lg px-3.5 py-2.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <p className="text-[9px] text-slate-500 mt-1 leading-relaxed">
                    Uses **gpt-4o-mini** and **text-embedding-3-small** models. Ensure your key has active credits.
                  </p>
                </div>
              )}
            </div>

            {/* Configured status */}
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-3">
              <div className={`p-2 rounded-full ${activeApiKey ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-slate-200 text-slate-500'}`}>
                <Key className="w-4 h-4" />
              </div>
              <div className="text-xs text-slate-650 font-semibold">
                <span className="text-slate-500">Current Status:</span>{' '}
                {activeApiKey ? (
                  <span className="text-emerald-700 font-bold uppercase tracking-wider">
                    AI Active Mode ({provider === 'gemini' ? 'Gemini' : 'OpenAI'})
                  </span>
                ) : (
                  <span className="text-slate-500 italic">
                    Local Fallback Mode (No active keys saved)
                  </span>
                )}
              </div>
            </div>

            {/* Slider configuration for weights */}
            <div className="border-t border-slate-100 pt-5 space-y-4">
              <div>
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-2">
                  Scoring Weights Sliders
                </h3>
                <p className="text-[9px] text-slate-500 mt-0.5">
                  Adjust how much weight each metric contributes to the aggregate composite ATS Score.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  { key: 'semantic', label: 'Semantic Similarity', color: 'accent-blue-600', desc: 'Meaning alignment beyond keywords' },
                  { key: 'skills', label: 'Skill Match', color: 'accent-emerald-600', desc: 'Direct overlap with required tech stack' },
                  { key: 'experience', label: 'Experience Match', color: 'accent-blue-600', desc: 'Alignment with target years of experience' }
                ].map(w => (
                  <div key={w.key} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-600">{w.label}</span>
                      <span className="text-slate-800 font-bold">{Math.round(weights[w.key] * 100)}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={weights[w.key] * 100}
                      onChange={(e) => {
                        const newVal = parseInt(e.target.value) / 100;
                        const others = Object.keys(weights).filter(k => k !== w.key);
                        const remaining = 1 - newVal;
                        const oldOthersSum = others.reduce((sum, k) => sum + weights[k], 0);
                        
                        setWeights(prev => ({
                          ...prev,
                          [w.key]: newVal,
                          [others[0]]: oldOthersSum > 0 ? (weights[others[0]] / oldOthersSum) * remaining : remaining / 2,
                          [others[1]]: oldOthersSum > 0 ? (weights[others[1]] / oldOthersSum) * remaining : remaining / 2
                        }));
                      }}
                      className={`w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer ${w.color}`}
                    />
                    <p className="text-[9px] text-slate-500 font-semibold">{w.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white py-4 border-t border-slate-200 text-center text-xs text-slate-500 shadow-inner">
        <p>© 2026 Resume Screener & Skill Match Analyzer. Standalone Student Project.</p>
      </footer>
    </div>
  );
}
