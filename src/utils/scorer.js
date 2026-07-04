import { analyzeSkillGap } from './gapAnalyzer.js';

/**
 * Parses required years of experience from job description.
 * @param {string} jdText - Job Description text
 * @returns {number} Required years of experience (defaults to 5)
 */
export function extractRequiredExperience(jdText) {
  if (!jdText) return 5;
  const match = jdText.match(/(\d+)\+?\s*years?/i);
  return match ? parseInt(match[1]) : 5;
}

/**
 * Calculates keyword density match between resume and job description.
 * @param {string} resumeText 
 * @param {string} jdText 
 * @returns {number} Score from 0 to 100
 */
export function calculateKeywordDensity(resumeText, jdText) {
  if (!resumeText || !jdText) return 0;
  
  const cleanWords = (text) => text.toLowerCase().split(/[^a-z0-9]+/i).filter(w => w.length > 3);
  const jdWords = new Set(cleanWords(jdText));
  const resumeWords = cleanWords(resumeText);
  
  if (jdWords.size === 0) return 100;
  
  let matches = 0;
  resumeWords.forEach(word => {
    if (jdWords.has(word)) {
      matches++;
    }
  });
  
  // Normalized density score (percentage of JD keywords that appear in resume)
  let found = 0;
  jdWords.forEach(word => {
    if (resumeWords.includes(word)) {
      found++;
    }
  });
  
  return Math.round((found / jdWords.size) * 100);
}

/**
 * Calculates education match score.
 * @param {string} candidateEdu - Candidate's education details
 * @param {string} jdText - Job description text
 * @returns {number} Score from 0 to 100
 */
export function calculateEducationScore(candidateEdu, jdText) {
  if (!jdText) return 100;
  const cEdu = (candidateEdu || '').toLowerCase();
  const jd = jdText.toLowerCase();
  
  // Detect JD requirements
  const requiresPhD = jd.includes('phd') || jd.includes('ph.d') || jd.includes('doctorate');
  const requiresMaster = jd.includes('master') || jd.includes('ms') || jd.includes('m.s') || jd.includes('mtech');
  
  // Detect candidate credentials
  const hasPhD = cEdu.includes('phd') || cEdu.includes('ph.d') || cEdu.includes('doctorate');
  const hasMaster = cEdu.includes('master') || cEdu.includes('ms') || cEdu.includes('m.s') || cEdu.includes('mtech') || hasPhD;
  const hasBachelor = cEdu.includes('bachelor') || cEdu.includes('bs') || cEdu.includes('b.s') || cEdu.includes('btech') || hasMaster;
  
  if (requiresPhD) {
    if (hasPhD) return 100;
    if (hasMaster) return 75;
    if (hasBachelor) return 50;
    return 30;
  }
  
  if (requiresMaster) {
    if (hasPhD || hasMaster) return 100;
    if (hasBachelor) return 80;
    return 40;
  }
  
  // Default is Bachelor or general degree
  if (hasBachelor || hasMaster || hasPhD) return 100;
  return 70; // Partial score if education section exists but no clear degree matches
}

/**
 * Calculates project relevance score based on keyword overlap.
 * @param {string[]} projects - Candidate projects list
 * @param {string[]} jdSkills - Required skills
 * @returns {number} Score from 0 to 100
 */
export function calculateProjectRelevance(projects, jdSkills) {
  if (!projects || projects.length === 0 || !jdSkills || jdSkills.length === 0) return 0;
  
  let relevantProjectsCount = 0;
  projects.forEach(project => {
    const pLower = project.toLowerCase();
    const hasSkillMatch = jdSkills.some(skill => pLower.includes(skill.toLowerCase()));
    if (hasSkillMatch) {
      relevantProjectsCount++;
    }
  });
  
  const ratio = relevantProjectsCount / projects.length;
  return Math.round(ratio * 100);
}

/**
 * Calculates certification relevance score.
 * @param {string[]} certifications 
 * @param {string} jdText 
 * @returns {number} Score from 0 to 100
 */
export function calculateCertificationScore(certifications, jdText) {
  if (!jdText) return 100;
  const jd = jdText.toLowerCase();
  
  const hasCertsRequired = jd.includes('certif') || jd.includes('aws certified') || jd.includes('scrum') || jd.includes('pmp');
  if (!hasCertsRequired) {
    return certifications.length > 0 ? 100 : 85; // Bonus if they have some, otherwise not penalized
  }
  
  if (certifications.length === 0) return 40;
  if (certifications.length === 1) return 75;
  return 100;
}

/**
 * Core Scorer Engine. Combines all metrics.
 * @param {object} parsedResume - Output from heuristic or LLM parser
 * @param {string} jdText - Job Description text
 * @param {string[]} jdSkills - Extracted skills from JD
 * @param {number} semanticMatchScore - Score calculated by semanticMatcher (embeddings)
 * @param {object} weights - Custom sliders for final score weighting
 * @returns {object} Full scores breakdown
 */
export function scoreCandidateATS(parsedResume, jdText, jdSkills, semanticMatchScore, weights = { semantic: 0.4, skills: 0.35, experience: 0.25 }) {
  const { skills: resumeSkills, experience_years, education, projects, certifications } = parsedResume;
  
  // 1. Skill Overlap Score
  const gap = analyzeSkillGap(resumeSkills, jdSkills);
  const skillOverlapScore = jdSkills.length > 0 
    ? Math.round((gap.matched.length / jdSkills.length) * 100) 
    : 100;
    
  // 2. Experience Match Score
  const reqExp = extractRequiredExperience(jdText);
  let experienceScore = 40; // Default baseline for Not specified
  
  if (experience_years !== null && experience_years !== undefined) {
    let years = 0;
    if (typeof experience_years === 'number') {
      years = experience_years;
    } else if (typeof experience_years === 'string') {
      if (experience_years.toLowerCase().includes('fresher')) {
        years = 0;
      } else {
        const numMatch = experience_years.match(/(\d+)/);
        years = numMatch ? parseInt(numMatch[1]) : 0;
      }
    }

    if (years >= reqExp) {
      experienceScore = 100;
    } else if (years >= reqExp - 2) {
      experienceScore = 80;
    } else if (years >= reqExp - 4) {
      experienceScore = 60;
    } else if (years > 0) {
      experienceScore = 45;
    } else { // Fresher (0)
      experienceScore = 30;
    }
  }
  
  // 3. Keyword Density
  const keywordDensityScore = calculateKeywordDensity(parsedResume.content, jdText);
  
  // 4. Project Relevance
  const projectRelevanceScore = calculateProjectRelevance(projects, jdSkills);
  
  // 5. Education Match
  const educationScore = calculateEducationScore(education, jdText);
  
  // 6. Certifications Score
  const certificationScore = calculateCertificationScore(certifications, jdText);
  
  // 7. Overall Weighted ATS Score
  // Normalized components based on custom slider weights:
  // semantic weight -> semantic score
  // skills weight -> skill overlap score
  // experience weight -> experience score
  // Other static components (keyword, project, education, certifications) serve as a 15% modifier aggregate to make it realistic
  const baseScore = (semanticMatchScore * weights.semantic) + 
                    (skillOverlapScore * weights.skills) + 
                    (experienceScore * weights.experience);
                    
  const supportingScore = (keywordDensityScore * 0.25) + 
                           (projectRelevanceScore * 0.25) + 
                           (educationScore * 0.25) + 
                           (certificationScore * 0.25);
                           
  // Final composite ATS Score (85% Core metrics, 15% Support metrics)
  const finalScore = Math.round((baseScore * 0.85) + (supportingScore * 0.15));
  
  return {
    finalScore: Math.min(100, Math.max(0, finalScore)),
    breakdown: {
      semantic: Math.round(semanticMatchScore),
      skills: skillOverlapScore,
      experience: experienceScore,
      keywordDensity: keywordDensityScore,
      projectRelevance: projectRelevanceScore,
      education: educationScore,
      certifications: certificationScore
    },
    skillGap: gap
  };
}
