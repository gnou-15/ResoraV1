import React from "react";
import "../css/about.css";
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
            <span className="logo-brand">
              Resora <span className="logo-subtext">by Nezer</span>
            </span>
          </a>
          <nav className="nav-menu">
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("landing"); }}>
              Home
            </a>
            <a href="#" className="nav-link active" onClick={(e) => e.preventDefault()}>
              About Us
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("services"); }}>
              Service
            </a>
            <a href="#" className="nav-link" onClick={(e) => { e.preventDefault(); onNavigate && onNavigate("contact"); }}>
              Contact
            </a>
          </nav>
        </header>
      )}

      <main className="about-main">
        {/* Hero Section */}
        <section className="about-hero-section">
          <div className="about-badge">ABOUT RESORA & NEZER</div>
          <h1 className="about-hero-title">
            Making the Complex <span className="highlight-text">Simple.</span>
          </h1>
          <p className="about-hero-subtitle">
            At <span className="brand-accent">Nezer</span>, we take intricate industrial, engineering, and digital processes and redesign them into intuitive, effortless experiences.
          </p>
        </section>

        {/* Product Overview Feature Section */}
        <section className="about-intro-card">
          <div className="intro-card-content">
            <h2 className="intro-card-title">Driven by Innovation & Efficiency</h2>
            <p className="intro-card-text">
              <strong>Resora</strong> is Nezer's flagship application—built to turn the frustrating and intricate chore of crafting a high-quality, Applicant Tracking System (ATS) friendly resume into a seamless, automated process that gives professionals the power to stand out instantly.
            </p>
          </div>
        </section>

        {/* Mission & Vision Dual Grid */}
        <section className="about-grid-section">
          <div className="about-card mission-card">
            <div className="card-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <circle cx="12" cy="12" r="6"/>
                <circle cx="12" cy="12" r="2"/>
              </svg>
            </div>
            <h3 className="card-title">Our Mission</h3>
            <p className="card-description">
              To simplify career document creation through intelligent design, removing friction and confusion so job seekers can showcase their true potential with confidence.
            </p>
          </div>

          <div className="about-card vision-card">
            <div className="card-icon-wrapper">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            </div>
            <h3 className="card-title">Our Vision</h3>
            <p className="card-description">
              To empower professionals everywhere with cutting-edge tools that elevate career opportunities, bridging the gap between talent and top recruiters.
            </p>
          </div>
        </section>

        {/* Core Values / Nezer Philosophy */}
        <section className="pillars-section">
          <h2 className="section-heading">Our Core Values</h2>
          <div className="pillars-grid">
            <div className="pillar-item">
              <div className="pillar-number">01</div>
              <h4 className="pillar-title">Process Simplicity</h4>
              <p className="pillar-desc">
                We believe the best technology stays out of your way. We transform complex workflows into simple, human-centered designs.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">02</div>
              <h4 className="pillar-title">Uncompromising Privacy</h4>
              <p className="pillar-desc">
                Your career story belongs to you. We design all our platforms with security and absolute user privacy at the core.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">03</div>
              <h4 className="pillar-title">Continuous Innovation</h4>
              <p className="pillar-desc">
                From engineering to AI profile scoring, we constantly refine our tools to keep job seekers ahead of evolving market standards.
              </p>
            </div>

            <div className="pillar-item">
              <div className="pillar-number">04</div>
              <h4 className="pillar-title">Equal Opportunity</h4>
              <p className="pillar-desc">
                Every candidate deserves a fair shot. We democratize access to high-impact resume creation for professionals everywhere.
              </p>
            </div>
          </div>
        </section>

        {/* Metrics Bar */}
        <section className="about-stats-bar">
          <div className="stat-box">
            <span className="stat-number">100%</span>
            <span className="stat-label">ATS Compliant Engine</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <span className="stat-number">10x</span>
            <span className="stat-label">Faster Resume Generation</span>
          </div>
          <div className="stat-divider" />
          <div className="stat-box">
            <span className="stat-number">Instant</span>
            <span className="stat-label">Live Preview & Export</span>
          </div>
        </section>

        {/* Call to Action Banner */}
        <section className="about-cta-card">
          <h2 className="cta-heading">Ready to Elevate Your Resume?</h2>
          <p className="cta-subtext">
            Join professionals using Resora by Nezer to craft standout resumes in seconds.
          </p>
          <div className="cta-actions">
            <button className="cta-btn primary" onClick={() => onNavigate && onNavigate("landing")}>
              Get Started Now
            </button>
            <button className="cta-btn secondary" onClick={() => onNavigate && onNavigate("contact")}>
              Contact Us
            </button>
          </div>
        </section>
      </main>
    </div>
  );
}
