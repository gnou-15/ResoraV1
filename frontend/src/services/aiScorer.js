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
  ],
  engineering: [
    { id: 'eng-1', company: 'Boeing', title: 'Mechanical Engineer', location: 'Seattle, WA (Hybrid)', matchScore: 92, salary: '$95k - $120k', logoColor: '#0033A0' },
    { id: 'eng-2', company: 'AECOM', title: 'Civil Engineer', location: 'Los Angeles, CA', matchScore: 86, salary: '$85k - $115k', logoColor: '#004B87' },
    { id: 'eng-3', company: 'Tesla', title: 'Electrical Design Engineer', location: 'Austin, TX', matchScore: 78, salary: '$110k - $145k', logoColor: '#CC0000' }
  ],
  safety: [
    { id: 'safe-1', company: 'Chevron', title: 'EHS Manager / Safety Officer', location: 'Houston, TX (On-site)', matchScore: 93, salary: '$105k - $135k', logoColor: '#005C8F' },
    { id: 'safe-2', company: 'Turner Construction', title: 'Construction Safety Coordinator', location: 'New York, NY', matchScore: 87, salary: '$80k - $100k', logoColor: '#1A365D' },
    { id: 'safe-3', company: 'OSHA Solutions', title: 'Occupational Health Specialist', location: 'Chicago, IL', matchScore: 75, salary: '$75k - $95k', logoColor: '#4A5568' }
  ],
  customs: [
    { id: 'cust-1', company: 'DHL Express', title: 'Customs Broker', location: 'Miami, FL (Hybrid)', matchScore: 91, salary: '$70k - $90k', logoColor: '#FFCC00' },
    { id: 'cust-2', company: 'FedEx Trade Networks', title: 'Import/Export Compliance Specialist', location: 'Memphis, TN', matchScore: 85, salary: '$75k - $95k', logoColor: '#4D148C' },
    { id: 'cust-3', company: 'Flexport', title: 'Trade Operations Coordinator', location: 'San Francisco, CA', matchScore: 79, salary: '$65k - $80k', logoColor: '#2D3748' }
  ],
  business: [
    { id: 'biz-1', company: 'Deloitte', title: 'Staff Accountant / Auditor', location: 'Chicago, IL (Hybrid)', matchScore: 94, salary: '$75k - $95k', logoColor: '#86BC25' },
    { id: 'biz-2', company: 'Goldman Sachs', title: 'Senior Financial Analyst', location: 'New York, NY', matchScore: 88, salary: '$110k - $140k', logoColor: '#002E6E' },
    { id: 'biz-3', company: 'H&R Block', title: 'Tax Consultant Specialist', location: 'Remote (US)', matchScore: 77, salary: '$60k - $80k', logoColor: '#00A859' }
  ],
  designer: [
    { id: 'dsgn-1', company: 'Figma', title: 'UI/UX Product Designer', location: 'San Francisco, CA (Hybrid)', matchScore: 93, salary: '$120k - $160k', logoColor: '#F24E1E' },
    { id: 'dsgn-2', company: 'Adobe', title: 'Senior Graphic Designer', location: 'San Jose, CA', matchScore: 89, salary: '$100k - $135k', logoColor: '#FF0000' },
    { id: 'dsgn-3', company: 'Mailchimp', title: 'Creative Specialist Intern', location: 'Atlanta, GA (Hybrid)', matchScore: 76, salary: '$35 - $45/hr', logoColor: '#FFE01B' }
  ],
  data: [
    { id: 'data-1', company: 'Netflix', title: 'Data Scientist', location: 'Los Gatos, CA (Hybrid)', matchScore: 95, salary: '$160k - $210k', logoColor: '#E50914' },
    { id: 'data-2', company: 'Amazon', title: 'Business Intelligence Analyst', location: 'Seattle, WA', matchScore: 88, salary: '$95k - $130k', logoColor: '#FF9900' },
    { id: 'data-3', company: 'Uber', title: 'Data Analyst Intern', location: 'San Francisco, CA', matchScore: 80, salary: '$40 - $55/hr', logoColor: '#000000' }
  ],
  sales: [
    { id: 'sales-1', company: 'Salesforce', title: 'Sales Account Executive', location: 'Chicago, IL (Hybrid)', matchScore: 92, salary: '$90k - $120k + Commission', logoColor: '#00A1E0' },
    { id: 'sales-2', company: 'HubSpot', title: 'Business Development Representative', location: 'Boston, MA', matchScore: 86, salary: '$65k - $85k base', logoColor: '#FF7A59' },
    { id: 'sales-3', company: 'ZoomInfo', title: 'Inside Sales Specialist', location: 'Vancouver, WA', matchScore: 78, salary: '$70k - $90k base', logoColor: '#1E3A8A' }
  ],
  hr: [
    { id: 'hr-1', company: 'Meta', title: 'HR Business Partner (HRBP)', location: 'Menlo Park, CA (Hybrid)', matchScore: 91, salary: '$120k - $155k', logoColor: '#0668E1' },
    { id: 'hr-2', company: 'LinkedIn', title: 'Recruiting Coordinator', location: 'Sunnyvale, CA', matchScore: 87, salary: '$75k - $95k', logoColor: '#0A66C2' },
    { id: 'hr-3', company: 'Workday', title: 'Human Resources Generalist', location: 'Pleasanton, CA', matchScore: 79, salary: '$85k - $110k', logoColor: '#E28743' }
  ]
};

/**
 * Evaluates the resume object and returns a detailed report
 * simulating calculations from LinkedIn / ATS APIs
 */
export function analyzeResume(resume, profession = 'it') {
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

  const isStudent = resume.userType === 'student';

  // ── Content Sufficiency Check ──
  // Estimate how many "lines" of content the resume would fill on a standard
  // letter-size page (8.5 × 11in). A full page is roughly 55 printable lines.
  // The midpoint is ~28 lines. We count filled sections and text volume to
  // determine if the resume has enough substance for a meaningful analysis.
  let estimatedLines = 0;

  // Header block: name, contact info → ~3 lines if present
  const hasName = personal.fullName?.trim();
  const hasEmail = personal.email?.trim();
  const hasPhone = personal.phoneNumber?.trim();
  const filledContactFields = [hasName, hasEmail, hasPhone, personal.linkedin?.trim(), personal.github?.trim(), personal.portfolio?.trim(), personal.location?.city?.trim()].filter(Boolean).length;
  if (filledContactFields > 0) estimatedLines += Math.min(3, Math.ceil(filledContactFields / 2));

  // Headline → 1 line
  if (headline?.trim()) estimatedLines += 2; // section header + content

  // Summary → approximately 1 line per 80 chars
  if (summary?.trim()) {
    estimatedLines += 2; // section header + spacing
    estimatedLines += Math.ceil(summary.length / 80);
  }

  // Skills → 1 line per category that has items
  let filledSkillCategories = 0;
  if (profession === 'it') {
    ['languages', 'frameworks', 'tools', 'databases', 'cloud'].forEach(k => {
      if (Array.isArray(technicalSkills[k]) && technicalSkills[k].length > 0) filledSkillCategories++;
    });
  } else {
    const rawSkills = resume.skills || '';
    const skillCount = typeof rawSkills === 'string'
      ? rawSkills.split(',').filter(s => s.trim()).length
      : Array.isArray(rawSkills) ? rawSkills.length : 0;
    if (skillCount > 0) filledSkillCategories = Math.ceil(skillCount / 5);

    const checkSubField = (val) => {
      if (!val) return 0;
      if (typeof val === 'string' && val.trim()) return 1;
      if (Array.isArray(val) && val.filter(Boolean).length > 0) return 1;
      return 0;
    };

    if (profession === 'healthcare') {
      filledSkillCategories += checkSubField(resume.license) + checkSubField(resume.clinicalSkills);
    } else if (profession === 'education') {
      filledSkillCategories += checkSubField(resume.teacherCert) + checkSubField(resume.subjects);
    } else if (profession === 'management') {
      filledSkillCategories += checkSubField(resume.managementCert) + checkSubField(resume.managementSkills);
    } else if (profession === 'engineering') {
      filledSkillCategories += checkSubField(resume.engineeringTools) + checkSubField(resume.engineeringMethods);
    } else if (profession === 'business') {
      filledSkillCategories += checkSubField(resume.accountingSoftware) + checkSubField(resume.cpaLicense);
    } else if (profession === 'customs') {
      filledSkillCategories += checkSubField(resume.regulatoryKnowledge) + checkSubField(resume.complianceSkills);
    } else if (profession === 'safety') {
      filledSkillCategories += checkSubField(resume.safetyCerts) + checkSubField(resume.safetyProtocols);
    } else if (profession === 'designer') {
      filledSkillCategories += checkSubField(resume.designTools) + checkSubField(resume.designSpecialties);
    } else if (profession === 'data') {
      filledSkillCategories += checkSubField(resume.analyticsTools) + checkSubField(resume.dataTechniques);
    } else if (profession === 'sales') {
      filledSkillCategories += checkSubField(resume.crmTools) + checkSubField(resume.salesMethods);
    } else if (profession === 'hr') {
      filledSkillCategories += checkSubField(resume.hrisTools) + checkSubField(resume.hrCompetencies);
    }
  }
  if (filledSkillCategories > 0) {
    estimatedLines += 2; // section header + spacing
    estimatedLines += filledSkillCategories;
  }

  // Education → ~3 lines per entry (school + degree + dates/gpa)
  const filledEducation_chk = education.filter(e => e.school || e.degree);
  if (filledEducation_chk.length > 0) {
    estimatedLines += 2; // section header + spacing
    filledEducation_chk.forEach(edu => {
      estimatedLines += 2; // school + degree line
      if (edu.gpa?.trim()) estimatedLines += 1;
      if (edu.coursework?.trim()) estimatedLines += Math.ceil(edu.coursework.length / 80);
    });
  }

  // Experience → ~2 lines per role header + 1 line per bullet
  const filledExp_chk = experience.filter(e => e.company || e.title);
  if (filledExp_chk.length > 0) {
    estimatedLines += 2; // section header + spacing
    filledExp_chk.forEach(job => {
      estimatedLines += 2; // company + title line
      const jobBullets = (job.bullets || []).filter(b => b && b.trim());
      estimatedLines += jobBullets.length;
    });
  }

  // Projects → ~2 lines per project header + 1 per bullet
  const filledProjects_chk = projects.filter(p => p.name);
  if (filledProjects_chk.length > 0) {
    estimatedLines += 2; // section header + spacing
    filledProjects_chk.forEach(proj => {
      estimatedLines += 1; // project name
      if (proj.stack?.trim()) estimatedLines += 1;
      const projBullets = (proj.bullets || []).filter(b => b && b.trim());
      estimatedLines += projBullets.length;
    });
  }

  // Certifications → 1 line each
  const filledCerts_chk = certifications.filter(c => c.name);
  if (filledCerts_chk.length > 0) {
    estimatedLines += 2;
    estimatedLines += filledCerts_chk.length;
  }

  // Achievements (students) → 1-2 lines each
  if (isStudent) {
    const filledAchievements = achievements.filter(a => a.title);
    if (filledAchievements.length > 0) {
      estimatedLines += 2;
      filledAchievements.forEach(a => {
        estimatedLines += 1;
        const aBullets = (a.bullets || []).filter(b => b && b.trim());
        estimatedLines += aBullets.length;
      });
    }
  }

  // Content threshold: ~44 lines = roughly 4/5 of a letter page
  const MIDPOINT_THRESHOLD = 44;

  if (estimatedLines < MIDPOINT_THRESHOLD) {
    // Build a list of missing sections to guide the user
    const missingSections = [];
    if (!hasName) missingSections.push('your full name');
    if (!hasEmail && !hasPhone) missingSections.push('contact details (email, phone)');
    if (!headline?.trim()) missingSections.push('a target role headline');
    if (!summary?.trim()) missingSections.push('a professional summary');
    if (filledSkillCategories === 0) missingSections.push('your key skills');
    if (filledExp_chk.length === 0) missingSections.push(isStudent ? 'internships or student org roles' : 'work experience');
    if (filledEducation_chk.length === 0 || (!filledEducation_chk[0].school && !filledEducation_chk[0].degree)) missingSections.push('education details');
    if (filledProjects_chk.length === 0) missingSections.push('projects');

    return {
      insufficientData: true,
      estimatedFill: Math.round((estimatedLines / 55) * 100), // percentage of page filled
      missingSections,
      score: 0,
      placement: '',
      placementColor: '#94a3b8',
      acceptancePercentage: 0,
      mascotMood: 'normal',
      tips: [],
      scoreBreakdown: { contact: 0, headline: 0, summary: 0, skills: 0, experience: 0, projects: 0 },
      jobs: []
    };
  }

  // ── Full Analysis (content is sufficient) ──
  const tips = [];
  const scoreBreakdown = {
    contact: 0,
    headline: 0,
    summary: 0,
    skills: 0,
    experience: 0,
    projects: 0
  };

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

  const needsGithubOrPortfolio = ["it", "data", "engineering"].includes(profession);
  const needsPortfolioOnly = ["designer", "education", "management", "sales", "hr"].includes(profession);
  const needsLicenseOnly = ["healthcare", "business"].includes(profession);

  if (needsGithubOrPortfolio) {
    const hasPortfolioOrGithub = personal.github?.trim() || personal.portfolio?.trim();
    if (hasPortfolioOrGithub) contactPoints += 3;
    else {
      tips.push({ id: 'portfolio', text: 'Add a link to your GitHub or portfolio to showcase work', impact: 3, category: 'contact', type: 'add' });
    }
  } else if (needsPortfolioOnly) {
    if (personal.portfolio?.trim()) contactPoints += 3;
    else {
      const label = profession === 'designer' ? 'Behance/Dribbble portfolio' :
        profession === 'education' ? 'teaching portfolio' :
          profession === 'sales' ? 'personal website' : 'portfolio';
      tips.push({ id: 'portfolio', text: `Add a link to your ${label} to showcase work`, impact: 3, category: 'contact', type: 'add' });
    }
  } else if (needsLicenseOnly) {
    if (personal.portfolio?.trim()) contactPoints += 3;
    else {
      const label = profession === 'healthcare' ? 'license number' : 'CPA / license';
      tips.push({ id: 'portfolio', text: `Add your ${label} to verify your credentials`, impact: 3, category: 'contact', type: 'add' });
    }
  } else {
    // Customs and safety need neither, award the points automatically
    contactPoints += 3;
  }
  scoreBreakdown.contact = contactPoints;

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
    const rawSkills = resume.skills || '';
    if (typeof rawSkills === 'string') {
      skillsCount = rawSkills.split(',').map(s => s.trim()).filter(Boolean).length;
    } else if (Array.isArray(rawSkills)) {
      skillsCount = rawSkills.length;
    }

    const countCommaSeparated = (val) => {
      if (!val) return 0;
      if (typeof val === 'string') {
        return val.split(',').map(s => s.trim()).filter(Boolean).length;
      }
      if (Array.isArray(val)) {
        return val.filter(Boolean).length;
      }
      return 0;
    };

    if (profession === 'healthcare') {
      skillsCount += countCommaSeparated(resume.license);
      if (Array.isArray(resume.clinicalSkills)) {
        skillsCount += resume.clinicalSkills.filter(Boolean).length;
      }
    } else if (profession === 'education') {
      skillsCount += countCommaSeparated(resume.teacherCert);
      if (Array.isArray(resume.subjects)) {
        skillsCount += resume.subjects.filter(Boolean).length;
      }
    } else if (profession === 'management') {
      skillsCount += countCommaSeparated(resume.managementCert);
      if (Array.isArray(resume.managementSkills)) {
        skillsCount += resume.managementSkills.filter(Boolean).length;
      }
    } else if (profession === 'engineering') {
      skillsCount += countCommaSeparated(resume.engineeringTools);
      skillsCount += countCommaSeparated(resume.engineeringMethods);
    } else if (profession === 'business') {
      skillsCount += countCommaSeparated(resume.accountingSoftware);
      skillsCount += countCommaSeparated(resume.cpaLicense);
    } else if (profession === 'customs') {
      skillsCount += countCommaSeparated(resume.regulatoryKnowledge);
      skillsCount += countCommaSeparated(resume.complianceSkills);
    } else if (profession === 'safety') {
      skillsCount += countCommaSeparated(resume.safetyCerts);
      skillsCount += countCommaSeparated(resume.safetyProtocols);
    } else if (profession === 'designer') {
      skillsCount += countCommaSeparated(resume.designTools);
      skillsCount += countCommaSeparated(resume.designSpecialties);
    } else if (profession === 'data') {
      skillsCount += countCommaSeparated(resume.analyticsTools);
      skillsCount += countCommaSeparated(resume.dataTechniques);
    } else if (profession === 'sales') {
      skillsCount += countCommaSeparated(resume.crmTools);
      skillsCount += countCommaSeparated(resume.salesMethods);
    } else if (profession === 'hr') {
      skillsCount += countCommaSeparated(resume.hrisTools);
      skillsCount += countCommaSeparated(resume.hrCompetencies);
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

  // 5. WORK EXPERIENCE BULLETS & QUALITY (Max 25 points)
  let expPoints = 0;
  const filledExp = experience.filter(e => e.company || e.title);

  // Collect metrics statistics and list of bullets that need metrics
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

  const metricPercentage = totalBullets > 0 ? (bulletsWithMetrics / totalBullets) : 0;

  if (isStudent) {
    // --- Student Experience Rubric (Max 25 points) ---
    if (filledExp.length > 0) {
      expPoints += 10; // has experience base

      // Bullets count check (min 2 bullets)
      if (totalBullets >= 2) {
        expPoints += 5;
      } else {
        tips.push({ id: 'exp_bullets_count', text: 'Add more descriptive bullet points under your experiences (minimum 2 total)', impact: 5, category: 'experience', type: 'improve' });
      }

      // Metrics check
      if (metricPercentage >= 0.5) {
        expPoints += 10;
      } else if (metricPercentage >= 0.2) {
        expPoints += 6;
        tips.push({
          id: 'exp_metrics_low',
          text: 'Add quantifiable metrics to your work or student Org bullets to prove impact!',
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
          text: 'Incorporate quantifiable results (percentages, sizes, frequencies) in experience bullets.',
          impact: 8,
          category: 'experience',
          type: 'improve',
          fixable: true,
          bulletsToFix: bulletsNoMetricsList
        });
      }
    } else {
      // Students get a default 12 points floor so lack of formal work history doesn't tank their score
      expPoints = 12;
      tips.push({
        id: 'experience',
        text: 'Add internships, part-time jobs, or school Org leadership roles to demonstrate initial experience.',
        impact: 13,
        category: 'experience',
        type: 'add'
      });
    }
  } else {
    // --- Professional Experience Rubric (Max 25 points) ---
    if (filledExp.length > 0) {
      expPoints += 10; // has experience base

      // Career depth: Multiple roles preferred
      if (filledExp.length >= 2) {
        expPoints += 5;
      } else {
        tips.push({ id: 'exp_roles_count', text: 'Add previous professional roles to demonstrate career progression.', impact: 5, category: 'experience', type: 'improve' });
      }

      // Bullets depth (min 3 per role or 5 total)
      if (totalBullets >= 5) {
        expPoints += 5;
      } else {
        tips.push({ id: 'exp_bullets_count', text: 'Add more accomplishments and bullet points under your professional experiences.', impact: 5, category: 'experience', type: 'improve' });
      }

      // Metrics checks
      if (metricPercentage >= 0.5) {
        expPoints += 5;
      } else if (metricPercentage >= 0.2) {
        expPoints += 3;
        tips.push({
          id: 'exp_metrics_low',
          text: 'Fewer than 50% of your experience bullets contain quantifiable results (%, numbers). Add metrics to prove impact!',
          impact: 2,
          category: 'experience',
          type: 'improve',
          fixable: true,
          bulletsToFix: bulletsNoMetricsList
        });
      } else {
        expPoints += 1;
        tips.push({
          id: 'exp_metrics_missing',
          text: 'Incorporate quantifiable results (percentages, revenue, savings, team scale) into your work experience bullets.',
          impact: 4,
          category: 'experience',
          type: 'improve',
          fixable: true,
          bulletsToFix: bulletsNoMetricsList
        });
      }
    } else {
      // Professionals get no floor points if experience is empty
      expPoints = 0;
      tips.push({
        id: 'experience',
        text: 'Add your work experience history to demonstrate your career track record.',
        impact: 25,
        category: 'experience',
        type: 'add'
      });
    }
  }
  scoreBreakdown.experience = expPoints;

  // 6. PROJECTS & CERTIFICATIONS & EXTRA (Max 15 points in breakdown)
  let projectsBreakdownPoints = 0;
  const filledProjects = projects.filter(p => p.name);
  const filledEducation = education.filter(e => e.school || e.degree);

  if (isStudent) {
    // Student Rubric: Education (15) + Projects (10) + Achievements (5) + Certs (5) = 35 total raw points
    let studentRawExtra = 0;

    // Education
    if (filledEducation.length > 0) {
      studentRawExtra += 5;
      const hasGPA = filledEducation.some(e => e.gpa?.trim());
      if (hasGPA) studentRawExtra += 5;
      else tips.push({ id: 'edu_gpa', text: 'Include your GPA if it is 3.0 or higher.', impact: 5, category: 'education', type: 'improve' });

      const hasCoursework = filledEducation.some(e => e.coursework?.trim());
      if (hasCoursework) studentRawExtra += 5;
      else tips.push({ id: 'edu_coursework', text: 'Add relevant coursework to showcase your academic focus.', impact: 5, category: 'education', type: 'improve' });
    } else {
      tips.push({ id: 'education', text: 'Add your university or college education details.', impact: 15, category: 'education', type: 'add' });
    }

    // Projects
    if (filledProjects.length > 0) {
      studentRawExtra += 5;
      const hasStack = filledProjects.some(p => p.stack?.trim());
      if (hasStack) studentRawExtra += 2;
      else tips.push({ id: 'proj_stack', text: 'Specify a tech stack for each of your projects', impact: 2, category: 'projects', type: 'improve' });

      const hasBullets = filledProjects.some(p => p.bullets?.some(b => b && b.trim()));
      if (hasBullets) studentRawExtra += 3;
    } else {
      tips.push({ id: 'projects', text: 'Add relevant projects to showcase practical application of your skills.', impact: 10, category: 'projects', type: 'add' });
    }

    // Achievements
    if (achievements.filter(a => a.title).length > 0) {
      studentRawExtra += 5;
    } else {
      tips.push({ id: 'achievements', text: 'Include honors, scholarship recognition, or coding competition achievements.', impact: 5, category: 'projects', type: 'add' });
    }

    // Certifications
    if (certifications.filter(c => c.name).length > 0) {
      studentRawExtra += 5;
    }

    // Scale 35 max raw points to 15 max breakdown points
    projectsBreakdownPoints = Math.round((studentRawExtra / 35) * 15);

  } else {
    // Professional Rubric: Education (5) + Projects (10) + Certs (10) = 25 total raw points
    // Achievements/GPA/Coursework are hidden/ignored entirely
    let profRawExtra = 0;

    // Education
    if (filledEducation.length > 0) {
      profRawExtra += 5;
    } else {
      tips.push({ id: 'education', text: 'Add your university or college education details.', impact: 5, category: 'education', type: 'add' });
    }

    // Projects
    if (filledProjects.length > 0) {
      profRawExtra += 5;
      const hasStack = filledProjects.some(p => p.stack?.trim());
      if (hasStack) profRawExtra += 2;
      else tips.push({ id: 'proj_stack', text: 'Specify a tech stack for each of your projects', impact: 2, category: 'projects', type: 'improve' });

      const hasBullets = filledProjects.some(p => p.bullets?.some(b => b && b.trim()));
      if (hasBullets) profRawExtra += 3;
    } else {
      tips.push({ id: 'projects', text: 'Add relevant projects to showcase practical application of your skills.', impact: 10, category: 'projects', type: 'add' });
    }

    // Certifications
    if (certifications.filter(c => c.name).length > 0) {
      profRawExtra += 10;
    } else {
      const certTipText =
        profession === 'it' ? 'Add industry-standard certifications (e.g. AWS, Azure, CompTIA) to prove technical expertise.' :
          profession === 'healthcare' ? 'Add clinical licenses or certifications (e.g. BLS, ACLS, nursing license) to verify compliance.' :
            profession === 'education' ? 'Add state teaching licenses, certifications, or endorsements.' :
              profession === 'management' ? 'Add professional certifications (e.g. PMP, Certified Scrum Master) to demonstrate leadership credentials.' :
                profession === 'engineering' ? 'Add engineering certifications or licenses (e.g. PE, SolidWorks Professional) to show specialized capability.' :
                  profession === 'business' ? 'Add financial or accounting certifications (e.g. CPA, CMA, QuickBooks User) to highlight credentials.' :
                    profession === 'customs' ? 'Add trade compliance certifications or a Customs Broker License to show credentials.' :
                      profession === 'safety' ? 'Add professional safety certifications (e.g. OSHA 30-Hour, NEBOSH, CSP) to verify compliance.' :
                        profession === 'designer' ? 'Add design tool certifications or credentials (e.g. Figma Certified Professional) to showcase expertise.' :
                          profession === 'data' ? 'Add analytics, cloud, or machine learning certifications to demonstrate technical skills.' :
                            profession === 'sales' ? 'Add sales training or CRM platform certifications (e.g. Salesforce Administrator) to prove ability.' :
                              profession === 'hr' ? 'Add HR professional certifications (e.g. SHRM-CP, PHR) to establish domain expertise.' :
                                'Add industry-standard certifications to prove expertise.';
      tips.push({ id: 'certifications', text: certTipText, impact: 10, category: 'projects', type: 'add' });
    }

    // Scale 25 max raw points to 15 max breakdown points
    projectsBreakdownPoints = Math.round((profRawExtra / 25) * 15);
  }
  scoreBreakdown.projects = projectsBreakdownPoints;

  // Calculate final score as the sum of all scaled scoreBreakdown values
  const scoreSum =
    scoreBreakdown.contact +
    scoreBreakdown.headline +
    scoreBreakdown.summary +
    scoreBreakdown.skills +
    scoreBreakdown.experience +
    scoreBreakdown.projects;

  const finalScore = Math.max(15, Math.min(100, Math.round(scoreSum)));

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
 * Contacts the Python FastAPI backend to evaluate the resume.
 * Falls back to the client-side JavaScript engine if the backend is offline.
 */
export async function fetchAPIAnalysis(resume, profession = 'it') {
  try {
    const response = await fetch("http://localhost:8000/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ resume, profession }),
    });

    if (response.ok) {
      return await response.json();
    }
    throw new Error("FastAPI server returned an error response status.");
  } catch (error) {
    console.warn("Python backend offline. Falling back to local JS scorer.", error);
    // Graceful fallback: run the local JS evaluation
    return analyzeResume(resume, profession);
  }
}

