# AI-Powered ATS Resume Screener & Recruiter Agent

An advanced, production-ready, client-side React application that screens multiple candidate resumes against a job description, calculates weighted ATS scores, does semantic matching, maps skills gaps, suggests improvements, generates interview questions, and houses a RAG (Retrieval-Augmented Generation) chatbot.

## Core Features

1. **Multi-File Client-Side Parsers**:
   - Parses **PDF** (`pdfjs-dist`), **DOCX** (`mammoth`), and **TXT** files directly in the browser. No server upload required.
2. **Dynamic ATS Score Engine**:
   - Calculates score breakdowns across: Skill Overlap, Experience Match, Keyword Density, Project Relevance, Education Match, Certifications, and Semantic Similarity.
   - Adjust aggregate scores dynamically via weight configuration sliders.
3. **Semantic Matching (Embeddings + Cosine Similarity)**:
   - Evaluates contextual mapping (e.g. matching `TensorFlow` to `Deep Learning`) using Google Gemini (`text-embedding-004`) or OpenAI (`text-embedding-3-small`) vectors.
   - Offline fallback mode uses token frequency vectors (Bag of Words) with stop-words removed to run a true document cosine similarity in-browser.
4. **Skills Gap Analysis & Suggestions**:
   - Visualizes matched, missing, and extra skills.
   - Recommends course topics and training resources for gaps.
5. **Interview Question Generator**:
   - Builds targeted questions categorized by: Technical, HR/Behavioral, Project-Based, and System Design.
6. **Candidate Leaderboard**:
   - Ranks multiple resumes and highlights the best-fit applicant.
7. **Resume-Aware RAG Chatbot**:
   - Splits resume and JD text into overlapping chunks, computes embeddings, saves them in an in-memory vector database, and queries them using cosine similarity retrieval to build LLM context prompts.
   - Offline fallback mode uses keyword token-overlap matching to answer questions.

---

## Architecture & Technology Stack

- **Frontend Framework**: React 18 (Vite Bundler)
- **Styling**: Tailwind CSS v3
- **Icons**: Lucide React
- **Document Parsers**: PDF.js Dist, Mammoth
- **LLM APIs**: `@google/generative-ai` (Gemini 1.5 Flash), `openai` (GPT-4o-Mini)
- **Vector DB**: Native JS in-memory VectorStore implementing cosine similarity search.

---

## Local Development Guide

### 1. Prerequisites
Ensure you have [Node.js (v18+)](https://nodejs.org/) installed.

### 2. Installation
Open the project directory and install the required npm dependencies:
```bash
cd resume-screener
npm install
```

### 3. Environment Setup
Create a `.env` file in the root of the `resume-screener` folder (or copy `.env`):
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
VITE_OPENAI_API_KEY=your_openai_api_key_here
```
*Note: You can also configure API keys dynamically inside the application UI's **Settings** tab. Keys entered in the UI are securely saved in your browser's `localStorage`.*

### 4. Running the Development Server
Launch the local development server (runs on `http://localhost:3000`):
```bash
npm run dev
```

### 5. Production Build
To build the application for hosting:
```bash
npm run build
```

---

## Deployment Instructions

This project is a single-page client-side application (SPA). It can be deployed to any static web hosting platform.

### Vercel Deployment

1. **Deploy via CLI**:
   Install the Vercel CLI and run the deploy command:
   ```bash
   npm install -g vercel
   vercel
   ```
2. **Deploy via GitHub**:
   - Push your repository to GitHub.
   - Import the repository in your [Vercel Dashboard](https://vercel.com).
   - Set the **Framework Preset** to `Vite`.
   - Set the **Root Directory** to `resume-screener`.
   - Add environment variables `VITE_GEMINI_API_KEY` or `VITE_OPENAI_API_KEY` (optional, can also be supplied inside the app's settings panel).
   - Click **Deploy**.

### Netlify Deployment

1. **Deploy via UI**:
   - Push your code to GitHub.
   - Link your Netlify account and choose the repository.
   - Set **Base directory** to `resume-screener`.
   - Set **Build command** to `npm run build`.
   - Set **Publish directory** to `resume-screener/dist`.
   - Add environment variables under Site settings if needed.
   - Click **Deploy site**.
2. **Deploy via Drag & Drop**:
   - Run `npm run build` locally.
   - Drag and drop the generated `dist/` folder into [Netlify Drop](https://app.netlify.com/drop).
