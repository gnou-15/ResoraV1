import { formatPhone, formatLocationShort } from "../utils/contactFormat";

function formatDateRange(start, end, current) {
  if (!start && !end) return "";
  if (current) return `${start} - Present`;
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function hasContent(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some((v) => hasContent(v));
  if (typeof value === "string") return Boolean(value.trim());
  return Boolean(String(value));
}

function ContactLine({ personal }) {
  const phone = formatPhone(personal);
  const location = formatLocationShort(personal.location);

  const items = [
    personal.email,
    phone,
    location,
    personal.github,
    personal.linkedin,
    personal.portfolio,
  ].filter(hasContent);

  if (items.length === 0) return null;

  return <p className="preview-contact">{items.join(" | ")}</p>;
}

function SkillBlock({ label, value }) {
  const content = Array.isArray(value)
    ? value.filter(Boolean).join(", ")
    : value;
  if (!content || !String(content).trim()) return null;
  return (
    <p className="skill-line">
      <strong>{label}:</strong> {content}
    </p>
  );
}

function ResumePreview({ resume }) {
  const {
    personal,
    headline,
    summary,
    technicalSkills,
    education,
    projects,
    experience,
    certifications,
    achievements,
    userType,
  } = resume;

  const filledEducation = education.filter((e) => e.school || e.degree);
  const filledProjects = projects.filter(
    (p) => p.name || p.bullets.some((b) => hasContent(b)),
  );
  const filledExperience = experience.filter(
    (e) => e.title || e.company || e.bullets.some((b) => hasContent(b)),
  );
  const filledCerts = certifications.filter((c) => c.name || c.issuer);
  const filledAchievements = (achievements || []).filter(
    (a) => a.title || a.organization || a.bullets.some((b) => hasContent(b)),
  );

  const hasSkills = Object.values(technicalSkills).some(hasContent);

  function parseDateValue(d) {
    if (!d) return 0;
    const s = String(d).trim();
    // try parsing whole string first
    let t = Date.parse(s);
    if (!isNaN(t)) return t;

    // if string is a range like 'Aug 2024 - Aug 2025', try the last segment
    const parts = s
      .split(/[-–—]/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const tt = Date.parse(parts[i]);
      if (!isNaN(tt)) return tt;
    }

    // fallback: find last 4-digit year
    const years = s.match(/\d{4}/g);
    if (years && years.length) {
      const y = years[years.length - 1];
      const tt = Date.parse(y);
      if (!isNaN(tt)) return tt;
    }

    return 0;
  }

  function parseFirstDateValue(d) {
    if (!d) return 0;
    const s = String(d).trim();
    // try the first segment (for ranges)
    const parts = s
      .split(/[-–—]/)
      .map((p) => p.trim())
      .filter(Boolean);
    if (parts.length === 0) return 0;
    const t = Date.parse(parts[0]);
    if (!isNaN(t)) return t;
    const year = parts[0].match(/\d{4}/);
    if (year) {
      const tt = Date.parse(year[0]);
      if (!isNaN(tt)) return tt;
    }
    return 0;
  }

  // show latest achievements first
  const sortedAchievements = filledAchievements.slice().sort((a, b) => {
    const taEnd = parseDateValue(a.date);
    const tbEnd = parseDateValue(b.date);
    if (tbEnd !== taEnd) return tbEnd - taEnd;
    const taStart = parseFirstDateValue(a.date);
    const tbStart = parseFirstDateValue(b.date);
    if (tbStart !== taStart) return tbStart - taStart;
    return 0;
  });

  // show latest experience first (current roles first)
  const sortedExperience = filledExperience.slice().sort((a, b) => {
    if (a.current && !b.current) return -1;
    if (!a.current && b.current) return 1;
    const taEnd = parseDateValue(a.endDate || a.startDate);
    const tbEnd = parseDateValue(b.endDate || b.startDate);
    if (tbEnd !== taEnd) return tbEnd - taEnd;
    const taStart = parseFirstDateValue(a.startDate || a.endDate);
    const tbStart = parseFirstDateValue(b.startDate || b.endDate);
    if (tbStart !== taStart) return tbStart - taStart;
    return 0;
  });

  return (
    <article className="resume-preview resume-ats">
      <header className="preview-header">
        <h1>{(personal.fullName || "Your Name").toUpperCase()}</h1>
        {hasContent(headline) && <p className="preview-headline">{headline}</p>}
        <ContactLine personal={personal} />
      </header>

      {hasContent(summary) && (
        <section className="preview-section">
          <h2>Professional Summary</h2>
          <p className="summary-text">{summary}</p>
        </section>
      )}

      {hasSkills && (
        <section className="preview-section">
          <h2>Technical Skills</h2>
          <SkillBlock label="Languages" value={technicalSkills.languages} />
          <SkillBlock label="Frameworks" value={technicalSkills.frameworks} />
          <SkillBlock label="Tools" value={technicalSkills.tools} />
          <SkillBlock label="Databases" value={technicalSkills.databases} />
          <SkillBlock label="Cloud" value={technicalSkills.cloud} />
        </section>
      )}

      {filledEducation.length > 0 && (
        <section className="preview-section">
          <h2>Education</h2>
          {filledEducation.map((edu) => (
            <div key={edu.id} className="preview-entry">
              <div className="entry-header">
                <div>
                  <h3>
                    {[edu.degree, edu.field].filter(hasContent).join(" in ") ||
                      "Degree"}
                    {hasContent(edu.gpa) && ` | GPA: ${edu.gpa}`}
                  </h3>
                  <p className="entry-sub">{edu.school}</p>
                  {hasContent(edu.coursework) && (
                    <p className="entry-detail">
                      <strong>Relevant Coursework:</strong> {edu.coursework}
                    </p>
                  )}
                </div>
                {hasContent(edu.endDate) && (
                  <span className="entry-date">{edu.endDate}</span>
                )}
              </div>
            </div>
          ))}
        </section>
      )}

      {filledProjects.length > 0 && (
        <section className="preview-section">
          <h2>Technical Projects</h2>
          {filledProjects.map((proj) => (
            <div key={proj.id} className="preview-entry">
              <div className="entry-header">
                <div>
                  <h3>
                    {proj.name || "Project"}
                    {hasContent(proj.link) && ` | ${proj.link}`}
                  </h3>
                  {hasContent(proj.stack) && (
                    <p className="entry-sub">
                      <strong>Tech Stack:</strong> {proj.stack}
                    </p>
                  )}
                </div>
              </div>
              {proj.bullets.filter(hasContent).length > 0 && (
                <ul>
                  {proj.bullets.filter(hasContent).map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {userType === "student" && sortedAchievements.length > 0 && (
        <section className="preview-section">
          <h2>Achievements</h2>
          {sortedAchievements.map((ach) => (
            <div key={ach.id} className="preview-entry">
              <div className="entry-header">
                <div>
                  <h3>
                    {ach.title || "Achievement"}
                    {hasContent(ach.distinction) && ` — ${ach.distinction}`}
                  </h3>
                  {hasContent(ach.organization) && (
                    <p className="entry-sub">{ach.organization}</p>
                  )}
                </div>
                {hasContent(ach.date) && (
                  <span className="entry-date">{ach.date}</span>
                )}
              </div>
              {ach.bullets?.filter(hasContent).length > 0 && (
                <ul>
                  {ach.bullets.filter(hasContent).map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {sortedExperience.length > 0 && (
        <section className="preview-section">
          <h2>Experience</h2>
          {sortedExperience.map((exp) => (
            <div key={exp.id} className="preview-entry">
              <div className="entry-header">
                <div>
                  <h3>{exp.title || "Job Title"}</h3>
                  <p className="entry-sub">
                    {exp.company}
                    {hasContent(exp.location) && ` | ${exp.location}`}
                  </p>
                </div>
                <span className="entry-date">
                  {formatDateRange(exp.startDate, exp.endDate, exp.current)}
                </span>
              </div>
              {exp.bullets.filter(hasContent).length > 0 && (
                <ul>
                  {exp.bullets.filter(hasContent).map((bullet, i) => (
                    <li key={i}>{bullet}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </section>
      )}

      {filledCerts.length > 0 && (
        <section className="preview-section">
          <h2>Certifications</h2>
          {filledCerts.map((cert) => (
            <p key={cert.id} className="cert-line">
              <strong>{cert.name || "Certification"}</strong>
              {hasContent(cert.issuer) && ` — ${cert.issuer}`}
              {hasContent(cert.date) && ` (${cert.date})`}
            </p>
          ))}
        </section>
      )}
    </article>
  );
}

export default ResumePreview;
