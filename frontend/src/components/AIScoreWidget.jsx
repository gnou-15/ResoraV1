import React, { useState } from "react";
import PeekingMonster from "./PeekingMonster";
import { getMetricSuggestions } from "../services/aiScorer";
import "../css/AIScoreWidget.css";

function AIScoreWidget({ resume, profession, analysisResult, loading, onUpdateResume, moodOverride, plan, onOpenPricing }) {
  const [expanded, setExpanded] = useState(false);
  const [activeOptimizerBulletId, setActiveOptimizerBulletId] = useState(null);

  const {
    score = 15,
    placement = "Needs Work",
    placementColor = "#ef4444",
    acceptancePercentage = 15,
    mascotMood = "normal",
    tips = [],
    scoreBreakdown = {},
    jobs = [],
    insufficientData = false,
    estimatedFill = 0,
    missingSections = []
  } = analysisResult || {};

  // Circumference for circular gauge
  const radius = 36;
  const strokeCircumference = 2 * Math.PI * radius; // 226.19
  const strokeDashoffset = strokeCircumference * (1 - score / 100);

  // Experience bullets optimization logic
  const handleApplyRewrite = (jobId, bulletIdx, rewrittenText) => {
    if (!resume || !resume.experience) return;
    
    const updatedExperience = resume.experience.map(job => {
      if (job.id === jobId) {
        const updatedBullets = [...job.bullets];
        updatedBullets[bulletIdx] = rewrittenText;
        return { ...job, bullets: updatedBullets };
      }
      return job;
    });

    onUpdateResume({
      ...resume,
      experience: updatedExperience
    });
    
    // Close optimizer for this bullet
    setActiveOptimizerBulletId(null);
  };

  const bulletsToOptimize = tips.find(t => t.id === 'exp_metrics_low' || t.id === 'exp_metrics_missing')?.bulletsToFix || [];

  // Compute the CSS class string for the card
  const cardClasses = [
    'ai-widget-card',
    loading ? 'ai-widget-loading' : '',
    insufficientData && !loading ? 'ai-widget-insufficient' : ''
  ].filter(Boolean).join(' ');

  // Banner text varies by state
  const bannerText = loading
    ? "Synchronizing with LinkedIn Insights API..."
    : insufficientData
      ? "Awaiting sufficient resume data for analysis..."
      : "LinkedIn & Multi-Source Talent APIs Connected";

  const badgeText = loading ? "Scanning..." : insufficientData ? "Pending" : "Synced";
  const dotClass = loading ? "syncing" : "connected";
  const dotStyle = insufficientData && !loading
    ? { background: '#94a3b8', boxShadow: '0 0 8px #94a3b8' }
    : {};

  return (
    <div className={cardClasses}>
      {/* simulated LinkedIn / API connection banner */}
      <div className="ai-widget-banner">
        <div className="status-indicator">
          <span className={`pulse-dot ${dotClass}`} style={dotStyle}></span>
          <span className="status-text">{bannerText}</span>
        </div>
        <div className="sync-badge">{badgeText}</div>
      </div>

      {plan && !plan.hasAI ? (
        <div className="ai-widget-locked-body">
          <div className="lock-icon-wrapper">
            <svg viewBox="0 0 24 24" width="48" height="48" stroke="#ea580c" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
          <h3 className="locked-title">AI Resume Scorer Locked</h3>
          <p className="locked-desc">
            Upgrade to <strong>Premium Pro</strong> to unlock the real-time AI scoring engine, interactive bullet rewrite suggestions, and verified LinkedIn job matching.
          </p>
          <button
            type="button"
            className="locked-upgrade-btn"
            onClick={onOpenPricing}
          >
            Upgrade to Premium Pro (₱119)
          </button>
        </div>
      ) : loading ? (
        <div className="ai-widget-loading-body animate-fade-in">
          <div className="sync-dance-wrapper">
            <PeekingMonster mood={moodOverride || "excited"} isPremium={plan && plan.isActive && (plan.type === "premium_plus" || plan.type === "premium_pro")} />
          </div>
          <div className="sync-blinking-text">Synchronizing...</div>
        </div>
      ) : insufficientData ? (
        <>
          {/* ── Insufficient Data Body (shown when not enough content) ── */}
          <div className="insufficient-data-body animate-fade-in">
            <div className="insufficient-mascot">
              <PeekingMonster mood="normal" isPremium={plan && plan.isActive && (plan.type === "premium_plus" || plan.type === "premium_pro")} />
            </div>

        <div className="insufficient-content">
          <h3 className="insufficient-title">Not Enough Information Yet</h3>
          <p className="insufficient-desc">
            Your resume content fills approximately <strong>{estimatedFill}%</strong> of the page.
            To provide an accurate AI analysis and job match score, please fill at least 80% of the page with your credentials.
          </p>

          <div className="insufficient-fill-bar">
            <div className="fill-track">
              <div className="fill-progress" style={{ width: `${estimatedFill}%` }}></div>
              <div className="fill-midpoint"></div>
            </div>
            <div className="fill-labels">
              <span>0%</span>
              <span className="midpoint-label">80% minimum</span>
              <span>100%</span>
            </div>
          </div>

          {missingSections.length > 0 && (
            <div className="insufficient-checklist">
              <span className="checklist-title">Consider adding:</span>
              <ul>
                {missingSections.map((section, idx) => (
                  <li key={idx}>
                    <span className="checklist-icon">＋</span>
                    <span>{section}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
      </>
      ) : (
        <>
          {/* ── Normal Analysis Body (shown when data is sufficient) ── */}
          <div className="ai-widget-body animate-fade-in">
        {/* Left column: Score circle and Mascot */}
        <div className="score-and-mascot-panel">
          <div className="circular-gauge-container">
            <svg width="100" height="100" viewBox="0 0 100 100" className="score-svg">
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="score-track-circle"
              />
              <circle
                cx="50"
                cy="50"
                r={radius}
                className="score-fill-circle"
                style={{
                  stroke: placementColor,
                  strokeDasharray: strokeCircumference,
                  strokeDashoffset: strokeDashoffset
                }}
              />
            </svg>
            <div className="score-inner-text">
              <span className="score-number">{score}%</span>
              <span className="score-label">MATCH</span>
            </div>
          </div>

          <div className="mascot-placeholder"></div>

          <div className="mascot-panel">
            <div className="sync-dance-wrapper">
              <PeekingMonster mood={moodOverride || (loading ? "excited" : mascotMood)} isPremium={plan && plan.isActive && (plan.type === "premium_plus" || plan.type === "premium_pro")} />
            </div>
            <div className="mascot-bubble">
              {score >= 85 ? (
                <span>Looking extremely dapper! Ready for hiring!</span>
              ) : score >= 65 ? (
                <span>Quite impressive, but a few edits can push us to the top!</span>
              ) : (
                <span>Let's optimize this. Follow the recommendations below!</span>
              )}
            </div>
          </div>
        </div>

        {/* Right column: Target Placement details */}
        <div className="placement-details-panel">
          <div className="placement-rank" style={{ color: placementColor }}>
            {placement}
          </div>
          <p className="placement-desc">
            Estimated accept rate: <strong>{acceptancePercentage}%</strong> on LinkedIn postings.
          </p>

          <div className="mini-breakdown">
            <div className="breakdown-item">
              <span className="b-label">Contact details</span>
              <div className="b-bar"><div className="b-fill" style={{ width: `${(scoreBreakdown.contact/15)*100}%`, background: placementColor }}></div></div>
            </div>
            <div className="breakdown-item">
              <span className="b-label">Headline & Summary</span>
              <div className="b-bar"><div className="b-fill" style={{ width: `${((scoreBreakdown.headline + scoreBreakdown.summary)/25)*100}%`, background: placementColor }}></div></div>
            </div>
            <div className="breakdown-item">
              <span className="b-label">Skills alignment</span>
              <div className="b-bar"><div className="b-fill" style={{ width: `${(scoreBreakdown.skills/20)*100}%`, background: placementColor }}></div></div>
            </div>
            <div className="breakdown-item">
              <span className="b-label">Experience impact</span>
              <div className="b-bar"><div className="b-fill" style={{ width: `${(scoreBreakdown.experience/25)*100}%`, background: placementColor }}></div></div>
            </div>
          </div>
        </div>
      </div>

      {/* Accordion list of tips */}
      <div className="ai-widget-suggestions animate-fade-in">
        <button 
          type="button" 
          className="suggestions-toggle-btn"
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? "Hide Suggestions" : `Show ATS & LinkedIn Suggestions (${tips.length} action items)`}</span>
          <span className={`chevron ${expanded ? 'up' : 'down'}`}>▼</span>
        </button>

        <div 
          className="suggestions-expanded-panel" 
          style={{
            maxHeight: expanded && !insufficientData ? '1200px' : '0px',
            opacity: expanded && !insufficientData ? (loading ? 0.55 : 1) : 0,
            padding: expanded && !insufficientData ? '1.25rem' : '0px 1.25rem',
            overflow: 'hidden',
            transition: 'max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.4s ease-out, padding 0.5s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          {tips.length === 0 ? (
            <div className="all-clear-msg">
              🎉 Perfect! Your resume scores 100% and meets all top LinkedIn & ATS benchmarks.
            </div>
          ) : (
            <div className="tips-list">
              {tips.map((tip) => (
                <div key={tip.id} className={`tip-card tip-${tip.type}`}>
                  <div className="tip-header">
                    <span className="tip-impact-badge">+{tip.impact}%</span>
                    <span className="tip-text">{tip.text}</span>
                  </div>

                  {/* Render Interactive Bullet metrics optimizer */}
                  {tip.fixable && bulletsToOptimize.length > 0 && (
                    <div className="bullet-optimizer-container">
                      <span className="optimizer-title">🎯 Interactive Bullet Optimizer</span>
                      <p className="optimizer-subtext">Click on any bullet below to automatically inject quantifiable metrics (numbers/percentages):</p>
                      
                      <div className="optimizer-list">
                        {bulletsToOptimize.map((bullet, idx) => {
                          const bulletId = `${bullet.jobId}-${bullet.bulletIndex}`;
                          const isSelected = activeOptimizerBulletId === bulletId;
                          const suggestions = getMetricSuggestions(bullet.text, profession);

                          return (
                            <div key={bulletId} className={`optimizer-bullet-item ${isSelected ? 'active' : ''}`}>
                              <div 
                                className="bullet-original-clickable" 
                                onClick={() => setActiveOptimizerBulletId(isSelected ? null : bulletId)}
                              >
                                <span className="bullet-bullet">•</span>
                                <span className="bullet-orig-text">{bullet.text} <small className="company-tag">({bullet.company})</small></span>
                                <span className="bullet-arrow">{isSelected ? '▲' : '▼ Optimize'}</span>
                              </div>

                              {isSelected && (
                                <div className="rewrite-suggestions-panel">
                                  <span className="rewrite-label">Choose a template to inject metrics:</span>
                                  <div className="rewrite-options">
                                    {suggestions.map((sug) => (
                                      <button
                                        key={sug.id}
                                        type="button"
                                        className="rewrite-btn"
                                        onClick={() => handleApplyRewrite(bullet.jobId, bullet.bulletIndex, sug.text)}
                                      >
                                        {sug.text}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* LinkedIn Matched Jobs section */}
          <div className="matched-jobs-section">
            <span className="jobs-section-title">💼 Verified LinkedIn Job Matches (Based on your skills)</span>
            <div className="jobs-carousel">
              {jobs.map((job) => (
                <div key={job.id} className="job-match-card">
                  <div className="job-header">
                    <div className="job-logo" style={{ background: job.logoColor }}>
                      {job.company.substring(0, 1)}
                    </div>
                    <div className="job-names">
                      <h4>{job.title}</h4>
                      <h5>{job.company}</h5>
                    </div>
                    <span className="job-percentage-badge" style={{ borderColor: placementColor, color: placementColor }}>
                      {job.matchScore}% Match
                    </span>
                  </div>
                  <div className="job-info">
                    <span className="job-loc">📍 {job.location}</span>
                    <span className="job-sal">💰 {job.salary}</span>
                  </div>
                  <a 
                    href={`https://www.linkedin.com/jobs/search/?keywords=${encodeURIComponent(job.title)}`}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="job-apply-link"
                  >
                    Quick Apply via LinkedIn →
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
        </>
      )}
</div>
  );
}

export default AIScoreWidget;
