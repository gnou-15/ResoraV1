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

export function isResumeEmpty(resume) {
  if (!resume) return true;

  const hasHeadline = !!(resume.headline && resume.headline.trim());
  const hasSummary = !!(resume.summary && resume.summary.trim());

  const techSkills = resume.technicalSkills;
  const hasTech = techSkills && Object.values(techSkills).some((arr) =>
    Array.isArray(arr) ? arr.some((s) => s && s.trim()) : (typeof arr === 'string' && arr.trim())
  );
  const hasGeneralSkills = !!(resume.skills && (Array.isArray(resume.skills) ? resume.skills.length > 0 : resume.skills.trim()));

  const hasExp = !!(resume.experience && resume.experience.some((e) =>
    (e.company && e.company.trim()) ||
    (e.title && e.title.trim()) ||
    (e.bullets && e.bullets.some((b) => b && b.trim()))
  ));

  const hasEdu = !!(resume.education && resume.education.some((e) =>
    (e.school && e.school.trim()) ||
    (e.degree && e.degree.trim()) ||
    (e.coursework && e.coursework.trim())
  ));

  const hasProj = !!(resume.projects && resume.projects.some((p) =>
    (p.name && p.name.trim()) ||
    (p.stack && p.stack.trim()) ||
    (p.bullets && p.bullets.some((b) => b && b.trim()))
  ));

  const hasAch = !!(resume.achievements && resume.achievements.some((a) =>
    (a.title && a.title.trim()) ||
    (a.organization && a.organization.trim())
  ));

  const hasCert = !!(resume.certifications && resume.certifications.some((c) =>
    (c.name && c.name.trim()) ||
    (c.issuer && c.issuer.trim())
  ));

  const hasLic = !!(resume.licenses && resume.licenses.some((l) =>
    (l.name && l.name.trim())
  ));

  return !hasHeadline && !hasSummary && !hasTech && !hasGeneralSkills && !hasExp && !hasEdu && !hasProj && !hasAch && !hasCert && !hasLic;
}

export { getCountryByCode }

