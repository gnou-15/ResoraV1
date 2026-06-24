import React, { useState, useRef, useEffect } from "react";

export default function InteractiveAuthPattern() {
  const containerRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [spotlight, setSpotlight] = useState({ x: 50, y: 50, active: false });
  const [ripples, setRipples] = useState([]);
  const [hoveredTile, setHoveredTile] = useState(null);

  // Proximity lighting for the bottom-right pegboard
  const [mouseGridPos, setMouseGridPos] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Spotlight percentages
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    setSpotlight({ x: pctX, y: pctY, active: true });

    // 3D Parallax Tilt (max 8 degrees tilt)
    const tiltX = ((y / rect.height) - 0.5) * -16;
    const tiltY = ((x / rect.width) - 0.5) * 16;
    setTilt({ x: tiltX, y: tiltY });

    // Track position relative to the bottom right pegboard (tile 9)
    // Pegboard is roughly at bottom-right of the canvas
    setMouseGridPos({ x, y });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
    setSpotlight((prev) => ({ ...prev, active: false }));
    setHoveredTile(null);
  };

  // Click handler to trigger concentric ripples anywhere or inside a specific tile
  const handlePanelClick = (e) => {
    const container = containerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const id = Date.now();
    setRipples((prev) => [...prev, { id, x, y }]);
  };

  // Clean up old ripples
  useEffect(() => {
    if (ripples.length > 0) {
      const timer = setTimeout(() => {
        setRipples((prev) => prev.slice(1));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [ripples]);

  // Render 9 grids with individual SVGs
  return (
    <div
      className="auth-pattern-wrapper"
      style={{ perspective: "1000px" }}
    >
      <div
        ref={containerRef}
        className="auth-pattern-container"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handlePanelClick}
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease-out, box-shadow 0.15s ease-out",
        }}
      >
        {/* Spotlight cursor glow overlay - Warm Orange Glow */}
        {spotlight.active && (
          <div
            className="auth-spotlight-glow"
            style={{
              background: `radial-gradient(circle 350px at ${spotlight.x}% ${spotlight.y}%, rgba(249, 115, 22, 0.18) 0%, rgba(251, 146, 60, 0.08) 50%, rgba(0, 0, 0, 0) 100%)`,
            }}
          />
        )}

        {/* Floating background dust/particles */}
        <div className="auth-dust-container">
          <div className="auth-dust dust-1"></div>
          <div className="auth-dust dust-2"></div>
          <div className="auth-dust dust-3"></div>
        </div>

        {/* Dynamic click ripples */}
        {ripples.map((ripple) => (
          <span
            key={ripple.id}
            className="auth-click-ripple"
            style={{
              left: `${ripple.x}px`,
              top: `${ripple.y}px`,
            }}
          />
        ))}

        <div className="auth-pattern-grid">
          {/* TILE 1: Orange/Yellow Petals (Top Left) */}
          <div
            className={`auth-tile tile-1 ${hoveredTile === 1 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(1)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <defs>
                <linearGradient id="petalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#fed7aa" />
                  <stop offset="100%" stopColor="#ea580c" />
                </linearGradient>
              </defs>
              <g className="petal-group">
                {/* Left Leaf/Petal */}
                <path
                  d="M 80,140 C 25,140 25,60 80,20 C 80,60 80,140 80,140 Z"
                  fill="url(#petalGrad)"
                  className="petal-left"
                />
                {/* Right Leaf/Petal */}
                <path
                  d="M 80,140 C 135,140 135,60 80,20 C 80,60 80,140 80,140 Z"
                  fill="#f97316"
                  fillOpacity="0.85"
                  className="petal-right"
                />
              </g>
            </svg>
          </div>

          {/* TILE 2: Navy Background with Diamonds & Piano Lines (Top Middle) */}
          <div
            className={`auth-tile tile-2 ${hoveredTile === 2 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(2)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Dot Grid background */}
              <pattern id="tinyDots" x="0" y="0" width="12" height="12" patternUnits="userSpaceOnUse">
                <circle cx="3" cy="3" r="1.2" fill="#1e293b" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#tinyDots)" />

              {/* Diagonal Diamond Tracks & Diamonds */}
              <g className="diamond-track-group">
                <line x1="20" y1="30" x2="140" y2="30" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
                <line x1="20" y1="50" x2="140" y2="50" stroke="#1e293b" strokeWidth="2" strokeDasharray="3 3" />
                
                {/* Diamonds */}
                <polygon
                  points="65,30 75,20 85,30 75,40"
                  fill="#eab308"
                  className="tile-diamond diamond-1"
                />
                <polygon
                  points="85,30 95,20 105,30 95,40"
                  fill="#ea580c"
                  className="tile-diamond diamond-2"
                />
              </g>

              {/* Piano key style bars */}
              <g className="piano-key-bars">
                {Array.from({ length: 14 }).map((_, i) => {
                  const x = 32 + i * 7;
                  return (
                    <rect
                      key={i}
                      x={x}
                      y="78"
                      width="4.5"
                      height="20"
                      rx="1"
                      fill="#f59e0b"
                      className="piano-bar"
                      style={{ animationDelay: `${i * 0.08}s` }}
                    />
                  );
                })}
              </g>

              {/* Base Line */}
              <rect x="25" y="104" width="110" height="3" rx="1" fill="#c2410c" />
            </svg>
          </div>

          {/* TILE 3: 3D Isometric Cubes (Top Right) */}
          <div
            className={`auth-tile tile-3 ${hoveredTile === 3 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(3)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%" className="cube-svg">
              <g className="iso-cubes-group" transform="translate(10, 10)">
                {/* Cube 1 (Center-Back) */}
                <g className="iso-cube cube-back" transform="translate(60, 40)">
                  {/* Top Face */}
                  <polygon points="0,-20 34.6,-40 0,-60 -34.6,-40" fill="#fed7aa" />
                  {/* Left Face */}
                  <polygon points="-34.6,-40 0,-20 0,20 -34.6,0" fill="#f97316" />
                  {/* Right Face */}
                  <polygon points="0,-20 34.6,-40 34.6,0 0,20" fill="#ea580c" />
                </g>

                {/* Cube 2 (Left-Front) */}
                <g className="iso-cube cube-left" transform="translate(25, 90)">
                  <polygon points="0,-20 34.6,-40 0,-60 -34.6,-40" fill="#ffedd5" />
                  <polygon points="-34.6,-40 0,-20 0,20 -34.6,0" fill="#fdba74" />
                  <polygon points="0,-20 34.6,-40 34.6,0 0,20" fill="#f97316" />
                </g>

                {/* Cube 3 (Right-Front) */}
                <g className="iso-cube cube-right" transform="translate(95, 90)">
                  <polygon points="0,-20 34.6,-40 0,-60 -34.6,-40" fill="#ffedd5" />
                  <polygon points="-34.6,-40 0,-20 0,20 -34.6,0" fill="#f97316" />
                  <polygon points="0,-20 34.6,-40 34.6,0 0,20" fill="#ea580c" />
                </g>
              </g>
            </svg>
          </div>

          {/* TILE 4: Triple Chevron/Triangles (Middle Left) */}
          <div
            className={`auth-tile tile-4 ${hoveredTile === 4 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(4)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <g className="chevron-group" transform="translate(30, 20)">
                <polygon points="50,20 15,55 85,55" fill="#f97316" fillOpacity="0.3" className="chevron chev-1" />
                <polygon points="50,45 20,75 80,75" fill="#f97316" fillOpacity="0.6" className="chevron chev-2" />
                <polygon points="50,70 25,95 75,95" fill="#f97316" className="chevron chev-3" />
              </g>
            </svg>
          </div>

          {/* TILE 5: Spinning Yellow Starburst & Floral Leaf (Middle Center) */}
          <div
            className={`auth-tile tile-5 ${hoveredTile === 5 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(5)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Vertical floral/geometric leaf pattern */}
              <g className="leaf-branch" transform="translate(80, 45)" fill="#475569">
                <path d="M0,0 C10,-10 10,-30 0,-40 C-10,-30 -10,-10 0,0 Z" fill="#ea580c" fillOpacity="0.5" />
                <path d="M0,-30 C12,-38 8,-50 0,-60 C-8,-50 -12,-38 0,-30 Z" fill="#f97316" fillOpacity="0.3" />
                {/* Sparkling diamond */}
                <polygon points="0,-72 8,-80 0,-88 -8,-80" fill="#ffffff" className="sparkle-star" />
              </g>

              {/* Decorative brackets */}
              <g stroke="#334155" strokeWidth="3" fill="none" strokeLinecap="round">
                <path d="M125,40 C132,55 132,75 125,90" />
                <path d="M135,40 C142,55 142,75 135,90" strokeDasharray="3 3" />
              </g>

              {/* Starburst yellow shape */}
              <g className="starburst-group" transform="translate(45, 85)">
                {/* 10-pointed star */}
                <path
                  d="M 0,-25 L 7,-8 L 24,-8 L 11,4 L 15,21 L 0,11 L -15,21 L -11,4 L -24,-8 L -7,-8 Z"
                  fill="#eab308"
                  className="yellow-star"
                />
              </g>
            </svg>
          </div>

          {/* TILE 6: Dandelion Line Starburst (Middle Right) */}
          <div
            className={`auth-tile tile-6 ${hoveredTile === 6 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(6)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Background abstract circles */}
              <circle cx="130" cy="80" r="60" fill="none" stroke="#1e293b" strokeWidth="1" />
              <circle cx="130" cy="80" r="45" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />

              <g className="dandelion-group" transform="translate(60, 90)">
                <circle cx="0" cy="0" r="3" fill="#f97316" />
                {/* Radial flower stems */}
                {Array.from({ length: 12 }).map((_, i) => {
                  const angle = (i * 360) / 12;
                  return (
                    <g key={i} transform={`rotate(${angle})`}>
                      <line x1="0" y1="0" x2="0" y2="-32" stroke="#fdba74" strokeWidth="1.2" className="dandelion-stem" />
                      <circle cx="0" cy="-32" r="3" fill="#ea580c" className="dandelion-bulb" />
                    </g>
                  );
                })}
              </g>
            </svg>
          </div>

          {/* TILE 7: Bottom Left Concentric Rippling Circles */}
          <div
            className={`auth-tile tile-7 ${hoveredTile === 7 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(7)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Concentric rings in bottom left corner */}
              <g className="concentric-rings" transform="translate(30, 130)">
                <circle cx="0" cy="0" r="110" fill="none" stroke="#ea580c" strokeWidth="2.5" strokeOpacity="0.15" />
                <circle cx="0" cy="0" r="85" fill="none" stroke="#ea580c" strokeWidth="2" strokeOpacity="0.25" />
                <circle cx="0" cy="0" r="60" fill="none" stroke="#f97316" strokeWidth="1.8" strokeOpacity="0.45" />
                <circle cx="0" cy="0" r="35" fill="none" stroke="#fdba74" strokeWidth="1.5" strokeOpacity="0.7" />
                <circle cx="0" cy="0" r="15" fill="none" stroke="#fed7aa" strokeWidth="1.2" />
                <circle cx="0" cy="0" r="4" fill="#fed7aa" />
              </g>
            </svg>
          </div>

          {/* TILE 8: Liquid Waves and Floating Bead (Bottom Middle) */}
          <div
            className={`auth-tile tile-8 ${hoveredTile === 8 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(8)}
            onMouseLeave={() => setHoveredTile(null)}
          >
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              {/* Waves */}
              <g className="wave-tracks" stroke="#ea580c" fill="none" strokeLinecap="round">
                {/* Wave 1 */}
                <path
                  d="M 15,70 Q 35,55 55,70 T 95,70 T 135,70 T 155,70"
                  strokeWidth="2.5"
                  className="wave-line wave-1"
                />
                {/* Wave 2 */}
                <path
                  d="M 15,85 Q 35,70 55,85 T 95,85 T 135,85 T 155,85"
                  strokeWidth="2"
                  strokeOpacity="0.6"
                  className="wave-line wave-2"
                />
                {/* Wave 3 */}
                <path
                  d="M 15,100 Q 35,85 55,100 T 95,100 T 135,100 T 155,100"
                  strokeWidth="1.5"
                  strokeOpacity="0.3"
                  className="wave-line wave-3"
                />
              </g>

              {/* Wave beads / bubbles */}
              <circle cx="45" cy="65" r="4.5" fill="#f59e0b" className="wave-bead-1" />
              <circle cx="105" cy="80" r="3.5" fill="#ffffff" className="wave-bead-2" />
            </svg>
          </div>

          {/* TILE 9: Warm Orange Semicircle Grid (Bottom Right) */}
          <div
            className={`auth-tile tile-9 ${hoveredTile === 9 ? "hovered" : ""}`}
            onMouseEnter={() => setHoveredTile(9)}
            onMouseLeave={() => setHoveredTile(null)}
            style={{ position: "relative" }}
          >
            {/* Base SVG with giant semicircle and grid of dots */}
            <svg viewBox="0 0 160 160" width="100%" height="100%">
              <defs>
                <linearGradient id="warmGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="#c2410c" />
                </linearGradient>
              </defs>
              {/* Semi-circle shape */}
              <path d="M 0,0 C 90,0 160,70 160,160 L 0,160 Z" fill="url(#warmGrad)" fillOpacity="0.85" />
              
              {/* Pegboard layout - standard dot matrices */}
              <g className="pegboard-dots">
                {Array.from({ length: 6 }).map((_, row) =>
                  Array.from({ length: 6 }).map((_, col) => {
                    const cx = 110 + col * 8;
                    const cy = 110 + row * 8;
                    
                    // Proximity simulation glow
                    return (
                      <circle
                        key={`${row}-${col}`}
                        cx={cx}
                        cy={cy}
                        r="2.2"
                        className="pegboard-dot"
                        fill="#ffffff"
                        style={{
                          animationDelay: `${(row + col) * 0.1}s`,
                          opacity: hoveredTile === 9 ? 0.95 : 0.4,
                          transform: hoveredTile === 9 ? "scale(1.3)" : "scale(1)",
                          transition: "opacity 0.2s ease, transform 0.2s ease",
                        }}
                      />
                    );
                  })
                )}
              </g>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
