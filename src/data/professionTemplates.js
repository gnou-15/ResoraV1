import { createId } from './defaultResume'

const IT_TEMPLATE = {
  personal: {
    fullName: '',
    email: '',
    phoneCountry: 'PH',
    phoneNumber: '',
    location: { country: 'PH', state: '', city: '', barangay: '', street: '' },
    github: '',
    linkedin: '',
    portfolio: '',
  },
  headline: 'Software Developer | React, Node.js, PostgreSQL',
  summary:
    'Full-stack developer with experience building scalable web applications. Strong in JavaScript, React, and backend APIs. Seeking an entry-level software engineering role.',
  technicalSkills: {
    languages: ['JavaScript', 'TypeScript', 'Python'],
    frameworks: ['React', 'Node.js', 'Express'],
    tools: ['Git', 'Docker', 'Vite'],
    databases: ['PostgreSQL', 'MongoDB'],
    cloud: ['AWS'],
  },
  projects: [
    {
      id: createId(),
      name: 'Full-Stack Portfolio',
      link: '',
      stack: 'React, Node.js, PostgreSQL',
      bullets: ['Built responsive UI with React and TypeScript', 'Implemented REST API with Express and PostgreSQL'],
    },
  ],
  education: [
    {
      id: createId(),
      school: '',
      degree: 'B.S. Computer Science',
      field: '',
      endDate: '',
      gpa: '',
      coursework: 'Data Structures, Algorithms, Databases',
    },
  ],
  userType: 'professional',
}

const HEALTHCARE_TEMPLATE = {
  headline: 'Registered Nurse | Patient Care, EMR',
  summary:
    'Compassionate registered nurse with clinical experience delivering high-quality patient care in fast-paced environments. Familiar with electronic medical records and care coordination.',
  technicalSkills: {
    languages: [],
    frameworks: [],
    tools: ['EMR', 'Patient Care', 'Medication Administration'],
    databases: [],
    cloud: [],
  },
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Registered Nurse',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['Provided direct patient care and coordinated treatments', 'Documented patient records in EMR systems'],
    },
  ],
  userType: 'professional',
}

const EDUCATION_TEMPLATE = {
  headline: 'Teacher | Classroom Instruction & Curriculum Development',
  summary:
    'Dedicated educator experienced in lesson planning, differentiated instruction, and classroom management. Passionate about student-centered learning and assessment.',
  technicalSkills: {
    languages: [],
    frameworks: [],
    tools: ['Curriculum Design', 'Assessment'],
    databases: [],
    cloud: [],
  },
  education: [
    {
      id: createId(),
      school: '',
      degree: 'B.Ed. / M.Ed.',
      field: '',
      endDate: '',
      gpa: '',
      coursework: 'Curriculum, Assessment, Classroom Management',
    },
  ],
  userType: 'professional',
}

const MANAGEMENT_TEMPLATE = {
  headline: 'Project Manager | Agile, Cross-functional Leadership',
  summary:
    'Project manager with experience coordinating cross-functional teams, managing timelines, and delivering projects on schedule. Skilled in Agile methodologies and stakeholder communication.',
  technicalSkills: {
    languages: [],
    frameworks: [],
    tools: ['Jira', 'Confluence', 'OKRs'],
    databases: [],
    cloud: [],
  },
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Project Manager',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: ['Led cross-functional teams to deliver product features', 'Managed project timelines, risks, and stakeholder communication'],
    },
  ],
  userType: 'professional',
}

export function getTemplateForProfession(key) {
  switch (key) {
    case 'it':
      return IT_TEMPLATE
    case 'healthcare':
      return HEALTHCARE_TEMPLATE
    case 'education':
      return EDUCATION_TEMPLATE
    case 'management':
      return MANAGEMENT_TEMPLATE
    default:
      return IT_TEMPLATE
  }
}
