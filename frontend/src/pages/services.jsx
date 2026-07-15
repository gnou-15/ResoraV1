import React from "react";
import "../css/services.css";
import InteractiveBackground from "../components/InteractiveBackground";

export default function Services({ onNavigate, isEmbedded, onMascotMoodChange }) {
  const servicesList = [
    {
      id: "ats",
      title: "ATS-Ready Architect",
      desc: "Resumes designed specifically to pass automated applicant tracking systems with optimized layouts, standard fonts, and perfect parser readability.",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="M7 8h10M7 12h10M7 16h6" />
        </svg>
      ),
    },
    {
      id: "tailored",
      title: "Role-Tailored Keywords",
      desc: "Receive smart content recommendations, technical keyword lists, and summary suggestions based on your exact chosen profession.",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
      ),
    },
    {
      id: "preview",
      title: "Live Paper Sandbox",
      desc: "Watch your edits render in real-time on a premium, true-to-life resume document with perfect layout fidelity and direct print styling.",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4l3 3" />
        </svg>
      ),
    },
    {
      id: "cloud",
      title: "Secure Cloud Vault",
      desc: "Your data is locked safely in your account. Log in from any device to continue customizing, editing, or copying your active resumes.",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      id: "ai-scorer",
      title: "LinkedIn AI Scorer (Boss Feature)",
      desc: "Benchmark your resume against thousands of profiles using real-time API simulation. Calculate your acceptance confidence score, optimize metrics via our interactive rewrite tools, and view matched jobs instantly.",
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" stroke="currentColor" strokeWidth="2" fill="none">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 2a10 10 0 0 1 10 10" />
          <path d="M12 12l4-4" strokeLinecap="round" />
          <circle cx="12" cy="12" r="2" fill="currentColor" />
          <path d="M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" strokeDasharray="2 2" />
        </svg>
      ),
    },
  ];

  return (
    <div className="services-container">
      {!isEmbedded && <InteractiveBackground />}
      
      {!isEmbedded && (
        <header className="landing-header">
          <a href="/" className="logo-container" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
            <svg className="logo-svg" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="17" cy="21" r="9.5" fill="#1e293b" />
              <rect x="6" y="9.5" width="22" height="2.5" rx="0.8" fill="#1e293b" />
              <rect x="10" y="8" width="14" height="1.5" fill="#ea580c" />
              <rect x="10" y="1" width="14" height="7" rx="1" fill="#1e293b" />
              <circle cx="13.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="20.5" cy="19" r="2.2" fill="#ffffff" />
              <circle cx="20.5" cy="19" r="3.6" stroke="#f59e0b" strokeWidth="0.9" fill="none" />
              <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
            </svg>
            <span className="logo-brand">
              Resora <span className="logo-subtext">by Nezer</span>
            </span>
          </a>
        </header>
      )}

      <main className="services-main">
        <div className="services-header-block animate-fade-in">
          <h2 className="services-title">Our Services</h2>
          <p className="services-subtitle">
            Crafting the ultimate toolkit to help you navigate and master your professional career path.
          </p>
        </div>

        <div className="services-grid animate-fade-in" style={{ animationDelay: "0.15s" }}>
          {servicesList.map((service) => (
            <div
              key={service.id}
              className="service-card"
              onMouseEnter={() => onMascotMoodChange && onMascotMoodChange("excited")}
              onMouseLeave={() => onMascotMoodChange && onMascotMoodChange("normal")}
            >
              <div className="service-icon-wrapper">
                {service.icon}
              </div>
              <h3 className="service-card-title">{service.title}</h3>
              <p className="service-card-desc">{service.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
