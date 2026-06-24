import React from "react";
import "../css/App.css";
import InteractiveBackground from "../components/InteractiveBackground";

export default function About({ onNavigate, isEmbedded }) {
  return (
    <div className="about-container">
      {!isEmbedded && <InteractiveBackground />}
      {!isEmbedded && (
        <header className="landing-header">
          <a href="/" className="logo-container" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
            <svg className="logo-svg" width="34" height="34" viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="aboutBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#475569" />
                  <stop offset="100%" stopColor="#1e293b" />
                </linearGradient>
              </defs>
              {/* Body */}
              <circle cx="17" cy="21" r="9.5" fill="url(#aboutBodyGrad)" />
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
              <path d="M23.5 21.5 C25 24 24 26 22 28.5" stroke="#f59e0b" strokeWidth="0.5" strokeDasharray="1.2 0.8" fill="none" />
              {/* Mustache */}
              <path d="M 17 23.5 C 13.5 21, 7.5 23.5, 5.5 27 C 7.5 27, 13 25.5, 17 24.5 C 21 25.5, 26.5 27, 28.5 27 C 26.5 23.5, 20.5 21, 17 23.5 Z" fill="#ffffff" />
            </svg>
            <h1 className="logo-brand">
              Resora <div className="logo-subtext">by Nezer</div>
            </h1>
          </a>
          <nav className="nav-menu">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
              Home
            </a>
            <a href="#" className="nav-link active" onClick={(e) => e.preventDefault()}>
              About Us
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
              Service
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
              Contact
            </a>
          </nav>
        </header>
      )}

      <main className="about-main">
        <div className="about-split-container">
          <div className="about-text-column">
            <h2 className="about-title">Hi, I'm <span style={{ color: "#ea580c" }}>Dan</span></h2>
            <h3 className="about-subtitle">The founder of <span style={{ color: "#ea580c", fontWeight: "700" }}>Nezer</span> company</h3>
            <p className="about-description">
              At <span style={{ color: "#ea580c", fontWeight: "700" }}>Nezer</span>, our core mission is to make the complex simple. Across all fields including engineering, modular studies, and diverse industrial sectors, we take processes that seem complicated and redesign them into intuitive, effortless experiences.
            </p>
            <p className="about-description" style={{ marginTop: "1rem" }}>
              Resora is our flagship product. Built on this exact philosophy, it turns the frustrating and intricate chore of crafting a high-quality, ATS-friendly resume into a seamless, automated process that gives professionals the power to stand out in seconds.
            </p>
          </div>
          <div className="about-image-column">
            <div className="about-image-wrapper">
              <img src="/founder.png" alt="Dan, Founder of Nezer company"
                className="about-portrait-img" />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
