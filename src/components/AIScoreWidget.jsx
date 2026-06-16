import React, { useState } from "react";
import PeekingMonster from "./PeekingMonster";
import { getMetricSuggestions } from "../services/aiScorer";

function AIScoreWidget({ resume, profession, analysisResult, loading, onUpdateResume, moodOverride }) {
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
    jobs = []
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

  return (
    <div className={`ai-widget-card ${loading ? 'ai-widget-loading' : ''}`}>
      {/* simulated LinkedIn / API connection banner */}
      <div className="ai-widget-banner">
        <div className="status-indicator">
          <span className={`pulse-dot ${loading ? 'syncing' : 'connected'}`}></span>
          <span className="status-text">
            {loading ? "Synchronizing with LinkedIn Insights API..." : "LinkedIn & Multi-Source Talent APIs Connected"}
          </span>
        </div>
        <div className="sync-badge">
          {loading ? "Scanning..." : "Synced"}
        </div>
      </div>

      <div className="ai-widget-body">
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
                  strokeDashoffset: loading ? strokeCircumference : strokeDashoffset
                }}
              />
            </svg>
            <div className="score-inner-text">
              <span className="score-number">{loading ? "..." : `${score}%`}</span>
              <span className="score-label">MATCH</span>
            </div>
          </div>

          <div className="mascot-panel">
            <PeekingMonster mood={moodOverride || (loading ? "frantic" : mascotMood)} />
            <div className="mascot-bubble">
              {loading ? (
                <span>Checking benchmarks...</span>
              ) : score >= 85 ? (
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
      <div className="ai-widget-suggestions">
        <button 
          type="button" 
          className="suggestions-toggle-btn"
          onClick={() => setExpanded(!expanded)}
        >
          <span>{expanded ? "Hide Suggestions" : `Show ATS & LinkedIn Suggestions (${tips.length} action items)`}</span>
          <span className={`chevron ${expanded ? 'up' : 'down'}`}>▼</span>
        </button>

        {expanded && (
          <div className="suggestions-expanded-panel">
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
        )}
      </div>

    </div>
  );
}

export default AIScoreWidget;
