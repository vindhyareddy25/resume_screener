import React, { useState, useEffect } from 'react';
import { LayoutGrid, BarChart3, TrendingUp, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import ATSScoreCard from './ATSScoreCard';
import SkillsAnalysis from './SkillsAnalysis';
import CandidateRanking from './CandidateRanking';
import SemanticMatch from './SemanticMatch';
import ResumeInsights from './ResumeInsights';
import InterviewQuestions from './InterviewQuestions';

export default function Dashboard({ 
  candidates, 
  selectedCandidate, 
  onSelectCandidate, 
  hasApiKey,
  insights,
  questions
}) {
  if (!candidates || candidates.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-slate-200 p-8 shadow-sm max-w-lg mx-auto">
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-full mb-4">
        <BarChart3 className="w-8 h-8 text-blue-600" />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">No Screening Data Yet</h3>
      <p className="text-xs text-slate-550 mt-2 max-w-sm leading-relaxed font-medium">
        Please upload a Job Description and at least one candidate resume on the **Upload** tab, then run the analysis to generate screening results.
      </p>
    </div>
  );
}

const activeCandidate = selectedCandidate || candidates[0];

return (
  <div className="space-y-6 text-slate-800">
    {/* Top summary cards */}
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
      {[
        { label: 'Candidates Scored', value: candidates.length, color: 'text-blue-600 bg-blue-50 border-blue-100' },
        { label: 'Strong Fits (≥70%)', value: candidates.filter(c => c.scores.final >= 70).length, color: 'text-emerald-700 bg-emerald-50 border-emerald-100' },
        { label: 'Highest ATS Score', value: `${candidates[0].scores.final}%`, color: 'text-slate-800 bg-slate-50 border-slate-200' },
        { label: 'Average Score', value: `${Math.round(candidates.reduce((sum, c) => sum + c.scores.final, 0) / candidates.length)}%`, color: 'text-slate-800 bg-slate-50 border-slate-200' }
      ].map((item, idx) => (
        <div key={idx} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex justify-between items-center">
          <span className="text-xs font-semibold text-slate-500">{item.label}</span>
          <span className={`text-xl font-bold px-2.5 py-0.5 rounded-full border ${item.color}`}>{item.value}</span>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left column: Leaderboard list */}
      <div className="lg:col-span-1 space-y-6">
        <CandidateRanking 
          candidates={candidates} 
          selectedCandidateId={activeCandidate.id} 
          onSelectCandidate={onSelectCandidate} 
        />
        
        {/* Active Candidate Quick Info */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-widest border-b border-slate-200 pb-2 flex justify-between items-center">
            <span>Selected Candidate Details</span>
            {activeCandidate.confidence !== undefined && activeCandidate.confidence < 70 && (
              <span className="bg-red-50 text-red-650 border border-red-200 text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-2.5 h-2.5" />
                Low Confidence
              </span>
            )}
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Full Name</span>
              <span className="font-semibold text-slate-800">{activeCandidate.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Email Contact</span>
              <span className="font-semibold text-blue-600 hover:underline truncate max-w-[150px]">{activeCandidate.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Phone Contact</span>
              <span className="font-semibold text-slate-800">{activeCandidate.phone || 'N/A'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Degree/Institution</span>
              <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={activeCandidate.education}>{activeCandidate.education}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-550 font-medium">Experience Years</span>
              <span className="font-semibold text-slate-800">
                {activeCandidate.experience_years === 0 ? 'Fresher' : (activeCandidate.experience_years ? `${activeCandidate.experience_years} years` : 'Not specified')}
              </span>
            </div>
          </div>
          
          {activeCandidate.justification && (
            <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
              <p className="text-[11px] text-slate-550 leading-relaxed italic font-medium">
                "{activeCandidate.justification}"
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Right column: Detailed Candidate breakdown (Minimal: ATS Score, Skill Match, Missing Skills) */}
      <div className="lg:col-span-2 space-y-6">
        {/* 1. Score Card */}
        <ATSScoreCard scoreData={activeCandidate} />

        {/* 2. Semantic vs Keyword (Skill Match) */}
        <SemanticMatch scoreData={activeCandidate} />

        {/* 3. Skills Gap */}
        <SkillsAnalysis skillGapData={activeCandidate.skillGap} />
      </div>
    </div>
  </div>
  );
}
