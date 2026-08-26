import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import "../css/ParsingLoader.css";

const PARSING_STAGES = [
  {
    id: "extract",
    label: "Reading PDF Document & Extracting Text",
    detail: "Scanning raw PDF streams and structure...",
    progress: 25
  },
  {
    id: "chunk",
    label: "Chunking Text & Mapping Sections",
    detail: "Segmenting work history, skills, and education...",
    progress: 55
  },
  {
    id: "ai",
    label: "AI Extracting Structured Keywords",
    detail: "Categorizing technical skills, contact info & dates...",
    progress: 82
  },
  {
    id: "format",
    label: "Building ATS-Optimized Layout",
    detail: "Finalizing resume data structure...",
    progress: 96
  }
];

export default function ParsingLoader({ filename }) {
  const [currentStageIndex, setCurrentStageIndex] = useState(0);

  useEffect(() => {
    const intervals = [900, 1300, 1600];
    let currentIdx = 0;
    
    let timer = null;
    const nextStep = () => {
      if (currentIdx < PARSING_STAGES.length - 1) {
        currentIdx++;
        setCurrentStageIndex(currentIdx);
        if (currentIdx < intervals.length) {
          timer = setTimeout(nextStep, intervals[currentIdx]);
        }
      }
    };

    timer = setTimeout(nextStep, intervals[0]);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, []);

  const currentStage = PARSING_STAGES[currentStageIndex];

  const content = (
    <div className="parsing-loader-overlay" onClick={(e) => e.stopPropagation()}>
      <div className="parsing-loader-content">
        {/* Domino Spinner */}
        <div className="domino-spinner-wrapper">
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
        </div>

        <h3 className="parsing-title">Parsing Resume...</h3>
        
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

        {/* Progress Bar Container */}
        <div className="parsing-progress-track">
          <div
            className="parsing-progress-fill"
            style={{ width: `${currentStage.progress}%` }}
          />
        </div>

        {/* Dynamic Chunking Pipeline Stages */}
        <div className="parsing-stages-list">
          {PARSING_STAGES.map((stage, idx) => {
            const isDone = idx < currentStageIndex;
            const isCurrent = idx === currentStageIndex;

            return (
              <div
                key={stage.id}
                className={`parsing-stage-item ${isDone ? "is-done" : ""} ${isCurrent ? "is-current" : ""}`}
              >
                <div className="parsing-stage-icon">
                  {isDone ? (
                    <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="#22c55e" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
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
