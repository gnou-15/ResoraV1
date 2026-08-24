import { useState, useEffect, useRef } from "react";
import "../css/landing.css";
import InteractiveBackground from "../components/InteractiveBackground";
import PeekingMonster from "../components/PeekingMonster";
import ParsingLoader from "../components/ParsingLoader";
import { findExistingUserResume } from "../services/api";

const PREDICTABLE_PROFESSIONS = [
  "Nurse",
  "Doctor",
  "Medical Assistant",
  "Clinic Coordinator",
  "Healthcare Administrator",
  "Teacher",
  "Tutor",
  "School Instructor",
  "Professor",
  "Psychiatrist",
  "Counselor",
  "Social Worker",
  "Therapist",
  "Behavioral Health Specialist",
  "Project Manager",
  "Product Manager",
  "Operations Manager",
  "Team Lead",
  "Supervisor",
  "Software Developer",
  "Frontend Engineer",
  "Backend Engineer",
  "Web Programmer",
  "Full-Stack Developer",
  "Civil Engineer",
  "Mechanical Engineer",
  "Electrical Engineer",
  "Engineering Consultant",
  "Accountant",
  "Financial Analyst",
  "Business Administrator",
  "Management Consultant",
  "Customs Broker",
  "Import/Export Specialist",
  "Customs Compliance Officer",
  "Safety Officer",
  "EHS Specialist",
  "Safety Coordinator",
  "Graphic Designer",
  "UI/UX Designer",
  "Data Analyst",
  "Business Intelligence Analyst",
  "Sales Representative",
  "Account Executive",
  "HR Specialist",
  "Recruitment Coordinator",
  "Psychologist",
  "Psychiatrist",
  "Counselor",
  "Social Worker",
  "Therapist",
  "Behavioral Health Specialist",
];

export default function Landing({ onSelect, onNavigate, isEmbedded, mascotMood, user }) {
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [localMood, setLocalMood] = useState("normal");
  const [existingResumeInfo, setExistingResumeInfo] = useState(null);
  const [isSearchingNewRole, setIsSearchingNewRole] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    async function checkExisting() {
      const info = await findExistingUserResume(user);
      if (isMounted && info && info.hasResume) {
        setExistingResumeInfo(info);
      }
    }
    checkExisting();
    return () => { isMounted = false; };
  }, [user]);

  const suggestions = input.trim()
    ? PREDICTABLE_PROFESSIONS.filter(
      (p) =>
        p.toLowerCase().includes(input.toLowerCase()) &&
        p.toLowerCase() !== input.toLowerCase()
    ).slice(0, 5)
    : [];

  function handleSelectSuggestion(suggestion) {
    setInput(suggestion);
    setSearchError("");
    setTimeout(() => {
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }, 0);
  }

  const handleKeyDown = (e) => {
    if (e.key === "Tab") {
      if (suggestions.length > 0) {
        e.preventDefault();
        handleSelectSuggestion(suggestions[0]);
      }
    }
  };


  useEffect(() => {
    // If the user starts typing, hide/reset typewriter placeholder
    if (input) {
      setPlaceholder("");
      return;
    }

    const words = ["Nurse", "Software Developer", "Teacher", "Project Manager"];
    let wordIdx = 0;
    let charIdx = 0;
    let isDeleting = false;
    let timer;

    const tick = () => {
      const currentWord = words[wordIdx];
      const prefix = "I am a ";

      if (!isDeleting) {
        // Typing phase
        const currentTarget = currentWord.substring(0, charIdx + 1);
        setPlaceholder(prefix + currentTarget + " |");
        charIdx++;

        if (charIdx === currentWord.length) {
          // Finished typing word, pause
          timer = setTimeout(() => {
            isDeleting = true;
            tick();
          }, 2000);
          return;
        }
      } else {
        // Deleting phase
        const currentTarget = currentWord.substring(0, charIdx - 1);
        setPlaceholder(prefix + currentTarget + " |");
        charIdx--;

        if (charIdx === 0) {
          isDeleting = false;
          wordIdx = (wordIdx + 1) % words.length;
          // Small pause before typing next word
          timer = setTimeout(tick, 300);
          return;
        }
      }

      const speed = isDeleting ? 50 : 100;
      timer = setTimeout(tick, speed);
    };

    tick();

    return () => clearTimeout(timer);
  }, [input]);

  function detectProfession(text) {
    const t = (text || "").toLowerCase();
    if (!t.trim()) return null;

    // Specific role detections first to avoid overlapping general keywords
    const hasEngineering = /(civil engineer|mechanical engineer|electrical engineer|chemical engineer|industrial engineer|safety engineer|\bengineering\b)/.test(t);
    const hasSafety = /(safety officer|safety coordinator|ehs|occupational safety|safety inspector)/.test(t);
    const hasCustoms = /(customs|import|export|tariff|declarant)/.test(t);
    const hasBusiness = /(accountant|accountancy|cpa|bookkeeper|financial analyst|business admin|finance|auditor)/.test(t);
    const hasDesigner = /(designer|graphic|illustrator|artist|ui\/ux|ux designer|ui designer)/.test(t);
    const hasData = /(data analyst|data scientist|business intelligence|bi analyst|analyst)/.test(t);
    const hasSales = /(sales|account executive|representative|seller|telemarketing)/.test(t);
    const hasHR = /(hr|human resources|recruiter|onboarding|recruitment|psychology|psychologist|psychiatrist|counselor|social worker|therapist|behavioral)/.test(t);

    const hasIT = /(developer|software|programmer|full[- ]stack|web|frontend|backend|react|node|coding|programming|tech|technology|computer|\bit\b|\bbsit\b|\bcs\b|software engineer|it engineer|systems engineer|devops)/.test(t);
    const hasHealthcare = /(nurse|doctor|clinic|health|patient|rn|lpn|clinical|medical|hospital)/.test(t);
    const hasEducation = /(teacher|instructor|professor|tutor|education|school|teaching|classroom)/.test(t);
    const hasManagement = /(manager|project|product|operations|pm|lead|supervisor|management)/.test(t);

    if (hasEngineering) return "engineering";
    if (hasSafety) return "safety";
    if (hasCustoms) return "customs";
    if (hasBusiness) return "business";
    if (hasDesigner) return "designer";
    if (hasData) return "data";
    if (hasSales) return "sales";
    if (hasHR) return "hr";

    if (hasIT) return "it";
    if (hasHealthcare) return "healthcare";
    if (hasEducation) return "education";
    if (hasManagement) return "management";

    return null;
  }

  const [isUploading, setIsUploading] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const [hasUploadedResume, setHasUploadedResume] = useState(() => {
    try {
      return !!(sessionStorage.getItem("resora-uploaded-resume") || localStorage.getItem("resora-uploaded-resume"));
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const checkUpload = () => {
      try {
        const stored = sessionStorage.getItem("resora-uploaded-resume") || localStorage.getItem("resora-uploaded-resume");
        setHasUploadedResume(!!stored);
      } catch {
        setHasUploadedResume(false);
      }
    };
    checkUpload();
    window.addEventListener("focus", checkUpload);
    return () => window.removeEventListener("focus", checkUpload);
  }, []);

  const parseTextResumeFallback = async (file) => {
    const text = await file.text();
    const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
    const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
    const phoneMatch = text.match(/(\+?\d{1,4}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/);
    const nameLine = lines[0] || "Resume Applicant";
    const detectedProf = detectProfession(text) || "general";

    return {
      profession: detectedProf,
      resume: {
        personal: {
          fullName: nameLine,
          email: emailMatch ? emailMatch[0] : "",
          phoneNumber: phoneMatch ? phoneMatch[0] : "",
          location: { country: "", state: "", city: "", barangay: "", street: "" },
          github: "",
          linkedin: "",
          portfolio: ""
        },
        headline: "Uploaded Candidate",
        summary: lines.slice(1, 4).join(" "),
        skills: "Parsed from text document",
        technicalSkills: { languages: "", frameworks: "", tools: "", databases: "", cloud: "" },
        education: [],
        projects: [],
        experience: lines.length > 4 ? [{ id: "exp-1", company: "Extracted Experience", title: "Role", bullets: lines.slice(4, 8) }] : [],
        certifications: [],
        achievements: [],
        userType: "professional"
      }
    };
  };

  const saveAndProceedUploadedResume = (detectedProf, parsedResume) => {
    const sid = sessionStorage.getItem('resora_guest_session_token') || 'guest';
    const storageKey = `resume-builder-data-${sid}-${detectedProf}`;
    localStorage.setItem(storageKey, JSON.stringify(parsedResume));
    sessionStorage.setItem("resora-uploaded-resume", JSON.stringify({ profession: detectedProf, resume: parsedResume }));
    setHasUploadedResume(true);
    onSelect(detectedProf);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadingFileName(file.name);
    setSearchError("");

    try {
      const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
      const rawEnvBackend = import.meta.env.VITE_PYTHON_BACKEND_URL || "";
      const backendUrl = rawEnvBackend || "http://localhost:8000";
      const isBackendLocal = !rawEnvBackend || backendUrl.includes("localhost") || backendUrl.includes("127.0.0.1");

      if (isProd && isBackendLocal) {
        if (file.name.endsWith(".txt") || file.type === "text/plain") {
          const fallbackData = await parseTextResumeFallback(file);
          saveAndProceedUploadedResume(fallbackData.profession, fallbackData.resume);
          return;
        }
        throw new Error("PROD_BACKEND_NOT_CONFIGURED");
      }

      const formData = new FormData();
      formData.append("file", file);

      const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/parse-resume`;

      const res = await fetch(targetUrl, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const detectedProf = data.profession || "general";
      const parsedResume = data.resume;

      saveAndProceedUploadedResume(detectedProf, parsedResume);
    } catch (err) {
      console.error("Resume upload error:", err);
      if (err.message === "PROD_BACKEND_NOT_CONFIGURED") {
        setSearchError("Backend URL not configured on Vercel. Please add VITE_PYTHON_BACKEND_URL in Vercel Environment Variables.");
      } else if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isProd) {
          setSearchError("Unable to connect to Python backend server. Please verify backend deployment and VITE_PYTHON_BACKEND_URL in Vercel.");
        } else {
          setSearchError("Backend server offline (http://localhost:8000). Please start FastAPI server (`uvicorn main:app --reload --port 8000`) and verify GROQ_API_KEY.");
        }
      } else {
        setSearchError(`Failed to parse resume (${err.message || "Network Error"}). Please verify backend server and GROQ_API_KEY.`);
      }
    } finally {
      setIsUploading(false);
      e.target.value = "";
    }
  };

  const handleGoToUploaded = () => {
    try {
      const raw = sessionStorage.getItem("resora-uploaded-resume") || localStorage.getItem("resora-uploaded-resume");
      if (raw) {
        const parsed = JSON.parse(raw);
        onSelect(parsed.profession || "general");
        return;
      }
    } catch {
      // fallback
    }
    onSelect("general");
  };

  function handleSubmit(e) {
    e && e.preventDefault();
    let targetInput = input.trim();
    if (!targetInput && placeholder) {
      targetInput = placeholder.replace(" |", "").replace("I am a ", "");
    }
    if (!targetInput) {
      setSearchError("Please enter a profession.");
      return;
    }

    if (/^[0-9\s!@#$%^&*()_+\-=[\]{};':"\\|,.<>?]*$/.test(targetInput)) {
      setSearchError("Please enter a valid profession.");
      return;
    }

    const prof = detectProfession(targetInput) || "general";
    onSelect(prof);
  }

  return (
    <div className="landing-container">
      {!isEmbedded && <InteractiveBackground />}
      {!isEmbedded && (
        <header className={`landing-header ${isUploading ? "header-disabled" : ""}`}>
          <a href="/" className="logo-container" onClick={(e) => e.preventDefault()}>
            <svg className="logo-svg" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="miniBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stop-color="#475569" />
                  <stop offset="100%" stop-color="#1e293b" />
                </linearGradient>
              </defs>
              {/* Body */}
              <circle cx="17" cy="21" r="9.5" fill="url(#miniBodyGrad)" />
              {/* Hat Brim (snug on head, overlapping by 0.5px to avoid gap) */}
              <rect x="6" y="9.5" width="22" height="2.5" rx="0.8" fill="#1e293b" />
              {/* Hat Ribbon (Vibrant orange) */}
              <rect x="10" y="8" width="14" height="1.5" fill="#ea580c" />
              {/* Hat Crown */}
              <rect x="10" y="1" width="14" height="7" rx="1" fill="#1e293b" />
              {/* Eyes */}
              <circle cx="13.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="13.5" cy="19" r="1.1" fill="#0f172a" />
              <circle cx="20.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="20.5" cy="19" r="1.1" fill="#0f172a" />
              {/* Monocle (Bright gold) */}
              <circle cx="20.5" cy="19" r="3.6" stroke="#f59e0b" stroke-width="0.9" fill="none" />
              <path d="M23.5 21.5 C25 24 24 26 22 28.5" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="1.2 0.8" fill="none" />
              {/* Mustache */}
              <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
            </svg>
            <span className="logo-brand">
              Resora <span className="logo-subtext" onClick={(e) => { e.stopPropagation(); e.preventDefault(); window.open("https://daniel-mapano.vercel.app/", "_blank", "noopener,noreferrer"); }}>by Nezer</span>
            </span>
          </a>
          <nav className="nav-menu">
            <a href="#" className="nav-link active" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
              Home
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("about"); }}>
              About Us
            </a>
            <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
              Service
            </a>
            <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
              Contact
            </a>
          </nav>
        </header>
      )}

      <main className="landing-hero">
        <h1 className="sr-only">Build a Professional, ATS-Friendly Resume with Resora</h1>
        <PeekingMonster mood={mascotMood || localMood} />
        {existingResumeInfo && !isSearchingNewRole ? (
          <div className="hero-title-container">
            <h2 className="hero-title-line">Ready to work on your</h2>
            <h2 className="hero-title-line">
              <span className="highlight-role">{existingResumeInfo.targetRole}</span> Resume?
            </h2>
          </div>
        ) : (
          <div className="hero-title-container">
            <h2 className="hero-title-line">What is your</h2>
            <h2 className="hero-title-line">Profession?</h2>
          </div>
        )}

        {existingResumeInfo && !isSearchingNewRole ? (
          <div className="existing-resume-cta-card">
            <button
              type="button"
              className="btn-go-to-resume"
              onClick={() => onSelect(existingResumeInfo.profession)}
            >
              <span>Go to My Resume</span>
              <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              type="button"
              className="btn-switch-role-link"
              onClick={() => setIsSearchingNewRole(true)}
            >
              Or search for a different role / start new
            </button>
          </div>
        ) : (
          <form className={`search-bar-pill ${searchError ? "shake" : ""}`} onSubmit={handleSubmit}>
            <div className="search-input-wrapper">
              <input
                ref={inputRef}
                type="text"
                className="search-input-field"
                placeholder={placeholder || "I am a ..."}
                value={input}
                onChange={(e) => {
                  setInput(e.target.value);
                  if (searchError) setSearchError("");
                }}
                onKeyDown={handleKeyDown}
                aria-label="Profession"
              />
            </div>
            <button type="submit" className="search-submit-btn" aria-label="Search">
              <svg viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>

            {searchError && (
              <div className="search-error-bubble">
                {searchError}
              </div>
            )}

            {suggestions.length > 0 && (
              <div className="search-predictions-dropdown">
                {suggestions.map((sug) => (
                  <button
                    key={sug}
                    type="button"
                    className="prediction-item"
                    onClick={() => handleSelectSuggestion(sug)}
                  >
                    {sug}
                  </button>
                ))}
              </div>
            )}
          </form>
        )}

        {existingResumeInfo && isSearchingNewRole && (
          <button
            type="button"
            className="btn-back-to-existing-link"
            onClick={() => setIsSearchingNewRole(false)}
            style={{ marginTop: "0.8rem" }}
          >
            ← Back to {existingResumeInfo.targetRole} Resume
          </button>
        )}

        <div className="hero-sample-new">
          Try:
          <button
            type="button"
            className="hero-sample-link"
            onClick={() => setInput("nurse")}
          >
            nurse
          </button>
          ·
          <button
            type="button"
            className="hero-sample-link"
            onClick={() => setInput("frontend developer")}
          >
            frontend developer
          </button>
          ·
          <button
            type="button"
            className="hero-sample-link"
            onClick={() => setInput("project manager")}
          >
            project manager
          </button>
        </div>


        <p className="hero-description-new">
          Resora creates single-page, ATS-friendly resumes tailored to your chosen profession in seconds.
        </p>
      </main>

      <div className="floating-upload-resume-widget">
        <input
          type="file"
          id="resume-upload-input"
          accept=".pdf,.docx,.doc,.txt"
          style={{ display: "none" }}
          onChange={handleFileUpload}
        />
        <button
          type="button"
          className={`Documents-btn ${hasUploadedResume ? "active-uploaded" : ""}`}
          onClick={() => {
            if (hasUploadedResume) {
              handleGoToUploaded();
            } else {
              document.getElementById("resume-upload-input")?.click();
            }
          }}
          disabled={isUploading}
          aria-label={hasUploadedResume ? "My Resume" : "Upload"}
        >
          <span className="folderContainer">
            {/* Back folder SVG */}
            <svg className="fileBack" width="146" height="113" viewBox="0 0 146 113" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0 4C0 1.79086 1.79086 0 4 0H50.3802C51.8285 0 53.2056 0.627965 54.1553 1.72142L64.3303 13.4371C65.2799 14.5306 66.657 15.1585 68.1053 15.1585H141.509C143.718 15.1585 145.509 16.9494 145.509 19.1585V109C145.509 111.209 143.718 113 141.509 113H3.99999C1.79085 113 0 111.209 0 109V4Z" fill={`url(#folderBack_${hasUploadedResume ? "green" : "orange"})`} />
              <defs>
                <linearGradient id={`folderBack_${hasUploadedResume ? "green" : "orange"}`} x1="0" y1="0" x2="72.93" y2="95.4804" gradientUnits="userSpaceOnUse">
                  <stop stopColor={hasUploadedResume ? "#34d399" : "#ff8a00"} />
                  <stop offset="1" stopColor={hasUploadedResume ? "#059669" : "#c2410c"} />
                </linearGradient>
              </defs>
            </svg>

            {/* Inner Document Sheet SVG */}
            <svg className="filePage" width="88" height="99" viewBox="0 0 88 99" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="88" height="99" rx="6" fill={`url(#folderPage_${hasUploadedResume ? "green" : "orange"})`} />
              <line x1="16" y1="24" x2="72" y2="24" stroke={hasUploadedResume ? "#059669" : "#ea580c"} strokeWidth="5" strokeLinecap="round"/>
              <line x1="16" y1="40" x2="56" y2="40" stroke={hasUploadedResume ? "#34d399" : "#fdba74"} strokeWidth="5" strokeLinecap="round"/>
              <line x1="16" y1="56" x2="64" y2="56" stroke={hasUploadedResume ? "#34d399" : "#fdba74"} strokeWidth="5" strokeLinecap="round"/>
              <line x1="16" y1="72" x2="48" y2="72" stroke={hasUploadedResume ? "#34d399" : "#fdba74"} strokeWidth="5" strokeLinecap="round"/>
              <defs>
                <linearGradient id={`folderPage_${hasUploadedResume ? "green" : "orange"}`} x1="0" y1="0" x2="81" y2="160.5" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#ffffff" />
                  <stop offset="1" stopColor={hasUploadedResume ? "#ecfdf5" : "#ffedd5"} />
                </linearGradient>
              </defs>
            </svg>

            {/* Front folder cover SVG */}
            <svg className="fileFront" width="160" height="79" viewBox="0 0 160 79" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M0.29306 12.2478C0.133905 9.38186 2.41499 6.97059 5.28537 6.97059H30.419H58.1902C59.5751 6.97059 60.9288 6.55982 62.0802 5.79025L68.977 1.18034C70.1283 0.410771 71.482 0 72.8669 0H77H155.462C157.87 0 159.733 2.1129 159.43 4.50232L150.443 75.5023C150.19 77.5013 148.489 79 146.474 79H7.78403C5.66106 79 3.9079 77.3415 3.79019 75.2218L0.29306 12.2478Z" fill={`url(#folderFront_${hasUploadedResume ? "green" : "orange"})`} />
              <defs>
                <linearGradient id={`folderFront_${hasUploadedResume ? "green" : "orange"}`} x1="38.7619" y1="8.71323" x2="66.9106" y2="82.8317" gradientUnits="userSpaceOnUse">
                  <stop stopColor={hasUploadedResume ? "#6ee7b7" : "#ffedd5"} />
                  <stop offset="1" stopColor={hasUploadedResume ? "#047857" : "#ea580c"} />
                </linearGradient>
              </defs>
            </svg>
          </span>
          <span className="text">
            {hasUploadedResume ? "My Resume" : isUploading ? "Uploading..." : "Upload"}
          </span>
        </button>
      </div>

      <footer className="landing-footer">
        <p className="footer-version-text">
          Resora by Nezer • <span className="footer-version-badge">v2.0.0</span>
        </p>
      </footer>

      {showAuthModal && (
        <div className="auth-gate-modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="auth-gate-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="auth-gate-icon">
              <svg viewBox="0 0 24 24" width="48" height="48">
                <circle cx="12" cy="12" r="10" fill="#ffedd5" />
                <path d="M12 9v4 M12 16h0.01" stroke="#ea580c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              </svg>
            </div>
            <h3 className="auth-gate-title">Sign In Required</h3>
            <p className="auth-gate-text">
              You need to sign in or create an account to start building and saving your resumes.
            </p>
            <div className="auth-gate-buttons">
              <button
                type="button"
                className="auth-gate-btn-primary"
                onClick={() => {
                  setShowAuthModal(false);
                  onNavigate && onNavigate("auth");
                }}
                onMouseEnter={() => setLocalMood("excited")}
                onMouseLeave={() => setLocalMood("normal")}
              >
                Sign In Now
              </button>
              <button
                type="button"
                className="auth-gate-btn-secondary"
                onClick={() => setShowAuthModal(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {isUploading && <ParsingLoader filename={uploadingFileName} />}
    </div>
  );
}
