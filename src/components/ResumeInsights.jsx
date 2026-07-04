import React from 'react';
import { Sparkles, MessageSquare, AlertCircle, FileText, Check } from 'lucide-react';

export default function ResumeInsights({ insights, hasApiKey }) {
  // Local fallback insights if LLM key is not configured
  const localFallbackInsights = {
    missingKeywords: ['Docker', 'Kubernetes', 'FastAPI', 'MLOps', 'CI/CD Pipelines'],
    actionVerbs: ['Engineered', 'Optimized', 'Spearheaded', 'Architected', 'Pioneered'],
    formattingSuggestions: [
      'Avoid placing text inside tables or graphical shapes which blocker-parsers ignore.',
      'Ensure standard section headers are used (e.g., "Work Experience" instead of "My Career Journey").',
      'Use a clean, single-column design layout. Multi-column PDF grids frequently cause parser overlap errors.'
    ],
    weakSections: [
      {
        section: 'Experience Highlights',
        critique: 'Quantify your accomplishments. Instead of "developed machine learning models", say "Designed ML model and achieved 12% accuracy improvement serving 5k requests/sec."'
      }
    ],
    atsTips: [
      'Export directly from Google Docs or Word. Avoid scanned images of text.',
      'Do not include skills in the header or sidebar where parser models lose structural hierarchy.'
    ]
  };

  const activeInsights = insights || localFallbackInsights;

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 shadow-lg space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-purple-400">
          <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
          Resume Improvement Insights
        </h2>
        {!hasApiKey && (
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Standard Rules Fallback
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Missing Keywords & Action Verbs */}
        <div className="space-y-4">
          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-red-400" />
              Missing Key Industry Terms
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeInsights.missingKeywords.map(word => (
                <span key={word} className="text-[10px] font-semibold bg-red-950/20 text-red-300 border border-red-900/30 px-2 py-0.5 rounded">
                  + {word}
                </span>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 space-y-3">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Strong Action Verbs to Include
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {activeInsights.actionVerbs.map(verb => (
                <span key={verb} className="text-[10px] font-semibold bg-emerald-950/20 text-emerald-300 border border-emerald-900/30 px-2 py-0.5 rounded">
                  {verb}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Section Critiques & Formatting */}
        <div className="space-y-4">
          {activeInsights.weakSections && activeInsights.weakSections.map((ws, i) => (
            <div key={i} className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 space-y-2">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-yellow-400" />
                Critique: {ws.section}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed italic">
                "{ws.critique}"
              </p>
            </div>
          ))}

          <div className="bg-slate-900/30 p-4 rounded-xl border border-slate-800/50 space-y-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-blue-400" />
              ATS Optimization Suggestions
            </h3>
            <ul className="list-disc list-inside text-xs text-slate-400 space-y-1.5 leading-relaxed">
              {activeInsights.formattingSuggestions.map((sug, i) => (
                <li key={i}>{sug}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {activeInsights.atsTips && (
        <div className="border-t border-slate-800 pt-4 text-center">
          <div className="inline-flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-[11px] text-slate-500">
            {activeInsights.atsTips.map((tip, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full" />
                {tip}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
