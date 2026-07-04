# Resume Screener & Skill Analyzer

A React-based web application that analyzes candidate resumes against a job description and calculates an ATS (Applicant Tracking System) score based on skills, education, experience, and keyword relevance.

This project helps recruiters or students quickly compare multiple resumes and identify the best-fit candidate.

---

## Features

- Upload Job Description (PDF, DOCX, TXT)
- Upload Multiple Candidate Resumes
- Extract text from resumes and job descriptions
- ATS Score Calculation
- Skill Match Analysis
- Missing Skills Detection
- Candidate Ranking System
- Resume Insights & Suggestions
- Interview Question Suggestions
- Basic RAG Chatbot for resume-related queries
- Offline fallback mode (works without API)

---

## Tech Stack

- React.js
- Vite
- Tailwind CSS
- JavaScript
- PDF.js
- Mammoth.js
- Google Gemini API
- OpenAI API

---

## How It Works

1. Upload the Job Description  
2. Upload one or more candidate resumes  
3. The system extracts text from the files  
4. ATS scores are calculated based on:
   - Skills Match
   - Experience Match
   - Education Match
   - Keyword Relevance
5. Candidates are ranked based on ATS score  
6. Users can analyze skill gaps and generate interview questions  
7. Chatbot can answer questions related to uploaded resumes  

---

## Installation

Clone the repository:

```bash
git clone https://github.com/your-username/resume-screener.git
```

Go to the project folder:

```bash
cd resume-screener
```

Install dependencies:

```bash
npm install
```

Run the project:

```bash
npm run dev
```

---

## Environment Variables

Create a `.env` file in the root folder and add:

```env
VITE_GEMINI_API_KEY=your_key_here
VITE_OPENAI_API_KEY=your_key_here
```

You can also add API keys directly inside the app settings.

---

## Project Structure

```text
resume-screener/
│── src/
│   │── components/
│   │── utils/
│   │── services/
│── public/
│── package.json
│── vite.config.js
│── README.md
```

---

## Future Improvements

- Improve resume parsing accuracy
- Better name and contact extraction
- Add recruiter login system
- Export shortlisted candidates
- Add database integration
- Improve UI and analytics dashboard

---

## Author

**Vindhya Reddy**  
B.Tech CSE (AI-Driven DevOps)  
Jain University
