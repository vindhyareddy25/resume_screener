import React, { useState } from 'react';
import { HelpCircle, Code, UserCheck, Terminal, Compass, MessageCircle } from 'lucide-react';

export default function InterviewQuestions({ questions, candidateSkills, hasApiKey }) {
  const [activeSubTab, setActiveSubTab] = useState('technical');

  // Rule-based fallback questions if LLM key is not configured
  const generateLocalQuestions = () => {
    const list = {
      technical: [
        { question: "Explain the differences between supervised and unsupervised learning, and how you choose between them.", topic: "Machine Learning Concepts", purpose: "Assesses theoretical foundations of ML algorithms." }
      ],
      hr: [
        { question: "Tell me about a time when you disagreed with a technical decision made by a senior lead. How did you handle it?", topic: "Conflict Resolution", purpose: "Evaluates mature communication and collaboration." },
        { question: "Why are you interested in leaving your current position to join our team?", topic: "Motivation", purpose: "Assesses cultural fit and career alignment." }
      ],
      projectBased: [
        { question: "Walk me through the architecture of the recommendation engine you worked on. How did you measure performance?", topic: "Recommendation Systems", purpose: "Verifies claims and actual implementation depth." }
      ],
      systemDesign: [
        { question: "How would you design a real-time analytics pipeline that processes 50,000 events/second and updates a dashboard?", topic: "Distributed Architectures", purpose: "Tests caching, load balancing, and pipeline concepts." }
      ]
    };

    // Dynamically insert questions based on candidate's parsed skills
    if (candidateSkills && candidateSkills.length > 0) {
      if (candidateSkills.includes('React') || candidateSkills.includes('JavaScript') || candidateSkills.includes('TypeScript')) {
        list.technical.push({
          question: "What is React Virtual DOM, and how does React reconciliation process state changes?",
          topic: "React Internals",
          purpose: "Assesses frontend rendering optimization depth."
        });
      }
      if (candidateSkills.includes('Docker') || candidateSkills.includes('Kubernetes')) {
        list.systemDesign.push({
          question: "How would you design a highly available microservices deployment using Kubernetes, managing database migrations during rollouts?",
          topic: "Container Orchestration",
          purpose: "Evaluates high-scale deployment patterns."
        });
      }
      if (candidateSkills.includes('Python') || candidateSkills.includes('PyTorch') || candidateSkills.includes('TensorFlow')) {
        list.technical.push({
          question: "How do you handle vanishing and exploding gradients in deep neural networks?",
          topic: "Neural Network Training",
          purpose: "Verifies optimization skills in ML training loops."
        });
      }
      if (candidateSkills.includes('SQL') || candidateSkills.includes('PostgreSQL') || candidateSkills.includes('MongoDB')) {
        list.technical.push({
          question: "What are database transactions, and how does PostgreSQL implement ACID properties?",
          topic: "Databases",
          purpose: "Checks storage and transaction isolation concepts."
        });
      }
    }

    return list;
  };

  const activeQuestions = questions || generateLocalQuestions();

  const subTabs = [
    { id: 'technical', label: 'Technical', icon: Code },
    { id: 'hr', label: 'HR / Behavioral', icon: UserCheck },
    { id: 'projectBased', label: 'Project-Based', icon: Terminal },
    { id: 'systemDesign', label: 'System Design', icon: Compass }
  ];

  return (
    <div className="glass-panel rounded-xl p-5 border border-slate-800 shadow-lg space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
          <HelpCircle className="w-5 h-5 text-blue-400 animate-pulse" />
          AI Interview Question Generator
        </h2>
        {!hasApiKey && (
          <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded border border-slate-700">
            Tailored Fallback Questions
          </span>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 pb-1.5 overflow-x-auto gap-2">
        {subTabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
              activeSubTab === tab.id
                ? 'bg-blue-500/10 text-blue-400 border border-blue-900/30'
                : 'text-slate-400 hover:bg-slate-800/30 hover:text-slate-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Questions Render */}
      <div className="space-y-4">
        {(!activeQuestions[activeSubTab] || activeQuestions[activeSubTab].length === 0) ? (
          <p className="text-xs text-slate-500 italic py-6 text-center">No questions in this category.</p>
        ) : (
          activeQuestions[activeSubTab].map((q, idx) => (
            <div
              key={idx}
              className="p-4 bg-slate-950/40 border border-slate-800/80 rounded-xl space-y-2.5 hover:border-slate-700/50 transition-colors"
            >
              <div className="flex gap-2">
                <span className="text-xs font-bold text-slate-500 mt-0.5">{idx + 1}.</span>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  {q.question}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 pl-5 text-[10px]">
                <span className="bg-blue-950/30 text-blue-400 px-2 py-0.5 rounded border border-blue-900/20 font-medium">
                  Topic: {q.topic}
                </span>
                <span className="text-slate-500 italic flex items-center gap-1">
                  <MessageCircle className="w-3 h-3" />
                  Purpose: {q.purpose}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
