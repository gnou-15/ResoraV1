import React, { useState, useEffect, useRef } from "react";
import { createId, skillCategories } from "../data/defaultResume";
import { PhoneField, LocationFields } from "./ContactFields";

function Section({ title, hint, children, onAdd, addLabel }) {
  return (
    <section className="editor-section">
      <div className="section-header">
        <div>
          <h2>{title}</h2>
          {hint && <p className="section-hint">{hint}</p>}
        </div>
      </div>
      {children}
      {onAdd && (
        <div className="section-add">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={onAdd}
          >
            + {addLabel}
          </button>
        </div>
      )}
    </section>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  placeholder,
  rows,
  hint,
  error,
  readOnly,
}) {
  const Tag = rows ? "textarea" : "input";
  const ref = useRef(null);

  useEffect(() => {
    if (rows && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  }, [value, rows]);

  const handleChange = (e) => {
    onChange(e.target.value);
    if (rows && ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = `${ref.current.scrollHeight}px`;
    }
  };

  return (
    <label className="field">
      <span>{label}</span>
      {hint && <span className="field-hint">{hint}</span>}
      <Tag
        ref={rows ? ref : undefined}
        type={rows ? undefined : type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        rows={rows}
        className={error ? "input-error" : ""}
        style={rows ? { overflow: "hidden" } : undefined}
        readOnly={readOnly}
      />
      {error && <span className="field-error-msg" style={{ color: "#dc2626", fontSize: "0.75rem", marginTop: "0.2rem" }}>{error}</span>}
    </label>
  );
}

function BulletList({ bullets, onChange, onAdd, onRemove, placeholder }) {
  return (
    <div className="bullets-group">
      <span className="bullets-label">
        Bullet points (start with action verbs + metrics)
      </span>
      {bullets.map((bullet, i) => (
        <div key={i} className="bullet-row">
          <input
            type="text"
            value={bullet}
            onChange={(e) => onChange(i, e.target.value)}
            placeholder={placeholder}
          />
          {bullets.length > 1 && (
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => onRemove(i)}
              aria-label="Remove bullet"
            >
              ×
            </button>
          )}
        </div>
      ))}
      <button type="button" className="btn btn-ghost btn-sm" onClick={onAdd}>
        + Add bullet
      </button>
    </div>
  );
}

function ResumeEditor({
  resume,
  setResume,
  updatePersonal,
  updateLocation,
  updateHeadline,
  updateSummary,
  updateTechnicalSkill,
  profession,
  user,
}) {
  const {
    personal,
    experience,
    education,
    projects,
    certifications,
    technicalSkills,
  } = resume;
  const { achievements = [], userType } = resume;

  const [errors, setErrors] = useState({});

  useEffect(() => {
    const newErrors = {};

    // Validate Full Name
    const fullName = personal?.fullName || "";
    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required";
    } else if (!/^[a-zA-Z\s.\-]{2,}$/.test(fullName)) {
      newErrors.fullName = "Name must contain only letters, spaces, dots, or hyphens (min 2 chars)";
    }

    // Validate Email
    const email = personal?.email || "";
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email address (e.g. name@domain.com)";
    }

    // Validate Phone Number
    const phone = personal?.phoneNumber || "";
    if (phone) {
      const digits = phone.replace(/\D/g, "");
      if (digits.length < 7 || digits.length > 15) {
        newErrors.phoneNumber = "Phone number must contain between 7 and 15 digits";
      }
    }

    // Validate GitHub
    const github = personal?.github || "";
    if (github && !github.includes("github.com") && !/^[a-zA-Z0-9\-]+$/.test(github)) {
      newErrors.github = "Please enter a valid GitHub link or username";
    }

    // Validate LinkedIn
    const linkedin = personal?.linkedin || "";
    if (linkedin && !linkedin.includes("linkedin.com") && !/^[a-zA-Z0-9\-]+$/.test(linkedin)) {
      newErrors.linkedin = "Please enter a valid LinkedIn link or username";
    }

    // Validate Education GPA
    education.forEach((edu) => {
      if (edu.gpa) {
        const num = parseFloat(edu.gpa);
        if (isNaN(num) || num < 0 || num > 5.0) {
          newErrors[`edu_gpa_${edu.id}`] = "GPA must be a number between 0.0 and 5.0";
        }
      }
    });

    setErrors(newErrors);
  }, [personal, education]);
  const SKILL_OPTIONS = {
    languages: [
      "JavaScript",
      "TypeScript",
      "Python",
      "Java",
      "C++",
      "C#",
      "Go",
      "Ruby",
      "PHP",
      "SQL",
      "Swift",
      "Kotlin",
      "Rust",
      "Scala",
    ],
    frameworks: [
      "React",
      "Angular",
      "Vue",
      "Svelte",
      "Next.js",
      "Nuxt",
      "Express",
      "Django",
      "Flask",
      "Spring Boot",
      ".NET",
      "Ruby on Rails",
    ],
    tools: [
      "Git",
      "Docker",
      "Kubernetes",
      "Jenkins",
      "GitHub Actions",
      "Terraform",
      "Webpack",
      "Vite",
      "Babel",
      "CI/CD",
      "Linux",
      "npm",
    ],
    databases: [
      "PostgreSQL",
      "MySQL",
      "MongoDB",
      "Redis",
      "SQLite",
      "Oracle",
      "SQL Server",
    ],
    cloud: ["AWS", "Azure", "GCP", "Firebase", "Heroku", "DigitalOcean"],
  };

  const getArray = (key) => (Array.isArray(resume[key]) ? resume[key] : []);

  const updateArray = (key, index, value) => {
    setResume((prev) => ({
      ...prev,
      [key]: (prev[key] || []).map((item, i) => (i === index ? value : item)),
    }));
  };

  const addArrayItem = (key, template = "") => {
    setResume((prev) => ({ ...prev, [key]: [...(prev[key] || []), template] }));
  };

  const removeArrayItem = (key, index) => {
    setResume((prev) => ({
      ...prev,
      [key]: (prev[key] || []).filter((_, i) => i !== index),
    }));
  };

  const updateField = (key, value) => {
    setResume((prev) => ({ ...prev, [key]: value }));
  };

  const updateList = (key, id, field, value) => {
    setResume((prev) => ({
      ...prev,
      [key]: prev[key].map((item) =>
        item.id === id ? { ...item, [field]: value } : item,
      ),
    }));
  };

  const addItem = (key, template) => {
    setResume((prev) => ({
      ...prev,
      [key]: [...prev[key], { ...template, id: createId() }],
    }));
  };

  const removeItem = (key, id) => {
    setResume((prev) => ({
      ...prev,
      [key]: prev[key].filter((item) => item.id !== id),
    }));
  };

  const updateBullets = (key, itemId, index, value) => {
    setResume((prev) => ({
      ...prev,
      [key]: prev[key].map((item) =>
        item.id === itemId
          ? {
              ...item,
              bullets: item.bullets.map((b, i) => (i === index ? value : b)),
            }
          : item,
      ),
    }));
  };

  const addBullet = (key, itemId) => {
    setResume((prev) => ({
      ...prev,
      [key]: prev[key].map((item) =>
        item.id === itemId ? { ...item, bullets: [...item.bullets, ""] } : item,
      ),
    }));
  };

  const removeBullet = (key, itemId, index) => {
    setResume((prev) => ({
      ...prev,
      [key]: prev[key].map((item) =>
        item.id === itemId
          ? { ...item, bullets: item.bullets.filter((_, i) => i !== index) }
          : item,
      ),
    }));
  };

  return (
    <div className="resume-editor">
      <div className="ats-tip">
        <strong>ATS tip:</strong> Use standard section titles, plain text, and
        keywords from the job posting. Keep everything on one page — be concise
        and measurable.
      </div>

      <Section title="Contact Information">
        <div className="field-grid">
          <Field
            label="Full Name"
            value={personal.fullName}
            onChange={(v) => updatePersonal("fullName", v)}
            placeholder="Jane Doe"
            error={errors.fullName}
            readOnly={!!user}
          />
          <Field
            label="Email"
            value={personal.email}
            onChange={(v) => updatePersonal("email", v)}
            type="email"
            placeholder="jane.doe@email.com"
            error={errors.email}
          />
          <PhoneField
            phoneCountry={personal.phoneCountry}
            phoneNumber={personal.phoneNumber}
            onCountryChange={(v) => updatePersonal("phoneCountry", v)}
            onNumberChange={(v) => updatePersonal("phoneNumber", v)}
            error={errors.phoneNumber}
          />
          <LocationFields
            location={personal.location}
            onChange={updateLocation}
          />

          {/* GitHub — only for computing-related professions */}
          {["it", "data", "engineering"].includes(profession) && (
            <Field
              label="GitHub"
              value={personal.github}
              onChange={(v) => updatePersonal("github", v)}
              placeholder="github.com/janedoe"
              error={errors.github}
            />
          )}

          {/* LinkedIn — universal across all professions */}
          <Field
            label="LinkedIn"
            value={personal.linkedin}
            onChange={(v) => updatePersonal("linkedin", v)}
            placeholder="linkedin.com/in/janedoe"
            error={errors.linkedin}
          />

          {/* Portfolio / profession-specific link */}
          {profession === "designer" ? (
            <Field
              label="Behance / Dribbble"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder="behance.net/janedoe"
            />
          ) : profession === "data" ? (
            <Field
              label="Portfolio / Kaggle"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder="kaggle.com/janedoe"
            />
          ) : profession === "education" ? (
            <Field
              label="Teaching Portfolio"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder="teachingportfolio.com/janedoe"
            />
          ) : profession === "sales" ? (
            <Field
              label="Personal Website"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder="janedoe.com"
            />
          ) : profession === "healthcare" ? (
            <Field
              label="License #"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder="RN-1234567"
            />
          ) : profession === "business" ? (
            <Field
              label="CPA / License"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder="CPA-987654"
            />
          ) : ["customs", "safety"].includes(profession) ? null : (
            <Field
              label="Portfolio"
              value={personal.portfolio}
              onChange={(v) => updatePersonal("portfolio", v)}
              placeholder={
                profession === "it" ? "janedoe.dev" :
                profession === "engineering" ? "janedoe-eng.com" :
                "janedoe.com"
              }
            />
          )}
        </div>
      </Section>

      <Section
        title="Target Role"
        hint={
          profession === "it" ? "One line with role + top technologies recruiters search for" :
          profession === "healthcare" ? "One line with role + specialty and certifications" :
          profession === "education" ? "One line with role + subject area and grade level" :
          profession === "management" ? "One line with role + industry and methodologies" :
          profession === "engineering" ? "One line with role + engineering discipline and tools" :
          profession === "business" ? "One line with role + industry focus and key competencies" :
          profession === "customs" ? "One line with role + regulatory expertise" :
          profession === "safety" ? "One line with role + safety standards and certifications" :
          profession === "designer" ? "One line with role + design specialties and tools" :
          profession === "data" ? "One line with role + tools and data specialties" :
          profession === "sales" ? "One line with role + industry and sales methodology" :
          profession === "hr" ? "One line with role + clinical focus/focus area and systems (e.g. Psychologist | CBT)" :
          "One line with role + keywords recruiters search for"
        }
      >
        <Field
          label="Headline"
          value={resume.headline}
          onChange={updateHeadline}
          placeholder={
            profession === "it" ? "Entry-Level Software Developer | Java, React, SQL, AWS" :
            profession === "healthcare" ? "Registered Nurse | ICU, BLS/ACLS Certified, Patient Care" :
            profession === "education" ? "High School Mathematics Teacher | AP Calculus, STEM Curriculum" :
            profession === "management" ? "Project Manager | PMP Certified, Agile, Cross-Functional Leadership" :
            profession === "engineering" ? "Mechanical Engineer | AutoCAD, SolidWorks, Manufacturing" :
            profession === "business" ? "Staff Accountant | CPA, Financial Reporting, QuickBooks" :
            profession === "customs" ? "Customs Officer | Trade Compliance, Tariff Classification, ASEAN" :
            profession === "safety" ? "Safety Officer | OSHA Certified, Hazard Analysis, EHS Compliance" :
            profession === "designer" ? "UI/UX Designer | Figma, Adobe Creative Suite, Brand Identity" :
            profession === "data" ? "Data Analyst | Python, SQL, Tableau, Machine Learning" :
            profession === "sales" ? "Account Executive | B2B SaaS, Salesforce, Consultative Selling" :
            profession === "hr" ? "Clinical Psychologist | CBT, Crisis Intervention, Family Counseling" :
            "Your target role | Keywords"
          }
        />
      </Section>

      <Section
        title="Professional Summary"
        hint="2-3 lines max. Objective, keywords, and what role you are targeting"
      >
        <Field
          label="Summary"
          value={resume.summary}
          onChange={updateSummary}
          placeholder={
            profession === "it" ? "Computer Science graduate seeking a junior developer role. Built full-stack apps with React and Node.js. Strong in data structures, REST APIs, and Agile teamwork." :
            profession === "healthcare" ? "Compassionate Registered Nurse with clinical experience in ICU and emergency care. BLS/ACLS certified with strong patient advocacy and interdisciplinary collaboration skills." :
            profession === "education" ? "Dedicated educator with 3+ years teaching STEM subjects. Skilled in differentiated instruction, student engagement strategies, and technology-enhanced learning." :
            profession === "management" ? "PMP-certified Project Manager with experience leading cross-functional teams. Skilled in Agile methodologies, stakeholder management, and delivering projects under budget." :
            profession === "engineering" ? "Mechanical Engineering graduate with hands-on experience in CAD design and manufacturing processes. Proficient in SolidWorks, MATLAB, and lean manufacturing principles." :
            profession === "business" ? "Detail-oriented accounting professional seeking a staff accountant role. Experienced in financial reporting, tax preparation, and proficient in QuickBooks and SAP." :
            profession === "customs" ? "Customs administration graduate with knowledge of international trade regulations, tariff classification, and ASEAN trade agreements. Strong in compliance and documentation." :
            profession === "safety" ? "OSHA-certified Safety Officer with experience in hazard analysis, workplace inspections, and EHS compliance. Committed to creating safe and regulatory-compliant work environments." :
            profession === "designer" ? "Creative Graphic Designer with expertise in brand identity, UI/UX, and print design. Proficient in Figma, Adobe Creative Suite, and motion graphics." :
            profession === "data" ? "Data Analyst skilled in Python, SQL, and Tableau. Experienced in building dashboards, predictive models, and translating data insights into business strategy." :
            profession === "sales" ? "Results-driven Sales professional with B2B experience in SaaS. Proven track record in pipeline management, consultative selling, and exceeding quarterly targets." :
            profession === "hr" ? "Compassionate Psychology graduate and Counselor experienced in clinical assessments, therapeutic interventions, and client advocacy. Proficient in DSM-5, crisis resolution, and organizational wellness." :
            "Describe your professional background and career objective."
          }
          rows={3}
          hint={`${resume.summary.length}/320 characters recommended`}
        />
      </Section>

      <Section
        title={
          profession === "it" ? "Technical Skills" :
          profession === "healthcare" ? "Clinical & Professional Skills" :
          profession === "education" ? "Teaching Skills & Qualifications" :
          profession === "management" ? "Management & Leadership Skills" :
          profession === "engineering" ? "Engineering Skills & Tools" :
          profession === "business" ? "Accounting & Business Skills" :
          profession === "customs" ? "Customs & Trade Skills" :
          profession === "safety" ? "Safety & Compliance Skills" :
          profession === "designer" ? "Design Tools & Skills" :
          profession === "data" ? "Data & Analytics Skills" :
          profession === "sales" ? "Sales & Communication Skills" :
          profession === "hr" ? "Behavioral Health & Social Services Skills" :
          "Skills"
        }
        hint={
          profession === "it" ? "List exact tools from job descriptions — ATS matches keywords here first" :
          profession === "healthcare" ? "Include licenses, clinical competencies, and medical systems" :
          profession === "education" ? "Include certifications, subjects, and instructional methods" :
          profession === "management" ? "Include methodologies, leadership styles, and project management tools" :
          profession === "engineering" ? "Include CAD tools, simulations, and engineering methodologies" :
          profession === "business" ? "Include accounting software, financial skills, and compliance knowledge" :
          profession === "customs" ? "Include regulatory frameworks, trade compliance, and documentation skills" :
          profession === "safety" ? "Include safety certifications, protocols, and regulatory standards" :
          profession === "designer" ? "Include design software, specialties, and creative tools" :
          profession === "data" ? "Include analytics tools, programming languages, and visualization software" :
          profession === "sales" ? "Include CRM platforms, sales methodologies, and negotiation skills" :
          profession === "hr" ? "Include clinical software/HRIS, therapeutic modalities, case management, or HR methodologies" :
          "List relevant skills and tools"
        }
      >
        {profession === "it" ? (
          <div className="skills-categories">
            {skillCategories.map(({ key, label }) => {
              const options = SKILL_OPTIONS[key] || [];
              const selected = Array.isArray(technicalSkills[key])
                ? technicalSkills[key]
                : [];

              if (options.length > 0) {
                return (
                  <div key={key} className="field">
                    <span>{label}</span>
                    <div className="skill-checklist">
                      {options.map((opt) => {
                        const isSelected = selected.includes(opt);
                        return (
                          <button
                            key={opt}
                            type="button"
                            className={`skill-chip ${isSelected ? "selected" : ""}`}
                            aria-pressed={isSelected}
                            onClick={() => {
                              const next = isSelected
                                ? selected.filter((l) => l !== opt)
                                : [...selected, opt];
                              updateTechnicalSkill(key, next);
                            }}
                          >
                            <span className="chip-label">{opt}</span>
                            <span className="chip-icon">
                              {isSelected ? "✕" : "✓"}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              return (
                <Field
                  key={key}
                  label={label}
                  value={technicalSkills[key]}
                  onChange={(v) => updateTechnicalSkill(key, v)}
                  placeholder=""
                />
              );
            })}
          </div>
        ) : (
          <div>
            <Field
              label="Key Skills"
              value={resume.skills || ""}
              onChange={(v) => updateField("skills", v)}
              placeholder={
                profession === "healthcare" ? "Patient care, Vital signs monitoring, Electronic health records, Medication administration" :
                profession === "education" ? "Lesson planning, Classroom management, Differentiated instruction, Assessment design" :
                profession === "management" ? "Strategic planning, Budget management, Team leadership, Stakeholder communication" :
                profession === "engineering" ? "Technical drawing, Quality control, Process optimization, Structural analysis" :
                profession === "business" ? "Financial analysis, Bookkeeping, Tax preparation, Audit compliance, Budgeting" :
                profession === "customs" ? "Tariff classification, Trade compliance, Import/export documentation, Risk assessment" :
                profession === "safety" ? "Hazard identification, Risk assessment, Safety auditing, Incident investigation" :
                profession === "designer" ? "Typography, Layout design, Color theory, Brand identity, Visual storytelling" :
                profession === "data" ? "Data cleaning, Statistical modeling, A/B testing, Data visualization, ETL pipelines" :
                profession === "sales" ? "Lead generation, Negotiation, Pipeline management, Client relationship building" :
                profession === "hr" ? "Psychotherapy, Crisis intervention, Case management, Talent acquisition, Employee relations, Behavior analysis" :
                "List key skills, separated by commas"
              }
            />

            {/* Healthcare-specific */}
            {profession === "healthcare" && (
              <>
                <Field
                  label="License / Registration"
                  value={resume.license || ""}
                  onChange={(v) => updateField("license", v)}
                  placeholder="RN License / Nursing Registration"
                />
                <Section
                  title="Clinical Skills"
                  hint="Key clinical competencies"
                >
                  <BulletList
                    bullets={getArray("clinicalSkills")}
                    onChange={(i, v) => updateArray("clinicalSkills", i, v)}
                    onAdd={() => addArrayItem("clinicalSkills", "")}
                    onRemove={(i) => removeArrayItem("clinicalSkills", i)}
                    placeholder="Wound care, IV therapy, Patient assessment"
                  />
                </Section>
              </>
            )}

            {/* Education-specific */}
            {profession === "education" && (
              <>
                <Field
                  label="Teaching Certificate"
                  value={resume.teacherCert || ""}
                  onChange={(v) => updateField("teacherCert", v)}
                  placeholder="State Teaching License, TESOL Certification"
                />
                <Section
                  title="Subjects Taught"
                  hint="Primary subjects or specialties"
                >
                  <BulletList
                    bullets={getArray("subjects")}
                    onChange={(i, v) => updateArray("subjects", i, v)}
                    onAdd={() => addArrayItem("subjects", "")}
                    onRemove={(i) => removeArrayItem("subjects", i)}
                    placeholder="Mathematics, Physics, English"
                  />
                </Section>
              </>
            )}

            {/* Management-specific */}
            {profession === "management" && (
              <>
                <Field
                  label="Management Certifications"
                  value={resume.managementCert || ""}
                  onChange={(v) => updateField("managementCert", v)}
                  placeholder="PMP, Scrum Master, Six Sigma"
                />
                <Section
                  title="Leadership Competencies"
                  hint="Leadership and operations skills"
                >
                  <BulletList
                    bullets={getArray("managementSkills")}
                    onChange={(i, v) => updateArray("managementSkills", i, v)}
                    onAdd={() => addArrayItem("managementSkills", "")}
                    onRemove={(i) => removeArrayItem("managementSkills", i)}
                    placeholder="Team building, Strategic planning, Change management"
                  />
                </Section>
              </>
            )}

            {/* Engineering-specific */}
            {profession === "engineering" && (
              <>
                <Field
                  label="Engineering Software & Tools"
                  value={resume.engineeringTools || ""}
                  onChange={(v) => updateField("engineeringTools", v)}
                  placeholder="AutoCAD, SolidWorks, MATLAB, ANSYS, LabVIEW"
                />
                <Field
                  label="Methodologies & Standards"
                  value={resume.engineeringMethods || ""}
                  onChange={(v) => updateField("engineeringMethods", v)}
                  placeholder="Lean Manufacturing, Six Sigma, ISO 9001, FEA"
                />
              </>
            )}

            {/* Business & Accountancy-specific */}
            {profession === "business" && (
              <>
                <Field
                  label="Accounting Software"
                  value={resume.accountingSoftware || ""}
                  onChange={(v) => updateField("accountingSoftware", v)}
                  placeholder="QuickBooks, SAP, Xero, Excel (Advanced), Peachtree"
                />
                <Field
                  label="License / CPA"
                  value={resume.cpaLicense || ""}
                  onChange={(v) => updateField("cpaLicense", v)}
                  placeholder="CPA, CMA, or equivalent license"
                />
              </>
            )}

            {/* Customs Administration-specific */}
            {profession === "customs" && (
              <>
                <Field
                  label="Regulatory Knowledge"
                  value={resume.regulatoryKnowledge || ""}
                  onChange={(v) => updateField("regulatoryKnowledge", v)}
                  placeholder="CMTA, ASEAN Free Trade, WTO Valuation, HS Code Classification"
                />
                <Field
                  label="Compliance & Documentation"
                  value={resume.complianceSkills || ""}
                  onChange={(v) => updateField("complianceSkills", v)}
                  placeholder="Import/Export permits, Customs bonds, Trade facilitation"
                />
              </>
            )}

            {/* Safety Officer-specific */}
            {profession === "safety" && (
              <>
                <Field
                  label="Safety Certifications"
                  value={resume.safetyCerts || ""}
                  onChange={(v) => updateField("safetyCerts", v)}
                  placeholder="OSHA 30-Hour, NEBOSH, CSP, First Aid/CPR Instructor"
                />
                <Field
                  label="Safety Protocols & Standards"
                  value={resume.safetyProtocols || ""}
                  onChange={(v) => updateField("safetyProtocols", v)}
                  placeholder="OSHA compliance, ISO 45001, Fire safety, PPE management"
                />
              </>
            )}

            {/* Graphic Designer-specific */}
            {profession === "designer" && (
              <>
                <Field
                  label="Design Software"
                  value={resume.designTools || ""}
                  onChange={(v) => updateField("designTools", v)}
                  placeholder="Figma, Adobe Photoshop, Illustrator, After Effects, InDesign"
                />
                <Field
                  label="Design Specialties"
                  value={resume.designSpecialties || ""}
                  onChange={(v) => updateField("designSpecialties", v)}
                  placeholder="UI/UX Design, Brand Identity, Motion Graphics, Print Design"
                />
              </>
            )}

            {/* Data Analytics-specific */}
            {profession === "data" && (
              <>
                <Field
                  label="Analytics & Visualization Tools"
                  value={resume.analyticsTools || ""}
                  onChange={(v) => updateField("analyticsTools", v)}
                  placeholder="Python, R, SQL, Tableau, Power BI, Excel (Advanced)"
                />
                <Field
                  label="Data Techniques"
                  value={resume.dataTechniques || ""}
                  onChange={(v) => updateField("dataTechniques", v)}
                  placeholder="Machine Learning, Regression, Clustering, A/B Testing, ETL"
                />
              </>
            )}

            {/* Sales-specific */}
            {profession === "sales" && (
              <>
                <Field
                  label="CRM & Sales Tools"
                  value={resume.crmTools || ""}
                  onChange={(v) => updateField("crmTools", v)}
                  placeholder="Salesforce, HubSpot, Pipedrive, LinkedIn Sales Navigator"
                />
                <Field
                  label="Sales Methodologies"
                  value={resume.salesMethods || ""}
                  onChange={(v) => updateField("salesMethods", v)}
                  placeholder="SPIN Selling, Consultative Sales, MEDDIC, Solution Selling"
                />
              </>
            )}

            {/* HR / Behavioral Health-specific */}
            {profession === "hr" && (
              <>
                <Field
                  label="Clinical Tools & HRIS Systems"
                  value={resume.hrisTools || ""}
                  onChange={(v) => updateField("hrisTools", v)}
                  placeholder="DSM-5, EHR/EMR (Epic), Workday, BambooHR, Assessment tools"
                />
                <Field
                  label="Behavioral & Organizational Competencies"
                  value={resume.hrCompetencies || ""}
                  onChange={(v) => updateField("hrCompetencies", v)}
                  placeholder="Cognitive Behavioral Therapy (CBT), Crisis intervention, Case management, Labor laws, Talent acquisition"
                />
              </>
            )}
          </div>
        )}
      </Section>

      <Section
        title="Education"
        hint="Include GPA if 3.5+ and coursework aligned to the job"
        onAdd={() =>
          addItem("education", {
            school: "",
            degree: "",
            field: "",
            endDate: "",
            gpa: "",
            coursework: "",
          })
        }
        addLabel="Add School"
      >
        {education.map((edu, eduIndex) => (
          <div key={edu.id} className="card">
            <div className="card-header">
              <span className="card-label">School {eduIndex + 1}</span>
              {education.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-danger"
                  onClick={() => removeItem("education", edu.id)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="field-grid">
              <Field
                label="School"
                value={edu.school}
                onChange={(v) => updateList("education", edu.id, "school", v)}
                placeholder="State University"
              />
              <Field
                label="Degree"
                value={edu.degree}
                onChange={(v) => updateList("education", edu.id, "degree", v)}
                placeholder="B.S. Computer Science"
              />
              <Field
                label="Field of Study"
                value={edu.field}
                onChange={(v) => updateList("education", edu.id, "field", v)}
                placeholder="Computer Science"
              />
              <Field
                label="Graduation Date"
                value={edu.endDate}
                onChange={(v) => updateList("education", edu.id, "endDate", v)}
                placeholder="May 2026"
              />
              <Field
                label="GPA"
                value={edu.gpa}
                onChange={(v) => updateList("education", edu.id, "gpa", v)}
                placeholder="3.7"
                error={errors[`edu_gpa_${edu.id}`]}
              />
            </div>
            <Field
              label="Relevant Coursework"
              value={edu.coursework}
              onChange={(v) => updateList("education", edu.id, "coursework", v)}
              placeholder="Data Structures, Algorithms, Database Systems, Software Engineering"
            />
          </div>
        ))}
      </Section>

      <Section
        title={
          profession === "it" ? "Technical Projects" :
          profession === "healthcare" ? "Clinical Rotations & Placements" :
          profession === "education" ? "Teaching Projects" :
          profession === "management" ? "Project Experience" :
          profession === "engineering" ? "Engineering Projects" :
          profession === "business" ? "Financial Projects" :
          profession === "customs" ? "Compliance Projects" :
          profession === "safety" ? "Safety Initiatives" :
          profession === "designer" ? "Portfolio Projects" :
          profession === "data" ? "Data Projects" :
          profession === "sales" ? "Sales Campaigns & Wins" :
          profession === "hr" ? "Clinical Cases & HR Programs" :
          "Project Experience"
        }
        hint={
          profession === "it" ? "Most important section for IT students — show impact with numbers" :
          profession === "healthcare" ? "Details of clinical rotations, ward assignments, and hospital placements during medical/nursing training" :
          profession === "education" ? "Teaching projects, curriculum development, or classroom initiatives" :
          profession === "management" ? "Projects demonstrating leadership, process improvements, or outcomes" :
          profession === "engineering" ? "Capstone projects, design work, or engineering problem-solving" :
          profession === "business" ? "Audit projects, financial analyses, or process improvements" :
          profession === "customs" ? "Trade compliance reviews, classification projects, or regulatory audits" :
          profession === "safety" ? "Safety programs, inspections, or incident reduction initiatives" :
          profession === "designer" ? "Design projects showing creative process and measurable outcomes" :
          profession === "data" ? "Analytics projects, dashboards, or predictive models with impact" :
          profession === "sales" ? "Campaigns, key deals, or territory expansions with revenue impact" :
          profession === "hr" ? "Case studies, wellness programs, support groups, or organizational initiatives" :
          "Projects demonstrating relevant skills and outcomes"
        }
        onAdd={() =>
          addItem("projects", {
            name: "",
            link: "",
            stack: "",
            bullets: [""],
          })
        }
        addLabel={profession === "healthcare" ? "Add Clinical Rotation" : ["it", "engineering", "data", "designer"].includes(profession) ? "Add Project" : "Add Entry"}
      >
        {projects.map((proj, projIndex) => (
          <div key={proj.id} className="card">
            <div className="card-header">
              <span className="card-label">
                {profession === "healthcare"
                  ? `Rotation ${projIndex + 1}`
                  : ["it", "engineering", "data", "designer"].includes(profession)
                    ? `Project ${projIndex + 1}`
                    : `Entry ${projIndex + 1}`}
              </span>
              {projects.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-danger"
                  onClick={() => removeItem("projects", proj.id)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="field-grid">
              <Field
                label={
                  profession === "healthcare" ? "Hospital / Clinical Facility" :
                  profession === "education" ? "Project / Course" :
                  profession === "engineering" ? "Project Name" :
                  profession === "business" ? "Project / Engagement" :
                  profession === "customs" ? "Project / Assignment" :
                  profession === "safety" ? "Initiative / Program" :
                  profession === "designer" ? "Project / Client" :
                  profession === "data" ? "Project Name" :
                  profession === "sales" ? "Campaign / Deal" :
                  profession === "hr" ? "Program / Case Study" :
                  "Project Name"
                }
                value={proj.name}
                onChange={(v) => updateList("projects", proj.id, "name", v)}
                placeholder={
                  profession === "it" ? "Task Tracker API" :
                  profession === "healthcare" ? "City General Hospital" :
                  profession === "education" ? "Curriculum redesign — Grade 10 Algebra" :
                  profession === "management" ? "Customer onboarding improvement" :
                  profession === "engineering" ? "Bridge Load Analysis — Capstone" :
                  profession === "business" ? "Year-end Audit — Client ABC Corp" :
                  profession === "customs" ? "HS Code Reclassification Project" :
                  profession === "safety" ? "Workplace Hazard Elimination Program" :
                  profession === "designer" ? "Brand Redesign — Startup XYZ" :
                  profession === "data" ? "Customer Churn Prediction Model" :
                  profession === "sales" ? "Enterprise SaaS Expansion — APAC" :
                  profession === "hr" ? "Cognitive Behavioral Therapy Program" :
                  "Project Name"
                }
              />
              <Field
                label={
                  profession === "healthcare" ? "Clinical Supervisor / MD" :
                  profession === "education" ? "Link (optional)" :
                  profession === "management" ? "Role" :
                  profession === "engineering" ? "Link / Repository" :
                  profession === "designer" ? "Portfolio Link" :
                  profession === "data" ? "Link / Repository" :
                  profession === "business" ? "Role" :
                  profession === "customs" ? "Agency / Department" :
                  profession === "safety" ? "Role" :
                  profession === "sales" ? "Role / Territory" :
                  profession === "hr" ? "Role" :
                  "Link"
                }
                value={proj.link}
                onChange={(v) => updateList("projects", proj.id, "link", v)}
                placeholder={
                  profession === "it" ? "github.com/janedoe/task-tracker" :
                  profession === "healthcare" ? "Dr. Jane Smith, Lead MD" :
                  profession === "education" ? "Link to lesson plan or portfolio" :
                  profession === "management" ? "Project Lead" :
                  profession === "engineering" ? "github.com/janedoe/bridge-sim" :
                  profession === "designer" ? "behance.net/janedoe/brand-xyz" :
                  profession === "data" ? "kaggle.com/janedoe/churn-model" :
                  profession === "business" ? "Senior Auditor" :
                  profession === "customs" ? "Bureau of Customs — Assessment Div." :
                  profession === "safety" ? "Safety Lead" :
                  profession === "sales" ? "Account Executive — APAC Region" :
                  profession === "hr" ? "Counselor / HR Generalist" :
                  "Link or role"
                }
              />
              <Field
                label={
                  profession === "it" ? "Tech Stack" :
                  profession === "healthcare" ? "Specialty / Ward" :
                  profession === "education" ? "Role / Grade Level" :
                  profession === "engineering" ? "Tools Used" :
                  profession === "designer" ? "Tools Used" :
                  profession === "data" ? "Tools & Libraries" :
                  "Outcome / Metrics"
                }
                value={proj.stack}
                onChange={(v) => updateList("projects", proj.id, "stack", v)}
                placeholder={
                  profession === "it" ? "React, Node.js, PostgreSQL, Docker" :
                  profession === "healthcare" ? "Cardiology / ICU" :
                  profession === "education" ? "Lead Instructor — Grade 10" :
                  profession === "management" ? "Improved cycle time by 20%" :
                  profession === "engineering" ? "AutoCAD, ANSYS, MATLAB" :
                  profession === "business" ? "Reduced variance by 15%" :
                  profession === "customs" ? "Reclassified 200+ items, 98% accuracy" :
                  profession === "safety" ? "Reduced incidents by 40%" :
                  profession === "designer" ? "Figma, Illustrator, After Effects" :
                  profession === "data" ? "Python, Pandas, Scikit-learn, Tableau" :
                  profession === "sales" ? "Closed $500K in new revenue" :
                  profession === "hr" ? "Achieved 95% client goal success rate or reduced attrition by 20%" :
                  "Tools or outcomes"
                }
              />
            </div>
            <BulletList
              bullets={proj.bullets}
              onChange={(i, v) => updateBullets("projects", proj.id, i, v)}
              onAdd={() => addBullet("projects", proj.id)}
              onRemove={(i) => removeBullet("projects", proj.id, i)}
              placeholder={
                profession === "it" ? "Developed REST API serving 500+ daily requests with 99.9% uptime" :
                profession === "healthcare" ? "Completed 120+ clinical hours administering medication and assessing patient vitals" :
                profession === "education" ? "Designed curriculum used by 120 students with measurable learning gains" :
                profession === "management" ? "Led cross-functional team to deliver product feature on time" :
                profession === "engineering" ? "Designed load-bearing structure supporting 2x rated capacity" :
                profession === "business" ? "Reconciled $2M in accounts with zero discrepancies" :
                profession === "customs" ? "Reviewed 500+ import declarations for tariff compliance" :
                profession === "safety" ? "Conducted 50+ site inspections, reducing safety violations by 35%" :
                profession === "designer" ? "Created brand identity system adopted across 5 product lines" :
                profession === "data" ? "Built predictive model achieving 92% accuracy for churn prediction" :
                profession === "sales" ? "Exceeded quarterly quota by 140% through consultative selling" :
                profession === "hr" ? "Designed and facilitated therapy sessions or corporate wellness workshops for 50+ participants" :
                "Describe your contribution and impact"
              }
            />
          </div>
        ))}
      </Section>

      {userType === "student" && (
        <Section
          title="Achievements"
          hint="Competitions, student org leadership, awards — show impact and scope"
          onAdd={() =>
            addItem("achievements", {
              title: "",
              organization: "",
              date: "",
              distinction: "",
              bullets: [""],
            })
          }
          addLabel="Add Achievement"
        >
          {achievements.map((ach, achIndex) => (
            <div key={ach.id} className="card">
              <div className="card-header">
                <span className="card-label">Achievement {achIndex + 1}</span>
                {achievements.length > 1 && (
                  <button
                    type="button"
                    className="btn btn-ghost btn-sm btn-danger"
                    onClick={() => removeItem("achievements", ach.id)}
                  >
                    Remove
                  </button>
                )}
              </div>
              <div className="field-grid">
                <Field
                  label="Title"
                  value={ach.title}
                  onChange={(v) =>
                    updateList("achievements", ach.id, "title", v)
                  }
                  placeholder="President, Developer Student Club"
                />
                <Field
                  label="Organization"
                  value={ach.organization}
                  onChange={(v) =>
                    updateList("achievements", ach.id, "organization", v)
                  }
                  placeholder="University Name / Competition"
                />
                <Field
                  label="Distinction"
                  value={ach.distinction}
                  onChange={(v) =>
                    updateList("achievements", ach.id, "distinction", v)
                  }
                  placeholder="3rd Place, Finalist, Honorable Mention"
                />
                <Field
                  label="Date"
                  value={ach.date}
                  onChange={(v) =>
                    updateList("achievements", ach.id, "date", v)
                  }
                  placeholder="Apr 2025"
                />
              </div>
              <BulletList
                bullets={ach.bullets}
                onChange={(i, v) => updateBullets("achievements", ach.id, i, v)}
                onAdd={() => addBullet("achievements", ach.id)}
                onRemove={(i) => removeBullet("achievements", ach.id, i)}
                placeholder="Led a team of 6 to build a web app used by 200+ students"
              />
            </div>
          ))}
        </Section>
      )}

      <Section
        title="Experience"
        hint={
          profession === "it" ? "Internships, part-time IT roles, freelance, or campus tech jobs" :
          profession === "healthcare" ? "Professional healthcare employment history, clinical internships, or residency positions" :
          profession === "education" ? "Teaching roles, tutoring, assistant positions, or education internships" :
          profession === "management" ? "Leadership roles, project management, or operations positions" :
          profession === "engineering" ? "Engineering internships, lab work, or manufacturing roles" :
          profession === "business" ? "Accounting internships, bookkeeping, or finance roles" :
          profession === "customs" ? "Government roles, trade compliance, or customs internships" :
          profession === "safety" ? "Safety officer roles, EHS internships, or compliance positions" :
          profession === "designer" ? "Design roles, freelance work, or creative internships" :
          profession === "data" ? "Data analyst roles, research positions, or analytics internships" :
          profession === "sales" ? "Sales roles, account management, or business development" :
          profession === "hr" ? "Counseling, social work, HR, psychology, or community support roles" :
          "Work experience, internships, or relevant roles"
        }
        onAdd={() =>
          addItem("experience", {
            company: "",
            title: "",
            location: "",
            startDate: "",
            endDate: "",
            current: false,
            bullets: [""],
          })
        }
        addLabel="Add Role"
      >
        {experience.map((exp, expIndex) => (
          <div key={exp.id} className="card">
            <div className="card-header">
              <span className="card-label">Role {expIndex + 1}</span>
              {experience.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-danger"
                  onClick={() => removeItem("experience", exp.id)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="field-grid">
              <Field
                label="Job Title"
                value={exp.title}
                onChange={(v) => updateList("experience", exp.id, "title", v)}
                placeholder={
                  profession === "it" ? "Software Engineering Intern" :
                  profession === "healthcare" ? "Student Nurse / Clinical Intern" :
                  profession === "education" ? "Student Teacher / Teaching Assistant" :
                  profession === "management" ? "Project Coordinator" :
                  profession === "engineering" ? "Engineering Intern" :
                  profession === "business" ? "Junior Accountant / Audit Intern" :
                  profession === "customs" ? "Customs Examiner / Trade Analyst" :
                  profession === "safety" ? "Safety Inspector / EHS Intern" :
                  profession === "designer" ? "Graphic Designer / Design Intern" :
                  profession === "data" ? "Data Analyst Intern" :
                  profession === "sales" ? "Sales Representative / BDR" :
                  profession === "hr" ? "Psychologist / HR Specialist" :
                  "Job Title"
                }
              />
              <Field
                label={profession === "healthcare" ? "Hospital / Facility" : "Company"}
                value={exp.company}
                onChange={(v) => updateList("experience", exp.id, "company", v)}
                placeholder={
                  profession === "it" ? "Tech Company Inc." :
                  profession === "healthcare" ? "City General Hospital" :
                  profession === "education" ? "Lincoln High School" :
                  profession === "management" ? "Consulting Firm LLC" :
                  profession === "engineering" ? "Manufacturing Corp." :
                  profession === "business" ? "Accounting Firm LLP" :
                  profession === "customs" ? "Bureau of Customs" :
                  profession === "safety" ? "Safety Solutions Inc." :
                  profession === "designer" ? "Creative Agency Co." :
                  profession === "data" ? "Analytics Corp." :
                  profession === "sales" ? "SaaS Company Inc." :
                  profession === "hr" ? "Behavioral Health Center / Corporate HR" :
                  "Company Name"
                }
              />
              <Field
                label="Location"
                value={exp.location}
                onChange={(v) =>
                  updateList("experience", exp.id, "location", v)
                }
                placeholder="Remote"
              />
              <Field
                label="Start Date"
                value={exp.startDate}
                onChange={(v) =>
                  updateList("experience", exp.id, "startDate", v)
                }
                placeholder="Jun 2025"
              />
              <Field
                label="End Date"
                value={exp.endDate}
                onChange={(v) => updateList("experience", exp.id, "endDate", v)}
                placeholder="Aug 2025"
              />
            </div>
            <label className="checkbox-field">
              <input
                type="checkbox"
                checked={exp.current}
                onChange={(e) =>
                  updateList("experience", exp.id, "current", e.target.checked)
                }
              />
              <span>I currently work here</span>
            </label>
            <BulletList
              bullets={exp.bullets}
              onChange={(i, v) => updateBullets("experience", exp.id, i, v)}
              onAdd={() => addBullet("experience", exp.id)}
              onRemove={(i) => removeBullet("experience", exp.id, i)}
              placeholder={
                profession === "it" ? "Reduced page load time by 35% by optimizing SQL queries and caching" :
                profession === "healthcare" ? "Provided direct patient care for 8+ patients per shift in ICU setting" :
                profession === "education" ? "Developed differentiated lesson plans for 30+ students across learning levels" :
                profession === "management" ? "Managed $500K project budget and delivered 2 weeks ahead of schedule" :
                profession === "engineering" ? "Optimized manufacturing process reducing waste by 15%" :
                profession === "business" ? "Prepared monthly financial statements for 12 client accounts" :
                profession === "customs" ? "Processed 100+ import entries daily with 99% accuracy rate" :
                profession === "safety" ? "Conducted weekly safety audits reducing workplace incidents by 25%" :
                profession === "designer" ? "Redesigned client dashboard increasing user engagement by 40%" :
                profession === "data" ? "Built automated reporting dashboard saving 10+ hours per week" :
                profession === "sales" ? "Generated $200K in pipeline through outbound prospecting" :
                profession === "hr" ? "Conducted comprehensive assessments and case management for 40+ active clients" :
                "Describe your contribution and impact with measurable results"
              }
            />
          </div>
        ))}
      </Section>

      <Section
        title="Certifications"
        hint={
          profession === "healthcare" ? "Licenses and clinical certifications (BLS, ACLS, specialty credentials)" :
          profession === "education" ? "Teaching certificates, endorsements, and state licenses" :
          profession === "management" ? "Professional certifications (PMP, Scrum, Six Sigma)" :
          profession === "engineering" ? "Engineering licenses, safety certifications, or tool credentials (PE, FE, SolidWorks)" :
          profession === "business" ? "Financial and accounting credentials (CPA, CMA, CFA, QuickBooks)" :
          profession === "customs" ? "Customs and trade licensing (Licensed Customs Broker, compliance specialist)" :
          profession === "safety" ? "Safety and environmental certifications (OSHA, NEBOSH, CSP, ASP)" :
          profession === "designer" ? "Design certifications, tool credentials, or design bootcamps (Adobe, Figma)" :
          profession === "data" ? "Data analysis, cloud, or ML certifications (Google Data Analytics, AWS Machine Learning)" :
          profession === "sales" ? "Sales certifications, training, or CRM certificates (Salesforce, HubSpot)" :
          profession === "hr" ? "HR certifications and standards (SHRM-CP, PHR, aPHR)" :
          "AWS, Azure, CompTIA, Oracle, Cisco, etc."
        }
        onAdd={() =>
          addItem("certifications", {
            name: "",
            issuer: "",
            date: "",
          })
        }
        addLabel="Add Certification"
      >
        {certifications.map((cert, certIndex) => (
          <div key={cert.id} className="card">
            <div className="card-header">
              <span className="card-label">Certification {certIndex + 1}</span>
              {certifications.length > 1 && (
                <button
                  type="button"
                  className="btn btn-ghost btn-sm btn-danger"
                  onClick={() => removeItem("certifications", cert.id)}
                >
                  Remove
                </button>
              )}
            </div>
            <div className="field-grid">
              <Field
                label="Certification Name"
                value={cert.name}
                onChange={(v) =>
                  updateList("certifications", cert.id, "name", v)
                }
                placeholder={
                  profession === "healthcare" ? "BLS, ACLS, RN License" :
                  profession === "education" ? "Teaching Certificate, State Endorsement" :
                  profession === "management" ? "PMP, Scrum Master, Six Sigma" :
                  profession === "engineering" ? "Professional Engineer (PE) License" :
                  profession === "business" ? "Certified Public Accountant (CPA)" :
                  profession === "customs" ? "Licensed Customs Broker (LCB)" :
                  profession === "safety" ? "OSHA 30-Hour Construction Safety" :
                  profession === "designer" ? "Figma Certified Professional" :
                  profession === "data" ? "Google Professional Data Analyst" :
                  profession === "sales" ? "Salesforce Certified Administrator" :
                  profession === "hr" ? "SHRM Certified Professional (SHRM-CP)" :
                  "AWS Certified Cloud Practitioner"
                }
              />
              <Field
                label="Issuer"
                value={cert.issuer}
                onChange={(v) =>
                  updateList("certifications", cert.id, "issuer", v)
                }
                placeholder={
                  profession === "healthcare" ? "State Board / Hospital" :
                  profession === "education" ? "State Department / University" :
                  profession === "management" ? "PMI / Scrum.org" :
                  profession === "engineering" ? "National Council of Examiners (NCEES)" :
                  profession === "business" ? "State Board of Accountancy" :
                  profession === "customs" ? "Bureau of Customs / Professional Regulation Commission" :
                  profession === "safety" ? "Occupational Safety & Health Administration (OSHA)" :
                  profession === "designer" ? "Figma" :
                  profession === "data" ? "Google / Coursera" :
                  profession === "sales" ? "Salesforce" :
                  profession === "hr" ? "Society for Human Resource Management (SHRM)" :
                  "Amazon Web Services"
                }
              />
              <Field
                label="Date"
                value={cert.date}
                onChange={(v) =>
                  updateList("certifications", cert.id, "date", v)
                }
                placeholder="Jan 2026"
              />
            </div>
          </div>
        ))}
      </Section>
    </div>
  );
}

export default ResumeEditor;
