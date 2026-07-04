import React from 'react';
import { Target } from 'lucide-react';

export default function ATSScoreCard({ scoreData }) {
  if (!scoreData) return null;

  const scores = scoreData?.scores || {};
  const finalScore = scores.final || 0;
  
  const semantic = scoreData?.semantic?.score ?? scores.semantic ?? 0;
  const skills = scores.skills || 0;
  const experience = scores.experience || 0;
  const keywordDensity = scores.keywordDensity || 0;
  const projectRelevance = scores.projectRelevance || 0;
  const education = scores.education || 0;
  const certifications = scores.certifications || 0;

  const getScoreColorClass = (s) => {
    if (s >= 85) return 'bg-emerald-600 text-emerald-700';
    if (s >= 70) return 'bg-blue-600 text-blue-600';
    if (s >= 50) return 'bg-slate-500 text-slate-650';
    return 'bg-red-600 text-red-700';
  };

  const scoreColor = getScoreColorClass(finalScore).split(' ')[0];
  const scoreText = getScoreColorClass(finalScore).split(' ')[1];

  const categories = [
    { label: 'Semantic Matching', value: semantic, color: 'bg-blue-600' },
    { label: 'Skill Overlap', value: skills, color: 'bg-emerald-600' },
    { label: 'Experience Match', value: experience, color: 'bg-blue-600' },
    { label: 'Keyword Density', value: keywordDensity, color: 'bg-slate-400' },
    { label: 'Project Relevance', value: projectRelevance, color: 'bg-slate-400' },
    { label: 'Education Match', value: education, color: 'bg-slate-400' },
    { label: 'Certifications', value: certifications, color: 'bg-slate-400' }
  ];

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col gap-5">
      {/* Horizontal Progress Score */}
      <div className="w-full space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-800">ATS Score</h3>
            <p className="text-[10px] text-slate-550 font-semibold tracking-wider uppercase">Overall Match Alignment</p>
          </div>
          <div className="text-right">
            <span className="text-3xl font-extrabold text-slate-800">{finalScore}%</span>
            <span className={`block text-xs font-bold ${scoreText}`}>
              {finalScore >= 85 ? 'Strong Match' : finalScore >= 70 ? 'Good Fit' : finalScore >= 50 ? 'Moderate Fit' : 'Weak Overlap'}
            </span>
          </div>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200">
          <div 
            className={`${scoreColor} h-full rounded-full transition-all duration-1000 ease-out`}
            style={{ width: `${finalScore}%` }}
          />
        </div>
      </div>

      {/* Categories Breakdown */}
      <div className="flex-1 w-full space-y-3 pt-3 border-t border-slate-100">
        <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest flex items-center gap-1.5">
          <Target className="w-3.5 h-3.5 text-blue-600" />
          ATS Categories Breakdown
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-500 font-medium">{cat.label}</span>
                <span className="text-slate-700 font-semibold">{cat.value}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                <div
                  className={`${cat.color} h-full rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${cat.value}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
