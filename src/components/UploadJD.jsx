import React, { useState } from 'react';
import { Briefcase, Upload, CheckCircle, FileText, Loader2 } from 'lucide-react';
import { parseFile } from '../utils/parser';

export default function UploadJD({ jdText, jdFile, onJdChange }) {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState('');

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsParsing(true);
    setError('');
    try {
      const text = await parseFile(file);
      onJdChange(text, file.name);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Failed to parse Job Description file.');
    } finally {
      setIsParsing(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-800">
          <Briefcase className="w-5 h-5 text-blue-600" />
          Job Description
        </h2>
      </div>

      <div className="space-y-4">
        <div className="border border-dashed border-slate-300 hover:border-blue-500 rounded-lg p-4 text-center transition-all bg-slate-50">
          <div className="flex flex-col items-center gap-2">
            <Upload className="w-6 h-6 text-slate-400" />
            <div className="text-xs text-slate-550">
              <span className="font-semibold text-blue-600 hover:underline cursor-pointer">
                Upload JD file
                <input
                  type="file"
                  accept=".txt,.pdf,.docx"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="jd-file-upload"
                />
              </span>{' '}
              or paste text below
            </div>
            <label
              htmlFor="jd-file-upload"
              className="mt-1 px-3 py-1 bg-white hover:bg-slate-50 border border-slate-300 rounded text-[11px] font-medium text-slate-700 cursor-pointer transition-colors"
            >
              Choose File
            </label>
            <p className="text-[10px] text-slate-455 font-medium">Supports PDF, DOCX, TXT</p>
          </div>
        </div>

        {isParsing && (
          <div className="flex items-center justify-center gap-2 text-xs text-blue-650 bg-blue-50 py-2 rounded-lg border border-blue-200">
            <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
            Parsing job description file...
          </div>
        )}

        {error && (
          <div className="text-xs text-red-700 bg-red-50 py-2 px-3 rounded-lg border border-red-200">
            {error}
          </div>
        )}

        {jdFile && !isParsing && (
          <div className="flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 py-2 px-3 rounded-lg border border-emerald-200">
            <CheckCircle className="w-4 h-4 flex-shrink-0 text-emerald-600" />
            <span className="truncate font-semibold">Loaded: {jdFile}</span>
          </div>
        )}

        <div className="relative">
          <textarea
            value={jdText}
            onChange={(e) => onJdChange(e.target.value, jdFile)}
            placeholder="Paste job description details, qualifications, and role requirements here..."
            className="w-full h-80 p-3 bg-white border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 resize-none font-sans"
          />
        </div>
      </div>
    </div>
  );
}
