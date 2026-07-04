import React from 'react';
import { CheckCircle2, XCircle, Award, Compass } from 'lucide-react';

export default function SkillsAnalysis({ skillGapData }) {
  if (!skillGapData) return null;
  const { matched, missing, extra, recommendations } = skillGapData;

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-6">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
        <Award className="w-5 h-5 text-blue-600" />
        Skills Analysis & Gaps
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Matched Skills */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            Matched Skills ({matched.length})
          </h3>
          {matched.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No direct skill matches found.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {matched.map(skill => (
                <span key={skill} className="text-xs bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Missing Skills */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <XCircle className="w-4 h-4 text-red-650" />
            Missing Skills ({missing.length})
          </h3>
          {missing.length === 0 ? (
            <p className="text-xs text-slate-400 italic">All required skills are present!</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {missing.map(skill => (
                <span key={skill} className="text-xs bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full flex items-center gap-1 font-medium">
                  {skill} <span className="text-[9px] text-red-650 font-bold">✗</span>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Extra Skills */}
        <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-1.5 border-b border-slate-200 pb-2">
            <Compass className="w-4 h-4 text-slate-500" />
            Adjacent / Extra Skills ({extra.length})
          </h3>
          {extra.length === 0 ? (
            <p className="text-xs text-slate-400 italic">No extra skills listed.</p>
          ) : (
            <div className="flex flex-wrap gap-1.5">
              {extra.map(skill => (
                <span key={skill} className="text-xs bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-0.5 rounded-full font-medium">
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Learning Recommendations */}
      {recommendations && recommendations.length > 0 && (
        <div className="space-y-3 border-t border-slate-100 pt-4">
          <h3 className="text-sm font-semibold text-slate-700 flex items-center gap-2">
            <Compass className="w-4 h-4 text-blue-650" />
            Tailored Upskilling Recommendations
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {recommendations.slice(0, 4).map((rec, idx) => (
              <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-lg hover:border-slate-350 transition-colors flex flex-col gap-1">
                <span className="text-xs font-semibold text-blue-700">{rec.skill}</span>
                <span className="text-[11px] text-slate-550 leading-relaxed font-medium">{rec.suggestion}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
