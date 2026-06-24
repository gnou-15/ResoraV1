import React, { useState, useEffect, useRef } from "react";

export default function PeekingMonster({ mood = "normal", isPremium = false }) {
  const [offsets, setOffsets] = useState({
    pupilX: 0,
    pupilY: 0,
    faceX: 0,
    faceY: 0,
    hatX: 0,
    hatY: 0,
    hatRot: 0
  });
  const containerRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dx = e.clientX - centerX;
      const dy = e.clientY - centerY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const angle = Math.atan2(dy, dx);

      // 1. Pupils offset (movement within eye socket)
      const maxPupilDist = 3.5;
      const pupilDist = Math.min(dist / 24, maxPupilDist);
      const pupilX = Math.cos(angle) * pupilDist;
      const pupilY = Math.sin(angle) * pupilDist;

      // 2. Face translation (3D Parallax offset on body)
      const maxFaceDist = 6; 
      const faceDist = Math.min(dist / 32, maxFaceDist);
      const faceX = Math.cos(angle) * faceDist;
      const faceY = Math.sin(angle) * faceDist;

      // 3. Hat offset (moves slightly more for depth layering)
      const maxHatDist = 8;
      const hatDist = Math.min(dist / 26, maxHatDist);
      const hatX = Math.cos(angle) * hatDist;
      const hatY = Math.sin(angle) * hatDist;
      
      // Hat tilt rotation towards cursor direction (max tilt around 15deg)
      const screenFraction = dx / (window.innerWidth / 2);
      const hatRot = screenFraction * 14;

      setOffsets({
        pupilX,
        pupilY,
        faceX,
        faceY,
        hatX,
        hatY,
        hatRot,
      });
    };

    const handleMouseLeave = () => {
      setOffsets({
        pupilX: 0,
        pupilY: 0,
        faceX: 0,
        faceY: 0,
        hatX: 0,
        hatY: 0,
        hatRot: 0,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div className="dapper-mascot-container" ref={containerRef}>
      <svg 
        width="90" 
        height="105" 
        viewBox="0 -15 90 105" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className={mood === "frantic" ? "frantic-mascot" : ""}
        style={{ overflow: "visible" }}
      >
        <defs>
          {/* Slate gradient for body */}
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#475569" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
          {/* Dark gradient for hat */}
          <linearGradient id="hatGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#0f172a" />
          </linearGradient>
          {/* Gold gradient for crown */}
          <linearGradient id="goldCrownGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ca8a04" />
            <stop offset="15%" stopColor="#eab308" />
            <stop offset="30%" stopColor="#fef9c3" />
            <stop offset="45%" stopColor="#ffffff" />
            <stop offset="60%" stopColor="#fef9c3" />
            <stop offset="75%" stopColor="#eab308" />
            <stop offset="90%" stopColor="#ca8a04" />
            <stop offset="100%" stopColor="#854d0e" />
          </linearGradient>
          {/* Gold Glow Filter */}
          <filter id="goldGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="1.2" stdDeviation="1.2" floodColor="#eab308" floodOpacity="0.8" />
          </filter>
        </defs>

        {/* 1. Stationary Body Silhouette (Face features slide on top) */}
        <circle cx="45" cy="56" r="23" fill="url(#bodyGrad)" />

        {/* 2. Group the Top Hat for 3D translation & rotation */}
        <g className="dapper-top-hat" style={{ 
          transform: `translate(${offsets.hatX}px, ${offsets.hatY + (mood === "excited" ? -4 : 0)}px) rotate(${offsets.hatRot + (mood === "excited" ? 8 : 0)}deg)`,
          transformOrigin: "45px 30px",
          transition: "transform 0.08s ease-out"
        }}>
          {/* Hat Crown */}
          <rect x="30" y="3" width="30" height="24" rx="2" fill="url(#hatGrad)" />
          
          {/* Premium Gold Crown (Brook/One Piece style) */}
          {isPremium && (
            <g className="premium-hat-crown" filter="url(#goldGlow)">
              <path 
                d="M 34 3 L 32 -8 L 39 -2 L 45 -12 L 51 -2 L 58 -8 L 56 3 Z" 
                fill="url(#goldCrownGrad)" 
                stroke="#92400e" 
                strokeWidth="0.8" 
                strokeLinejoin="round" 
              />
              {/* Peak Tip Circles */}
              <circle cx="32" cy="-8" r="1.4" fill="url(#goldCrownGrad)" stroke="#92400e" strokeWidth="0.5" />
              <circle cx="45" cy="-12" r="1.6" fill="url(#goldCrownGrad)" stroke="#92400e" strokeWidth="0.5" />
              <circle cx="58" cy="-8" r="1.4" fill="url(#goldCrownGrad)" stroke="#92400e" strokeWidth="0.5" />
              {/* Base Gems/Studs */}
              <circle cx="39" cy="0" r="1" fill="#ffffff" stroke="#92400e" strokeWidth="0.4" />
              <circle cx="45" cy="0" r="1" fill="#ffffff" stroke="#92400e" strokeWidth="0.4" />
              <circle cx="51" cy="0" r="1" fill="#ffffff" stroke="#92400e" strokeWidth="0.4" />
            </g>
          )}

          {/* Ribbon (Brand Orange) */}
          <rect x="30" y="26" width="30" height="4" fill="#ea580c" />
          {/* Hat Brim (overlaps head at y=33 to prevent gap) */}
          <rect x="22" y="30" width="46" height="4" rx="2" fill="url(#hatGrad)" />
        </g>

        {/* 3. Moving Face Features (3D Parallax look-around effect) */}
        <g className="dapper-face" style={{ 
          transform: `translate(${offsets.faceX}px, ${offsets.faceY}px)`,
          transition: "transform 0.08s ease-out"
        }}>
          {/* Left Eye */}
          <circle cx="36" cy="52" r="5" fill="#ffffff" />
          <circle cx={36 + offsets.pupilX} cy={52 + offsets.pupilY} r={mood === "excited" ? 3.4 : mood === "frantic" ? 1.2 : 2.2} fill="#0f172a" />
          {mood === "excited" && <circle cx={36 + offsets.pupilX - 0.8} cy={52 + offsets.pupilY - 0.8} r="0.9" fill="#ffffff" />}

          {/* Right Eye */}
          <circle cx="54" cy="52" r="5" fill="#ffffff" />
          <circle cx={54 + offsets.pupilX} cy={52 + offsets.pupilY} r={mood === "excited" ? 3.4 : mood === "frantic" ? 1.2 : 2.2} fill="#0f172a" />
          {mood === "excited" && <circle cx={54 + offsets.pupilX - 0.8} cy={52 + offsets.pupilY - 0.8} r="0.9" fill="#ffffff" />}

          {/* Golden Monocle */}
          <circle cx="54" cy="52" r="8" stroke="#f59e0b" strokeWidth="1.8" fill="none" />
          {/* Monocle chain */}
          <path d="M61 55 C65 62 62 68 57 73" stroke="#f59e0b" strokeWidth="1.2" strokeLinecap="round" strokeDasharray="2.5 1.5" />

          {/* Bushy Mustache */}
          <path 
            className="dapper-mustache"
            d="M 45 61 
               C 36 57, 22 61, 16 68 
               C 22 68, 36 66, 45 63 
               C 54 66, 68 68, 74 68 
               C 68 61, 54 57, 45 61 Z" 
            fill="#ffffff" 
          />
        </g>

        {/* Excited sparkles */}
        {mood === "excited" && (
          <g>
            {/* Sparkle Left */}
            <path className="excited-sparkle" d="M 15 15 L 17 19 L 21 20 L 17 21 L 15 25 L 13 21 L 9 20 L 13 19 Z" fill="#f59e0b" style={{ animationDelay: "0s" }} />
            {/* Sparkle Right */}
            <path className="excited-sparkle" d="M 75 15 L 77 19 L 81 20 L 77 21 L 75 25 L 73 21 L 69 20 L 73 19 Z" fill="#eab308" style={{ animationDelay: "0.2s" }} />
            {/* Sparkle Top */}
            <path className="excited-sparkle" d="M 45 5 L 47 9 L 51 10 L 47 11 L 45 15 L 43 11 L 39 10 L 43 9 Z" fill="#ea580c" style={{ animationDelay: "0.4s" }} />
          </g>
        )}

        {/* Frantic Sweat Drops */}
        {mood === "frantic" && (
          <g>
            {/* Sweat Drop Left */}
            <path className="frantic-sweat-left" d="M 25 45 C 23 48 21 50 21 52 C 21 54 23 56 25 56 C 27 56 29 54 29 52 C 29 50 27 48 25 45 Z" fill="#38bdf8" />
            {/* Sweat Drop Right */}
            <path className="frantic-sweat-right" d="M 65 45 C 63 48 61 50 61 52 C 61 54 63 56 65 56 C 67 56 69 54 69 52 C 69 50 67 48 65 45 Z" fill="#38bdf8" />
          </g>
        )}
      </svg>
    </div>
  );
}
