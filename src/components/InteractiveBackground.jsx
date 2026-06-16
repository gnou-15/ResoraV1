import React, { useEffect, useRef } from "react";

export default function InteractiveBackground() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    let animationFrameId;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // Track mouse position
    const mouse = {
      x: null,
      y: null,
      radius: 140, // Interaction radius
    };

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("resize", handleResize);

    // Particle class representing "anti-gravity" floating elements
    class Particle {
      constructor() {
        this.reset();
        // Start randomly positioned across vertical viewport height
        this.y = Math.random() * height;
      }

      reset() {
        this.x = Math.random() * width;
        this.y = height + Math.random() * 80; // spawn below view
        this.size = Math.random() * 18 + 8; // size between 8px and 26px
        this.speedY = -(Math.random() * 0.5 + 0.15); // floating upwards speed
        this.speedX = Math.random() * 0.3 - 0.15; // slight horizontal drift
        
        // Pick between brand colors: orange (#f97316) and teal (#14b8a6)
        const isOrange = Math.random() > 0.4;
        this.color = isOrange ? "249, 115, 22" : "20, 184, 166";
        this.alpha = Math.random() * 0.04 + 0.03; // translucent (3% - 7% opacity)
        
        // Offset for wave floating motion
        this.angle = Math.random() * Math.PI * 2;
        this.angleSpeed = Math.random() * 0.02 - 0.01;
      }

      update() {
        // Move particle upward
        this.y += this.speedY;
        // Float horizontal wave movement
        this.angle += this.angleSpeed;
        this.x += this.speedX + Math.sin(this.angle) * 0.15;

        // Interaction: push away from mouse (repulsion / anti-gravity)
        if (mouse.x !== null && mouse.y !== null) {
          const dx = this.x - mouse.x;
          const dy = this.y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < mouse.radius) {
            // Force strength scales closer to the cursor
            const force = (mouse.radius - distance) / mouse.radius;
            // Push direction vectors
            const pushX = (dx / distance) * force * 2.5;
            const pushY = (dy / distance) * force * 2.5;

            this.x += pushX;
            this.y += pushY;
          }
        }

        // Reset if goes off-screen top or sides
        if (this.y < -this.size || this.x < -this.size || this.x > width + this.size) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        // Create radial gradient for a soft fuzzy glow look
        const grad = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, this.size
        );
        grad.addColorStop(0, `rgba(${this.color}, ${this.alpha * 1.6})`);
        grad.addColorStop(1, `rgba(${this.color}, 0)`);
        
        ctx.fillStyle = grad;
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Initialize particles
    const particleCount = Math.min(Math.floor(width / 35), 45); // screen width dependent count
    const particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle());
    }

    // Spotlight cursor effect
    let mouseGlowX = null;
    let mouseGlowY = null;

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      // Render a very soft interactive spotlight follow background
      if (mouse.x !== null && mouse.y !== null) {
        // Smooth transition follow mouse spotlight
        if (mouseGlowX === null) {
          mouseGlowX = mouse.x;
          mouseGlowY = mouse.y;
        } else {
          mouseGlowX += (mouse.x - mouseGlowX) * 0.08;
          mouseGlowY += (mouse.y - mouseGlowY) * 0.08;
        }

        const spotlightGrad = ctx.createRadialGradient(
          mouseGlowX, mouseGlowY, 0,
          mouseGlowX, mouseGlowY, 320
        );
        // Premium brand-orange glow, blending into background
        spotlightGrad.addColorStop(0, "rgba(251, 146, 60, 0.24)");
        spotlightGrad.addColorStop(0.4, "rgba(251, 146, 60, 0.08)");
        spotlightGrad.addColorStop(1, "rgba(251, 146, 60, 0)");

        ctx.fillStyle = spotlightGrad;
        ctx.beginPath();
        ctx.arc(mouseGlowX, mouseGlowY, 320, 0, Math.PI * 2);
        ctx.fill();
      }

      // Render and update floating elements
      particles.forEach((particle) => {
        particle.update();
        particle.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        zIndex: 0,
      }}
    />
  );
}
