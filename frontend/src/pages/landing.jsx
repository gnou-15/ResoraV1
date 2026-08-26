import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../css/landing.css";
import InteractiveBackground from "../components/InteractiveBackground";
import PeekingMonster from "../components/PeekingMonster";
import ParsingLoader from "../components/ParsingLoader";
import { findExistingUserResume } from "../services/api";
import { hasSufficientContent } from "../data/defaultResume";


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

const PROFESSION_DISPLAY_NAMES = {
  it: "IT",
  healthcare: "Healthcare",
  education: "Education",
  management: "Management",
  engineering: "Engineering",
  business: "Business & Accountancy",
  customs: "Customs Administration",
  safety: "Safety Officer",
  designer: "Graphic Design",
  data: "Data Analytics",
  sales: "Sales & Account Executive",
  hr: "Behavioral Health & Social Services",
  general: "Professional",
};

function getProfessionDisplayName(profession) {
  if (!profession) return "My";
  return PROFESSION_DISPLAY_NAMES[profession.toLowerCase()] || (profession.charAt(0).toUpperCase() + profession.slice(1));
}

function checkClientRateLimited() {
  try {
    const until = localStorage.getItem("resora-upload-rate-limit-until");
    return !!(until && Number(until) > Date.now());
  } catch {
    return false;
  }
}

function getInitialRemainingUploads() {
  try {
    const cached = localStorage.getItem("resora-remaining-uploads");
    if (cached !== null && !isNaN(Number(cached))) return Number(cached);
    if (checkClientRateLimited()) return 0;
    return 3;
  } catch {
    return 3;
  }
}

function DelayedTooltip({ title, description, children, disabled }) {
  const [show, setShow] = useState(false);
  const timer = useRef(null);

  const onEnter = () => {
    if (disabled || (!title && !description)) return;
    timer.current = setTimeout(() => setShow(true), 300);
  };
  const onLeave = () => {
    if (timer.current) clearTimeout(timer.current);
    setShow(false);
  };

  return (
    <div
      className="delayed-tooltip-container"
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      {(title || description) && (
        <div
          className={`delayed-tooltip-box ${show ? "tooltip-visible" : ""}`}
          role="tooltip"
        >
          <div className="delayed-tooltip-arrow" />
          <svg className="delayed-tooltip-icon" width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#ea580c" />
            <path d="M12 16v-4M12 8h.01" stroke="#ffffff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div className="delayed-tooltip-content">
            {title && <div className="delayed-tooltip-title">{title}</div>}
            {description && <div className="delayed-tooltip-desc">{description}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

export default function Landing({ onSelect, onNavigate, isEmbedded, mascotMood, user }) {
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showRateLimitModal, setShowRateLimitModal] = useState(false);
  const [isDailyRateLimited, setIsDailyRateLimited] = useState(checkClientRateLimited);
  const [remainingUploads, setRemainingUploads] = useState(getInitialRemainingUploads);
  const [localMood, setLocalMood] = useState("normal");
  const [existingResumeInfo, setExistingResumeInfo] = useState(() => {
    if (!user) return null;
    try {
      const cached = localStorage.getItem("resora-last-active-resume-info");
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed && parsed.hasResume && parsed.userId === user.id && hasSufficientContent(parsed.resume)) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null;
  });

  const [isSearchingNewRole, setIsSearchingNewRole] = useState(false);
  const inputRef = useRef(null);

  // Proactively check rate limit status in the background on mount & window focus
  useEffect(() => {
    let isMounted = true;
    const checkQuota = async () => {
      try {
        const rawEnvBackend = import.meta.env.VITE_PYTHON_BACKEND_URL || "";
        const backendUrl = rawEnvBackend || "http://localhost:8000";
        const res = await fetch(`${backendUrl.replace(/\/$/, "")}/api/rate-limit-status`).catch(() => null);
        if (res && res.ok && isMounted) {
          const data = await res.json();
          if (data && typeof data.remainingUploads === "number") {
            setRemainingUploads(data.remainingUploads);
            try { localStorage.setItem("resora-remaining-uploads", String(data.remainingUploads)); } catch { /* ignore */ }
          }
          if (data.isRateLimited) {
            const resetMs = (data.resetSeconds || 86400) * 1000;
            localStorage.setItem("resora-upload-rate-limit-until", String(Date.now() + resetMs));
            setIsDailyRateLimited(true);
          } else {
            localStorage.removeItem("resora-upload-rate-limit-until");
            setIsDailyRateLimited(false);
          }
        }
      } catch {
        // silent
      }
    };

    checkQuota();
    window.addEventListener("focus", checkQuota);
    return () => {
      isMounted = false;
      window.removeEventListener("focus", checkQuota);
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function checkExisting() {
      if (!user) {
        if (isMounted) setExistingResumeInfo(null);
        try {
          localStorage.removeItem("resora-last-active-resume-info");
        } catch {
          /* ignore */
        }
        return;
      }
      const info = await findExistingUserResume(user);
      if (isMounted) {
        if (info && info.hasResume && info.userId === user.id && hasSufficientContent(info.resume)) {
          setExistingResumeInfo(info);
        } else {
          setExistingResumeInfo(null);
          // Clean up stale cache if the resume was empty/cleared or below threshold
          try { localStorage.removeItem("resora-last-active-resume-info"); } catch { /* ignore */ }
        }
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
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadingFileName, setUploadingFileName] = useState("");
  const pendingTransitionRef = useRef(null);
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
    window.addEventListener("storage", checkUpload);
    window.addEventListener("resora-upload-cleared", checkUpload);
    return () => {
      window.removeEventListener("storage", checkUpload);
      window.removeEventListener("resora-upload-cleared", checkUpload);
    };
  }, []);

  const parseTextResumeFallback = async (file) => {
    const text = await file.text();
    const detectedProf = detectProfession(text) || "general";
    const lines = text.split("\n").map(l => l.trim()).filter(Boolean);
    const emailMatch = text.match(/[\w.-]+@[\w.-]+\.\w+/);
    const phoneMatch = text.match(/(\+?\d{1,4}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/);
    const nameLine = lines[0] || "Uploaded Candidate";

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

  const handleUploadFinished = () => {
    setIsUploading(false);
    setUploadComplete(false);
    if (pendingTransitionRef.current) {
      const { prof, resume } = pendingTransitionRef.current;
      pendingTransitionRef.current = null;
      saveAndProceedUploadedResume(prof, resume);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (isUploading) return;

    // 5MB file size limit check
    if (file.size > 5 * 1024 * 1024) {
      setSearchError("File size exceeds the 5MB limit. Please upload a smaller resume file.");
      e.target.value = "";
      return;
    }

    setIsUploading(true);
    setUploadComplete(false);
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
          pendingTransitionRef.current = { prof: fallbackData.profession, resume: fallbackData.resume };
          setUploadComplete(true);
          return;
        }
        throw new Error("PROD_BACKEND_NOT_CONFIGURED");
      }

      const formData = new FormData();
      formData.append("file", file);

      const targetUrl = `${backendUrl.replace(/\/$/, "")}/api/parse-resume`;

      // 30-second timeout to prevent hanging on slow Render cold starts
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      let res;
      try {
        res = await fetch(targetUrl, {
          method: "POST",
          body: formData,
          signal: controller.signal,
        });
      } finally {
        clearTimeout(timeoutId);
      }

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        if (res.status === 429 || (errJson.detail && String(errJson.detail).toLowerCase().includes("rate limit"))) {
          setIsUploading(false);
          setUploadComplete(false);
          pendingTransitionRef.current = null;
          localStorage.setItem("resora-upload-rate-limit-until", String(Date.now() + 86400000));
          localStorage.setItem("resora-remaining-uploads", "0");
          setRemainingUploads(0);
          setIsDailyRateLimited(true);
          setShowRateLimitModal(true);
          setSearchError("");
          return;
        }
        throw new Error(errJson.detail || `HTTP ${res.status}`);
      }

      const data = await res.json();

      // Proactively record if quota was updated on this successful upload
      if (data.rateLimit) {
        if (typeof data.rateLimit.remainingUploads === "number") {
          setRemainingUploads(data.rateLimit.remainingUploads);
          try { localStorage.setItem("resora-remaining-uploads", String(data.rateLimit.remainingUploads)); } catch { /* ignore */ }
        }
        if (data.rateLimit.isRateLimited || data.rateLimit.remainingUploads === 0) {
          const resetMs = (data.rateLimit.resetSeconds || 86400) * 1000;
          localStorage.setItem("resora-upload-rate-limit-until", String(Date.now() + resetMs));
          setIsDailyRateLimited(true);
        }
      }

      // Check if the backend returned a meaningful parsed resume
      const parsedResume = data.resume;
      const hasContent = parsedResume && (
        (parsedResume.personal?.fullName && parsedResume.personal.fullName.trim()) ||
        (parsedResume.headline && parsedResume.headline.trim()) ||
        (parsedResume.experience && parsedResume.experience.length > 0 && parsedResume.experience.some(e => e.title?.trim() || e.company?.trim())) ||
        (parsedResume.education && parsedResume.education.length > 0 && parsedResume.education.some(e => e.school?.trim())) ||
        (parsedResume.skills && parsedResume.skills.trim())
      );

      if (!hasContent) {
        // Backend returned empty — fall back to text extraction
        if (file.name.endsWith(".txt") || file.type === "text/plain") {
          const fallbackData = await parseTextResumeFallback(file);
          pendingTransitionRef.current = { prof: fallbackData.profession, resume: fallbackData.resume };
          setUploadComplete(true);
        } else {
          // Can't extract text from binary PDF on client — send to general builder
          setSearchError("Resume could not be parsed automatically. You can fill in your details manually below.");
          pendingTransitionRef.current = { prof: "general", resume: parsedResume || {} };
          setUploadComplete(true);
        }
        return;
      }

      // Use the detected profession only if content exists; default to 'general' if empty
      const detectedProf = data.profession && hasContent ? data.profession : "general";

      pendingTransitionRef.current = { prof: detectedProf, resume: parsedResume };
      setUploadComplete(true);
    } catch (err) {
      console.error("Resume upload error:", err);
      setIsUploading(false);
      setUploadComplete(false);
      pendingTransitionRef.current = null;
      if (err.message && (err.message.includes("429") || err.message.toLowerCase().includes("rate limit") || err.message.toLowerCase().includes("maximum 5"))) {
        localStorage.setItem("resora-upload-rate-limit-until", String(Date.now() + 86400000));
        setIsDailyRateLimited(true);
        setShowRateLimitModal(true);
        setSearchError("");
      } else if (err.name === "AbortError") {
        setSearchError("Resume parsing timed out (>30s). The backend server may be starting up — please try again in a moment.");
      } else if (err.message === "PROD_BACKEND_NOT_CONFIGURED") {
        setSearchError("Backend URL not configured. Please add VITE_PYTHON_BACKEND_URL in your deployment environment variables.");
      } else if (err.message?.includes("Failed to fetch") || err.name === "TypeError") {
        const isProd = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';
        if (isProd) {
          setSearchError("Unable to connect to backend server. Please verify your backend is running and VITE_PYTHON_BACKEND_URL is set.");
        } else {
          setSearchError("Backend server offline (http://localhost:8000). Please start FastAPI server and verify GROQ_API_KEY.");
        }
      } else {
        setSearchError(`Failed to parse resume (${err.message || "Network Error"}). Please verify backend server and GROQ_API_KEY.`);
      }
    } finally {
      e.target.value = "";
    }
  };

  const handleUploadButtonClick = () => {
    if (hasUploadedResume) {
      handleGoToUploaded();
      return;
    }

    // 1. Instant check: if state or local storage marks the client as rate limited
    const isCachedLimited = checkClientRateLimited();

    if (isDailyRateLimited || isCachedLimited) {
      setShowRateLimitModal(true);
      return;
    }

    // 2. Not limited: open file selector directly
    document.getElementById("resume-upload-input")?.click();
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
    setInput("");
    setSearchError("");
    setIsSearchingNewRole(false);
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
          <div key="returning-title" className="hero-title-container returning-hero hero-fade-enter">
            <h2 className="hero-title-returning">
              Ready to work on your <span className="highlight-role">{existingResumeInfo.targetRole}</span> resume?
            </h2>
          </div>
        ) : (
          <div key="default-title" className="hero-title-container hero-fade-enter">
            <h2 className="hero-title-line">What is your</h2>
            <h2 className="hero-title-line">Profession?</h2>
          </div>
        )}

        {existingResumeInfo && !isSearchingNewRole ? (
          <div key="returning-cta" className="existing-resume-cta-row hero-fade-enter">
            <button
              type="button"
              className="btn-go-to-resume"
              onClick={() => onSelect(existingResumeInfo.profession)}
            >
              <span>Go to My Resume</span>
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </button>

            <button
              type="button"
              className="btn-switch-role-secondary"
              onClick={() => setIsSearchingNewRole(true)}
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
              <span>Search Different Role</span>
            </button>
          </div>
        ) : (
          <form key="search-form" className={`search-bar-pill hero-fade-enter ${searchError ? "shake" : ""}`} onSubmit={handleSubmit}>
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
          <div className="back-to-existing-wrapper">
            <button
              type="button"
              className="btn-back-to-existing-link"
              onClick={() => setIsSearchingNewRole(false)}
            >
              <svg className="back-arrow-svg" xmlns="http://www.w3.org/2000/svg" width="16" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              <span className="hover-underline-animation">Back to {getProfessionDisplayName(existingResumeInfo.profession)} Resume</span>
            </button>
          </div>
        )}

        {(!existingResumeInfo || isSearchingNewRole) && (
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
        )}


        <p className="hero-description-new">
          Resora creates single-page, ATS-friendly resumes tailored to your chosen profession in seconds.
        </p>
      </main>

      {(!existingResumeInfo || isSearchingNewRole) && (
        <div className="floating-upload-resume-widget">
          <input
            type="file"
            id="resume-upload-input"
            accept=".pdf,.docx,.doc,.txt"
            style={{ display: "none" }}
            onChange={handleFileUpload}
          />
          <DelayedTooltip
            title="Weekly Upload Quota"
            description={
              !hasUploadedResume ? (
                <>
                  <strong>{remainingUploads}/3 uploads remaining</strong> this week for your IP address.
                </>
              ) : null
            }
          >
            <button
              type="button"
              className={`Documents-btn ${hasUploadedResume ? "active-uploaded" : ""}`}
              onClick={handleUploadButtonClick}
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
                  <line x1="16" y1="24" x2="72" y2="24" stroke={hasUploadedResume ? "#059669" : "#ea580c"} strokeWidth="5" strokeLinecap="round" />
                  <line x1="16" y1="40" x2="56" y2="40" stroke={hasUploadedResume ? "#34d399" : "#fdba74"} strokeWidth="5" strokeLinecap="round" />
                  <line x1="16" y1="56" x2="64" y2="56" stroke={hasUploadedResume ? "#34d399" : "#fdba74"} strokeWidth="5" strokeLinecap="round" />
                  <line x1="16" y1="72" x2="48" y2="72" stroke={hasUploadedResume ? "#34d399" : "#fdba74"} strokeWidth="5" strokeLinecap="round" />
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
              <span className="text-wrapper">
                <span className="text">
                  {hasUploadedResume ? "My Resume" : isUploading ? "Uploading..." : "Upload"}
                </span>
                {!hasUploadedResume && (
                  <span className={`upload-quota-tag ${remainingUploads === 0 ? "quota-exhausted" : ""}`}>
                    {remainingUploads}/3
                  </span>
                )}
              </span>
            </button>
          </DelayedTooltip>
        </div>
      )}

      <footer className="landing-footer">
        <p className="footer-version-text">
          Resora by Nezer • <span className="footer-version-badge">v2.5.5</span>
        </p>
      </footer>

      {showAuthModal && createPortal(
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
        </div>,
        document.body
      )}

      {showRateLimitModal && createPortal(
        <div className="auth-gate-modal-overlay" onClick={() => setShowRateLimitModal(false)}>
          <div className="auth-gate-modal-box rate-limit-modal-box" onClick={(e) => e.stopPropagation()}>
            <div className="rate-limit-mascot-wrapper">
              <PeekingMonster mood="frustrated" />
            </div>
            <div className="rate-limit-badge">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <span>Weekly Limit Reached</span>
            </div>
            <h3 className="auth-gate-title">Weekly Upload Limit Reached</h3>
            <p className="auth-gate-text">
              You have reached your weekly allowance of <strong>3 resume uploads</strong> for this week. Your quota resets every 7 days.
            </p>
            <div className="rate-limit-suggestion-box">
              <div className="rate-limit-suggestion-icon">💡</div>
              <div className="rate-limit-suggestion-text">
                Don't worry! You can still build and export your resume <strong>manually in seconds</strong> with our tailored templates.
              </div>
            </div>
            <div className="auth-gate-buttons">
              <button
                type="button"
                className="auth-gate-btn-primary"
                onClick={() => setShowRateLimitModal(false)}
              >
                Got It
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
      {isUploading && (
        <ParsingLoader
          filename={uploadingFileName}
          isComplete={uploadComplete}
          onFinished={handleUploadFinished}
        />
      )}
    </div>
  );
}
