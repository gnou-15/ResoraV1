import React, { useState, useEffect } from "react";
import "../css/App.css";
import InteractiveBackground from "../components/InteractiveBackground";
import PeekingMonster from "../components/PeekingMonster";

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
  "Education Specialist",
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
];

export default function Landing({ onSelect, onNavigate, isEmbedded, user, mascotMood, onMascotMoodChange }) {
  const [input, setInput] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [searchError, setSearchError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [localMood, setLocalMood] = useState("normal");

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
    const hasHR = /(hr|human resources|recruiter|onboarding|recruitment)/.test(t);

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

  function handleSubmit(e) {
    e && e.preventDefault();
    let targetInput = input.trim();
    if (!targetInput && placeholder) {
      // Clean up placeholder text for matching (remove cursor and prefix)
      targetInput = placeholder.replace(" |", "").replace("I am a ", "");
    }
    if (!targetInput) {
      setSearchError("Please enter a profession.");
      return;
    }

    // Check if input is only numbers or special characters
    if (/^[0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]*$/.test(targetInput)) {
      setSearchError("Please enter a valid profession.");
      return;
    }
    
    const prof = detectProfession(targetInput);
    if (prof) {
      if (!user) {
        setShowAuthModal(true);
      } else {
        onSelect(prof);
      }
    } else {
      setSearchError("Unsupported profession. Try: Nurse, Developer, Engineer, Accountant, Safety Officer");
    }
  }

  return (
    <div className="landing-container">
      {!isEmbedded && <InteractiveBackground />}
      {!isEmbedded && (
        <header className="landing-header">
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
            <h1 className="logo-brand">
              Resora <div className="logo-subtext" onClick={(e) => { e.stopPropagation(); e.preventDefault(); onNavigate && onNavigate("about"); }}>by Nezer</div>
            </h1>
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
        <PeekingMonster mood={mascotMood || localMood} />
        <div className="hero-title-container">
          <h2 className="hero-title-line">What is your</h2>
          <h2 className="hero-title-line">Profession?</h2>
        </div>

        <form className={`search-bar-pill ${searchError ? "shake" : ""}`} onSubmit={handleSubmit}>
          <div className="search-input-wrapper">
            <input
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

        <div className="announcement-banner">
          <strong>Announcement:</strong> This is currently a beta version of Resora. A major system overhaul and additional template options will be introduced once we reach our target user threshold.
        </div>
      </main>

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
    </div>
  );
}
