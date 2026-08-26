import { getCountryByCode } from './countries'

export function createId() {
  return crypto.randomUUID()
}

export const defaultLocation = {
  country: 'PH',
  state: '',
  city: '',
  barangay: '',
  street: '',
}

export const defaultResume = {
  personal: {
    fullName: '',
    email: '',
    phoneCountry: 'PH',
    phoneNumber: '',
    location: { ...defaultLocation },
    github: '',
    linkedin: '',
    portfolio: '',
  },
  headline: '',
  summary: '',
  technicalSkills: {
    languages: [],
    frameworks: [],
    tools: [],
    databases: [],
    cloud: [],
  },
  education: [
    {
      id: createId(),
      school: '',
      degree: '',
      field: '',
      endDate: '',
      gpa: '',
      latinHonors: '',
      coursework: '',
    },
  ],
  projects: [
    {
      id: createId(),
      name: '',
      link: '',
      stack: '',
      bullets: [''],
    },
  ],
  experience: [
    {
      id: createId(),
      company: '',
      title: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [''],
    },
  ],
  certifications: [
    {
      id: createId(),
      name: '',
      issuer: '',
      date: '',
    },
  ],
  licenses: [
    {
      id: createId(),
      name: '',
      issuer: '',
      number: '',
      date: '',
    },
  ],
  userType: 'professional',
  achievements: [
    {
      id: createId(),
      title: '',
      organization: '',
      date: '',
      distinction: '',
      bullets: [''],
    },
  ],
}

export const skillCategories = [
  { key: 'languages', label: 'Languages', placeholder: 'Java, Python, JavaScript, C++, SQL' },
  { key: 'frameworks', label: 'Frameworks & Libraries', placeholder: 'React, Spring Boot, Node.js, .NET' },
  { key: 'tools', label: 'Tools & DevOps', placeholder: 'Git, Docker, Jenkins, Linux, Jira' },
  { key: 'databases', label: 'Databases', placeholder: 'PostgreSQL, MongoDB, MySQL, Redis' },
  { key: 'cloud', label: 'Cloud & Platforms', placeholder: 'AWS, Azure, GCP, Firebase' },
]

function migratePersonal(personal) {
  if (!personal) return { ...defaultResume.personal }

  const hasStructuredLocation =
    personal.location && typeof personal.location === 'object'

  const legacyPhone = personal.phone ?? ''
  const legacyLocation = typeof personal.location === 'string' ? personal.location : ''

  return {
    fullName: personal.fullName ?? '',
    email: personal.email ?? '',
    phoneCountry: personal.phoneCountry ?? 'PH',
    phoneNumber: personal.phoneNumber ?? legacyPhone,
    location: hasStructuredLocation
      ? { ...defaultLocation, ...personal.location }
      : {
          ...defaultLocation,
          city: legacyLocation,
        },
    github: personal.github ?? '',
    linkedin: personal.linkedin ?? '',
    portfolio: personal.portfolio ?? personal.website ?? '',
  }
}

export function migrateResume(data) {
  if (!data) return defaultResume

  const tech = data.technicalSkills ? { ...data.technicalSkills } : null;
  if (tech) {
    ['languages', 'frameworks', 'tools', 'databases', 'cloud'].forEach(
      (k) => {
        if (typeof tech[k] === 'string') {
          tech[k] = tech[k]
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        } else if (!Array.isArray(tech[k])) {
          tech[k] = tech[k] ? [tech[k]] : [];
        }
      },
    );
  }

  const skills = Array.isArray(data.skills)
    ? data.skills.filter(Boolean)
    : typeof data.skills === 'string'
    ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return {
    ...defaultResume,
    ...data,
    personal: migratePersonal(data.personal),
    headline: data.headline ?? '',
    summary: data.summary ?? '',
    skills: data.skills || (tech && tech.languages ? tech.languages.join(', ') : ''),
    technicalSkills: tech
      ? { ...defaultResume.technicalSkills, ...tech }
      : {
          languages: skills,
          frameworks: [],
          tools: [],
          databases: [],
          cloud: [],
        },
    education: (data.education && data.education.length > 0 ? data.education : defaultResume.education).map((edu) => ({
      id: edu.id ?? createId(),
      school: edu.school ?? '',
      degree: edu.degree ?? '',
      field: edu.field ?? '',
      endDate: edu.endDate ?? '',
      gpa: edu.gpa ?? edu.details ?? '',
      latinHonors: edu.latinHonors ?? '',
      coursework: edu.coursework ?? '',
    })),
    projects: (data.projects && data.projects.length > 0 ? data.projects : defaultResume.projects).map((proj) => ({
      id: proj.id ?? createId(),
      name: proj.name ?? '',
      link: proj.link ?? '',
      stack: proj.stack ?? proj.technologies ?? '',
      bullets: Array.isArray(proj.bullets) ? proj.bullets : (proj.description ? [proj.description] : ['']),
    })),
    experience: (data.experience && data.experience.length > 0 ? data.experience : defaultResume.experience).map((exp) => ({
      id: exp.id ?? createId(),
      company: exp.company ?? '',
      title: exp.title ?? '',
      location: exp.location ?? '',
      startDate: exp.startDate ?? '',
      endDate: exp.endDate ?? '',
      current: exp.current ?? false,
      bullets: Array.isArray(exp.bullets) ? exp.bullets : (exp.description ? [exp.description] : ['']),
    })),
    achievements: (data.achievements && data.achievements.length > 0 ? data.achievements : defaultResume.achievements).map((a) => ({
      id: a.id ?? createId(),
      title: a.title ?? '',
      organization: a.organization ?? '',
      date: a.date ?? '',
      distinction: a.distinction ?? '',
      bullets: Array.isArray(a.bullets) ? a.bullets : [''],
    })),
    userType: data.userType ?? defaultResume.userType,
    certifications: data.certifications ?? defaultResume.certifications,
    licenses: data.licenses ?? defaultResume.licenses ?? [],
  }
}


/**
 * Calculates how much of the resume a real user has filled in.
 *
 * IMPORTANT: Template-seeded fields (headline, summary, skills, education degree,
 * coursework) are intentionally excluded because every profession template
 * pre-populates them — they do not prove the user engaged.
 *
 * We only score fields the user must type themselves:
 *   - Personal contact info  (email, phone, location, socials)    → 35 pts
 *   - Experience entries with real company + title                 → 30 pts
 *   - Education entries with a real school name the user typed     → 15 pts
 *   - Projects with a real name                                    → 10 pts
 *   - Certifications or Achievements with a real name/title        → 10 pts
 *
 * Returns a value 0–100. A resume scoring ≥ 40 is considered
 * sufficiently filled to be shown as the user's "main resume".
 */
export function getResumeFillScore(resume) {
  if (!resume) return 0;

  let score = 0;

  // ── Personal contact info (35 pts) ────────────────────────────────────────
  const p = resume.personal || {};
  if (p.email && p.email.trim())            score += 10;
  if (p.phoneNumber && p.phoneNumber.trim()) score += 8;
  const loc = p.location || {};
  if ((loc.city && loc.city.trim()) || (loc.state && loc.state.trim())) score += 7;
  if ((p.linkedin && p.linkedin.trim()) ||
      (p.github && p.github.trim()) ||
      (p.portfolio && p.portfolio.trim()))  score += 10;

  // ── Experience: real entries require BOTH company AND title (30 pts) ───────
  const realExp = (resume.experience || []).filter(
    (e) => (e.company && e.company.trim()) && (e.title && e.title.trim())
  );
  if (realExp.length >= 1) score += 20;
  if (realExp.length >= 2) score += 10;

  // ── Education: school name the user typed (15 pts) ────────────────────────
  // Template leaves school = '' — so a filled school is real user input.
  const realEdu = (resume.education || []).filter(
    (e) => e.school && e.school.trim()
  );
  if (realEdu.length >= 1) score += 15;

  // ── Projects with a real name (10 pts) ────────────────────────────────────
  const realProj = (resume.projects || []).filter(
    (p) => p.name && p.name.trim()
  );
  if (realProj.length >= 1) score += 10;

  // ── Certifications or Achievements (10 pts) ───────────────────────────────
  const hasCert = (resume.certifications || []).some((c) => c.name && c.name.trim());
  const hasAch  = (resume.achievements || []).some((a) => a.title && a.title.trim());
  if (hasCert || hasAch) score += 10;

  return Math.min(score, 100);
}

/**
 * Returns true if the resume is sufficiently filled (≥ 40%) to be
 * treated as the user's active/main resume on the landing page.
 */
export function hasSufficientContent(resume) {
  return getResumeFillScore(resume) >= 40;
}

/**
 * Returns true if the resume has NO real content at all.
 * Uses getResumeFillScore to stay consistent.
 */
export function isResumeEmpty(resume) {
  if (!resume) return true;
  return getResumeFillScore(resume) === 0;
}

export { getCountryByCode }

