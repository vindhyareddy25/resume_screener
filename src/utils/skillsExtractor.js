// Comprehensive dictionary of technical and soft skills
export const SKILLS_DICTIONARY = [
  // Languages
  'python', 'javascript', 'typescript', 'go', 'golang', 'java', 'c++', 'c#', 'c', 'ruby', 'php', 'rust', 'scala', 'kotlin', 'swift', 'r', 'html', 'css', 'sql',
  // Frameworks & Libraries
  'react', 'angular', 'vue', 'next.js', 'nuxt.js', 'svelte', 'express', 'django', 'flask', 'fastapi', 'spring boot', 'pytorch', 'tensorflow', 'keras', 'scikit-learn', 'xgboost', 'pandas', 'numpy', 'laravel', 'rails', 'jquery', 'bootstrap', 'tailwind', 'sass', 'redux', 'graphql',
  // DevOps & Cloud
  'aws', 'azure', 'gcp', 'docker', 'kubernetes', 'k8s', 'terraform', 'jenkins', 'ansible', 'git', 'github actions', 'gitlab ci', 'circleci', 'linux', 'bash', 'nginx', 'apache', 'prometheus', 'grafana', 'ci/cd', 'cloudformation',
  // Databases & Storage
  'postgresql', 'mysql', 'mongodb', 'redis', 'sqlite', 'cassandra', 'dynamodb', 'elasticsearch', 'mariadb', 'oracle', 'neo4j', 'firebase', 'supabase',
  // AI, Data & MLOps
  'machine learning', 'deep learning', 'nlp', 'natural language processing', 'computer vision', 'data science', 'analytics', 'tableau', 'powerbi', 'spark', 'databricks', 'hadoop', 'apache airflow', 'mlops', 'kubeflow', 'mlflow', 'vector search', 'embeddings', 'rag', 'large language models', 'llm', 'gpt', 'llama', 'langchain', 'llama-index',
  // Vector DBs
  'pinecone', 'faiss', 'chroma', 'weaviate', 'milvus', 'qdrant',
  // Protocols & Concepts
  'rest api', 'restful api', 'grpc', 'websockets', 'oauth', 'jwt', 'microservices', 'serverless', 'agile', 'scrum', 'kanban', 'object-oriented programming', 'oop'
];

/**
 * Calculates experience years dynamically.
 * If fresher, intern, student, or trainee is found, returns 0.
 * Else looks for years/yrs format and returns number.
 * Else returns null.
 */
export function calculateExperience(experienceText) {
  if (!experienceText) return null;
  const text = Array.isArray(experienceText) ? experienceText.join('\n') : experienceText;
  const cleanText = text.toLowerCase();

  // If fresher/intern/student/trainee found -> return 0 (Fresher)
  if (cleanText.includes('fresher') || cleanText.includes('intern') || cleanText.includes('student') || cleanText.includes('trainee')) {
    return 0;
  }

  // Match experience years pattern
  const expRegex = /(\d+)\+?\s*(years|yrs)/gi;
  let match;
  let maxYears = 0;

  while ((match = expRegex.exec(cleanText)) !== null) {
    const years = parseInt(match[1]);
    if (years > maxYears && years < 50) {
      maxYears = years;
    }
  }

  if (maxYears > 0) {
    return maxYears;
  }

  // Fallback: estimate from date ranges
  const dateRangeRegex = /\b((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}\/\d{4}|\b\d{4}\b)\s*-\s*((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{4}|\d{1,2}\/\d{4}|\b\d{4}\b|Present|Current|Ongoing)\b/gi;
  let totalMonths = 0;
  let rangesFound = 0;

  const monthMap = {
    jan: 0, january: 0, feb: 1, february: 1, mar: 2, march: 2, apr: 3, april: 3,
    may: 4, jun: 5, june: 5, jul: 6, july: 6, aug: 7, august: 7, sep: 8, september: 8,
    oct: 9, october: 9, nov: 10, november: 10, dec: 11, december: 11
  };

  const parseDateStr = (str) => {
    const s = str.trim().toLowerCase();
    if (s === 'present' || s === 'current' || s === 'ongoing') {
      const now = new Date();
      return { month: now.getMonth(), year: now.getFullYear() };
    }
    if (s.includes('/')) {
      const parts = s.split('/');
      const m = parseInt(parts[0]) - 1;
      const y = parseInt(parts[1]);
      if (!isNaN(m) && !isNaN(y) && m >= 0 && m < 12) return { month: m, year: y };
    }
    const words = s.split(/\s+/);
    if (words.length >= 2) {
      const mName = words[0].substring(0, 3);
      const y = parseInt(words[1]);
      const m = monthMap[mName];
      if (m !== undefined && !isNaN(y)) return { month: m, year: y };
    }
    const yOnly = parseInt(s);
    if (!isNaN(yOnly) && yOnly >= 1970 && yOnly <= 2030) return { month: 0, year: yOnly };
    return null;
  };

  const cleanTextDates = text.replace(/\r\n/g, '\n').replace(/[–—]/g, '-');
  let matchDate;
  while ((matchDate = dateRangeRegex.exec(cleanTextDates)) !== null) {
    const start = parseDateStr(matchDate[1]);
    const end = parseDateStr(matchDate[2]);
    if (start && end) {
      const months = (end.year - start.year) * 12 + (end.month - start.month);
      if (months > 0 && months < 600) {
        totalMonths += months;
        rangesFound++;
      }
    }
  }

  if (rangesFound > 0) {
    const calculatedYears = Math.round(totalMonths / 12);
    if (calculatedYears > 0) return calculatedYears;
  }

  return null;
}

/**
 * Helper to extract education section text boundaries.
 */
function getEducationSection(lines) {
  const startKeywords = ['education', 'academic background', 'qualification', 'academics'];
  const endKeywords = ['skills', 'projects', 'experience', 'internships', 'certifications'];

  let startIndex = -1;
  let endIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (startKeywords.some(keyword => line.includes(keyword))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return [];

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (endKeywords.some(keyword => line.includes(keyword))) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex + 1, endIndex);
}

/**
 * Helper to extract experience section text boundaries.
 */
function getExperienceSection(lines) {
  const startKeywords = [
    'experience',
    'work experience',
    'employment',
    'history',
    'professional experience',
    'internship',
    'employment history'
  ];

  const endKeywords = [
    'education',
    'academic background',
    'qualification',
    'academics',
    'skills',
    'projects',
    'certifications'
  ];

  let startIndex = -1;
  let endIndex = lines.length;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (startKeywords.some(keyword => line.includes(keyword))) {
      startIndex = i;
      break;
    }
  }

  if (startIndex === -1) return [];

  for (let i = startIndex + 1; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (endKeywords.some(keyword => line.includes(keyword))) {
      endIndex = i;
      break;
    }
  }

  return lines.slice(startIndex + 1, endIndex);
}

function parseSkills(text) {
  const matched = new Set();
  const lowerText = text.toLowerCase();
  
  SKILLS_DICTIONARY.forEach(skill => {
    const isShort = skill.length <= 3;
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = isShort 
      ? new RegExp(`\\b${escaped}\\b`, 'i') 
      : new RegExp(`\\b${escaped}(?:s|es)?\\b`, 'i');
      
    if (skill.includes('.') || skill.includes('-') || skill.includes(' ')) {
      if (lowerText.includes(skill)) matched.add(skill);
    } else if (regex.test(lowerText)) {
      matched.add(skill);
    }
  });

  return Array.from(matched).map(s => {
    const specialCap = {
      'javascript': 'JavaScript', 'typescript': 'TypeScript', 'next.js': 'Next.js', 'nuxt.js': 'Nuxt.js',
      'node.js': 'Node.js', 'express': 'Express', 'fastapi': 'FastAPI', 'pytorch': 'PyTorch', 
      'tensorflow': 'TensorFlow', 'scikit-learn': 'scikit-learn', 'mongodb': 'MongoDB', 'postgresql': 'PostgreSQL', 
      'mysql': 'MySQL', 'sqlite': 'SQLite', 'dynamodb': 'DynamoDB', 'aws': 'AWS', 'gcp': 'GCP', 
      'azure': 'Azure', 'docker': 'Docker', 'kubernetes': 'Kubernetes', 'terraform': 'Terraform', 
      'github actions': 'GitHub Actions', 'ci/cd': 'CI/CD', 'rest api': 'REST API', 'grpc': 'gRPC', 
      'graphql': 'GraphQL', 'mlops': 'MLOps', 'nlp': 'NLP', 'llm': 'LLM', 'gpt': 'GPT', 'llama': 'LLaMA',
      'rag': 'RAG', 'faiss': 'FAISS', 'db': 'DB', 'powerbi': 'PowerBI', 'sql': 'SQL', 'html': 'HTML', 'css': 'CSS'
    };
    return specialCap[s] || s.replace(/\b\w/g, c => c.toUpperCase());
  });
}

function parseProjects(text) {
  const projects = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  let inProjects = false;
  
  for (const line of lines) {
    if (/projects|selected projects|key projects/i.test(line)) {
      inProjects = true;
      continue;
    }
    if (inProjects) {
      if (/education|skills|experience|certifications/i.test(line)) {
        inProjects = false;
        continue;
      }
      if ((line.startsWith('-') || line.startsWith('•') || line.startsWith('*')) && line.length > 20) {
        projects.push(line.replace(/^[-•*\s]+/, ''));
      }
      if (projects.length >= 4) break;
    }
  }
  return projects;
}

function parseCertifications(text) {
  const certifications = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const certKeywords = ['certified', 'certification', 'aws', 'gcp', 'scrum', 'pmp', 'comptia', 'cisco', 'red hat', 'microsoft'];
  
  for (const line of lines) {
    if (/certification|credentials/i.test(line)) continue;
    if (certKeywords.some(keyword => line.toLowerCase().includes(keyword)) && line.length < 75 && line.length > 5) {
      certifications.push(line);
    }
    if (certifications.length >= 3) break;
  }
  return certifications;
}

function parseAchievements(text) {
  const achievements = [];
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const achKeywords = ['won', 'award', 'placed', 'scholarship', 'selected', 'patent', 'led team', 'reduced', 'increased'];
  
  for (const line of lines) {
    if (achKeywords.some(keyword => line.toLowerCase().includes(keyword)) && line.length > 15 && line.length < 120) {
      achievements.push(line);
    }
    if (achievements.length >= 3) break;
  }
  return achievements;
}

/**
 * Universal generalized layout-independent resume parser.
 */
export function extractResumeDataHeuristically(text, fileName) {
  // 6. MULTI-COLUMN & PREPROCESSING: Remove icons, unicode symbols, collapse spaces, preserve line order
  const asciiCleaned = text.replace(/[^\x20-\x7E\n]/g, '');

  const rawLines = asciiCleaned.replace(/\r\n/g, '\n').split('\n');
  const cleanLineByLine = rawLines
    .map(line => line.replace(/[ \t]+/g, ' ').trim())
    .filter(Boolean);

  const normalizedText = cleanLineByLine.join(' ');

  // Isolate candidate extraction state
  const candidate = {
    name: null,
    email: null,
    phone: null,
    degree: null,
    institution: null,
    experience: null,
    confidence: 100
  };

  // 2. EMAIL EXTRACTION (Global search)
  const emailRegex = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/;
  const emailMatch = normalizedText.match(emailRegex);
  candidate.email = emailMatch ? emailMatch[0] : "N/A";

  // 3. PHONE EXTRACTION (Global search with multiple formats support)
  const phoneRegex = /(?:\+?\d{1,3}[\s-]?)?(?:\(?\d{3,5}\)?[\s-]?)?\d{5,10}/g;
  const phoneMatches = normalizedText.match(phoneRegex);
  let bestPhone = "N/A";
  if (phoneMatches) {
    const validPhone = phoneMatches.find(p => p.replace(/\D/g, '').length >= 7);
    if (validPhone) {
      bestPhone = validPhone.trim();
    }
  }
  candidate.phone = bestPhone;

  // 4. DEGREE & INSTITUTION EXTRACTION (Nearby context scanning)
  const degreeKeywords = ["B.Tech", "B.E", "M.Tech", "MCA", "BCA", "B.Sc", "M.Sc", "MBA", "BTech", "BE", "MTech", "BSc", "MSc"];
  const instKeywords = ["University", "College", "Institute"];

  for (let i = 0; i < cleanLineByLine.length; i++) {
    const line = cleanLineByLine[i];
    const matchedKeyword = degreeKeywords.find(kw => {
      const esc = kw.replace(/\./g, '\\.');
      const rx = new RegExp(`\\b${esc}\\b`, 'i');
      return rx.test(line);
    });

    if (matchedKeyword && !candidate.degree) {
      candidate.degree = matchedKeyword;

      // Scan nearby +/- 2 lines for university or institution name
      const start = Math.max(0, i - 2);
      const end = Math.min(cleanLineByLine.length - 1, i + 2);
      for (let j = start; j <= end; j++) {
        const checkLine = cleanLineByLine[j];
        if (/(university|college|institute)/i.test(checkLine)) {
          const words = checkLine.split(/\s+/);
          const idx = words.findIndex(w => /university|college|institute/i.test(w));
          if (idx !== -1) {
            const wordStart = Math.max(0, idx - 2);
            const wordEnd = Math.min(words.length, idx + 3);
            candidate.institution = words.slice(wordStart, wordEnd).join(' ').trim();
            break;
          }
        }
      }
    }
  }

  // Fallback: full document regex checks
  if (!candidate.degree) {
    for (const kw of degreeKeywords) {
      const esc = kw.replace(/\./g, '\\.');
      const rx = new RegExp(`\\b${esc}\\b`, 'i');
      if (rx.test(normalizedText)) {
        candidate.degree = kw;
        break;
      }
    }
  }
  if (!candidate.institution) {
    const match = normalizedText.match(/([A-Z][a-zA-Z\s]{0,25}?(?:University|College|Institute))/i);
    if (match) {
      candidate.institution = match[0].trim();
    }
  }

  if (candidate.degree && candidate.institution && candidate.institution !== 'Not found') {
    if (candidate.degree.toLowerCase().includes(candidate.institution.toLowerCase())) {
      candidate.degree = candidate.degree.replace(new RegExp(candidate.institution, 'gi'), '').trim().replace(/,\s*$/i, '').trim();
    }
  }

  candidate.degree = candidate.degree || "Not found";
  candidate.institution = candidate.institution || "Not found";

  // 1. NAME EXTRACTION (Generic scorer scanning top 20 lines)
  let bestName = "";
  let highestScore = -999;
  
  const top20Lines = cleanLineByLine.slice(0, 20);
  for (let i = 0; i < top20Lines.length; i++) {
    const line = top20Lines[i];
    let score = 0;
    
    const words = line.split(/\s+/).filter(Boolean);
    
    // +5 if 2-4 words
    if (words.length >= 2 && words.length <= 4) {
      score += 5;
    }
    
    // +5 if words are alphabetic only
    const onlyAlphabetic = /^[A-Za-z\s]+$/.test(line);
    if (onlyAlphabetic) {
      score += 5;
    }
    
    // +5 if Title Case OR ALL CAPS
    const isTitleCase = words.every(w => /^[A-Z][a-zA-Z'-]*$/.test(w) || /^[A-Z]\.?$/.test(w));
    const isAllCaps = /^[A-Z\s.-]+$/.test(line);
    if (isTitleCase || isAllCaps) {
      score += 5;
    }
    
    // +3 if near top (first 5 lines)
    if (i < 5) {
      score += 3;
    }
    
    // -10 if contains @
    if (line.includes('@')) {
      score -= 10;
    }
    
    // -10 if contains digits
    if (/\d/.test(line)) {
      score -= 10;
    }
    
    // -10 if contains headers
    const blockKeywords = ["education", "skills", "projects", "experience", "certifications", "summary"];
    if (blockKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
      score -= 10;
    }
    
    if (score > highestScore && score > 0) {
      highestScore = score;
      bestName = line;
    }
  }

  // Fallback: If no name found via scoring, check text before email username
  if (!bestName && candidate.email && candidate.email !== 'N/A') {
    const beforeEmail = candidate.email.split('@')[0];
    const cleanedEmailName = beforeEmail.replace(/[^A-Za-z]/g, ' ').replace(/\s+/g, ' ').trim();
    const words = cleanedEmailName.split(/\s+/);
    const alphabetRegex = /^[A-Za-z]+(?:\s+[A-Za-z]+){1,3}$/;
    if (words.length >= 2 && words.length <= 4 && alphabetRegex.test(cleanedEmailName)) {
      bestName = cleanedEmailName.replace(/\b\w/g, c => c.toUpperCase());
    }
  }

  // Backup fallback: Clean filename title casing
  if (!bestName && fileName) {
    const cleanFileName = fileName
      .replace(/\.[^/.]+$/, "")
      .replace(/[_-\s]+(resume|cv|screener|version\d+|eval|profile|screener)/gi, "")
      .replace(/[_-]/g, ' ')
      .trim();
    if (cleanFileName.split(' ').length >= 2 && cleanFileName.split(' ').length <= 4 && /^[A-Za-z\s]+$/.test(cleanFileName)) {
      bestName = cleanFileName.replace(/\b\w/g, c => c.toUpperCase());
    }
  }

  // Reject overlap checks
  if (bestName) {
    const nameLower = bestName.toLowerCase();
    const degLower = candidate.degree.toLowerCase();
    const instLower = candidate.institution.toLowerCase();
    if (
      nameLower === degLower ||
      nameLower === instLower ||
      degLower.includes(nameLower) ||
      instLower.includes(nameLower)
    ) {
      bestName = null;
    }
  }

  candidate.name = bestName || "Unknown Candidate";

  // 10. Add parser confidence scores
  let confidence = 100;
  if (candidate.name === "Unknown Candidate") confidence -= 30;
  if (candidate.email === "N/A") confidence -= 25;
  if (candidate.phone === "N/A") confidence -= 20;
  if (candidate.degree === "Not found") confidence -= 15;

  candidate.confidence = Math.max(10, confidence);

  // 5. EXPERIENCE EXTRACTION (Keep dynamic layout-independent checks)
  const expSection = getExperienceSection(cleanLineByLine);
  candidate.experience = calculateExperience(expSection.length > 0 ? expSection : cleanLineByLine);

  if (candidate.experience === null) {
    confidence -= 10;
    candidate.confidence = Math.max(10, confidence);

    const lowerText = normalizedText.toLowerCase();
    const hasAcademic = lowerText.includes('university') || lowerText.includes('college') || lowerText.includes('student') || lowerText.includes('degree') || lowerText.includes('education') || lowerText.includes('b.tech');
    const hasProjects = lowerText.includes('project') || lowerText.includes('portfolio');
    const hasWorkHistory = lowerText.includes('experience') || lowerText.includes('employment') || lowerText.includes('history') || lowerText.includes('work') || lowerText.includes('position');
    
    if (hasAcademic && hasProjects && !hasWorkHistory) {
      candidate.experience = 0; // Fresher
    }
  }

  // Parse remaining fields
  const skills = parseSkills(normalizedText);
  const projects = parseProjects(normalizedText);
  const certifications = parseCertifications(normalizedText);
  const achievements = parseAchievements(normalizedText);

  // Debug Console print
  console.log("Parsed Candidate:", candidate);

  return {
    ...candidate,
    skills,
    projects,
    certifications,
    achievements,
    experience_years: candidate.experience,
    education: candidate.degree && candidate.institution && candidate.degree !== 'Not found' && candidate.institution !== 'Not found'
      ? `${candidate.degree}, ${candidate.institution}`
      : (candidate.degree !== 'Not found' ? candidate.degree : (candidate.institution !== 'Not found' ? candidate.institution : 'Not found')),
    content: text
  };
}
