import { useState, useEffect, useCallback, useRef } from "react";
import profilePhoto from "@/imports/profilePhoto.jpg";
function FlameCursor() {
  const dotEl   = useRef<HTMLDivElement>(null);
  const ringEl  = useRef<HTMLDivElement>(null);
  const trailEl = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "pf-cursor-hide";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    if (!document.getElementById("pf-cursor-hide")) document.head.appendChild(style);

    const TRAIL = 8;
    const trail: { x: number; y: number }[] = Array(TRAIL).fill({ x: -200, y: -200 });
    const mouse = { x: -200, y: -200 };
    const ring  = { x: -200, y: -200 };
    let clicking = false, onInteractive = false;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onDown = () => { clicking = true; };
    const onUp   = () => { clicking = false; };
    const onOver = (e: MouseEvent) => {
      onInteractive = !!(e.target as HTMLElement).closest("a,button,[role=button],input,textarea,label,select");
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        clicking = true;
      }
    };
    const onTouchEnd = () => { clicking = false; };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseover", onOver, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    let raf: number;
    const tick = () => {
      trail.unshift({ x: mouse.x, y: mouse.y });
      trail.length = TRAIL;
      ring.x = lerp(ring.x, mouse.x, 0.13);
      ring.y = lerp(ring.y, mouse.y, 0.13);
      const dot = dotEl.current, r = ringEl.current;
      if (dot) {
        const s = clicking ? 0.45 : onInteractive ? 1.5 : 1;
        dot.style.transform = `translate(${mouse.x - 4}px,${mouse.y - 4}px) scale(${s})`;
      }
      if (r) {
        const s = clicking ? 0.75 : onInteractive ? 1.6 : 1;
        r.style.transform   = `translate(${ring.x - 20}px,${ring.y - 20}px) scale(${s})`;
        r.style.borderColor = onInteractive ? "rgba(167,139,250,0.95)" : "rgba(99,102,241,0.55)";
        r.style.boxShadow   = onInteractive ? "0 0 18px rgba(167,139,250,0.35)" : "0 0 8px rgba(99,102,241,0.2)";
      }
      trailEl.current.forEach((el, i) => {
        if (!el) return;
        const t = trail[i] ?? trail[trail.length - 1];
        const alpha = (1 - i / TRAIL) * 0.45;
        const size  = (1 - i / TRAIL) * 5;
        el.style.transform = `translate(${t.x - size / 2}px,${t.y - size / 2}px)`;
        el.style.width = `${size}px`; el.style.height = `${size}px`;
        el.style.opacity = String(alpha);
      });
      raf = requestAnimationFrame(tick);
    };
    tick();

    return () => {
      cancelAnimationFrame(raf);
      document.getElementById("pf-cursor-hide")?.remove();
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup",   onUp);
      window.removeEventListener("mouseover", onOver);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <>
      <div ref={dotEl} style={{ position: "fixed", top: 0, left: 0, zIndex: 999999, width: 8, height: 8, borderRadius: "50%", background: "rgba(224,220,255,1)", boxShadow: "0 0 10px rgba(99,102,241,1), 0 0 24px rgba(99,102,241,0.5)", pointerEvents: "none", transition: "transform 0.07s ease", willChange: "transform" }} />
      <div ref={ringEl} style={{ position: "fixed", top: 0, left: 0, zIndex: 999998, width: 40, height: 40, borderRadius: "50%", border: "1.5px solid rgba(99,102,241,0.55)", pointerEvents: "none", transition: "transform 0.1s ease, border-color 0.2s, box-shadow 0.2s", willChange: "transform" }} />
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} ref={el => { if (el) trailEl.current[i] = el; }} style={{ position: "fixed", top: 0, left: 0, zIndex: 999997, borderRadius: "50%", background: "rgba(129,140,248,1)", pointerEvents: "none", willChange: "transform" }} />
      ))}
    </>
  );
}

// ─── Solar System + Interactive Black Hole Background ─────────────────────────

function SolarSystemBlackHoleBackground({ done }: { done: boolean }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;

    let W = (canvas.width = window.innerWidth);
    let H = (canvas.height = window.innerHeight);

    const onResize = () => {
      W = canvas.width = window.innerWidth;
      H = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", onResize, { passive: true });

    // Mouse & Touch & Black hole state
    const mouse = { x: W / 2, y: H / 2, active: false };
    const blackHole = { x: W / 2, y: H / 2, radius: 0, targetRadius: 0 };
    let lastMouseX = mouse.x, lastMouseY = mouse.y;

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mouse.x = e.touches[0].clientX;
        mouse.y = e.touches[0].clientY;
        mouse.active = true;
      }
    };
    const onTouchEnd = () => {
      mouse.active = false;
    };

    window.addEventListener("mousemove", onMouseMove, { passive: true });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });

    // Background Stars (Cosmic field)
    type Star = { x: number; y: number; size: number; alpha: number; speed: number; color: string };
    const starColors = ["#ffffff", "#e0e7ff", "#fef08a", "#bae6fd"];
    const stars: Star[] = Array.from({ length: 220 }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      size: Math.random() * 1.6 + 0.3,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.006 + 0.002,
      color: starColors[Math.floor(Math.random() * starColors.length)],
    }));

    // Realistic Solar System Planets Data
    interface PlanetData {
      name: string;
      color: string;
      glowColor: string;
      orbitRx: number;
      orbitRy: number;
      size: number;
      speed: number;
      angle: number;
      x: number;
      y: number;
      vx: number;
      vy: number;
      hasRing?: boolean;
      hasMoon?: boolean;
      moonAngle?: number;
      absorbed: boolean;
      respawnTimer: number;
      stretch: number;
      stretchAngle: number;
      trail: { x: number; y: number }[];
    }

    const planets: PlanetData[] = [
      { name: "Mercury", color: "#a39e93", glowColor: "#d1c7b7", orbitRx: 140, orbitRy: 95, size: 5, speed: 0.022, angle: 0.5, x: 0, y: 0, vx: 0, vy: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Venus", color: "#eab308", glowColor: "#fde047", orbitRx: 220, orbitRy: 150, size: 8, speed: 0.016, angle: 1.8, x: 0, y: 0, vx: 0, vy: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Earth", color: "#2563eb", glowColor: "#60a5fa", orbitRx: 320, orbitRy: 220, size: 9.5, speed: 0.012, angle: 3.2, x: 0, y: 0, vx: 0, vy: 0, hasMoon: true, moonAngle: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Mars", color: "#dc2626", glowColor: "#f87171", orbitRx: 420, orbitRy: 290, size: 7, speed: 0.009, angle: 4.5, x: 0, y: 0, vx: 0, vy: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Jupiter", color: "#d97706", glowColor: "#fbbf24", orbitRx: 540, orbitRy: 370, size: 18, speed: 0.006, angle: 0.9, x: 0, y: 0, vx: 0, vy: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Saturn", color: "#ca8a04", glowColor: "#fef08a", orbitRx: 670, orbitRy: 460, size: 15, speed: 0.0045, angle: 2.4, x: 0, y: 0, vx: 0, vy: 0, hasRing: true, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Uranus", color: "#0891b2", glowColor: "#67e8f9", orbitRx: 800, orbitRy: 550, size: 11, speed: 0.003, angle: 3.9, x: 0, y: 0, vx: 0, vy: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
      { name: "Neptune", color: "#1d4ed8", glowColor: "#93c5fd", orbitRx: 930, orbitRy: 640, size: 10.5, speed: 0.002, angle: 5.3, x: 0, y: 0, vx: 0, vy: 0, absorbed: false, respawnTimer: 0, stretch: 1, stretchAngle: 0, trail: [] },
    ];

    // Accretion disk particles
    type DiskParticle = { angle: number; dist: number; speed: number; size: number; hue: number };
    const diskParticles: DiskParticle[] = Array.from({ length: 160 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: 25 + Math.random() * 95,
      speed: 0.025 + Math.random() * 0.035,
      size: 0.8 + Math.random() * 2.2,
      hue: 240 + Math.random() * 90,
    }));

    // Solar flare particle streams
    type SolarParticle = { angle: number; speed: number; dist: number; maxDist: number; size: number; alpha: number };
    const solarParticles: SolarParticle[] = Array.from({ length: 45 }, () => ({
      angle: Math.random() * Math.PI * 2,
      speed: Math.random() * 0.8 + 0.3,
      dist: 55 + Math.random() * 20,
      maxDist: 85 + Math.random() * 40,
      size: Math.random() * 2.5 + 1,
      alpha: Math.random() * 0.7 + 0.3,
    }));

    // Swallow explosion particles
    type SwallowParticle = { x: number; y: number; vx: number; vy: number; color: string; life: number; size: number };
    let swallowParticles: SwallowParticle[] = [];

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    let time = 0;
    let raf: number;

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, W, H);

      // Responsive scale factor for mobile screens
      const mobileScale = Math.min(1, Math.max(0.45, W / 1100));

      // ── SUN POSITION: RIGHT TOP CORNER ──
      const sunX = W * 0.86;
      const sunY = Math.max(70, H * 0.15);
      const sunRadius = 65 * mobileScale;

      // ── 1. Cosmic Deep Space Background & Stars ──
      const bgGrad = ctx.createRadialGradient(sunX, sunY, 100, W / 2, H / 2, Math.max(W, H) * 1.2);
      bgGrad.addColorStop(0, "#09081a");
      bgGrad.addColorStop(0.4, "#04040e");
      bgGrad.addColorStop(1, "#020206");
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, W, H);

      // Deep space nebula clouds
      const nebula1 = ctx.createRadialGradient(W * 0.2, H * 0.8, 50, W * 0.2, H * 0.8, 400);
      nebula1.addColorStop(0, "rgba(88, 28, 135, 0.12)");
      nebula1.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = nebula1;
      ctx.fillRect(0, 0, W, H);

      // Twinkling stars
      stars.forEach((s) => {
        s.alpha += Math.sin(time * 5 * s.speed + s.x) * 0.008;
        const curAlpha = Math.max(0.1, Math.min(0.95, s.alpha));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
        ctx.fillStyle = s.color;
        ctx.globalAlpha = curAlpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      });

      // ── 2. Update Black Hole State ──
      const mouseDistMoved = Math.hypot(mouse.x - lastMouseX, mouse.y - lastMouseY);
      if (mouse.active && mouseDistMoved > 0.2) {
        blackHole.targetRadius = Math.min(blackHole.targetRadius + 2.8, 70 * mobileScale);
      } else {
        blackHole.targetRadius = Math.max(blackHole.targetRadius - 0.7, mouse.active ? 38 * mobileScale : 0);
      }
      lastMouseX = mouse.x;
      lastMouseY = mouse.y;

      blackHole.x = lerp(blackHole.x, mouse.x, 0.16);
      blackHole.y = lerp(blackHole.y, mouse.y, 0.16);
      blackHole.radius = lerp(blackHole.radius, blackHole.targetRadius, 0.12);

      const bhX = blackHole.x;
      const bhY = blackHole.y;
      const bhR = blackHole.radius;

      // ── 3. Orbit Path Ellipses Centered at Top-Right Sun ──
      const tiltAngle = -0.15; // Ellipse orbital tilt angle
      planets.forEach((p) => {
        const rx = p.orbitRx * mobileScale;
        const ry = p.orbitRy * mobileScale;
        ctx.save();
        ctx.translate(sunX, sunY);
        ctx.rotate(tiltAngle);
        ctx.beginPath();
        ctx.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.05)";
        ctx.lineWidth = 1;
        ctx.setLineDash([4, 6]);
        ctx.stroke();
        ctx.restore();
      });

      // ── 4. Render Sun in Top Right Corner (Ultra-Realistic) ──
      // Dynamic Sun Corona Glow
      const coronaGrad = ctx.createRadialGradient(sunX, sunY, sunRadius * 0.7, sunX, sunY, sunRadius * 3.5);
      coronaGrad.addColorStop(0, "rgba(255, 240, 160, 0.95)");
      coronaGrad.addColorStop(0.25, "rgba(245, 158, 11, 0.6)");
      coronaGrad.addColorStop(0.65, "rgba(239, 68, 68, 0.25)");
      coronaGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius * 3.5, 0, Math.PI * 2);
      ctx.fillStyle = coronaGrad;
      ctx.fill();

      // Solar flares / prominences
      solarParticles.forEach((sp) => {
        sp.dist += sp.speed;
        const maxD = sp.maxDist * mobileScale;
        const minD = sunRadius * 0.8;
        if (sp.dist > maxD) {
          sp.dist = minD;
          sp.angle = Math.random() * Math.PI * 2;
        }
        const px = sunX + Math.cos(sp.angle) * sp.dist;
        const py = sunY + Math.sin(sp.angle) * sp.dist;
        const alpha = (1 - (sp.dist - minD) / (maxD - minD + 1)) * sp.alpha;

        ctx.beginPath();
        ctx.arc(px, py, sp.size * mobileScale, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(254, 240, 138, ${Math.max(0, alpha)})`;
        ctx.shadowColor = "#f59e0b";
        ctx.shadowBlur = 10;
        ctx.fill();
        ctx.shadowBlur = 0;
      });

      // Sun Core Body Gradient
      const sunCoreGrad = ctx.createRadialGradient(sunX - sunRadius * 0.2, sunY - sunRadius * 0.2, 5, sunX, sunY, sunRadius);
      sunCoreGrad.addColorStop(0, "#ffffff");
      sunCoreGrad.addColorStop(0.3, "#fef08a");
      sunCoreGrad.addColorStop(0.7, "#f59e0b");
      sunCoreGrad.addColorStop(1, "#d97706");
      ctx.beginPath();
      ctx.arc(sunX, sunY, sunRadius, 0, Math.PI * 2);
      ctx.fillStyle = sunCoreGrad;
      ctx.shadowColor = "#fbbf24";
      ctx.shadowBlur = 35;
      ctx.fill();
      ctx.shadowBlur = 0;

      // ── 5. Planets Physics & Black Hole Gravitational Pull ──
      planets.forEach((p) => {
        const rx = p.orbitRx * mobileScale;
        const ry = p.orbitRy * mobileScale;
        const pSize = Math.max(3.5, p.size * mobileScale);

        if (p.absorbed) {
          p.respawnTimer--;
          if (p.respawnTimer <= 0) {
            p.absorbed = false;
            p.angle = Math.random() * Math.PI * 2;
            // Respawn near top-right Sun
            p.x = sunX + Math.cos(p.angle) * rx;
            p.y = sunY + Math.sin(p.angle) * ry;
            p.vx = 0;
            p.vy = 0;
            p.stretch = 1;
            p.trail = [];
          }
          return;
        }

        // Calculate natural orbit coordinates relative to top-right Sun
        p.angle += p.speed;
        const cosA = Math.cos(p.angle);
        const sinA = Math.sin(p.angle);
        // Apply tilt rotation matrix
        const unrotatedX = cosA * rx;
        const unrotatedY = sinA * ry;
        const targetX = sunX + (unrotatedX * Math.cos(tiltAngle) - unrotatedY * Math.sin(tiltAngle));
        const targetY = sunY + (unrotatedX * Math.sin(tiltAngle) + unrotatedY * Math.cos(tiltAngle));

        // Distance to Black Hole
        const dx = bhX - p.x;
        const dy = bhY - p.y;
        const distToBH = Math.hypot(dx, dy) || 1;

        // Gravitational Attraction Threshold
        const gravThreshold = 300 * mobileScale + bhR * 2.2;

        if (bhR > 6 && distToBH < gravThreshold) {
          // Pull towards Black Hole with spiral velocity
          const pullForce = ((bhR * 320) / (distToBH * distToBH + 120)) * 0.5;
          const nx = dx / distToBH;
          const ny = dy / distToBH;

          // Tangential spiral force
          const tx = -ny;
          const ty = nx;

          p.vx += nx * pullForce + tx * pullForce * 0.45;
          p.vy += ny * pullForce + ty * pullForce * 0.45;

          p.vx *= 0.93;
          p.vy *= 0.93;

          p.x += p.vx;
          p.y += p.vy;

          // Spaghettification effect when close to Black Hole
          if (distToBH < bhR * 2.5) {
            p.stretch = Math.min(3.5, 1 + (bhR * 2.5 - distToBH) / (bhR * 0.6));
            p.stretchAngle = Math.atan2(dy, dx);
          } else {
            p.stretch = 1;
          }

          // Check if planet gets swallowed inside the Event Horizon!
          if (distToBH < bhR + pSize * 0.6) {
            p.absorbed = true;
            p.respawnTimer = 300; // 5 seconds before respawning at Sun

            // Create swallow explosion of glowing cosmic embers
            for (let i = 0; i < 36; i++) {
              const ang = Math.random() * Math.PI * 2;
              const spd = Math.random() * 6 + 2;
              swallowParticles.push({
                x: p.x,
                y: p.y,
                vx: Math.cos(ang) * spd,
                vy: Math.sin(ang) * spd,
                color: p.glowColor,
                life: 1,
                size: Math.random() * 3.5 + 1.5,
              });
            }
          }
        } else {
          // Smooth return to natural orbit around Sun
          p.x = lerp(p.x || targetX, targetX, 0.07);
          p.y = lerp(p.y || targetY, targetY, 0.07);
          p.vx = 0;
          p.vy = 0;
          p.stretch = lerp(p.stretch, 1, 0.1);
        }

        // Store planet trail
        p.trail.unshift({ x: p.x, y: p.y });
        if (p.trail.length > 14) p.trail.pop();

        // Draw Planet Motion Trail
        p.trail.forEach((t, ti) => {
          const alpha = (1 - ti / p.trail.length) * 0.3;
          ctx.beginPath();
          ctx.arc(t.x, t.y, pSize * (1 - ti / p.trail.length), 0, Math.PI * 2);
          ctx.fillStyle = p.glowColor;
          ctx.globalAlpha = alpha;
          ctx.fill();
          ctx.globalAlpha = 1;
        });

        // Render Realistic Planet Body with Shading & Details
        ctx.save();
        ctx.translate(p.x, p.y);

        if (p.stretch > 1.05) {
          ctx.rotate(p.stretchAngle);
          ctx.scale(p.stretch, 1 / Math.sqrt(p.stretch));
        }

        // Outer Planet Glow
        ctx.shadowColor = p.glowColor;
        ctx.shadowBlur = pSize * 1.5;

        // Base Planet Sphere
        const planetGrad = ctx.createRadialGradient(-pSize * 0.3, -pSize * 0.3, 1, 0, 0, pSize);
        planetGrad.addColorStop(0, p.glowColor);
        planetGrad.addColorStop(0.6, p.color);
        planetGrad.addColorStop(1, "#0f172a");

        ctx.beginPath();
        ctx.arc(0, 0, pSize, 0, Math.PI * 2);
        ctx.fillStyle = planetGrad;
        ctx.fill();
        ctx.shadowBlur = 0;

        // Custom Realistic Planet Textures / Details
        if (p.name === "Earth") {
          // Green continents preview
          ctx.fillStyle = "#15803d";
          ctx.beginPath();
          ctx.arc(-pSize * 0.2, -pSize * 0.1, pSize * 0.45, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.arc(pSize * 0.3, pSize * 0.2, pSize * 0.35, 0, Math.PI * 2);
          ctx.fill();
          // White ice caps
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, -pSize * 0.85, pSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.name === "Jupiter") {
          // Cloud bands
          ctx.fillStyle = "rgba(180, 83, 9, 0.6)";
          ctx.fillRect(-pSize, -pSize * 0.4, pSize * 2, pSize * 0.25);
          ctx.fillRect(-pSize, pSize * 0.15, pSize * 2, pSize * 0.2);
          // Great Red Spot
          ctx.fillStyle = "#b91c1c";
          ctx.beginPath();
          ctx.ellipse(pSize * 0.3, pSize * 0.2, pSize * 0.3, pSize * 0.2, 0, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.name === "Mars") {
          // Polar ice cap
          ctx.fillStyle = "#ffffff";
          ctx.beginPath();
          ctx.arc(0, -pSize * 0.8, pSize * 0.35, 0, Math.PI * 2);
          ctx.fill();
        }

        // Day/Night Terminator Shadow (Light source from top-right Sun)
        const angleToSun = Math.atan2(sunY - p.y, sunX - p.x);
        const shadowGrad = ctx.createLinearGradient(
          Math.cos(angleToSun + Math.PI) * pSize,
          Math.sin(angleToSun + Math.PI) * pSize,
          Math.cos(angleToSun) * pSize,
          Math.sin(angleToSun) * pSize
        );
        shadowGrad.addColorStop(0, "rgba(2, 6, 23, 0.85)");
        shadowGrad.addColorStop(0.5, "rgba(2, 6, 23, 0.3)");
        shadowGrad.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = shadowGrad;
        ctx.beginPath();
        ctx.arc(0, 0, pSize, 0, Math.PI * 2);
        ctx.fill();

        // Saturn Rings System
        if (p.hasRing) {
          ctx.rotate(Math.PI / 6);
          // Outer Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 2.5, pSize * 0.7, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(253, 224, 71, 0.65)";
          ctx.lineWidth = 3;
          ctx.stroke();
          // Inner Ring
          ctx.beginPath();
          ctx.ellipse(0, 0, pSize * 1.8, pSize * 0.5, 0, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(234, 179, 8, 0.45)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }

        ctx.restore();

        // Earth Orbiting Moon
        if (p.hasMoon && !p.absorbed) {
          p.moonAngle = (p.moonAngle || 0) + 0.045;
          const moonR = pSize * 2.2;
          const moonX = p.x + Math.cos(p.moonAngle) * moonR;
          const moonY = p.y + Math.sin(p.moonAngle) * moonR * 0.6;

          ctx.beginPath();
          ctx.arc(moonX, moonY, Math.max(1.8, 2.5 * mobileScale), 0, Math.PI * 2);
          ctx.fillStyle = "#e2e8f0";
          ctx.shadowColor = "#ffffff";
          ctx.shadowBlur = 4;
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      });

      // ── 6. Render Dynamic Black Hole Singularity at Cursor / Touch ──
      if (bhR > 1) {
        // Gravitational Lensing Rings (bending ambient starlight)
        for (let i = 5; i > 0; i--) {
          const ringR = bhR * (1 + i * 0.4);
          ctx.beginPath();
          ctx.arc(bhX, bhY, ringR, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(167, 139, 250, ${0.14 - i * 0.025})`;
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // High-Speed Plasma Accretion Disk Swirl
        diskParticles.forEach((dp) => {
          dp.angle += dp.speed * (1 + bhR / 25);
          const currentDist = bhR * 1.25 + (dp.dist % (bhR * 1.9 + 25));
          const px = bhX + Math.cos(dp.angle) * currentDist;
          const py = bhY + Math.sin(dp.angle) * currentDist * 0.42;

          ctx.beginPath();
          ctx.arc(px, py, dp.size * mobileScale, 0, Math.PI * 2);
          ctx.fillStyle = `hsla(${dp.hue}, 95%, 75%, 0.8)`;
          ctx.fill();
        });

        // Event Horizon Ambient Glow
        const bhGlow = ctx.createRadialGradient(bhX, bhY, bhR * 0.5, bhX, bhY, bhR * 2.4);
        bhGlow.addColorStop(0, "rgba(0,0,0,0)");
        bhGlow.addColorStop(0.5, "rgba(124, 58, 237, 0.35)");
        bhGlow.addColorStop(0.8, "rgba(99, 102, 241, 0.18)");
        bhGlow.addColorStop(1, "rgba(0,0,0,0)");
        ctx.beginPath();
        ctx.arc(bhX, bhY, bhR * 2.4, 0, Math.PI * 2);
        ctx.fillStyle = bhGlow;
        ctx.fill();

        // Relativistic Photon Ring (Intense luminous white/violet border)
        ctx.beginPath();
        ctx.arc(bhX, bhY, bhR * 1.07, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(243, 232, 255, 0.95)";
        ctx.lineWidth = 2.5;
        ctx.shadowColor = "#c084fc";
        ctx.shadowBlur = 18;
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Pitch Black Singularity Event Horizon Core
        const bhCore = ctx.createRadialGradient(bhX, bhY, 0, bhX, bhY, bhR);
        bhCore.addColorStop(0, "#000000");
        bhCore.addColorStop(0.92, "#000000");
        bhCore.addColorStop(1, "rgba(10, 5, 20, 0.98)");
        ctx.beginPath();
        ctx.arc(bhX, bhY, bhR, 0, Math.PI * 2);
        ctx.fillStyle = bhCore;
        ctx.fill();
      }

      // ── 7. Render Swallow Explosion Particles ──
      swallowParticles = swallowParticles.filter((sp) => sp.life > 0.02);
      swallowParticles.forEach((sp) => {
        sp.x += sp.vx;
        sp.y += sp.vy;
        sp.vx *= 0.94;
        sp.vy *= 0.94;
        sp.life *= 0.92;

        ctx.beginPath();
        ctx.arc(sp.x, sp.y, sp.size * sp.life, 0, Math.PI * 2);
        ctx.fillStyle = sp.color;
        ctx.globalAlpha = sp.life;
        ctx.shadowColor = sp.color;
        ctx.shadowBlur = 12;
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.globalAlpha = 1;
      });

      raf = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        display: "block",
        zIndex: 0,
        opacity: done ? 0 : 1,
        transition: "opacity 0.6s ease",
      }}
    />
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────

export default function LoginPage({ onLogin }: { onLogin: () => void }) {
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 40);
    return () => clearTimeout(t);
  }, []);

  const handleLogin = useCallback(() => {
    if (loading || done) return;
    setLoading(true);
    setTimeout(() => {
      setDone(true);
      setTimeout(onLogin, 600);
    }, 900);
  }, [loading, done, onLogin]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Enter") handleLogin(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [handleLogin]);

  return (
    <div
      className="lock-root"
      style={{ opacity: visible ? 1 : 0, transition: "opacity .6s ease" }}
    >
      <FlameCursor />
      {/* Solar System + Interactive Black Hole Background */}
      <SolarSystemBlackHoleBackground done={done} />

      {/* Noise grain */}
      <div className="lock-noise" />

      {/* Centered content */}
      <div
        className="lock-card"
        style={{
          opacity:    done ? 0 : 1,
          transform:  done ? "scale(1.05) translateY(-8px)" : "scale(1)",
          transition: "opacity .5s ease, transform .5s ease",
        }}
      >
        {/* Avatar */}
        <div className="lock-avatar-wrap">
          <div className="lock-avatar-ring" />
          <div className="lock-avatar-ring lock-avatar-ring-outer" />
          <img src={profilePhoto} alt="Abhishek" className="lock-avatar-img" />
        </div>

        {/* Name */}
        <h1 className="lock-name">Abhishek</h1>

        {/* Greeting */}
        <p className="lock-greeting">Good to see you 👋</p>

        {/* Login button */}
        <button
          className={`lock-btn ${loading ? "lock-btn-loading" : ""} ${done ? "lock-btn-done" : ""}`}
          onClick={handleLogin}
          disabled={loading || done}
        >
          {done ? (
            <span className="lock-btn-inner">
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Welcome
            </span>
          ) : loading ? (
            <span className="lock-btn-inner">
              <span className="lock-spinner" />
              Entering…
            </span>
          ) : (
            <span className="lock-btn-inner">
              Login
              <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </span>
          )}
        </button>

        {/* Hint */}
        <p className="lock-hint">Press Enter or click to continue</p>
      </div>
    </div>
  );
}
