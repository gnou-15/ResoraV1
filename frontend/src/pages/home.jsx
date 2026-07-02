import { useState, useEffect, useRef } from "react";
import "../css/App.css";
import ResumeEditor from "../components/ResumeEditor";
import ResumePreview from "../components/ResumePreview";
import { useResume } from "../hooks/useResume";
import { defaultResume } from "../data/defaultResume";
import AIScoreWidget from "../components/AIScoreWidget";
import { analyzeResume, fetchAPIAnalysis } from "../services/aiScorer";
import { useDialog } from "../context/DialogContext";

const PROFESSION_TITLES = {
  it: "IT Resume Builder",
  healthcare: "Healthcare Resume Builder",
  education: "Education Resume Builder",
  management: "Management Resume Builder",
  engineering: "Engineering Resume Builder",
  business: "Business & Accountancy Resume Builder",
  customs: "Customs Administration Resume Builder",
  safety: "Safety Officer Resume Builder",
  designer: "Graphic Design Resume Builder",
  data: "Data Analytics Resume Builder",
  sales: "Sales & Account Executive Resume Builder",
  hr: "Behavioral Health & Social Services Resume Builder",
};

function Home({ profession, user, onBack, plan, onOpenPricing }) {
  const { showAlert, showConfirm } = useDialog();
  const {
    resume,
    setResume,
    saved,
    isInitialized,
    updatePersonal,
    updateLocation,
    updateHeadline,
    updateSummary,
    updateTechnicalSkill,
    updateUserType,
    resetResume,
  } = useResume(profession, user);

  const [mobileTab, setMobileTab] = useState("edit");
  const [analysisResult, setAnalysisResult] = useState(() => {
    try {
      const cached = localStorage.getItem(`resume-analysis-${profession}`);
      if (cached) return JSON.parse(cached);
    } catch (e) {
      console.warn("Failed to load cached analysis on initial state setup:", e);
    }
    return analyzeResume(defaultResume, profession);
  });
  const [syncing, setSyncing] = useState(false);
  const [mascotMoodOverride, setMascotMoodOverride] = useState(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [headerCollapsed, setHeaderCollapsed] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  const hasSyncedInitially = useRef(false);

  // Load cached analysis and reset sync check flag when profession changes
  useEffect(() => {
    hasSyncedInitially.current = false;
    try {
      const cached = localStorage.getItem(`resume-analysis-${profession}`);
      if (cached) {
        setAnalysisResult(JSON.parse(cached));
      } else {
        setAnalysisResult(analyzeResume(defaultResume, profession));
      }
    } catch (e) {
      console.warn("Failed to load cached analysis on profession change:", e);
      setAnalysisResult(analyzeResume(defaultResume, profession));
    }
  }, [profession]);

  useEffect(() => {
    const handleResize = () => {
      const panel = document.querySelector(".panel-preview");
      if (panel) {
        const padding = 48; // padding and spacing tolerance
        const availableWidth = panel.clientWidth - padding;
        const targetWidth = 816; // 8.5in in pixels
        if (availableWidth < targetWidth && availableWidth > 0) {
          setPreviewScale(availableWidth / targetWidth);
        } else {
          setPreviewScale(1);
        }
      }
    };

    window.addEventListener("resize", handleResize);
    const timer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timer);
    };
  }, [mobileTab]);

  useEffect(() => {
    setHeaderCollapsed(false); // reset header on tab switch

    const panels = document.querySelectorAll(".panel");
    const handleScroll = (e) => {
      const scrollTop = e.target.scrollTop;
      // If user scrolls down more than 40px, collapse the header on mobile
      if (scrollTop > 40) {
        setHeaderCollapsed(true);
      } else {
        setHeaderCollapsed(false);
      }
    };

    panels.forEach((panel) => {
      panel.addEventListener("scroll", handleScroll);
    });

    return () => {
      panels.forEach((panel) => {
        panel.removeEventListener("scroll", handleScroll);
      });
    };
  }, [mobileTab]);



  // Debounced real-time analysis sync whenever resume changes
  useEffect(() => {
    if (!isInitialized) return;

    let lastAnalyzedResume = null;
    try {
      const cachedResume = localStorage.getItem(`last-analyzed-resume-${profession}`);
      if (cachedResume) {
        lastAnalyzedResume = JSON.parse(cachedResume);
      }
    } catch (e) {
      console.warn("Failed to load last analyzed resume:", e);
    }

    const resumeChanged = JSON.stringify(resume) !== JSON.stringify(lastAnalyzedResume);

    const runSync = async () => {
      setSyncing(true);
      try {
        const res = await fetchAPIAnalysis(resume, profession);
        setAnalysisResult(res);
        localStorage.setItem(`resume-analysis-${profession}`, JSON.stringify(res));
        localStorage.setItem(`last-analyzed-resume-${profession}`, JSON.stringify(resume));
      } catch (e) {
        console.error("Failed syncing analysis with backend:", e);
      } finally {
        setSyncing(false);
      }
    };

    // On initial load of the resume for this session/profession
    if (!hasSyncedInitially.current) {
      hasSyncedInitially.current = true;
      if (resumeChanged) {
        runSync();
      }
      return;
    }

    // If there are no literal changes to the resume data, skip everything
    if (!resumeChanged) {
      return;
    }

    // Subsequent edits are debounced by 10 seconds
    const timer = setTimeout(runSync, 10000);

    return () => clearTimeout(timer);
  }, [resume, profession, isInitialized]);


  const handleExport = async () => {
    if (plan && !plan.hasExport) {
      await showAlert(
        "PDF Export is locked. Please upgrade to a Premium plan to unlock high-fidelity exports.",
        "Premium Required"
      );
      onOpenPricing();
      return;
    }

    // ensure preview is visible
    setMobileTab("preview");

    setTimeout(() => {
      const originalTitle = document.title;
      const name = (
        resume?.personal?.fullName ||
        resume?.headline ||
        "Resume"
      ).toUpperCase();
      document.title = name;

      const restoreTitle = () => {
        document.title = originalTitle;
        window.removeEventListener("afterprint", restoreTitle);
      };

      window.addEventListener("afterprint", restoreTitle);
      window.print();

      // Fallback in case afterprint doesn't fire immediately/properly
      setTimeout(restoreTitle, 500);
    }, 250);
  };

  const handleReset = async () => {
    const confirmed = await showConfirm(
      "Clear all resume data? This cannot be undone.",
      "Reset Resume"
    );
    if (confirmed) {
      resetResume();
    }
  };

  const themeClass =
    resume.userType === "student" ? "theme-student" : "theme-professional";

  return (
    <div className={`app ${themeClass} theme-skeuo ${headerCollapsed ? "header-collapsed" : ""}`}>

      <header className="app-header">
        <div className="header-brand" style={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
          <svg className="logo-svg" width="28" height="28" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="editorBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#475569" />
                <stop offset="100%" stopColor="#1e293b" />
              </linearGradient>
            </defs>
            {/* Body */}
            <circle cx="17" cy="21" r="9.5" fill="url(#editorBodyGrad)" />
            {/* Hat Brim */}
            <rect x="6" y="9.5" width="22" height="2.5" rx="0.8" fill="#1e293b" />
            {/* Hat Ribbon */}
            <rect x="10" y="8" width="14" height="1.5" fill="#ea580c" />
            {/* Hat Crown */}
            <rect x="10" y="1" width="14" height="7" rx="1" fill="#1e293b" />
            {/* Eyes */}
            <circle cx="13.5" cy="19" r="2.2" fill="#ffffff" />
            <circle cx="13.5" cy="19" r="1.1" fill="#0f172a" />
            <circle cx="20.5" cy="19" r="2.2" fill="#ffffff" />
            <circle cx="20.5" cy="19" r="1.1" fill="#0f172a" />
            {/* Monocle */}
            <circle cx="20.5" cy="19" r="3.6" stroke="#f59e0b" strokeWidth="0.9" fill="none" />
            <path d="M23.5 21.5 C25 24 24 26 22 28.5" stroke="#f59e0b" stroke-width="0.5" stroke-dasharray="1.2 0.8" fill="none" />
            {/* Mustache */}
            <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
          </svg>
          <h1 style={{ margin: 0 }}>{PROFESSION_TITLES[profession] || "Resora"}</h1>
        </div>
        {onBack && (
          <div style={{ marginLeft: "1rem" }}>
            <button type="button" className="btn btn-ghost" onClick={onBack}>
              ← Back
            </button>
          </div>
        )}
        <div className="header-actions">
          <div className="user-type-toggle">
            <button
              type="button"
              className={resume.userType === "professional" ? "active" : ""}
              onClick={() => updateUserType("professional")}
            >
              Professional
            </button>
            <button
              type="button"
              className={resume.userType === "student" ? "active" : ""}
              onClick={() => updateUserType("student")}
            >
              Student
            </button>
          </div>
          <div className="format-badge-container">
            <span className="format-badge">ATS Standard Format</span>
            <div className="ats-tooltip-bubble">
              <h4>What is ATS?</h4>
              <p>
                An <strong>Applicant Tracking System</strong> is software recruiters use to scan, parse, and filter candidate resumes for relevant skills and keywords.
              </p>
              <h4>Why it matters:</h4>
              <p>
                Resora generates clean, single-column documents. By avoiding complex graphic assets, tables, or text columns, it guarantees <strong>100% parsing accuracy</strong> when processed by hiring algorithms.
              </p>
            </div>
          </div>
          <span className={`save-status ${saved ? "saved" : "saving"}`}>
            {saved ? "Saved" : "Saving…"}
          </span>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={handleExport}
            onMouseEnter={() => setMascotMoodOverride("excited")}
            onMouseLeave={() => setMascotMoodOverride(null)}
          >
            Export
          </button>
          <button
            type="button"
            className="btn btn-ghost"
            onClick={handleReset}
            onMouseEnter={() => setMascotMoodOverride("frantic")}
            onMouseLeave={() => setMascotMoodOverride(null)}
          >
            Clear All
          </button>
        </div>
      </header>

      <div className="mobile-tabs">
        <button
          type="button"
          className={mobileTab === "edit" ? "active" : ""}
          onClick={() => setMobileTab("edit")}
        >
          Edit
        </button>
        <button
          type="button"
          className={mobileTab === "preview" ? "active" : ""}
          onClick={() => setMobileTab("preview")}
        >
          Preview
        </button>
      </div>

      <main className="app-main">
        <div
          className={`panel panel-editor ${mobileTab === "edit" ? "active" : ""}`}
        >
          <ResumeEditor
            resume={resume}
            setResume={setResume}
            profession={profession}
            updatePersonal={updatePersonal}
            updateLocation={updateLocation}
            updateHeadline={updateHeadline}
            updateSummary={updateSummary}
            updateTechnicalSkill={updateTechnicalSkill}
            user={user}
          />
        </div>
        <div
          className={`panel panel-preview ${mobileTab === "preview" ? "active" : ""}`}
        >
          <AIScoreWidget
            resume={resume}
            profession={profession}
            analysisResult={analysisResult}
            loading={syncing}
            onUpdateResume={setResume}
            moodOverride={mascotMoodOverride}
            plan={plan}
            onOpenPricing={onOpenPricing}
          />
          <div className="preview-toolbar">
            <span>Live preview — multi-page pagination enabled</span>
          </div>
          <div className="preview-container" style={{ height: `${((pageCount * 1056) + (pageCount - 1) * 20) * previewScale}px`, overflow: "hidden", width: "100%", position: "relative" }}>
            <div className="preview-wrapper" style={{ transform: `scale(${previewScale})`, transformOrigin: "top center" }}>
              <ResumePreview resume={resume} profession={profession} plan={plan} onPageCountChange={setPageCount} />
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default Home;
