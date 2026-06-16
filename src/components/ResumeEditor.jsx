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
          <Field
            label="GitHub"
            value={personal.github}
            onChange={(v) => updatePersonal("github", v)}
            placeholder="github.com/janedoe"
            error={errors.github}
          />
          <Field
            label="LinkedIn"
            value={personal.linkedin}
            onChange={(v) => updatePersonal("linkedin", v)}
            placeholder="linkedin.com/in/janedoe"
            error={errors.linkedin}
          />
          <Field
            label="Portfolio"
            value={personal.portfolio}
            onChange={(v) => updatePersonal("portfolio", v)}
            placeholder="janedoe.dev"
          />
        </div>
      </Section>

      <Section
        title="Target Role"
        hint="One line with role + top technologies recruiters search for"
      >
        <Field
          label="Headline"
          value={resume.headline}
          onChange={updateHeadline}
          placeholder="Entry-Level Software Developer | Java, React, SQL, AWS"
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
          placeholder="Computer Science graduate seeking a junior developer role. Built full-stack apps with React and Node.js. Strong in data structures, REST APIs, and Agile teamwork."
          rows={3}
          hint={`${resume.summary.length}/320 characters recommended`}
        />
      </Section>

      <Section
        title="Technical Skills"
        hint="List exact tools from job descriptions — ATS matches keywords here first"
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
              placeholder="List key skills, separated by commas (e.g. Project management, Patient care, Curriculum design)"
            />

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

            {profession === "education" && (
              <>
                <Field
                  label="Certifications"
                  value={resume.teacherCert || ""}
                  onChange={(v) => updateField("teacherCert", v)}
                  placeholder="Teaching certificate, grade levels"
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

            {profession === "management" && (
              <>
                <Field
                  label="Certifications"
                  value={resume.managementCert || ""}
                  onChange={(v) => updateField("managementCert", v)}
                  placeholder="PMP, Scrum Master, Six Sigma"
                />
                <Section
                  title="Management Skills"
                  hint="Leadership and operations skills"
                >
                  <BulletList
                    bullets={getArray("managementSkills")}
                    onChange={(i, v) => updateArray("managementSkills", i, v)}
                    onAdd={() => addArrayItem("managementSkills", "")}
                    onRemove={(i) => removeArrayItem("managementSkills", i)}
                    placeholder="Project planning, Stakeholder management"
                  />
                </Section>
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
          profession === "it"
            ? "Technical Projects"
            : profession === "healthcare"
              ? "Clinical Experience"
              : profession === "education"
                ? "Teaching Projects"
                : "Project Experience"
        }
        hint={
          profession === "it"
            ? "Most important section for IT students — show impact with numbers"
            : profession === "healthcare"
              ? "Clinical rotations, initiatives, or patient-focused projects"
              : profession === "education"
                ? "Teaching projects, curriculum development, or classroom initiatives"
                : "Projects demonstrating leadership, process improvements, or outcomes"
        }
        onAdd={() =>
          addItem("projects", {
            name: "",
            link: "",
            stack: "",
            bullets: [""],
          })
        }
        addLabel={profession === "it" ? "Add Project" : "Add Entry"}
      >
        {projects.map((proj, projIndex) => (
          <div key={proj.id} className="card">
            <div className="card-header">
              <span className="card-label">
                {profession === "it"
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
                  profession === "healthcare"
                    ? "Facility / Project"
                    : profession === "education"
                      ? "Project / Course"
                      : profession === "management"
                        ? "Project Name"
                        : "Project Name"
                }
                value={proj.name}
                onChange={(v) => updateList("projects", proj.id, "name", v)}
                placeholder={
                  profession === "healthcare"
                    ? "General Hospital — Clinical rotation"
                    : profession === "education"
                      ? "Curriculum redesign — Grade 10 Algebra"
                      : profession === "management"
                        ? "Customer onboarding improvement"
                        : "Task Tracker API"
                }
              />
              <Field
                label={
                  profession === "healthcare"
                    ? "Department / Supervisor"
                    : profession === "education"
                      ? "Link (optional)"
                      : profession === "management"
                        ? "Role"
                        : "Link"
                }
                value={proj.link}
                onChange={(v) => updateList("projects", proj.id, "link", v)}
                placeholder={
                  profession === "healthcare"
                    ? "Cardiology / Dr. Smith"
                    : profession === "education"
                      ? "Link to lesson plan or portfolio"
                      : profession === "management"
                        ? "Project Lead"
                        : "github.com/janedoe/task-tracker"
                }
              />
              <Field
                label={
                  profession === "it"
                    ? "Tech Stack"
                    : profession === "healthcare"
                      ? "Role / Unit"
                      : profession === "education"
                        ? "Role / Grade Level"
                        : "Outcome / Metrics"
                }
                value={proj.stack}
                onChange={(v) => updateList("projects", proj.id, "stack", v)}
                placeholder={
                  profession === "it"
                    ? "React, Node.js, PostgreSQL, Docker"
                    : profession === "healthcare"
                      ? "Staff Nurse — ICU"
                      : profession === "education"
                        ? "Lead Instructor — Grade 10"
                        : "Improved cycle time by 20%"
                }
              />
            </div>
            <BulletList
              bullets={proj.bullets}
              onChange={(i, v) => updateBullets("projects", proj.id, i, v)}
              onAdd={() => addBullet("projects", proj.id)}
              onRemove={(i) => removeBullet("projects", proj.id, i)}
              placeholder={
                profession === "it"
                  ? "Developed REST API serving 500+ daily requests with 99.9% uptime"
                  : profession === "healthcare"
                    ? "Managed patient caseloads, administered medications, coordinated care"
                    : profession === "education"
                      ? "Designed curriculum used by 120 students with measurable learning gains"
                      : "Led cross-functional team to deliver product feature on time"
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
        hint="Internships, part-time IT roles, freelance, or campus tech jobs"
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
                placeholder="Software Engineering Intern"
              />
              <Field
                label="Company"
                value={exp.company}
                onChange={(v) => updateList("experience", exp.id, "company", v)}
                placeholder="Tech Company Inc."
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
              placeholder="Reduced page load time by 35% by optimizing SQL queries and caching"
            />
          </div>
        ))}
      </Section>

      <Section
        title="Certifications"
        hint={
          profession === "healthcare"
            ? "Licenses and clinical certifications (BLS, ACLS, specialty credentials)"
            : profession === "education"
              ? "Teaching certificates, endorsements, and state licenses"
              : profession === "management"
                ? "Professional certifications (PMP, Scrum, Six Sigma)"
                : "AWS, Azure, CompTIA, Oracle, Cisco, etc."
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
                  profession === "healthcare"
                    ? "BLS, ACLS, RN License"
                    : profession === "education"
                      ? "Teaching Certificate, State Endorsement"
                      : profession === "management"
                        ? "PMP, Scrum Master, Six Sigma"
                        : "AWS Certified Cloud Practitioner"
                }
              />
              <Field
                label="Issuer"
                value={cert.issuer}
                onChange={(v) =>
                  updateList("certifications", cert.id, "issuer", v)
                }
                placeholder={
                  profession === "healthcare"
                    ? "State Board / Hospital"
                    : profession === "education"
                      ? "State Department / University"
                      : profession === "management"
                        ? "PMI / Scrum.org"
                        : "Amazon Web Services"
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
