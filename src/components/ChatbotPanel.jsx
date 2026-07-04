import React, { useState, useRef, useEffect } from 'react';
import { Bot, UserCircle, Send, Loader2, RefreshCw } from 'lucide-react';

export default function ChatbotPanel({ messages, onSendMessage, isChatLoading, hasCandidates }) {
  const [input, setInput] = useState('');
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isChatLoading) return;
    onSendMessage(input.trim());
    setInput('');
  };

  const handleSuggest = (text) => {
    if (isChatLoading) return;
    onSendMessage(text);
  };

  const suggestions = [
    "Who is the top candidate?",
    "What skills are missing?",
    "Does anyone have Python experience?",
    "Explain their weaknesses"
  ];

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col h-[calc(100vh-200px)] min-h-[500px]">
      {/* Header */}
      <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 rounded-lg border border-blue-100">
            <Bot className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Resume Assistant Chat</h3>
            <p className="text-[10px] text-slate-500 font-semibold">Search candidate database using natural language</p>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`flex gap-3 text-xs leading-relaxed max-w-[85%] ${
              msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''
            }`}
          >
            <div className={`p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center border ${
              msg.role === 'user'
                ? 'bg-slate-50 border-slate-200 text-slate-500'
                : 'bg-blue-50 border-blue-100 text-blue-600'
            }`}>
              {msg.role === 'user' ? <UserCircle className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>

            <div className={`p-3.5 rounded-xl border ${
              msg.role === 'user'
                ? 'bg-blue-50 border-blue-100 text-slate-800 rounded-tr-none font-medium'
                : 'bg-slate-50 border-slate-200 text-slate-700 rounded-tl-none font-medium'
            }`}>
              <div className="whitespace-pre-wrap font-sans">{msg.content}</div>
            </div>
          </div>
        ))}

        {isChatLoading && (
          <div className="flex gap-3 text-xs leading-relaxed max-w-[80%]">
            <div className="p-2 rounded-full h-8 w-8 flex-shrink-0 flex items-center justify-center border bg-blue-50 border-blue-100 text-blue-600">
              <Bot className="w-5 h-5" />
            </div>
            <div className="p-3.5 rounded-xl border bg-slate-50 border-slate-200 text-slate-500 flex items-center gap-2 rounded-tl-none font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
              Searching context & generating answer...
            </div>
          </div>
        )}

        <div ref={chatEndRef} />
      </div>

      {/* Suggested prompts */}
      {hasCandidates && messages.length <= 1 && !isChatLoading && (
        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <p className="text-[10px] font-bold text-slate-550 uppercase tracking-widest mb-2 pl-1">
            Suggested Queries
          </p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((text, i) => (
              <button
                key={i}
                onClick={() => handleSuggest(text)}
                className="text-[10px] font-semibold bg-white hover:bg-slate-100 text-slate-650 hover:text-slate-900 px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm transition-colors"
              >
                {text}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input Form */}
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 bg-slate-50 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={
            hasCandidates 
              ? "Ask a question about the candidates (e.g. 'What is their education background?')..." 
              : "Upload resumes to enable RAG chatbot..."
          }
          disabled={!hasCandidates || isChatLoading}
          className="flex-1 bg-white border border-slate-350 rounded-lg px-3 py-2 text-xs text-slate-800 placeholder-slate-450 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        />
        <button
          type="submit"
          disabled={!input.trim() || isChatLoading || !hasCandidates}
          className="p-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-100 text-white disabled:text-slate-400 rounded-lg transition-colors flex-shrink-0 border border-transparent disabled:cursor-not-allowed shadow-sm"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
}
