import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import "../css/ParsingLoader.css";

const PARSING_STAGES = [
  {
    id: "extract",
    label: "Reading PDF Document & Extracting Text",
    detail: "Scanning raw PDF streams and structure...",
    threshold: 25
  },
  {
    id: "chunk",
    label: "Chunking Text & Mapping Sections",
    detail: "Segmenting work history, skills, and education...",
    threshold: 55
  },
  {
    id: "ai",
    label: "AI Extracting Structured Keywords",
    detail: "Categorizing technical skills, contact info & dates...",
    threshold: 85
  },
  {
    id: "format",
    label: "Building ATS-Optimized Layout",
    detail: "Finalizing resume data structure...",
    threshold: 100
  }
];

export default function ParsingLoader({ filename, isComplete = false, onFinished }) {
  const [progress, setProgress] = useState(8);
  const onFinishedRef = useRef(onFinished);
  onFinishedRef.current = onFinished;

  // Regular simulated progression while backend processes
  useEffect(() => {
    if (isComplete) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev < 25) {
          return prev + (Math.random() * 2.8 + 1.6);
        } else if (prev < 55) {
          return prev + (Math.random() * 2.0 + 1.0);
        } else if (prev < 85) {
          return prev + (Math.random() * 1.4 + 0.6);
        } else if (prev < 94) {
          // Slow down near ceiling while waiting for backend completion
          return prev + (Math.random() * 0.4 + 0.1);
        }
        return prev;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isComplete]);

  // When backend completion is signaled, smoothly drive progress to 100%
  useEffect(() => {
    if (!isComplete) return;

    let current = progress;
    const stepInterval = setInterval(() => {
      current += Math.max(2, (100 - current) * 0.35);
      if (current >= 99.5) {
        current = 100;
        setProgress(100);
        clearInterval(stepInterval);

        // Brief delay at 100% so user sees completion before transitioning
        setTimeout(() => {
          if (onFinishedRef.current) {
            onFinishedRef.current();
          }
        }, 400);
      } else {
        setProgress(current);
      }
    }, 30);

    return () => clearInterval(stepInterval);
  }, [isComplete]);

  const currentPercent = Math.min(100, Math.floor(progress));

  let currentStageIndex = 0;
  if (currentPercent >= 100 || isComplete && currentPercent >= 98) {
    currentStageIndex = 4; // all done
  } else if (currentPercent >= 85) {
    currentStageIndex = 3;
  } else if (currentPercent >= 55) {
    currentStageIndex = 2;
  } else if (currentPercent >= 25) {
    currentStageIndex = 1;
  } else {
    currentStageIndex = 0;
  }

  const isAllDone = currentPercent >= 100;

  const content = (
    <div className="parsing-loader-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="parsing-loader-content">
        {/* Domino Spinner / Checkmark */}
        <div className="domino-spinner-wrapper">
          {isAllDone ? (
            <div className="parsing-done-icon-wrapper">
              <svg viewBox="0 0 24 24" width="44" height="44" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            </div>
          ) : (
            <div className="domino-spinner">
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          )}
        </div>

        <h3 className="parsing-title">
          {isAllDone ? "Resume Parsed Successfully!" : "Parsing Resume..."}
        </h3>
        
        {/* Filename Pill Badge */}
        {filename && (
          <div className="parsing-filename-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
            <span className="parsing-filename-text">{filename}</span>
          </div>
        )}

        {/* Progress Header & Percentage Counter */}
        <div className="parsing-progress-header">
          <span className="parsing-progress-status">
            {isAllDone ? "Opening Resume Builder..." : "Processing document..."}
          </span>
          <span className="parsing-progress-percent">{currentPercent}%</span>
        </div>

        {/* Dynamic Progress Bar */}
        <div className="parsing-progress-track">
          <div
            className={`parsing-progress-fill ${isAllDone ? "is-complete" : ""}`}
            style={{ width: `${currentPercent}%` }}
          />
        </div>

        {/* Dynamic Chunking Pipeline Stages */}
        <div className="parsing-stages-list">
          {PARSING_STAGES.map((stage, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex && !isAllDone;

            return (
              <div
                key={stage.id}
                className={`parsing-stage-item ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
              >
                <div className="parsing-stage-icon">
                  {isDone ? (
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : isCurrent ? (
                    <span className="parsing-current-dot" />
                  ) : (
                    <span className="parsing-upcoming-dot" />
                  )}
                </div>
                <div className="parsing-stage-info">
                  <span className="parsing-stage-label">{stage.label}</span>
                  {isCurrent && (
                    <span className="parsing-stage-detail">
                      {stage.detail}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
