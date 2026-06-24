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
      latinHonors: '',
      coursework: 'Data Structures, Algorithms, Databases',
    },
  ],
  userType: 'professional',
}

const HEALTHCARE_TEMPLATE = {
  headline: 'Registered Nurse | Patient Care, EMR',
  summary:
    'Compassionate registered nurse with clinical experience delivering high-quality patient care in fast-paced environments. Familiar with electronic medical records and care coordination.',
  skills: 'EMR, Patient Care, Medication Administration',
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
  skills: 'Curriculum Design, Assessment, Classroom Management',
  education: [
    {
      id: createId(),
      school: '',
      degree: 'B.Ed. / M.Ed.',
      field: '',
      endDate: '',
      gpa: '',
      latinHonors: '',
      coursework: 'Curriculum, Assessment, Classroom Management',
    },
  ],
  userType: 'professional',
}

const MANAGEMENT_TEMPLATE = {
  headline: 'Project Manager | Agile, Cross-functional Leadership',
  summary:
    'Project manager with experience coordinating cross-functional teams, managing timelines, and delivering projects on schedule. Skilled in Agile methodologies and stakeholder communication.',
  skills: 'Jira, Confluence, OKRs',
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

const ENGINEERING_TEMPLATE = {
  headline: 'Mechanical Engineer | Product Design & Finite Element Analysis',
  summary:
    'Detail-oriented Mechanical Engineer with experience in CAD design, product development, and manufacturing supervision. Proficient in SolidWorks, AutoCAD, and FEA tools. Strong analytical and problem-solving skills.',
  skills: 'SolidWorks, AutoCAD, Finite Element Analysis (FEA), Product Design, Manufacturing, MATLAB, Project Management',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Mechanical Engineer',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Designed and simulated mechanical components using SolidWorks and FEA tools, reducing prototyping iterations by 25%.',
        'Supervised manufacturing processes to ensure alignment with CAD drawings and quality compliance.',
      ],
    },
  ],
  userType: 'professional',
}

const BUSINESS_TEMPLATE = {
  headline: 'Financial Accountant | Auditing, Tax Compliance, & Financial Reporting',
  summary:
    'Dedicated Accountant with experience in corporate financial reporting, general ledger maintenance, tax compliance, and auditing. Skilled in QuickBooks, SAP, and advanced Excel modeling.',
  skills: 'Financial Auditing, Tax Compliance, General Ledger, GAAP, QuickBooks, SAP, Advanced Excel, Financial Analysis',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Staff Accountant',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Managed daily general ledger entries and reconciled monthly bank statements with 100% accuracy.',
        'Assisted in the preparation of quarterly financial statements and corporate tax returns.',
      ],
    },
  ],
  userType: 'professional',
}

const CUSTOMS_TEMPLATE = {
  headline: 'Customs Broker | Tariff Classification & Import/Export Compliance',
  summary:
    'Licensed Customs Broker with expertise in tariff classification, import/export regulations, customs clearance, and supply chain logistics. Proven track record of minimizing compliance risks and clearance delays.',
  skills: 'Tariff Classification, Customs Clearance, Import/Export Regulations, Trade Compliance, Logistics Coordination, HS Code Auditing',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Customs Broker / Compliance Officer',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Classified over 500 import products monthly under correct HS codes, ensuring full compliance with customs laws.',
        'Coordinated with customs officials and freight forwarders to clear shipments 20% faster than average timeline.',
      ],
    },
  ],
  userType: 'professional',
}

const SAFETY_TEMPLATE = {
  headline: 'Safety Officer | EHS Compliance & Workplace Risk Assessment',
  summary:
    'Certified Safety Officer with experience in establishing environmental, health, and safety (EHS) protocols, conducting risk assessments, and delivering safety training. Committed to maintaining zero-incident workspaces.',
  skills: 'Workplace Safety, EHS Audits, Hazard Identification, Risk Assessment, Safety Training, Accident Investigation, OSHA Compliance',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Safety Officer',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Conducted daily site safety audits and addressed non-compliant hazards immediately, maintaining a zero-accident record.',
        'Developed and delivered safety onboarding training to over 150 workers and subcontractors.',
      ],
    },
  ],
  userType: 'professional',
}

const DESIGNER_TEMPLATE = {
  headline: 'Graphic Designer | Brand Identity & UI/UX Design',
  summary:
    'Creative Graphic Designer with experience in brand development, digital layout, and user interface design. Proficient in Adobe Creative Suite and Figma. Passionate about translating concepts into visual stories.',
  skills: 'Adobe Illustrator, Adobe Photoshop, Figma, Branding & Identity, Typography, UI/UX Design, Layout Design',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Graphic Designer',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Designed brand assets and guidelines for 10+ clients, increasing brand recall and customer engagement.',
        'Collaborated with developers to create high-fidelity UI/UX mockups and interactive prototypes in Figma.',
      ],
    },
  ],
  userType: 'professional',
}

const DATA_TEMPLATE = {
  headline: 'Data Analyst | SQL, Python, & Business Intelligence',
  summary:
    'Analytical Data Analyst with experience in cleaning data, database querying, and building interactive business intelligence dashboards. Skilled in SQL, Python (Pandas), and Tableau.',
  skills: 'SQL, Python (Pandas/NumPy), Tableau, Power BI, Data Cleaning, Statistical Analysis, Excel Modeling',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Data Analyst',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Wrote complex SQL queries to extract and aggregate user engagement data, saving 5 hours of manual reporting per week.',
        'Created interactive Tableau dashboards for executive leadership to monitor key performance indicators.',
      ],
    },
  ],
  userType: 'professional',
}

const SALES_TEMPLATE = {
  headline: 'Sales Executive | Account Management & Relationship Sales',
  summary:
    'Result-driven Sales Representative with a track record of meeting quotas, managing client relations, and identifying new business opportunities. Adept in CRM tools and consultative selling.',
  skills: 'Client Acquisition, CRM (Salesforce), Negotiation, Lead Generation, Account Management, Consultative Selling',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Account Executive',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Exceeded sales target by 15% consistently for three consecutive quarters through outbound lead generation.',
        'Managed a portfolio of 40+ client accounts, achieving a 95% retention rate.',
      ],
    },
  ],
  userType: 'professional',
}

const HR_TEMPLATE = {
  headline: 'Clinical Psychologist | CBT, Crisis Intervention, & Case Management',
  summary:
    'Dedicated Behavioral Health Specialist and Counselor experienced in clinical assessments, therapeutic interventions, and client advocacy. Proficient in DSM-5 and crisis resolution, with additional expertise in organizational psychology and team counseling.',
  skills: 'Psychotherapy, CBT, Crisis Intervention, Case Management, DSM-5, Client Assessment, HRIS/EHR Systems, Conflict Resolution',
  experience: [
    {
      id: createId(),
      company: '',
      title: 'Clinical Counselor / HR Specialist',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      bullets: [
        'Conducted individual therapy sessions and diagnostic assessments for 35+ active clients.',
        'Developed and implemented employee wellness programs, reducing workplace stress scores by 25%.',
      ],
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
    case 'engineering':
      return ENGINEERING_TEMPLATE
    case 'business':
      return BUSINESS_TEMPLATE
    case 'customs':
      return CUSTOMS_TEMPLATE
    case 'safety':
      return SAFETY_TEMPLATE
    case 'designer':
      return DESIGNER_TEMPLATE
    case 'data':
      return DATA_TEMPLATE
    case 'sales':
      return SALES_TEMPLATE
    case 'hr':
      return HR_TEMPLATE
    default:
      return IT_TEMPLATE
  }
}
