/**
 * AI Scorer and Benchmarking Service
 * Simulates querying multiple professional platform APIs (LinkedIn, CareerBuilder, ResumeWorded)
 * to provide a comprehensive resume alignment score, candidate ranking, actionable feedback,
 * and an interactive metrics optimizer.
 */

const ACTION_VERBS = [
  'developed', 'led', 'designed', 'managed', 'optimized', 'built', 'created', 
  'implemented', 'improved', 'increased', 'decreased', 'delivered', 'automated', 
  'spearheaded', 'coordinated', 'engineered', 'launched', 'formulated', 'facilitated',
  'administered', 'structured', 'executed', 'designed', 'directed', 'reduced'
];

// Helper to check if a string contains action verbs
function hasActionVerb(text) {
  if (!text) return false;
  const words = text.toLowerCase().split(/\W+/);
  return words.some(word => ACTION_VERBS.includes(word));
}

// Helper to check if a string contains numbers or metrics
function hasMetrics(text) {
  if (!text) return false;
  // Look for numbers, percentages, dollar signs, or time periods (e.g. 50%, $10k, 12 months, 5x, 300+)
  const hasNumber = /\d+/.test(text);
  const hasMetricSymbol = /[%$]/.test(text);
  const hasMetricKeywords = /\b(percent|dollars|million|thousand|users|hours|weeks|months|years|increase|decrease|growth|reduction|revenue|speed|latency)\b/i.test(text);
  
  return hasNumber || hasMetricSymbol || (hasNumber && hasMetricKeywords);
}

// Standard templates for rewrites based on profession
const METRIC_TEMPLATES = {
  it: [
    "improving loading performance by {metric}% and increasing user retention",
    "reducing server latency by {metric}% for over {scale}+ daily active users",
    "delivering {metric}+ new features under an Agile framework, {scale} weeks ahead of schedule",
    "automating workflows to save the team {metric} hours of manual effort per week",
    "resulting in a {metric}% code coverage increase and {scale}% fewer production bugs"
  ],
  healthcare: [
    "maintaining a {metric}% patient satisfaction rating across {scale}+ patient interactions daily",
    "reducing patient check-in wait times by {metric}% through workflow streamlining",
    "administering medications with {metric}% accuracy in compliance with ICU protocols",
    "leading a care team of {metric} nurses to manage a unit of {scale}+ beds",
    "collaborating on a clinical study that reduced post-op recovery times by {metric}%"
  ],
  education: [
    "improving average student exam scores by {metric}% over one academic term",
    "designing dynamic lesson plans used by {metric}+ students across {scale} grade levels",
    "achieving a {metric}% parent-teacher conference satisfaction rating",
    "managing a classroom of {metric} students while maintaining a {scale}% engagement rate",
    "training {metric} fellow teachers on new LMS tools, saving {scale} hours of prep time weekly"
  ],
  management: [
    "delivering project {metric}% under budget, saving the company ${scale}k",
    "directing a cross-functional team of {metric} members to launch a new product line",
    "improving team operational efficiency by {metric}% using Kanban methodologies",
    "managing a project portfolio valued at ${metric}M with a {scale}% client satisfaction score",
    "reducing onboarding cycle times by {metric}% for {scale}+ new hires"
  ]
};

// Generate smart suggestions to add metrics to a bullet point
export function getMetricSuggestions(bulletText, profession = 'it') {
  const templates = METRIC_TEMPLATES[profession] || METRIC_TEMPLATES.it;
  
  // Pick random values to populate templates realistically
  const metrics = [15, 25, 40, 80, 5, 10];
  const scales = [100, 500, 10, 3, 20, 50];
  
  return templates.map((template, idx) => {
    const m = metrics[idx % metrics.length];
    const s = scales[idx % scales.length];
    const textSnippet = template.replace('{metric}', m).replace('{scale}', s);
    
    // Smooth transition: remove trailing period if it exists in original text
    const cleanBullet = bulletText.trim().replace(/\.$/, '');
    return {
      id: `suggestion-${idx}`,
      text: `${cleanBullet}, ${textSnippet}.`,
      valueToAdd: `, ${textSnippet}`
    };
  });
}

// Mock job postings corresponding to professions
const MOCK_JOBS = {
  it: [
    { id: 'it-1', company: 'Google', title: 'Software Engineer', location: 'Mountain View, CA (Hybrid)', matchScore: 94, salary: '$135k - $175k', logoColor: '#4285F4' },
    { id: 'it-2', company: 'Canva', title: 'React Frontend Developer', location: 'Remote (US)', matchScore: 88, salary: '$100k - $130k', logoColor: '#7D2AE8' },
    { id: 'it-3', company: 'Stripe', title: 'Full Stack Engineer Intern', location: 'San Francisco, CA', matchScore: 78, salary: '$45 - $55/hr', logoColor: '#635BFF' },
    { id: 'it-4', company: 'AWS', title: 'Cloud Solutions Architect', location: 'Seattle, WA', matchScore: 65, salary: '$140k - $190k', logoColor: '#FF9900' }
  ],
  healthcare: [
    { id: 'hc-1', company: 'Mayo Clinic', title: 'ICU Registered Nurse', location: 'Rochester, MN', matchScore: 95, salary: '$85k - $110k', logoColor: '#005CA9' },
    { id: 'hc-2', company: 'Cleveland Clinic', title: 'Clinical Nursing Supervisor', location: 'Cleveland, OH (On-site)', matchScore: 89, salary: '$95k - $120k', logoColor: '#00A499' },
    { id: 'hc-3', company: 'HCA Healthcare', title: 'Staff Nurse - Pediatrics', location: 'Nashville, TN', matchScore: 81, salary: '$75k - $90k', logoColor: '#D32F2F' }
  ],
  education: [
    { id: 'edu-1', company: 'Oakridge Academy', title: 'High School Mathematics Teacher', location: 'Boston, MA', matchScore: 96, salary: '$55k - $72k', logoColor: '#1B5E20' },
    { id: 'edu-2', company: 'EdTech Solutions', title: 'Curriculum Development Specialist', location: 'Austin, TX (Remote)', matchScore: 87, salary: '$70k - $90k', logoColor: '#0D47A1' },
    { id: 'edu-3', company: 'STEM Charter School', title: 'Lead Robotics Instructor', location: 'Denver, CO', matchScore: 76, salary: '$60k - $75k', logoColor: '#E65100' }
  ],
  management: [
    { id: 'mgt-1', company: 'Microsoft', title: 'Technical Project Manager', location: 'Redmond, WA (Hybrid)', matchScore: 93, salary: '$125k - $160k', logoColor: '#F25022' },
    { id: 'mgt-2', company: 'Salesforce', title: 'Agile Product Owner', location: 'San Francisco, CA', matchScore: 86, salary: '$110k - $145k', logoColor: '#00A1E0' },
    { id: 'mgt-3', company: 'Global Logistics Co.', title: 'Operations Lead Manager', location: 'Chicago, IL', matchScore: 74, salary: '$95k - $125k', logoColor: '#37474F' }
  ]
};

/**
 * Evaluates the resume object and returns a detailed report
 * simulating calculations from LinkedIn / ATS APIs
 */
export function analyzeResume(resume, profession = 'it') {
  let score = 0;
  const tips = [];
  const scoreBreakdown = {
    contact: 0,
    headline: 0,
    summary: 0,
    skills: 0,
    experience: 0,
    projects: 0
  };

  const {
    personal = {},
    headline = '',
    summary = '',
    technicalSkills = {},
    education = [],
    projects = [],
    experience = [],
    certifications = [],
    achievements = []
  } = resume;

  // 1. CONTACT INFO COMPLETENESS (Max 15 points)
  let contactPoints = 0;
  if (personal.email?.trim()) contactPoints += 3;
  else tips.push({ id: 'email', text: 'Provide a professional email address', impact: 3, category: 'contact', type: 'add' });

  if (personal.phoneNumber?.trim()) contactPoints += 3;
  else tips.push({ id: 'phone', text: 'Add your phone number for recruiter outreach', impact: 3, category: 'contact', type: 'add' });

  if (personal.location?.city?.trim()) contactPoints += 3;
  else tips.push({ id: 'location', text: 'Specify your location (City, Country)', impact: 3, category: 'contact', type: 'add' });

  if (personal.linkedin?.trim()) contactPoints += 3;
  else tips.push({ id: 'linkedin', text: 'Add your LinkedIn profile link to compare with industry benchmarks', impact: 3, category: 'contact', type: 'add' });

  const hasPortfolioOrGithub = personal.github?.trim() || personal.portfolio?.trim();
  if (hasPortfolioOrGithub) contactPoints += 3;
  else {
    const label = profession === 'it' ? 'GitHub or portfolio' : 'portfolio or website';
    tips.push({ id: 'portfolio', text: `Add a links to your ${label} to showcase work`, impact: 3, category: 'contact', type: 'add' });
  }
  scoreBreakdown.contact = contactPoints;
  score += contactPoints;

  // 2. HEADLINE & TARGET ROLE (Max 10 points)
  let headlinePoints = 0;
  if (headline?.trim()) {
    if (headline.length >= 15) {
      headlinePoints = 10;
    } else {
      headlinePoints = 6;
      tips.push({ id: 'headline_len', text: 'Expand target role headline to include main keyword tags (e.g. React, Docker)', impact: 4, category: 'headline', type: 'improve' });
    }
  } else {
    tips.push({ id: 'headline', text: 'Add a target role headline to capture ATS search filters', impact: 10, category: 'headline', type: 'add' });
  }
  scoreBreakdown.headline = headlinePoints;
  score += headlinePoints;

  // 3. PROFESSIONAL SUMMARY (Max 15 points)
  let summaryPoints = 0;
  if (summary?.trim()) {
    const len = summary.length;
    if (len >= 80 && len <= 320) {
      summaryPoints += 10;
    } else if (len > 320) {
      summaryPoints += 6;
      tips.push({ id: 'summary_long', text: 'Shorten your summary to be more concise (under 320 characters)', impact: 4, category: 'summary', type: 'improve' });
    } else {
      summaryPoints += 6;
      tips.push({ id: 'summary_short', text: 'Expand your summary to clearly highlight your objective and top competencies (min 80 characters)', impact: 4, category: 'summary', type: 'improve' });
    }

    if (hasActionVerb(summary)) {
      summaryPoints += 5;
    } else {
      tips.push({ id: 'summary_verbs', text: 'Incorporate active verbs (e.g. built, managed) in your professional summary', impact: 5, category: 'summary', type: 'improve' });
    }
  } else {
    tips.push({ id: 'summary', text: 'Write a professional summary to quickly brief recruiters on your background', impact: 15, category: 'summary', type: 'add' });
  }
  scoreBreakdown.summary = summaryPoints;
  score += summaryPoints;

  // 4. KEY SKILLS ALIGNMENT (Max 20 points)
  let skillsPoints = 0;
  let skillsCount = 0;

  if (profession === 'it') {
    const keys = ['languages', 'frameworks', 'tools', 'databases', 'cloud'];
    keys.forEach(k => {
      if (Array.isArray(technicalSkills[k])) {
        skillsCount += technicalSkills[k].length;
      }
    });
  } else {
    // Other professions use a comma-separated key skills text or array
    const rawSkills = resume.skills || '';
    if (typeof rawSkills === 'string') {
      skillsCount = rawSkills.split(',').map(s => s.trim()).filter(Boolean).length;
    } else if (Array.isArray(rawSkills)) {
      skillsCount = rawSkills.length;
    }

    // Include sub-lists if healthcare/management/edu
    if (profession === 'healthcare' && Array.isArray(resume.clinicalSkills)) {
      skillsCount += resume.clinicalSkills.filter(Boolean).length;
    }
    if (profession === 'management' && Array.isArray(resume.managementSkills)) {
      skillsCount += resume.managementSkills.filter(Boolean).length;
    }
    if (profession === 'education' && Array.isArray(resume.subjects)) {
      skillsCount += resume.subjects.filter(Boolean).length;
    }
  }

  if (skillsCount >= 10) {
    skillsPoints = 20;
  } else if (skillsCount >= 5) {
    skillsPoints = 14;
    tips.push({ id: 'skills_count_low', text: 'Include at least 10 core skills to increase ATS matching options', impact: 6, category: 'skills', type: 'improve' });
  } else if (skillsCount > 0) {
    skillsPoints = 8;
    tips.push({ id: 'skills_count_critical', text: 'Expand your key skills listing. Recruiters search directly for these terms', impact: 12, category: 'skills', type: 'improve' });
  } else {
    tips.push({ id: 'skills', text: 'Populate your skills list to enable industry match ranking calculations', impact: 20, category: 'skills', type: 'add' });
  }
  scoreBreakdown.skills = skillsPoints;
  score += skillsPoints;

  // 5. WORK EXPERIENCE BULLETS & QUALITY (Max 25 points)
  let expPoints = 0;
  const filledExp = experience.filter(e => e.company || e.title);
  
  if (filledExp.length > 0) {
    expPoints += 10; // has experience

    // Check bullets
    let totalBullets = 0;
    let bulletsWithMetrics = 0;
    const bulletsNoMetricsList = [];

    filledExp.forEach(job => {
      const jobBullets = (job.bullets || []).filter(b => b && b.trim());
      totalBullets += jobBullets.length;
      
      jobBullets.forEach((bullet, idx) => {
        if (hasMetrics(bullet)) {
          bulletsWithMetrics++;
        } else {
          bulletsNoMetricsList.push({
            jobId: job.id,
            company: job.company || 'Current Role',
            bulletIndex: idx,
            text: bullet
          });
        }
      });
    });

    // Score bullets count
    if (totalBullets >= 3) {
      expPoints += 5;
    } else {
      tips.push({ id: 'exp_bullets_count', text: 'Add more descriptive bullet points under your work experiences (minimum 3 total)', impact: 5, category: 'experience', type: 'improve' });
    }

    // Score metrics presence (10 points max)
    if (totalBullets > 0) {
      const metricPercentage = bulletsWithMetrics / totalBullets;
      if (metricPercentage >= 0.5) {
        expPoints += 10;
      } else if (metricPercentage >= 0.2) {
        expPoints += 6;
        tips.push({ 
          id: 'exp_metrics_low', 
          text: 'Fewer than 50% of your experience bullets contain quantifiable results (%, numbers). Add metrics to prove impact!', 
          impact: 4, 
          category: 'experience', 
          type: 'improve',
          fixable: true,
          bulletsToFix: bulletsNoMetricsList
        });
      } else {
        expPoints += 2;
        tips.push({ 
          id: 'exp_metrics_missing', 
          text: 'No quantifiable results (percentages, savings, scales) found in work bullets. Recruiter ATS tools score these highly', 
          impact: 8, 
          category: 'experience', 
          type: 'improve',
          fixable: true,
          bulletsToFix: bulletsNoMetricsList
        });
      }
    }
  } else {
    tips.push({ id: 'experience', text: 'Add at least one relevant work experience role (use internships or project roles if student)', impact: 25, category: 'experience', type: 'add' });
  }
  scoreBreakdown.experience = expPoints;
  score += expPoints;

  // 6. PROJECTS & CERTIFICATIONS & EXTRA (Max 15 points)
  let projectPoints = 0;
  const filledProjects = projects.filter(p => p.name);
  if (filledProjects.length > 0) {
    projectPoints += 5;
    const hasStack = filledProjects.some(p => p.stack?.trim());
    if (hasStack) projectPoints += 3;
    else tips.push({ id: 'proj_stack', text: 'Specify a tech stack for each of your technical projects', impact: 3, category: 'projects', type: 'improve' });
  } else {
    tips.push({ id: 'projects', text: 'Add relevant projects to showcase practical application of your skills', impact: 8, category: 'projects', type: 'add' });
  }

  if (certifications.filter(c => c.name).length > 0) {
    projectPoints += 4;
  } else {
    tips.push({ id: 'certifications', text: 'Add standard industry certifications (proves dedication to professional growth)', impact: 4, category: 'projects', type: 'add' });
  }

  if (achievements.filter(a => a.title).length > 0) {
    projectPoints += 3;
  } else if (resume.userType === 'student') {
    tips.push({ id: 'achievements', text: 'Include honors, scholarship recognition, or coding competition achievements', impact: 3, category: 'projects', type: 'add' });
  }
  
  scoreBreakdown.projects = projectPoints;
  score += projectPoints;

  // Cap final score at 100% just in case of rounding errors
  const finalScore = Math.max(15, Math.min(100, Math.round(score)));

  // Generate percentiles and placement prompts
  let placement = "Needs Optimization";
  let placementColor = "#ef4444"; // red
  let acceptancePercentage = 15;
  let mascotMood = "normal";

  if (finalScore >= 90) {
    placement = "Top 5% of Applicants";
    placementColor = "#16a34a"; // green
    acceptancePercentage = 95;
    mascotMood = "excited";
  } else if (finalScore >= 75) {
    placement = "Top 15% of Applicants";
    placementColor = "#10b981"; // emerald
    acceptancePercentage = 85;
    mascotMood = "normal"; // Or excited
  } else if (finalScore >= 60) {
    placement = "Top 30% of Applicants";
    placementColor = "#eab308"; // yellow
    acceptancePercentage = 65;
    mascotMood = "normal";
  } else if (finalScore >= 40) {
    placement = "Top 50% of Applicants";
    placementColor = "#f97316"; // orange
    acceptancePercentage = 42;
    mascotMood = "normal";
  } else {
    placement = "Needs Structural Fixes (Bottom 50%)";
    placementColor = "#ef4444"; // red
    acceptancePercentage = 18;
    mascotMood = "shy"; // or worried / shy
  }

  // Get matching mock jobs based on the profession
  const jobs = MOCK_JOBS[profession] || MOCK_JOBS.it;
  // Calculate relative match scores dynamically based on user score
  const calibratedJobs = jobs.map(job => {
    // Map job match score relative to user's overall resume score
    const userOffset = Math.round((finalScore - 50) * 0.4); 
    const dynamicMatch = Math.min(99, Math.max(35, job.matchScore + userOffset));
    return {
      ...job,
      matchScore: dynamicMatch
    };
  });

  return {
    score: finalScore,
    placement,
    placementColor,
    acceptancePercentage,
    mascotMood,
    tips,
    scoreBreakdown,
    jobs: calibratedJobs
  };
}

/**
 * Simulates a multi-source API call (LinkedIn + CareerBuilder + ResumeWorded)
 * Returns a promise that resolves after a specified duration to simulate network delay.
 */
export function fetchAPIAnalysis(resume, profession = 'it') {
  return new Promise((resolve) => {
    setTimeout(() => {
      const result = analyzeResume(resume, profession);
      resolve(result);
    }, 1200); // 1.2 second mock latency for premium feel
  });
}
