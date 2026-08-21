import { useState, useEffect } from "react";
import "../css/ParsingLoader.css";

const STEPS = [
  "Extracting text & formatting...",
  "Analyzing sections with AI...",
  "Building ATS-optimized layout..."
];

export default function ParsingLoader({ filename }) {
  const [stepIndex, setStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex((prev) => (prev + 1) % STEPS.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="parsing-loader-overlay">
      <div className="parsing-loader-content">
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
        <p className="parsing-subtitle">
          {filename ? `"${filename}"` : STEPS[stepIndex]}
        </p>
      </div>
    </div>
  );
}
