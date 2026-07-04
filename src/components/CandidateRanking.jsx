import React from 'react';
import { Layers, Clock, ArrowRight, User } from 'lucide-react';

export default function CandidateRanking({ candidates, selectedCandidateId, onSelectCandidate }) {
  if (!candidates || candidates.length === 0) return null;

  const getRankBadge = (idx) => {
    if (idx === 0) return <span className="w-5 h-5 rounded-full bg-yellow-50 text-yellow-700 border border-yellow-250 flex items-center justify-center font-bold text-xs">1</span>;
    if (idx === 1) return <span className="w-5 h-5 rounded-full bg-slate-50 text-slate-600 border border-slate-200 flex items-center justify-center font-bold text-xs">2</span>;
    if (idx === 2) return <span className="w-5 h-5 rounded-full bg-orange-50 text-orange-700 border border-orange-200 flex items-center justify-center font-bold text-xs">3</span>;
    return <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center font-semibold text-[11px]">{idx + 1}</span>;
  };

  const getScoreColorClass = (s) => {
    if (s >= 85) return 'text-emerald-700 font-bold';
    if (s >= 70) return 'text-blue-600 font-bold';
    if (s >= 50) return 'text-slate-650 font-bold';
    return 'text-red-700 font-bold';
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm space-y-4 text-slate-800">
      <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
        <Layers className="w-5 h-5 text-blue-600" />
        Candidate Ranking ({candidates.length})
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200 text-slate-500 text-xs font-semibold tracking-wider bg-slate-50">
              <th className="py-2.5 px-2">Rank</th>
              <th className="py-2.5 px-3">Name</th>
              <th className="py-2.5 px-2">Experience</th>
              <th className="py-2.5 px-2">Degree</th>
              <th className="py-2.5 px-2 text-right">ATS Score</th>
              <th className="py-2.5 px-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((c, idx) => {
              const isSelected = selectedCandidateId === c.id;
              return (
                <tr
                  key={c.id}
                  onClick={() => onSelectCandidate(c)}
                  className={`cursor-pointer transition-colors group ${
                    isSelected 
                      ? 'bg-blue-50/50 hover:bg-blue-50' 
                      : 'hover:bg-slate-50/50'
                  }`}
                >
                  <td className="py-3 px-2 align-middle">{getRankBadge(idx)}</td>
                  <td className="py-3 px-3 align-middle">
                    <div className="min-w-[150px]">
                      <div className="text-xs font-semibold text-slate-700 group-hover:text-blue-600 transition-colors flex items-center gap-1.5 font-sans justify-between">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-slate-400" />
                          {c.name}
                        </span>
                        {c.confidence !== undefined && c.confidence < 70 && (
                          <span className="text-red-700 text-[8px] bg-red-50 border border-red-200 px-1.5 py-0.25 rounded font-bold uppercase tracking-wider">
                            Low Conf
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-500 truncate">{c.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-2 align-middle text-xs text-slate-650 font-medium">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {c.experience_years === 0 ? 'Fresher' : (c.experience_years ? `${c.experience_years} years` : 'Not specified')}
                    </span>
                  </td>
                  <td className="py-3 px-2 align-middle text-xs text-slate-650 font-medium truncate max-w-[200px]" title={c.education}>
                    {c.education}
                  </td>
                  <td className={`py-3 px-2 align-middle text-right text-sm ${getScoreColorClass(c.scores.final)}`}>
                    {c.scores.final}%
                  </td>
                  <td className="py-3 px-2 align-middle text-right">
                    <ArrowRight className={`w-3.5 h-3.5 text-slate-400 group-hover:translate-x-1 transition-all ${
                      isSelected ? 'text-blue-600 translate-x-0.5' : ''
                    }`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
