import React, { useState } from 'react';
import { FileText, Upload, Trash2, X, Sparkles, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';

export default function UploadResume({ resumes, onResumesChange, onAnalyze, isProcessing, canAnalyze }) {
  const [dragOver, setDragOver] = useState(false);

  const processFiles = (files) => {
    const validFiles = Array.from(files).filter(f => {
      const ext = f.name.split('.').pop().toLowerCase();
      return ['pdf', 'docx', 'txt'].includes(ext);
    });

    if (validFiles.length === 0) return;

    const newResumes = validFiles.map((file, idx) => ({
      id: `file-${Date.now()}-${idx}-${Math.random().toString(36).substr(2, 4)}`,
      name: file.name.replace(/\.[^/.]+$/, "").replace(/[_-]/g, ' '),
      fileName: file.name,
      size: file.size,
      fileObject: file,
      status: 'pending' // pending, parsing, error, complete
    }));

    onResumesChange([...resumes, ...newResumes]);
  };

  const handleFileSelect = (e) => {
    processFiles(e.target.files);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    processFiles(e.dataTransfer.files);
  };

  const removeResume = (id) => {
    onResumesChange(resumes.filter(r => r.id !== id));
  };

  const formatSize = (bytes) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <FileText className="w-5 h-5 text-blue-600" />
          Candidate Resumes
          {resumes.length > 0 && (
            <span className="bg-blue-50 text-blue-600 text-xs px-2 py-0.5 rounded-full border border-blue-200">
              {resumes.length}
            </span>
          )}
        </h2>
        {resumes.length > 0 && !isProcessing && (
          <button
            onClick={() => onResumesChange([])}
            className="text-xs text-red-600 hover:text-red-800 flex items-center gap-1 transition-colors font-semibold"
          >
            Clear All
          </button>
        )}
      </div>

      <div className="space-y-4 flex-1 flex flex-col justify-between">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          className={`border-2 border-dashed rounded-xl p-8 text-center transition-all flex flex-col items-center justify-center cursor-pointer ${
            dragOver 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-slate-300 bg-slate-50 hover:border-slate-400'
          }`}
          onClick={() => document.getElementById('resume-file-input').click()}
        >
          <div className="p-3 bg-white rounded-full mb-3 border border-slate-200">
            <Upload className="w-6 h-6 text-slate-400" />
          </div>
          <p className="text-sm font-medium text-slate-700">
            Drag & drop resumes here, or <span className="text-blue-600 hover:underline">browse</span>
          </p>
          <p className="text-xs text-slate-455 font-medium mt-1">Supports PDF, DOCX, TXT (Batch upload enabled)</p>
          <input
            type="file"
            multiple
            accept=".pdf,.docx,.txt"
            onChange={handleFileSelect}
            className="hidden"
            id="resume-file-input"
          />
        </div>

        {resumes.length > 0 && (
          <div className="space-y-2 max-h-64 overflow-y-auto pr-1 flex-1 mt-4">
            {resumes.map(resume => (
              <div
                key={resume.id}
                className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="p-2 bg-blue-50 rounded-lg flex-shrink-0 border border-blue-100">
                    <FileText className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate">{resume.name}</p>
                    <p className="text-[10px] text-slate-500 flex items-center gap-2">
                      <span>{formatSize(resume.size)}</span>
                      {resume.status === 'parsing' && (
                        <span className="text-blue-600 flex items-center gap-0.5 font-medium">
                          <Loader2 className="w-3 h-3 animate-spin text-blue-600" /> parsing...
                        </span>
                      )}
                      {resume.status === 'complete' && (
                        <span className="text-emerald-700 flex items-center gap-0.5 font-medium">
                          <CheckCircle className="w-3 h-3 text-emerald-600" /> parsed
                        </span>
                      )}
                      {resume.status === 'error' && (
                        <span className="text-red-700 flex items-center gap-0.5 font-medium">
                          <AlertTriangle className="w-3 h-3 text-red-650" /> error
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                {!isProcessing && (
                  <button
                    onClick={(e) => { e.stopPropagation(); removeResume(resume.id); }}
                    className="p-1 hover:bg-red-50 rounded text-slate-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-4">
          <button
            onClick={onAnalyze}
            disabled={!canAnalyze || isProcessing}
            className={`w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 transition-all ${
              !canAnalyze || isProcessing
                ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                : 'bg-blue-600 hover:bg-blue-700 shadow-sm'
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Screening & Analyzing Candidates...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze & Score Candidates
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
