Resume Screener & Skill Analyzer

A React-based web application that analyzes resumes against a job description and calculates an ATS score based on skill matching, education, experience, and keyword relevance.

Features
Upload Job Description (PDF, DOCX, TXT)
Upload Multiple Candidate Resumes
Resume Parsing using PDF.js and Mammoth
ATS Score Calculation
Skill Match Analysis
Missing Skills Detection
Candidate Ranking System
Interview Question Suggestions
Basic Resume Chatbot (RAG-based)
Offline Fallback Mode (without API)
Tech Stack
React.js
Vite
Tailwind CSS
JavaScript
PDF.js
Mammoth
Google Gemini API / OpenAI API
How It Works
Upload the Job Description.
Upload one or more resumes.
The system extracts text from documents.
ATS score is calculated based on:
Skills
Experience
Education
Keywords
Candidates are ranked based on score.
Users can analyze skill gaps and ask questions using chatbot.
Installation
npm install
npm run dev
Environment Variables

Create a .env file:

VITE_GEMINI_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
Future Improvements
Better resume parsing accuracy
Improved name and contact extraction
Login system for recruiters
Export shortlisted candidates
Database integration
