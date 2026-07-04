import React from 'react';
import { Target, Zap, Info, Check } from 'lucide-react';

export default function SemanticMatch({ scoreData }) {
  if (!scoreData) return null;

  // Safe extraction with fallbacks and optional chaining
  const scores = scoreData?.scores || {};
  
  // Resolve scores through both schemas (direct .semantic.score or nested scores.semantic)
  const semantic = scoreData?.semantic?.score ?? scores.semantic ?? 0;
  const keywordDensity = scores.keywordDensity ?? 0;

  const conceptExamples = [
    { source: 'TensorFlow / PyTorch', target: 'Deep Learning / AI Modeling', status: 'Context Matched' },
    { source: 'Docker / Kubernetes', target: 'Container Orchestration & DevOps', status: 'Context Matched' },
    { source: 'FastAPI / Flask', target: 'REST API development', status: 'Context Matched' },
    { source: 'Node.js / Express', target: 'Backend Development', status: 'Context Matched' }
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <Zap className="w-5 h-5 text-blue-600" />
          Skill Match
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {/* Semantic Similarity Card */}
        <div className="p-4 bg-blue-50/30 border border-blue-100 rounded-xl space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-blue-700 uppercase tracking-wider">Semantic Match</span>
              <span className="text-xl font-bold text-blue-600">{semantic}%</span>
            </div>
            <p className="text-[11px] text-slate-550 leading-relaxed font-medium">
              Calculates contextual equivalence and meaning overlap using high-dimensional embedding vectors and Cosine Similarity.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: `${semantic}%` }} />
          </div>
        </div>

        {/* Keyword Density Card */}
        <div className="p-4 bg-slate-550/5 border border-slate-200 rounded-xl space-y-2 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Keyword Density</span>
              <span className="text-xl font-bold text-slate-800">{keywordDensity}%</span>
            </div>
            <p className="text-[11px] text-slate-550 leading-relaxed font-medium">
              Measures the exact string matching overlap of keywords and technical terminology found in the Job Description.
            </p>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-4 overflow-hidden border border-slate-200">
            <div className="bg-slate-450 h-full rounded-full" style={{ width: `${keywordDensity}%` }} />
          </div>
        </div>
      </div>

      {/* Semantic Conceptual Mapping */}
      <div className="space-y-2 border-t border-slate-100 pt-4">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-slate-400" />
          Embedding Concepts Mapping
        </h3>
        <p className="text-[10px] text-slate-500 leading-relaxed mb-3">
          Our vector store checks relationships beyond literal strings. Related technologies map closer together in vector space:
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-[11px]">
          {conceptExamples.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg">
              <div className="flex flex-col">
                <span className="font-semibold text-slate-700">{item.source}</span>
                <span className="text-[10px] text-slate-500">Maps closely to: {item.target}</span>
              </div>
              <span className="flex items-center gap-0.5 text-[9px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 border border-emerald-100 rounded">
                <Check className="w-2.5 h-2.5" />
                Matched
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
