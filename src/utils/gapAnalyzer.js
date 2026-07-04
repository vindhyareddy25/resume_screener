import { SKILLS_DICTIONARY } from './skillsExtractor.js';

/**
 * Extracts skills from job description text using local dictionary matching.
 * @param {string} jdText - Job Description text
 * @returns {string[]} List of unique skills found
 */
export function extractJdSkillsHeuristically(jdText) {
  if (!jdText) return [];
  const lowerJd = jdText.toLowerCase();
  const matched = new Set();
  
  SKILLS_DICTIONARY.forEach(skill => {
    const isShort = skill.length <= 3;
    const escaped = skill.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    const regex = isShort 
      ? new RegExp(`\\b${escaped}\\b`, 'i') 
      : new RegExp(`\\b${escaped}(?:s|es)?\\b`, 'i');
      
    if (skill.includes('.') || skill.includes('-') || skill.includes(' ')) {
      if (lowerJd.includes(skill)) {
        matched.add(skill);
      }
    } else if (regex.test(lowerJd)) {
      matched.add(skill);
    }
  });
  
  // Format beautifully
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

/**
 * Performs a comprehensive skill gap analysis.
 * @param {string[]} resumeSkills - Candidate's skills
 * @param {string[]} jdSkills - Required skills from Job Description
 * @returns {object} Analysis results containing matched, missing, extra skills, and suggestions
 */
export function analyzeSkillGap(resumeSkills, jdSkills) {
  const resumeLower = resumeSkills.map(s => s.toLowerCase());
  const jdLower = jdSkills.map(s => s.toLowerCase());
  
  const matched = [];
  const missing = [];
  
  jdSkills.forEach((skill, index) => {
    const sLower = jdLower[index];
    // Check for direct match or substring match (e.g. AWS vs Amazon Web Services)
    const isMatched = resumeLower.some(cSkill => 
      cSkill === sLower || 
      cSkill.includes(sLower) || 
      sLower.includes(cSkill)
    );
    
    if (isMatched) {
      matched.push(skill);
    } else {
      missing.push(skill);
    }
  });
  
  const extra = resumeSkills.filter(skill => {
    const sLower = skill.toLowerCase();
    return !jdLower.some(jSkill => 
      jSkill === sLower || 
      jSkill.includes(sLower) || 
      sLower.includes(jSkill)
    );
  });
  
  // Generate learning recommendations based on missing skills
  const recommendations = missing.map(skill => {
    const s = skill.toLowerCase();
    
    // Custom tailored learning advice
    if (s.includes('pytorch') || s.includes('tensorflow') || s.includes('keras')) {
      return { skill, suggestion: 'Complete deep learning specialization on Coursera/Fast.ai focusing on neural networks and gradient descent.' };
    }
    if (s.includes('docker') || s.includes('kubernetes') || s.includes('k8s')) {
      return { skill, suggestion: 'Study containerization and microservices architecture. Practice writing Dockerfiles and setting up local Kubernetes clusters (Minikube).' };
    }
    if (s.includes('aws') || s.includes('gcp') || s.includes('azure') || s.includes('cloud')) {
      return { skill, suggestion: 'Prepare for Cloud Practitioner or Solutions Architect certifications to master resource provisioning, security, and cloud deployment.' };
    }
    if (s.includes('mlops') || s.includes('ci/cd')) {
      return { skill, suggestion: 'Learn MLflow, Kubeflow, or build automated CI/CD pipelines for deployment using GitHub Actions or GitLab CI.' };
    }
    if (s.includes('vector') || s.includes('pinecone') || s.includes('faiss') || s.includes('rag') || s.includes('embeddings')) {
      return { skill, suggestion: 'Build a RAG project using LangChain/LlamaIndex and Pinecone or FAISS, learning semantic search principles.' };
    }
    if (s.includes('python') || s.includes('javascript') || s.includes('typescript') || s.includes('go') || s.includes('golang')) {
      return { skill, suggestion: `Strengthen core syntax and concurrency patterns in ${skill} by solving data structure exercises and building CLI utilities.` };
    }
    if (s.includes('sql') || s.includes('postgresql') || s.includes('mongodb') || s.includes('redis')) {
      return { skill, suggestion: `Learn database indexing, transactions, and query optimization for ${skill} databases.` };
    }
    return { skill, suggestion: `Review documentation and build a small side project to demonstrate basic proficiency in ${skill}.` };
  });

  return {
    matched,
    missing,
    extra,
    recommendations
  };
}
