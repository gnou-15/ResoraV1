import { useState, useEffect, useLayoutEffect } from "react";
import { formatPhone, formatLocationShort } from "../utils/contactFormat";

function formatDateRange(start, end, current) {
  if (!start && !end) return "";
  if (current) return `${start} - Present`;
  if (start && end) return `${start} - ${end}`;
  return start || end;
}

function SkillBlock({ label, value, blockId }) {
  const content = Array.isArray(value)
    ? value.filter(Boolean).join(", ")
    : value;
  if (!content || !String(content).trim()) return null;
  return (
    <p className="skill-line" data-block-id={blockId}>
      <strong>{label}:</strong> {content}
    </p>
  );
}

function hasContent(value) {
  if (value == null) return false;
  if (Array.isArray(value)) return value.some((v) => hasContent(v));
  if (typeof value === "string") return Boolean(value.trim());
  return Boolean(String(value));
}

function ContactLine({ personal, profession }) {
  const phone = formatPhone(personal);
  const location = formatLocationShort(personal.location);

  const showGithub = ["it", "data", "engineering"].includes(profession);
  const showPortfolio = !["healthcare", "business", "customs", "safety"].includes(profession);

  const licenseText =
    profession === "healthcare" && personal.portfolio
      ? `License: ${personal.portfolio}`
      : profession === "business" && personal.portfolio
        ? `CPA / License: ${personal.portfolio}`
        : null;

  const items = [
    personal.email,
    phone,
    location,
    showGithub ? personal.github : null,
    personal.linkedin,
    licenseText || (showPortfolio ? personal.portfolio : null),
  ].filter(hasContent);

  if (items.length === 0) return null;

  return <p className="preview-contact">{items.join(" | ")}</p>;
}

function ResumePreview({ resume, profession, plan, onPageCountChange, isMobilePreviewActive = false }) {
  const [pages, setPages] = useState([]);
  const [isBlurred, setIsBlurred] = useState(false);
  const [measureTrigger, setMeasureTrigger] = useState(0);
  const [measurerNode, setMeasurerNode] = useState(null);

  // Monitor size / visibility changes on the hidden measurer
  useEffect(() => {
    if (!measurerNode) return;

    const resizeObserver = new ResizeObserver(() => {
      setMeasureTrigger((prev) => prev + 1);
    });

    resizeObserver.observe(measurerNode);
    return () => {
      resizeObserver.disconnect();
    };
  }, [measurerNode]);

  // If we switch away from the mobile preview tab, remove the blur overlay automatically
  useEffect(() => {
    if (!isMobilePreviewActive) {
      const timer = setTimeout(() => {
        setIsBlurred(false);
        const wrapper = document.getElementById("resume-preview-root-wrapper");
        if (wrapper) {
          wrapper.classList.remove("blurred-preview");
        }
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isMobilePreviewActive]);

  useEffect(() => {
    const wrapper = document.getElementById("resume-preview-root-wrapper");

    const applyBlur = () => {
      const isMobileDevice = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent) || window.innerWidth <= 768;
      if (isMobileDevice && !isMobilePreviewActive) return;

      if (wrapper) {
        wrapper.classList.add("blurred-preview");
      }
      setIsBlurred(true);
    };

    const handleBlur = (e) => {
      if (e.target !== window && e.target !== document) return;
      applyBlur();
    };

    const handleFocus = (e) => {
      if (e.target !== window && e.target !== document) return;
      if (wrapper) {
        wrapper.classList.remove("blurred-preview");
      }
      setIsBlurred(false);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        applyBlur();
      }
    };

    const handleKeyDown = (e) => {
      const isPrintScreen = e.key === "PrintScreen" || e.keyCode === 44;
      const isSnippingTool = e.metaKey && e.shiftKey && (e.key === "s" || e.key === "S");
      
      if (isPrintScreen || isSnippingTool) {
        applyBlur();
      }
    };

    window.addEventListener("blur", handleBlur, true);
    window.addEventListener("focus", handleFocus, true);
    document.addEventListener("visibilitychange", handleVisibilityChange, true);
    window.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keyup", handleKeyDown, true);

    return () => {
      window.removeEventListener("blur", handleBlur, true);
      window.removeEventListener("focus", handleFocus, true);
      document.removeEventListener("visibilitychange", handleVisibilityChange, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keyup", handleKeyDown, true);
    };
  }, [isMobilePreviewActive]);

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
    licenses = [],
  } = resume;

  const filledEducation = education.filter((e) => e.school || e.degree);
  const filledProjects = projects.filter(
    (p) => p.name || p.bullets.some((b) => hasContent(b)),
  );
  const filledExperience = experience.filter(
    (e) => e.title || e.company || e.bullets.some((b) => hasContent(b)),
  );
  const filledCerts = certifications.filter((c) => c.name || c.issuer);
  const filledLicenses = (licenses || []).filter((l) => l.name || l.issuer);
  const filledAchievements = (achievements || []).filter(
    (a) => a.title || a.organization || a.bullets.some((b) => hasContent(b)),
  );

  const hasSkills = profession === "it"
    ? Object.values(technicalSkills).some(hasContent)
    : (
        hasContent(resume.skills) ||
        (profession === "healthcare" && (hasContent(resume.license) || (resume.clinicalSkills && resume.clinicalSkills.some(hasContent)))) ||
        (profession === "education" && (hasContent(resume.teacherCert) || (resume.subjects && resume.subjects.some(hasContent)))) ||
        (profession === "management" && (hasContent(resume.managementCert) || (resume.managementSkills && resume.managementSkills.some(hasContent)))) ||
        (profession === "engineering" && (hasContent(resume.engineeringTools) || hasContent(resume.engineeringMethods))) ||
        (profession === "business" && (hasContent(resume.accountingSoftware) || hasContent(resume.cpaLicense))) ||
        (profession === "customs" && (hasContent(resume.regulatoryKnowledge) || hasContent(resume.complianceSkills))) ||
        (profession === "safety" && (hasContent(resume.safetyCerts) || hasContent(resume.safetyProtocols))) ||
        (profession === "designer" && (hasContent(resume.designTools) || hasContent(resume.designSpecialties))) ||
        (profession === "data" && (hasContent(resume.analyticsTools) || hasContent(resume.dataTechniques))) ||
        (profession === "sales" && (hasContent(resume.crmTools) || hasContent(resume.salesMethods))) ||
        (profession === "hr" && (hasContent(resume.hrisTools) || hasContent(resume.hrCompetencies)))
      );

  function parseDateValue(d) {
    if (!d) return 0;
    const s = String(d).trim();
    let t = Date.parse(s);
    if (!isNaN(t)) return t;

    const parts = s
      .split(/[-–—]/)
      .map((p) => p.trim())
      .filter(Boolean);
    for (let i = parts.length - 1; i >= 0; i--) {
      const tt = Date.parse(parts[i]);
      if (!isNaN(tt)) return tt;
    }

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

  const sortedAchievements = filledAchievements.slice().sort((a, b) => {
    const taEnd = parseDateValue(a.date);
    const tbEnd = parseDateValue(b.date);
    if (tbEnd !== taEnd) return tbEnd - taEnd;
    const taStart = parseFirstDateValue(a.date);
    const tbStart = parseFirstDateValue(b.date);
    if (tbStart !== taStart) return tbStart - taStart;
    return 0;
  });

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

  // Construct Flat Blocks Array
  const blocks = [];

  // 1. Header block
  blocks.push({
    id: "header",
    type: "header",
    section: "header",
    render: () => (
      <header key="header" className="preview-header" data-block-id="header">
        <h1>{(personal.fullName || "Your Name").toUpperCase()}</h1>
        {hasContent(headline) && <p className="preview-headline">{headline}</p>}
        <ContactLine personal={personal} profession={profession} />
      </header>
    )
  });

  // 2. Summary block
  if (hasContent(summary)) {
    blocks.push({
      id: "summary",
      type: "summary",
      section: "summary",
      render: () => (
        <div key="summary" data-block-id="summary">
          <h2>Professional Summary</h2>
          <p className="summary-text">{summary}</p>
        </div>
      )
    });
  }

  // 3. Skills blocks
  if (hasSkills) {
    blocks.push({
      id: "skills-header",
      type: "section-header",
      section: "skills",
      render: () => (
        <div key="skills-header" data-block-id="skills-header" className="preview-section-title-only">
          <h2>{profession === "it" ? "Technical Skills" : "Key Skills"}</h2>
        </div>
      )
    });

    if (profession === "it") {
      const skillItems = [
        { key: "languages", label: "Languages", value: technicalSkills.languages },
        { key: "frameworks", label: "Frameworks", value: technicalSkills.frameworks },
        { key: "tools", label: "Tools", value: technicalSkills.tools },
        { key: "databases", label: "Databases", value: technicalSkills.databases },
        { key: "cloud", label: "Cloud", value: technicalSkills.cloud },
      ];
      skillItems.forEach((item) => {
        if (hasContent(item.value)) {
          blocks.push({
            id: `skills-${item.key}`,
            type: "skill-line",
            section: "skills",
            render: () => <SkillBlock key={`skills-${item.key}`} label={item.label} value={item.value} blockId={`skills-${item.key}`} />
          });
        }
      });
    } else {
      const skillItems = [
        { key: "skills", label: "Key Skills", value: resume.skills },
        ...(profession === "healthcare" ? [
          { key: "license", label: "License / Registration", value: resume.license },
          { key: "clinicalSkills", label: "Clinical Skills", value: resume.clinicalSkills }
        ] : []),
        ...(profession === "education" ? [
          { key: "teacherCert", label: "Teaching Certificate", value: resume.teacherCert },
          { key: "subjects", label: "Subjects Taught", value: resume.subjects }
        ] : []),
        ...(profession === "management" ? [
          { key: "managementCert", label: "Management Certifications", value: resume.managementCert },
          { key: "managementSkills", label: "Leadership Competencies", value: resume.managementSkills }
        ] : []),
        ...(profession === "engineering" ? [
          { key: "engineeringTools", label: "Engineering Software & Tools", value: resume.engineeringTools },
          { key: "engineeringMethods", label: "Methodologies & Standards", value: resume.engineeringMethods }
        ] : []),
        ...(profession === "business" ? [
          { key: "accountingSoftware", label: "Accounting Software", value: resume.accountingSoftware },
          { key: "cpaLicense", label: "License / CPA", value: resume.cpaLicense }
        ] : []),
        ...(profession === "customs" ? [
          { key: "regulatoryKnowledge", label: "Regulatory Knowledge", value: resume.regulatoryKnowledge },
          { key: "complianceSkills", label: "Compliance & Documentation", value: resume.complianceSkills }
        ] : []),
        ...(profession === "safety" ? [
          { key: "safetyCerts", label: "Safety Certifications", value: resume.safetyCerts },
          { key: "safetyProtocols", label: "Safety Protocols & Standards", value: resume.safetyProtocols }
        ] : []),
        ...(profession === "designer" ? [
          { key: "designTools", label: "Design Software", value: resume.designTools },
          { key: "designSpecialties", label: "Design Specialties", value: resume.designSpecialties }
        ] : []),
        ...(profession === "data" ? [
          { key: "analyticsTools", label: "Analytics & Visualization Tools", value: resume.analyticsTools },
          { key: "dataTechniques", label: "Data Techniques", value: resume.dataTechniques }
        ] : []),
        ...(profession === "sales" ? [
          { key: "crmTools", label: "CRM & Sales Tools", value: resume.crmTools },
          { key: "salesMethods", label: "Sales Methodologies", value: resume.salesMethods }
        ] : []),
        ...(profession === "hr" ? [
          { key: "hrisTools", label: "Clinical Tools & HRIS Systems", value: resume.hrisTools },
          { key: "hrCompetencies", label: "Behavioral & Organizational Competencies", value: resume.hrCompetencies }
        ] : [])
      ];
      skillItems.forEach((item) => {
        if (hasContent(item.value)) {
          blocks.push({
            id: `skills-${item.key}`,
            type: "skill-line",
            section: "skills",
            render: () => <SkillBlock key={`skills-${item.key}`} label={item.label} value={item.value} blockId={`skills-${item.key}`} />
          });
        }
      });
    }
  }

  // Helper to build education blocks
  const buildEducationBlocks = () => {
    if (filledEducation.length > 0) {
      blocks.push({
        id: "education-header",
        type: "section-header",
        section: "education",
        render: () => <h2 key="education-header" data-block-id="education-header">Education</h2>
      });
      filledEducation.forEach((edu) => {
        blocks.push({
          id: `education-${edu.id}`,
          type: "entry",
          section: "education",
          render: () => (
            <div key={edu.id} className="preview-entry" data-block-id={`education-${edu.id}`}>
              <div className="entry-header">
                <div>
                  <h3>
                    {[edu.degree, edu.field].filter(hasContent).join(" in ") || "Degree"}
                    {hasContent(edu.gpa) && ` | GPA: ${edu.gpa}`}
                    {hasContent(edu.latinHonors) && ` | ${edu.latinHonors}`}
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
          )
        });
      });
    }
  };

  // Helper to build projects blocks
  const buildProjectsBlocks = () => {
    if (filledProjects.length > 0) {
      const projectSectionTitle =
        profession === "it"
          ? "Technical Projects"
          : profession === "healthcare"
            ? "Clinical Rotations & Placements"
            : profession === "education"
              ? "Teaching Projects"
              : profession === "hr"
                ? "Clinical Cases & Programs"
                : "Project Experience";

      blocks.push({
        id: "projects-header",
        type: "section-header",
        section: "projects",
        render: () => <h2 key="projects-header" data-block-id="projects-header">{projectSectionTitle}</h2>
      });
      filledProjects.forEach((proj) => {
        blocks.push({
          id: `projects-${proj.id}`,
          type: "entry",
          section: "projects",
          render: () => (
            <div key={proj.id} className="preview-entry" data-block-id={`projects-${proj.id}`}>
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
          )
        });
      });
    }
  };

  // Helper to build achievements blocks
  const buildAchievementsBlocks = () => {
    if (userType === "student" && sortedAchievements.length > 0) {
      blocks.push({
        id: "achievements-header",
        type: "section-header",
        section: "achievements",
        render: () => <h2 key="achievements-header" data-block-id="achievements-header">Achievements</h2>
      });
      sortedAchievements.forEach((ach) => {
        blocks.push({
          id: `achievements-${ach.id}`,
          type: "entry",
          section: "achievements",
          render: () => (
            <div key={ach.id} className="preview-entry" data-block-id={`achievements-${ach.id}`}>
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
          )
        });
      });
    }
  };

  // Helper to build experience blocks
  const buildExperienceBlocks = () => {
    if (sortedExperience.length > 0) {
      blocks.push({
        id: "experience-header",
        type: "section-header",
        section: "experience",
        render: () => <h2 key="experience-header" data-block-id="experience-header">Experience</h2>
      });
      sortedExperience.forEach((exp) => {
        blocks.push({
          id: `experience-${exp.id}`,
          type: "entry",
          section: "experience",
          render: () => (
            <div key={exp.id} className="preview-entry" data-block-id={`experience-${exp.id}`}>
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
          )
        });
      });
    }
  };

  // Helper to build certifications blocks
  const buildCertificationsBlocks = () => {
    if (filledCerts.length > 0) {
      blocks.push({
        id: "certifications-header",
        type: "section-header",
        section: "certifications",
        render: () => <h2 key="certifications-header" data-block-id="certifications-header">Certifications</h2>
      });
      filledCerts.forEach((cert) => {
        blocks.push({
          id: `certifications-${cert.id}`,
          type: "cert-line",
          section: "certifications",
          render: () => (
            <p key={cert.id} className="cert-line" data-block-id={`certifications-${cert.id}`}>
              <strong>{cert.name || "Certification"}</strong>
              {hasContent(cert.issuer) && ` — ${cert.issuer}`}
              {hasContent(cert.date) && ` (${cert.date})`}
            </p>
          )
        });
      });
    }
  };

  // Helper to build licenses blocks
  const buildLicensesBlocks = () => {
    if (filledLicenses.length > 0) {
      blocks.push({
        id: "licenses-header",
        type: "section-header",
        section: "licenses",
        render: () => <h2 key="licenses-header" data-block-id="licenses-header">Licenses</h2>
      });
      filledLicenses.forEach((lic) => {
        blocks.push({
          id: `licenses-${lic.id}`,
          type: "cert-line",
          section: "licenses",
          render: () => (
            <p key={lic.id} className="cert-line" data-block-id={`licenses-${lic.id}`}>
              <strong>{lic.name || "License"}</strong>
              {hasContent(lic.issuer) && ` — ${lic.issuer}`}
              {hasContent(lic.number) && ` | Lic No. ${lic.number}`}
              {hasContent(lic.date) && ` (${lic.date})`}
            </p>
          )
        });
      });
    }
  };

  // Construct blocks in order
  if (userType === "student") {
    buildEducationBlocks();
    buildProjectsBlocks();
    buildAchievementsBlocks();
    buildExperienceBlocks();
    buildCertificationsBlocks();
    buildLicensesBlocks();
  } else {
    buildExperienceBlocks();
    buildProjectsBlocks();
    buildEducationBlocks();
    buildCertificationsBlocks();
    buildLicensesBlocks();
  }

  // Render Page Blocks & Group sections for consistent style cascades
  const renderPageBlocks = (pageBlocks) => {
    const rendered = [];
    let currentSection = null;
    let currentSectionBlocks = [];

    const flushSection = (secKey) => {
      if (currentSectionBlocks.length > 0) {
        if (currentSection === "header") {
          rendered.push(...currentSectionBlocks.map((b) => b.render()));
        } else {
          rendered.push(
            <section className="preview-section" key={secKey}>
              {currentSectionBlocks.map((b) => b.render())}
            </section>
          );
        }
        currentSectionBlocks = [];
      }
    };

    pageBlocks.forEach((block, idx) => {
      const blockSection = block.section || "header";
      if (blockSection !== currentSection) {
        flushSection(`${currentSection}-${idx}`);
        currentSection = blockSection;
      }
      currentSectionBlocks.push(block);
    });
    flushSection(`last-${currentSection}`);

    return rendered;
  };

  // Dynamic Layout measurement in useLayoutEffect
  useLayoutEffect(() => {
    if (!measurerNode) return;

    const blockElements = measurerNode.querySelectorAll("[data-block-id]");
    const heights = {};
    let totalMeasuredHeight = 0;
    
    blockElements.forEach((el) => {
      const blockId = el.getAttribute("data-block-id");
      
      const styles = window.getComputedStyle(el);
      const marginTop = parseFloat(styles.marginTop) || 0;
      const marginBottom = parseFloat(styles.marginBottom) || 0;
      const h = el.offsetHeight + marginTop + marginBottom;
      
      heights[blockId] = h;
      totalMeasuredHeight += h;
    });

    // If total measured height is 0, the elements might not be laid out or painted yet.
    if (totalMeasuredHeight === 0) {
      return;
    }

    const PAGE_MAX_CONTENT_HEIGHT = 950; // Safety content threshold
    const newPages = [];
    let currentPageBlocks = [];
    let currentPageHeight = 0;
    let currentSectionName = null;

    blocks.forEach((block) => {
      const blockHeight = heights[block.id] || 0;
      
      let extraHeight = 0;
      const blockSection = block.section || "header";
      if (blockSection !== currentSectionName) {
        if (blockSection !== "header") {
          extraHeight += 6; // Section margin spacing
        }
      }

      // fitting with orphan block protection
      let canFit = true;
      if (block.type === "section-header") {
        const nextBlock = blocks.find(b => b.section === block.section && b.type !== "section-header");
        const nextBlockHeight = nextBlock ? (heights[nextBlock.id] || 0) : 0;
        if (currentPageHeight + blockHeight + nextBlockHeight + extraHeight > PAGE_MAX_CONTENT_HEIGHT) {
          canFit = false;
        }
      } else {
        if (currentPageHeight + blockHeight + extraHeight > PAGE_MAX_CONTENT_HEIGHT) {
          canFit = false;
        }
      }

      if (canFit && currentPageBlocks.length > 0) {
        currentPageBlocks.push(block);
        currentPageHeight += blockHeight + extraHeight;
        currentSectionName = blockSection;
      } else {
        if (currentPageBlocks.length > 0) {
          newPages.push(currentPageBlocks);
        }
        currentPageBlocks = [block];
        currentPageHeight = blockHeight;
        currentSectionName = blockSection;
      }
    });

    if (currentPageBlocks.length > 0) {
      newPages.push(currentPageBlocks);
    }

    const pagesSerialized = JSON.stringify(newPages.map(p => p.map(b => b.id)));
    const currentSerialized = JSON.stringify(pages.map(p => p.map(b => b.id)));
    
    if (pagesSerialized !== currentSerialized) {
      setPages(newPages);
      if (onPageCountChange) {
        onPageCountChange(newPages.length);
      }
    }
  }, [resume, profession, pages, onPageCountChange, measureTrigger, measurerNode]);

  const handleDismissUnblur = () => {
    setIsBlurred(false);
    const wrapper = document.getElementById("resume-preview-root-wrapper");
    if (wrapper) {
      wrapper.classList.remove("blurred-preview");
    }
  };

  const displayPages = pages.length > 0 ? pages : [blocks];

  return (
    <div 
      id="resume-preview-root-wrapper"
      className={`resume-preview-outer-wrapper ${isBlurred ? "blurred-preview" : ""}`}
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onDragStart={(e) => e.preventDefault()}
      style={{ position: "relative", width: "100%" }}
    >
      {/* Hidden Measurer */}
      <div 
        ref={setMeasurerNode}
        id="resume-measurer" 
        className="resume-preview resume-ats" 
        style={{ position: "absolute", left: "-9999px", top: "-9999px", width: "816px", height: "auto", minHeight: "0", visibility: "hidden" }}
      >
        {renderPageBlocks(blocks)}
      </div>

      {/* Visible Pages */}
      <div className="preview-pages-container">
        {displayPages.map((pageBlocks, index) => (
          <article key={index} className="resume-page-sheet resume-ats">
            {renderPageBlocks(pageBlocks.map((pb) => blocks.find((b) => b.id === pb.id) || pb))}
            {plan && plan.hasWatermark && (
              <div className="trial-watermark-overlay" aria-hidden="true">
                <div className="watermark-diagonal-text">RESORA TRIAL - PREMIUM PRO</div>
                <div className="watermark-diagonal-text">RESORA TRIAL - PREMIUM PRO</div>
                <div className="watermark-diagonal-text">RESORA TRIAL - PREMIUM PRO</div>
                <div className="watermark-diagonal-text">RESORA TRIAL - PREMIUM PRO</div>
              </div>
            )}
          </article>
        ))}
      </div>

      {isBlurred && (
        <div className="screenshot-blur-overlay">
          <div className="blur-alert-box">
            <span className="blur-lock-icon">🔒</span>
            <h4>Content Protected</h4>
            <p>Screenshots are disabled on this preview panel to protect premium designs.</p>
            <button type="button" className="unblur-btn" onClick={handleDismissUnblur}>
              Dismiss & Unblur
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ResumePreview;
