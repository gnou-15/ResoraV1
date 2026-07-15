import React from "react";
import "../css/AuthTransitionBuffer.css";

export default function AuthTransitionBuffer({ active, message }) {
  return (
    <div className={`auth-transition-overlay ${active ? "active" : ""}`}>
      <div className="auth-transition-box">
        {/* Animated mascot logo in SVGator style */}
        <svg
          className="mascot-transition-svg"
          viewBox="0 0 100 100"
          width="180"
          height="180"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mascotBodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
          </defs>
          
          {/* Mascot Head Body */}
          <circle cx="50" cy="58" r="18" fill="url(#mascotBodyGrad)" />
          
          {/* Mascot Eyes */}
          <circle cx="43" cy="54" r="4" fill="#ffffff" className="mascot-eye-blink" />
          <circle cx="43" cy="54" r="2" fill="#0f172a" />
          <circle cx="57" cy="54" r="4" fill="#ffffff" className="mascot-eye-blink" />
          <circle cx="57" cy="54" r="2" fill="#0f172a" />
          
          {/* Monocle (Gold frame and dashed string) */}
          <circle cx="57" cy="54" r="6.5" stroke="#f59e0b" strokeWidth="1.5" fill="none" className="mascot-monocle-shimmer" />
          <path d="M63 59 C67 64 65 68 62 72" stroke="#f59e0b" strokeWidth="1" strokeDasharray="2 1.5" fill="none" />
          
          {/* Mascot Mustache */}
          <path
            className="mascot-mustache-twitch"
            d="M 50 63 C 43 58, 32 63, 28 70 C 32 70, 42 67, 50 65 C 58 67, 68 70, 72 70 C 68 63, 57 58, 50 63 Z"
            fill="#ffffff"
          />
          
          {/* Mascot Top Hat (Brim, Ribbon, Crown) */}
          <g className="mascot-hat-group">
            {/* Crown */}
            <rect x="36" y="16" width="28" height="15" rx="2" fill="#1e293b" />
            {/* Ribbon */}
            <rect x="36" y="29" width="28" height="3" fill="#ea580c" />
            {/* Brim */}
            <rect x="28" y="31" width="44" height="4" rx="1.5" fill="#1e293b" />
          </g>

          {/* Dapper Gloved Hands (Left waves, Right tips hat) */}
          
          {/* Left Waving Hand */}
          <g className="mascot-hand-left">
            {/* Glove Cuff */}
            <path d="M22 66 C20 66 19 68 19 70 C19 72 20 74 22 74 Z" fill="#ffffff" opacity="0.9" />
            {/* Gloved Hand & Fingers */}
            <path d="M19 70 C14 69 11 65 11 61 C11 59 13 58 14 59 C15 60 16 62 17 64 C16 61 17 59 18 59 C19 59 20 61 20 63 C20 60 22 59 23 59 C24 59 25 61 25 64 C25 61 27 61 28 62 C29 63 29 65 28 67 Z" fill="#ffffff" />
          </g>
          
          {/* Right Tipping Hand */}
          <g className="mascot-hand-right">
            {/* Glove Cuff */}
            <path d="M78 66 C80 66 81 68 81 70 C81 72 80 74 78 74 Z" fill="#ffffff" opacity="0.9" />
            {/* Gloved Hand */}
            <path d="M78 70 C83 69 86 65 86 61 C86 59 84 58 83 59 C82 60 81 62 80 64 C81 61 80 59 79 59 C78 59 77 61 77 63 C77 60 75 59 74 59 C73 59 72 61 72 64 C72 61 70 61 69 62 C68 63 68 65 69 67 Z" fill="#ffffff" />
          </g>
        </svg>
        <p className="auth-transition-text">{message || "Preparing your space..."}</p>
      </div>
    </div>
  );
}
