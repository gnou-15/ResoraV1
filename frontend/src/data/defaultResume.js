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

  if (data.technicalSkills) {
    const tech = { ...data.technicalSkills };
    // Normalize any string fields into arrays for consistency
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

    return {
      ...defaultResume,
      ...data,
      skills: data.skills || (tech.languages && Array.isArray(tech.languages) ? tech.languages.join(', ') : ''),
      technicalSkills: { ...defaultResume.technicalSkills, ...tech },
      personal: migratePersonal(data.personal),
    };
  }


  const skills = Array.isArray(data.skills)
    ? data.skills.filter(Boolean)
    : typeof data.skills === 'string'
    ? data.skills.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  return {
    ...defaultResume,
    personal: migratePersonal(data.personal),
    headline: data.headline ?? '',
    summary: data.summary ?? '',
    technicalSkills: {
      languages: skills,
      frameworks: [],
      tools: [],
      databases: [],
      cloud: [],
    },
    education: (data.education ?? defaultResume.education).map((edu) => ({
      id: edu.id ?? createId(),
      school: edu.school ?? '',
      degree: edu.degree ?? '',
      field: edu.field ?? '',
      endDate: edu.endDate ?? '',
      gpa: edu.gpa ?? edu.details ?? '',
      latinHonors: edu.latinHonors ?? '',
      coursework: edu.coursework ?? '',
    })),
    projects: (data.projects ?? defaultResume.projects).map((proj) => ({
      id: proj.id ?? createId(),
      name: proj.name ?? '',
      link: proj.link ?? '',
      stack: proj.stack ?? proj.technologies ?? '',
      bullets: proj.bullets ?? (proj.description ? [proj.description] : ['']),
    })),
    experience: data.experience ?? defaultResume.experience,
    achievements: (data.achievements ?? defaultResume.achievements).map((a) => ({
      id: a.id ?? createId(),
      title: a.title ?? '',
      organization: a.organization ?? '',
      date: a.date ?? '',
      distinction: a.distinction ?? '',
      bullets: a.bullets ?? [''],
    })),
    userType: data.userType ?? defaultResume.userType,
    certifications: data.certifications ?? defaultResume.certifications,
    licenses: data.licenses ?? defaultResume.licenses ?? [],
  }
}

export { getCountryByCode }
