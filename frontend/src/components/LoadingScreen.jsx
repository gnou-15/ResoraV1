import React, { useEffect } from "react";

export default function LoadingScreen({ onComplete }) {
  useEffect(() => {
    const timer = setTimeout(onComplete, 1000); // Quick 1-second transition
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="loader-container">
      <div className="circle-wave-wrapper">
        <span className="dot dot-orange"></span>
        <span className="dot dot-slate"></span>
        <span className="dot dot-light"></span>
        <span className="dot dot-gold"></span>
      </div>
    </div>
  );
}
