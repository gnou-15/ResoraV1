import re
# pyrefly: ignore [missing-import]
from fastapi import FastAPI
# pyrefly: ignore [missing-import]
from fastapi.middleware.cors import CORSMiddleware
# pyrefly: ignore [missing-import]
from pydantic import BaseModel
from typing import List, Dict, Any, Optional

app = FastAPI()

# Enable CORS so the Vite React frontend can make requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Pydantic Data Models matching JS Resume schema ---

class Location(BaseModel):
    country: Optional[str] = ""
    state: Optional[str] = ""
    city: Optional[str] = ""
    barangay: Optional[str] = ""
    street: Optional[str] = ""

class Personal(BaseModel):
    fullName: Optional[str] = ""
    email: Optional[str] = ""
    phoneCountry: Optional[str] = ""
    phoneNumber: Optional[str] = ""
    location: Optional[Location] = None
    github: Optional[str] = ""
    linkedin: Optional[str] = ""
    portfolio: Optional[str] = ""

class EducationEntry(BaseModel):
    id: Optional[str] = ""
    school: Optional[str] = ""
    degree: Optional[str] = ""
    field: Optional[str] = ""
    endDate: Optional[str] = ""
    gpa: Optional[str] = ""
    coursework: Optional[str] = ""

class ProjectEntry(BaseModel):
    id: Optional[str] = ""
    name: Optional[str] = ""
    link: Optional[str] = ""
    stack: Optional[str] = ""
    bullets: Optional[List[str]] = []

class ExperienceEntry(BaseModel):
    id: Optional[str] = ""
    company: Optional[str] = ""
    title: Optional[str] = ""
    location: Optional[str] = ""
    startDate: Optional[str] = ""
    endDate: Optional[str] = ""
    current: Optional[bool] = False
    bullets: Optional[List[str]] = []

class CertEntry(BaseModel):
    id: Optional[str] = ""
    name: Optional[str] = ""
    issuer: Optional[str] = ""
    date: Optional[str] = ""

class AchievementEntry(BaseModel):
    id: Optional[str] = ""
    title: Optional[str] = ""
    organization: Optional[str] = ""
    date: Optional[str] = ""
    distinction: Optional[str] = ""
    bullets: Optional[List[str]] = []

class Resume(BaseModel):
    personal: Optional[Personal] = None
    headline: Optional[str] = ""
    summary: Optional[str] = ""
    technicalSkills: Optional[Dict[str, Any]] = {}
    skills: Optional[str] = ""
    clinicalSkills: Optional[List[str]] = []
    managementSkills: Optional[List[str]] = []
    subjects: Optional[List[str]] = []
    education: Optional[List[EducationEntry]] = []
    projects: Optional[List[ProjectEntry]] = []
    experience: Optional[List[ExperienceEntry]] = []
    certifications: Optional[List[CertEntry]] = []
    achievements: Optional[List[AchievementEntry]] = []
    userType: Optional[str] = "professional"

class AnalyzeRequest(BaseModel):
    resume: Resume
    profession: str = "it"

# --- AI Scorer Helpers & Mock Data ---

ACTION_VERBS = [
    'developed', 'led', 'designed', 'managed', 'optimized', 'built', 'created', 
    'implemented', 'improved', 'increased', 'decreased', 'delivered', 'automated', 
    'spearheaded', 'coordinated', 'engineered', 'launched', 'formulated', 'facilitated',
    'administered', 'structured', 'executed', 'directed', 'reduced'
]

def has_action_verb(text: str) -> bool:
    if not text:
        return False
    words = re.findall(r'\b\w+\b', text.lower())
    return any(word in ACTION_VERBS for word in words)

def has_metrics(text: str) -> bool:
    if not text:
        return False
    has_number = bool(re.search(r'\d+', text))
    has_metric_symbol = bool(re.search(r'[%$]', text))
    metric_keywords = [
        'percent', 'dollars', 'million', 'thousand', 'users', 'hours', 'weeks', 
        'months', 'years', 'increase', 'decrease', 'growth', 'reduction', 'revenue', 
        'speed', 'latency'
    ]
    has_metric_keywords = any(kw in text.lower() for kw in metric_keywords)
    return has_number or has_metric_symbol or (has_number and has_metric_keywords)

MOCK_JOBS = {
    'it': [
        { 'id': 'it-1', 'company': 'Google', 'title': 'Software Engineer', 'location': 'Mountain View, CA (Hybrid)', 'matchScore': 94, 'salary': '$135k - $175k', 'logoColor': '#4285F4' },
        { 'id': 'it-2', 'company': 'Canva', 'title': 'React Frontend Developer', 'location': 'Remote (US)', 'matchScore': 88, 'salary': '$100k - $130k', 'logoColor': '#7D2AE8' },
        { 'id': 'it-3', 'company': 'Stripe', 'title': 'Full Stack Engineer Intern', 'location': 'San Francisco, CA', 'matchScore': 78, 'salary': '$45 - $55/hr', 'logoColor': '#635BFF' },
        { 'id': 'it-4', 'company': 'AWS', 'title': 'Cloud Solutions Architect', 'location': 'Seattle, WA', 'matchScore': 65, 'salary': '$140k - $190k', 'logoColor': '#FF9900' }
    ],
    'healthcare': [
        { 'id': 'hc-1', 'company': 'Mayo Clinic', 'title': 'ICU Registered Nurse', 'location': 'Rochester, MN', 'matchScore': 95, 'salary': '$85k - $110k', 'logoColor': '#005CA9' },
        { 'id': 'hc-2', 'company': 'Cleveland Clinic', 'title': 'Clinical Nursing Supervisor', 'location': 'Cleveland, OH (On-site)', 'matchScore': 89, 'salary': '$95k - $120k', 'logoColor': '#00A499' },
        { 'id': 'hc-3', 'company': 'HCA Healthcare', 'title': 'Staff Nurse - Pediatrics', 'location': 'Nashville, TN', 'matchScore': 81, 'salary': '$75k - $90k', 'logoColor': '#D32F2F' }
    ],
    'education': [
        { 'id': 'edu-1', 'company': 'Oakridge Academy', 'title': 'High School Mathematics Teacher', 'location': 'Boston, MA', 'matchScore': 96, 'salary': '$55k - $72k', 'logoColor': '#1B5E20' },
        { 'id': 'edu-2', 'company': 'EdTech Solutions', 'title': 'Curriculum Development Specialist', 'location': 'Austin, TX (Remote)', 'matchScore': 87, 'salary': '$70k - $90k', 'logoColor': '#0D47A1' },
        { 'id': 'edu-3', 'company': 'STEM Charter School', 'title': 'Lead Robotics Instructor', 'location': 'Denver, CO', 'matchScore': 76, 'salary': '$60k - $75k', 'logoColor': '#E65100' }
    ],
    'management': [
        { 'id': 'mgt-1', 'company': 'Microsoft', 'title': 'Technical Project Manager', 'location': 'Redmond, WA (Hybrid)', 'matchScore': 93, 'salary': '$125k - $160k', 'logoColor': '#F25022' },
        { 'id': 'mgt-2', 'company': 'Salesforce', 'title': 'Agile Product Owner', 'location': 'San Francisco, CA', 'matchScore': 86, 'salary': '$110k - $145k', 'logoColor': '#00A1E0' },
        { 'id': 'mgt-3', 'company': 'Global Logistics Co.', 'title': 'Operations Lead Manager', 'location': 'Chicago, IL', 'matchScore': 74, 'salary': '$95k - $125k', 'logoColor': '#37474F' }
    ],
    'engineering': [
        { 'id': 'eng-1', 'company': 'Boeing', 'title': 'Mechanical Engineer', 'location': 'Seattle, WA (Hybrid)', 'matchScore': 92, 'salary': '$95k - $120k', 'logoColor': '#0033a0' },
        { 'id': 'eng-2', 'company': 'AECOM', 'title': 'Civil Engineer', 'location': 'Los Angeles, CA', 'matchScore': 86, 'salary': '$85k - $115k', 'logoColor': '#004B87' },
        { 'id': 'eng-3', 'company': 'Tesla', 'title': 'Electrical Design Engineer', 'location': 'Austin, TX', 'matchScore': 78, 'salary': '$110k - $145k', 'logoColor': '#CC0000' }
    ],
    'safety': [
        { 'id': 'safe-1', 'company': 'Chevron', 'title': 'EHS Manager / Safety Officer', 'location': 'Houston, TX (On-site)', 'matchScore': 93, 'salary': '$105k - $135k', 'logoColor': '#005C8F' },
        { 'id': 'safe-2', 'company': 'Turner Construction', 'title': 'Construction Safety Coordinator', 'location': 'New York, NY', 'matchScore': 87, 'salary': '$80k - $100k', 'logoColor': '#1A365D' },
        { 'id': 'safe-3', 'company': 'OSHA Solutions', 'title': 'Occupational Health Specialist', 'location': 'Chicago, IL', 'matchScore': 75, 'salary': '$75k - $95k', 'logoColor': '#4A5568' }
    ],
    'customs': [
        { 'id': 'cust-1', 'company': 'DHL Express', 'title': 'Customs Broker', 'location': 'Miami, FL (Hybrid)', 'matchScore': 91, 'salary': '$70k - $90k', 'logoColor': '#FFCC00' },
        { 'id': 'cust-2', 'company': 'FedEx Trade Networks', 'title': 'Import/Export Compliance Specialist', 'location': 'Memphis, TN', 'matchScore': 85, 'salary': '$75k - $95k', 'logoColor': '#4D148C' },
        { 'id': 'cust-3', 'company': 'Flexport', 'title': 'Trade Operations Coordinator', 'location': 'San Francisco, CA', 'matchScore': 79, 'salary': '$65k - $80k', 'logoColor': '#2D3748' }
    ],
    'business': [
        { 'id': 'biz-1', 'company': 'Deloitte', 'title': 'Staff Accountant / Auditor', 'location': 'Chicago, IL (Hybrid)', 'matchScore': 94, 'salary': '$75k - $95k', 'logoColor': '#86BC25' },
        { 'id': 'biz-2', 'company': 'Goldman Sachs', 'title': 'Senior Financial Analyst', 'location': 'New York, NY', 'matchScore': 88, 'salary': '$110k - $140k', 'logoColor': '#002E6E' },
        { 'id': 'biz-3', 'company': 'H&R Block', 'title': 'Tax Consultant Specialist', 'location': 'Remote (US)', 'matchScore': 77, 'salary': '$60k - $80k', 'logoColor': '#00A859' }
    ],
    'designer': [
        { 'id': 'dsgn-1', 'company': 'Figma', 'title': 'UI/UX Product Designer', 'location': 'San Francisco, CA (Hybrid)', 'matchScore': 93, 'salary': '$120k - $160k', 'logoColor': '#F24E1E' },
        { 'id': 'dsgn-2', 'company': 'Adobe', 'title': 'Senior Graphic Designer', 'location': 'San Jose, CA', 'matchScore': 89, 'salary': '$100k - $135k', 'logoColor': '#FF0000' },
        { 'id': 'dsgn-3', 'company': 'Mailchimp', 'title': 'Creative Specialist Intern', 'location': 'Atlanta, GA (Hybrid)', 'matchScore': 76, 'salary': '$35 - $45/hr', 'logoColor': '#FFE01B' }
    ],
    'data': [
        { 'id': 'data-1', 'company': 'Netflix', 'title': 'Data Scientist', 'location': 'Los Gatos, CA (Hybrid)', 'matchScore': 95, 'salary': '$160k - $210k', 'logoColor': '#E50914' },
        { 'id': 'data-2', 'company': 'Amazon', 'title': 'Business Intelligence Analyst', 'location': 'Seattle, WA', 'matchScore': 88, 'salary': '$95k - $130k', 'logoColor': '#FF9900' },
        { 'id': 'data-3', 'company': 'Uber', 'title': 'Data Analyst Intern', 'location': 'San Francisco, CA', 'matchScore': 80, 'salary': '$40 - $55/hr', 'logoColor': '#000000' }
    ],
    'sales': [
        { 'id': 'sales-1', 'company': 'Salesforce', 'title': 'Sales Account Executive', 'location': 'Chicago, IL (Hybrid)', 'matchScore': 92, 'salary': '$90k - $120k + Commission', 'logoColor': '#00A1E0' },
        { 'id': 'sales-2', 'company': 'HubSpot', 'title': 'Business Development Representative', 'location': 'Boston, MA', 'matchScore': 86, 'salary': '$65k - $85k base', 'logoColor': '#FF7A59' },
        { 'id': 'sales-3', 'company': 'ZoomInfo', 'title': 'Inside Sales Specialist', 'location': 'Vancouver, WA', 'matchScore': 78, 'salary': '$70k - $90k base', 'logoColor': '#1E3A8A' }
    ],
    'hr': [
        { 'id': 'hr-1', 'company': 'Meta', 'title': 'HR Business Partner (HRBP)', 'location': 'Menlo Park, CA (Hybrid)', 'matchScore': 91, 'salary': '$120k - $155k', 'logoColor': '#0668E1' },
        { 'id': 'hr-2', 'company': 'LinkedIn', 'title': 'Recruiting Coordinator', 'location': 'Sunnyvale, CA', 'matchScore': 87, 'salary': '$75k - $95k', 'logoColor': '#0A66C2' },
        { 'id': 'hr-3', 'company': 'Workday', 'title': 'Human Resources Generalist', 'location': 'Pleasanton, CA', 'matchScore': 79, 'salary': '$85k - $110k', 'logoColor': '#E28743' }
    ]
}

def calculate_job_suitability(resume: Resume, job_title: str, profession: str) -> float:
    text_content = []
    
    if resume.headline: text_content.append(resume.headline.lower())
    if resume.summary: text_content.append(resume.summary.lower())
    if resume.skills: text_content.append(resume.skills.lower())
    
    if resume.technicalSkills:
        for val in resume.technicalSkills.values():
            if isinstance(val, list):
                text_content.extend([str(s).lower() for s in val])
            elif val:
                text_content.append(str(val).lower())
                
    for exp in (resume.experience or []):
        if exp.title: text_content.append(exp.title.lower())
        if exp.company: text_content.append(exp.company.lower())
        for b in (exp.bullets or []):
            if b: text_content.append(b.lower())
            
    for proj in (resume.projects or []):
        if proj.name: text_content.append(proj.name.lower())
        if proj.stack: text_content.append(proj.stack.lower())
        for b in (proj.bullets or []):
            if b: text_content.append(b.lower())
            
    for cert in (resume.certifications or []):
        if cert.name: text_content.append(cert.name.lower())
        
    for edu in (resume.education or []):
        if edu.school: text_content.append(edu.school.lower())
        if edu.degree: text_content.append(edu.degree.lower())
        if edu.field: text_content.append(edu.field.lower())
        if edu.coursework: text_content.append(edu.coursework.lower())
        
    full_text = " ".join(text_content)
    title_lower = job_title.lower()
    
    if "cloud" in title_lower or "architect" in title_lower:
        keywords = ["aws", "azure", "gcp", "cloud", "devops", "kubernetes", "docker", "terraform"]
        if not any(kw in full_text for kw in keywords):
            return 0.25
            
    if "react" in title_lower or "frontend" in title_lower:
        keywords = ["react", "vue", "angular", "javascript", "typescript", "html", "css", "frontend"]
        if not any(kw in full_text for kw in keywords):
            return 0.35
            
    if "software engineer" in title_lower or "developer" in title_lower:
        keywords = ["developer", "engineer", "programming", "software", "code", "coding", "java", "python", "javascript", "c++", "c#", "php", "ruby", "go", "sql"]
        if not any(kw in full_text for kw in keywords):
            return 0.45
            
    return 1.0

# --- Core Analyzer Logic ---

def analyze_resume(resume: Resume, profession: str = "it") -> Dict[str, Any]:
    tips = []
    score_breakdown = {
        "contact": 0,
        "headline": 0,
        "summary": 0,
        "skills": 0,
        "experience": 0,
        "projects": 0
    }

    personal = resume.personal or Personal()
    headline = resume.headline or ""
    summary = resume.summary or ""
    technical_skills = resume.technicalSkills or {}
    education = resume.education or []
    projects = resume.projects or []
    experience = resume.experience or []
    certifications = resume.certifications or []
    achievements = resume.achievements or []
    is_student = resume.userType == "student"

    # 1. CONTACT INFO COMPLETENESS (Max 15 points)
    contact_points = 0
    if personal.email and personal.email.strip(): contact_points += 3
    else: tips.append({ "id": "email", "text": "Provide a professional email address", "impact": 3, "category": "contact", "type": "add" })

    if personal.phoneNumber and personal.phoneNumber.strip(): contact_points += 3
    else: tips.append({ "id": "phone", "text": "Add your phone number for recruiter outreach", "impact": 3, "category": "contact", "type": "add" })

    if personal.location and personal.location.city and personal.location.city.strip(): contact_points += 3
    else: tips.append({ "id": "location", "text": "Specify your location (City, Country)", "impact": 3, "category": "contact", "type": "add" })

    if personal.linkedin and personal.linkedin.strip(): contact_points += 3
    else: tips.append({ "id": "linkedin", "text": "Add your LinkedIn profile link to compare with industry benchmarks", "impact": 3, "category": "contact", "type": "add" })

    has_portfolio_or_github = (personal.github and personal.github.strip()) or (personal.portfolio and personal.portfolio.strip())
    if has_portfolio_or_github: contact_points += 3
    else:
        label = "GitHub or portfolio" if profession == "it" else "portfolio or website"
        tips.append({ "id": "portfolio", "text": f"Add a link to your {label} to showcase work", "impact": 3, "category": "contact", "type": "add" })
    score_breakdown["contact"] = contact_points

    # 2. HEADLINE & TARGET ROLE (Max 10 points)
    headline_points = 0
    if headline and headline.strip():
        if len(headline) >= 15:
            headline_points = 10
        else:
            headline_points = 6
            tips.append({ "id": "headline_len", "text": "Expand target role headline to include main keyword tags (e.g. React, Docker)", "impact": 4, "category": "headline", "type": "improve" })
    else:
        tips.append({ "id": "headline", "text": "Add a target role headline to capture ATS search filters", "impact": 10, "category": "headline", "type": "add" })
    score_breakdown["headline"] = headline_points

    # 3. PROFESSIONAL SUMMARY (Max 15 points)
    summary_points = 0
    if summary and summary.strip():
        length = len(summary)
        if 80 <= length <= 320:
            summary_points += 10
        elif length > 320:
            summary_points += 6
            tips.append({ "id": "summary_long", "text": "Shorten your summary to be more concise (under 320 characters)", "impact": 4, "category": "summary", "type": "improve" })
        else:
            summary_points += 6
            tips.append({ "id": "summary_short", "text": "Expand your summary to clearly highlight your objective and top competencies (min 80 characters)", "impact": 4, "category": "summary", "type": "improve" })

        if has_action_verb(summary):
            summary_points += 5
        else:
            tips.append({ "id": "summary_verbs", "text": "Incorporate active verbs (e.g. built, managed) in your professional summary", "impact": 5, "category": "summary", "type": "improve" })
    else:
        tips.append({ "id": "summary", "text": "Write a professional summary to quickly brief recruiters on your background", "impact": 15, "category": "summary", "type": "add" })
    score_breakdown["summary"] = summary_points

    # 4. KEY SKILLS ALIGNMENT (Max 20 points)
    skills_points = 0
    skills_count = 0

    if profession == "it":
        keys = ["languages", "frameworks", "tools", "databases", "cloud"]
        for k in keys:
            val = technical_skills.get(k, [])
            if isinstance(val, list):
                skills_count += len(val)
    else:
        raw_skills = resume.skills or ""
        if isinstance(raw_skills, str):
            skills_count = len([s for s in raw_skills.split(",") if s.strip()])
        elif isinstance(raw_skills, list):
            skills_count = len(raw_skills)

        if profession == "healthcare" and isinstance(resume.clinicalSkills, list):
            skills_count += len([s for s in resume.clinicalSkills if s])
        if profession == "management" and isinstance(resume.managementSkills, list):
            skills_count += len([s for s in resume.managementSkills if s])
        if profession == "education" and isinstance(resume.subjects, list):
            skills_count += len([s for s in resume.subjects if s])

    if skills_count >= 10:
        skills_points = 20
    elif skills_count >= 5:
        skills_points = 14
        tips.append({ "id": "skills_count_low", "text": "Include at least 10 core skills to increase ATS matching options", "impact": 6, "category": "skills", "type": "improve" })
    elif skills_count > 0:
        skills_points = 8
        tips.append({ "id": "skills_count_critical", "text": "Expand your key skills listing. Recruiters search directly for these terms", "impact": 12, "category": "skills", "type": "improve" })
    else:
        tips.append({ "id": "skills", "text": "Populate your skills list to enable industry match ranking calculations", "impact": 20, "category": "skills", "type": "add" })
    score_breakdown["skills"] = skills_points

    # 5. WORK EXPERIENCE BULLETS & QUALITY (Max 25 points)
    exp_points = 0
    filled_exp = [e for e in experience if e.company or e.title]
    
    # Collect metrics statistics and list of bullets that need metrics
    total_bullets = 0
    bullets_with_metrics = 0
    bullets_no_metrics_list = []

    for job in filled_exp:
        job_bullets = [b for b in (job.bullets or []) if b and b.strip()]
        total_bullets += len(job_bullets)
        
        for idx, bullet in enumerate(job_bullets):
            if has_metrics(bullet):
                bullets_with_metrics += 1
            else:
                bullets_no_metrics_list.append({
                    "jobId": job.id,
                    "company": job.company or "Current Role",
                    "bulletIndex": idx,
                    "text": bullet
                })

    metric_percentage = (bullets_with_metrics / total_bullets) if total_bullets > 0 else 0

    if is_student:
        # --- Student Experience Rubric (Max 25 points) ---
        if len(filled_exp) > 0:
            exp_points += 10 # has experience base

            # Bullets count check (min 2 bullets)
            if total_bullets >= 2:
                exp_points += 5
            else:
                tips.append({ "id": "exp_bullets_count", "text": "Add more descriptive bullet points under your experiences (minimum 2 total)", "impact": 5, "category": "experience", "type": "improve" })

            # Metrics check
            if metric_percentage >= 0.5:
                exp_points += 10
            elif metric_percentage >= 0.2:
                exp_points += 6
                tips.append({ 
                    "id": "exp_metrics_low", 
                    "text": "Add quantifiable metrics to your work or student Org bullets to prove impact!", 
                    "impact": 4, 
                    "category": "experience", 
                    "type": "improve",
                    "fixable": True,
                    "bulletsToFix": bullets_no_metrics_list
                })
            else:
                exp_points += 2
                tips.append({ 
                    "id": "exp_metrics_missing", 
                    "text": "Incorporate quantifiable results (percentages, sizes, frequencies) in experience bullets.", 
                    "impact": 8, 
                    "category": "experience", 
                    "type": "improve",
                    "fixable": True,
                    "bulletsToFix": bullets_no_metrics_list
                })
        else:
            # Students get a default 12 points floor so lack of formal work history doesn't tank their score
            exp_points = 12
            tips.append({ 
                "id": "experience", 
                "text": "Add internships, part-time jobs, or school Org leadership roles to demonstrate initial experience.", 
                "impact": 13, 
                "category": "experience", 
                "type": "add" 
            })
    else:
        # --- Professional Experience Rubric (Max 25 points) ---
        if len(filled_exp) > 0:
            exp_points += 10 # has experience base

            # Career depth: Multiple roles preferred
            if len(filled_exp) >= 2:
                exp_points += 5
            else:
                tips.append({ "id": "exp_roles_count", "text": "Add previous professional roles to demonstrate career progression.", "impact": 5, "category": "experience", "type": "improve" })

            # Bullets depth (min 3 per role or 5 total)
            if total_bullets >= 5:
                exp_points += 5
            else:
                tips.append({ "id": "exp_bullets_count", "text": "Add more accomplishments and bullet points under your professional experiences.", "impact": 5, "category": "experience", "type": "improve" })

            # Metrics checks
            if metric_percentage >= 0.5:
                exp_points += 5
            elif metric_percentage >= 0.2:
                exp_points += 3
                tips.append({ 
                    "id": "exp_metrics_low", 
                    "text": "Fewer than 50% of your experience bullets contain quantifiable results (%, numbers). Add metrics to prove impact!", 
                    "impact": 2, 
                    "category": "experience", 
                    "type": "improve",
                    "fixable": True,
                    "bulletsToFix": bullets_no_metrics_list
                })
            else:
                exp_points += 1
                tips.append({ 
                    "id": "exp_metrics_missing", 
                    "text": "Incorporate quantifiable results (percentages, revenue, savings, team scale) into your work experience bullets.", 
                    "impact": 4, 
                    "category": "experience", 
                    "type": "improve",
                    "fixable": True,
                    "bulletsToFix": bullets_no_metrics_list
                })
        else:
            # Professionals get no floor points if experience is empty
            exp_points = 0
            tips.append({ 
                "id": "experience", 
                "text": "Add your work experience history to demonstrate your career track record.", 
                "impact": 25, 
                "category": "experience", 
                "type": "add" 
            })
    score_breakdown["experience"] = exp_points

    # 6. PROJECTS & CERTIFICATIONS & EXTRA (Max 15 points in breakdown)
    projects_breakdown_points = 0
    filled_projects = [p for p in projects if p.name]
    filled_education = [e for e in education if e.school or e.degree]

    if is_student:
        # Student Rubric: Education (15) + Projects (10) + Achievements (5) + Certs (5) = 35 total raw points
        student_raw_extra = 0

        # Education
        if len(filled_education) > 0:
            student_raw_extra += 5
            has_gpa = any(e.gpa and e.gpa.strip() for e in filled_education)
            if has_gpa: student_raw_extra += 5
            else: tips.append({ "id": "edu_gpa", "text": "Include your GPA if it is 3.0 or higher.", "impact": 5, "category": "education", "type": "improve" })

            has_coursework = any(e.coursework and e.coursework.strip() for e in filled_education)
            if has_coursework: student_raw_extra += 5
            else: tips.append({ "id": "edu_coursework", "text": "Add relevant coursework to showcase your academic focus.", "impact": 5, "category": "education", "type": "improve" })
        else:
            tips.append({ "id": "education", "text": "Add your university or college education details.", "impact": 15, "category": "education", "type": "add" })

        # Projects
        if len(filled_projects) > 0:
            student_raw_extra += 5
            has_stack = any(p.stack and p.stack.strip() for p in filled_projects)
            if has_stack: student_raw_extra += 2
            else: tips.append({ "id": "proj_stack", "text": "Specify a tech stack for each of your projects", "impact": 2, "category": "projects", "type": "improve" })

            has_bullets = any(p.bullets and any(b and b.strip() for b in p.bullets) for p in filled_projects)
            if has_bullets: student_raw_extra += 3
        else:
            tips.append({ "id": "projects", "text": "Add relevant projects to showcase practical application of your skills.", "impact": 10, "category": "projects", "type": "add" })

        # Achievements
        filled_achievements = [a for a in achievements if a.title]
        if len(filled_achievements) > 0:
            student_raw_extra += 5
        else:
            tips.append({ "id": "achievements", "text": "Include honors, scholarship recognition, or coding competition achievements.", "impact": 5, "category": "projects", "type": "add" })

        # Certifications
        filled_certs = [c for c in certifications if c.name]
        if len(filled_certs) > 0:
            student_raw_extra += 5

        # Scale 35 max raw points to 15 max breakdown points
        projects_breakdown_points = round((student_raw_extra / 35) * 15)

    else:
        # Professional Rubric: Education (5) + Projects (10) + Certs (10) = 25 total raw points
        # Achievements/GPA/Coursework are hidden/ignored entirely
        prof_raw_extra = 0

        # Education
        if len(filled_education) > 0:
            prof_raw_extra += 5
        else:
            tips.append({ "id": "education", "text": "Add your university or college education details.", "impact": 5, "category": "education", "type": "add" })

        # Projects
        if len(filled_projects) > 0:
            prof_raw_extra += 5
            has_stack = any(p.stack and p.stack.strip() for p in filled_projects)
            if has_stack: prof_raw_extra += 2
            else: tips.append({ "id": "proj_stack", "text": "Specify a tech stack for each of your projects", "impact": 2, "category": "projects", "type": "improve" })

            has_bullets = any(p.bullets and any(b and b.strip() for b in p.bullets) for p in filled_projects)
            if has_bullets: prof_raw_extra += 3
        else:
            tips.append({ "id": "projects", "text": "Add relevant projects to showcase practical application of your skills.", "impact": 10, "category": "projects", "type": "add" })

        # Certifications
        filled_certs = [c for c in certifications if c.name]
        if len(filled_certs) > 0:
            prof_raw_extra += 10
        else:
            tips.append({ "id": "certifications", "text": "Add industry-standard certifications to prove expertise.", "impact": 10, "category": "projects", "type": "add" })

        # Scale 25 max raw points to 15 max breakdown points
        projects_breakdown_points = round((prof_raw_extra / 25) * 15)
    
    score_breakdown["projects"] = projects_breakdown_points

    # Calculate final score as the sum of all scaled scoreBreakdown values
    score_sum = sum(score_breakdown.values())
    final_score = max(15, min(100, round(score_sum)))

    # Generate percentiles and placement prompts
    placement = "Needs Optimization"
    placement_color = "#ef4444"
    acceptance_percentage = 15
    mascot_mood = "normal"

    if final_score >= 90:
        placement = "Top 5% of Applicants"
        placement_color = "#16a34a"
        acceptance_percentage = 95
        mascot_mood = "excited"
    elif final_score >= 75:
        placement = "Top 15% of Applicants"
        placement_color = "#10b981"
        acceptance_percentage = 85
        mascot_mood = "normal"
    elif final_score >= 60:
        placement = "Top 30% of Applicants"
        placement_color = "#eab308"
        acceptance_percentage = 65
        mascot_mood = "normal"
    elif final_score >= 40:
        placement = "Top 50% of Applicants"
        placement_color = "#f97316"
        acceptance_percentage = 42
        mascot_mood = "normal"
    else:
        placement = "Needs Structural Fixes (Bottom 50%)"
        placement_color = "#ef4444"
        acceptance_percentage = 18
        mascot_mood = "shy"

    # Fetch corresponding jobs
    jobs = MOCK_JOBS.get(profession, MOCK_JOBS['it'])
    calibrated_jobs = []
    for job in jobs:
        user_offset = round((final_score - 50) * 0.4)
        base_match = job['matchScore'] + user_offset
        
        # Calculate suitability based on resume keywords
        suitability = calculate_job_suitability(resume, job['title'], profession)
        final_match = round(base_match * suitability)
        
        dynamic_match = min(99, max(15, final_match))
        calibrated_jobs.append({**job, "matchScore": dynamic_match})

    return {
        "score": final_score,
        "placement": placement,
        "placementColor": placement_color,
        "acceptancePercentage": acceptance_percentage,
        "mascotMood": mascot_mood,
        "tips": tips,
        "scoreBreakdown": score_breakdown,
        "jobs": calibrated_jobs
    }

@app.get("/")
def read_root():
    return {"status": "online", "message": "Resora Resume Analyzer API is running!"}

@app.post("/analyze")
def analyze(req: AnalyzeRequest):
    return analyze_resume(req.resume, req.profession)

