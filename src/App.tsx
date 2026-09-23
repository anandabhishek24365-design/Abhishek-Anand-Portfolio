import React, { useState, useEffect, useRef, useCallback } from "react";
import LoginPage from "./LoginPage";
import {
  getSupabaseClient,
  sendContactMessage,
  fetchContactMessages,
  isSupabaseConfigured,
  ContactMessageRecord,
} from "./lib/supabase";
import profilePhoto from "@/imports/WhatsApp_Image_2026-09-08_at_11.27.05_AM.jpeg";
// ─── Premium dot + ring cursor ────────────────────────────────────────────────

function CustomCursor() {
  const dotEl  = useRef<HTMLDivElement>(null);
  const ringEl = useRef<HTMLDivElement>(null);
  const trailEl= useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    const style = document.createElement("style");
    style.id = "pf-cursor-hide";
    style.textContent = "*, *::before, *::after { cursor: none !important; }";
    if (!document.getElementById("pf-cursor-hide")) document.head.appendChild(style);

    const TRAIL = 8;
    const trail: { x: number; y: number }[] = Array(TRAIL).fill({ x: -200, y: -200 });

    const mouse  = { x: -200, y: -200 };
    const ring   = { x: -200, y: -200 };
    let clicking = false;
    let onInteractive = false;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const onMove = (e: MouseEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; };
    const onDown = () => { clicking = true; };
    const onUp   = () => { clicking = false; };
    const onOver = (e: MouseEvent) => {
      onInteractive = !!(e.target as HTMLElement).closest("a,button,[role=button],input,textarea,label,select");
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup",   onUp);
    window.addEventListener("mouseover", onOver, { passive: true });

    let raf: number;
    const tick = () => {
      // Shift trail
      trail.unshift({ x: mouse.x, y: mouse.y });
      trail.length = TRAIL;

      // Lerp ring
      ring.x = lerp(ring.x, mouse.x, 0.13);
      ring.y = lerp(ring.y, mouse.y, 0.13);

      const dot = dotEl.current;
      const r   = ringEl.current;

      if (dot) {
        const s = clicking ? 0.45 : onInteractive ? 1.5 : 1;
        dot.style.transform = `translate(${mouse.x - 4}px,${mouse.y - 4}px) scale(${s})`;
      }
      if (r) {
        const s = clicking ? 0.75 : onInteractive ? 1.6 : 1;
        r.style.transform = `translate(${ring.x - 20}px,${ring.y - 20}px) scale(${s})`;
        r.style.borderColor = onInteractive ? "rgba(167,139,250,0.95)" : "rgba(99,102,241,0.55)";
        r.style.boxShadow   = onInteractive
          ? "0 0 18px rgba(167,139,250,0.35), inset 0 0 8px rgba(167,139,250,0.1)"
          : "0 0 8px rgba(99,102,241,0.2)";
      }

      // Trail dots
      trailEl.current.forEach((el, i) => {
        if (!el) return;
        const t = trail[i] ?? trail[trail.length - 1];
        const alpha = (1 - i / TRAIL) * 0.45;
        const size  = (1 - i / TRAIL) * 5;
        el.style.transform  = `translate(${t.x - size / 2}px,${t.y - size / 2}px)`;
        el.style.width      = `${size}px`;
        el.style.height     = `${size}px`;
        el.style.opacity    = String(alpha);
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
    };
  }, []);

  return (
    <>
      {/* Dot */}
      <div
        ref={dotEl}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999999,
          width: 8, height: 8, borderRadius: "50%",
          background: "rgba(224,220,255,1)",
          boxShadow: "0 0 10px rgba(99,102,241,1), 0 0 24px rgba(99,102,241,0.5)",
          pointerEvents: "none",
          transition: "transform 0.07s ease",
          willChange: "transform",
        }}
      />
      {/* Ring */}
      <div
        ref={ringEl}
        style={{
          position: "fixed", top: 0, left: 0, zIndex: 999998,
          width: 40, height: 40, borderRadius: "50%",
          border: "1.5px solid rgba(99,102,241,0.55)",
          pointerEvents: "none",
          transition: "transform 0.1s ease, border-color 0.2s, box-shadow 0.2s",
          willChange: "transform",
          backdropFilter: "blur(0px)",
        }}
      />
      {/* Comet trail */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          ref={el => { if (el) trailEl.current[i] = el; }}
          style={{
            position: "fixed", top: 0, left: 0, zIndex: 999997,
            borderRadius: "50%",
            background: "rgba(129,140,248,1)",
            pointerEvents: "none",
            willChange: "transform",
          }}
        />
      ))}
    </>
  );
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const IconGithub = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
  </svg>
);

const IconLinkedin = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
  </svg>
);

const IconMail = ({ size = 20 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
    <rect x="2" y="4" width="20" height="16" rx="2.5" />
    <path d="M2 7.5l10 6.5 10-6.5" />
  </svg>
);

const IconArrowRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
    <path d="M3 8h10M9 4l4 4-4 4" />
  </svg>
);

const IconExternal = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
    <path d="M6 3H3v10h10v-3M9 3h4v4M13 3L7 9" />
  </svg>
);

const IconChevronUp = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
    <path d="M4 10l4-4 4 4" />
  </svg>
);

const IconStar = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 1.5l1.75 3.5 3.85.56-2.8 2.72.66 3.84L8 10.27l-3.46 1.85.66-3.84L2.4 5.56l3.85-.56L8 1.5z" />
  </svg>
);

const IconFork = ({ size = 13 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
    <path d="M5 3.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm0 2.122a2.25 2.25 0 10-1.5 0v.878A2.25 2.25 0 005.75 8.5h1.5v2.128a2.251 2.251 0 101.5 0V8.5h1.5a2.25 2.25 0 002.25-2.25v-.878a2.25 2.25 0 10-1.5 0v.878a.75.75 0 01-.75.75h-4.5A.75.75 0 015 6.25v-.878zm3.75 7.378a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm3-8.75a.75.75 0 11-1.5 0 .75.75 0 011.5 0z" />
  </svg>
);

// ─── Hooks ────────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function useTypewriter(words: string[], speed = 80, pause = 1800) {
  const [text, setText] = useState("");
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = words[wordIdx];
    const delay = deleting ? speed / 2 : charIdx === current.length ? pause : speed;
    const t = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setText(current.slice(0, charIdx + 1));
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setDeleting(true);
      } else if (deleting && charIdx > 0) {
        setText(current.slice(0, charIdx - 1));
        setCharIdx(c => c - 1);
      } else {
        setDeleting(false);
        setWordIdx(i => (i + 1) % words.length);
      }
    }, delay);
    return () => clearTimeout(t);
  }, [text, wordIdx, charIdx, deleting, words, speed, pause]);

  return text;
}

// ─── FadeIn ───────────────────────────────────────────────────────────────────

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(28px)",
        transition: `opacity 0.65s ease ${delay}ms, transform 0.65s ease ${delay}ms`,
      }}
    >
      {children}
    </div>
  );
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["About", "Skills", "Projects", "Experience", "Contact"];

const TABS = ["About", "Skills", "Projects", "Experience", "Contact"] as const;
type Tab = typeof TABS[number];

const TYPEWRITER_ROLES = ["Software Developer.", "Web Builder.", "DSA Practitioner.", "Problem Solver.", "CS Student @ NIIT."];

const STATS = [
  { value: "10+", label: "Projects Built" },
  { value: "5+", label: "Technologies" },
  { value: "∞", label: "Curiosity" },
  { value: "24/7", label: "Learning Mode" },
];

const SKILLS = [
  {
    category: "Languages",
    color: "#6366f1",
    items: [
      { name: "Python", tag: "Primary" },
      { name: "Java", tag: "Learning" },
    ],
  },
  {
    category: "DSA",
    color: "#06b6d4",
    items: [
      { name: "Arrays", tag: "Core" },
      { name: "Linked Lists", tag: "Core" },
      { name: "Recursion", tag: "Core" },
      { name: "Sorting", tag: "Algo" },
    ],
  },
  {
    category: "Web",
    color: "#10b981",
    items: [
      { name: "Supabase", tag: "Backend" },
      { name: "Firebase", tag: "BaaS" },
      { name: "Vercel", tag: "Deploy" },
      { name: "Netlify", tag: "Deploy" },
      { name: "MongoDB", tag: "Database" },
    ],
  },
  {
    category: "Tools",
    color: "#f59e0b",
    items: [
      { name: "Git", tag: "VCS" },
      { name: "GitHub", tag: "Collab" },
      { name: "VS Code", tag: "Editor" },
      { name: "Cursor", tag: "AI Editor" },
      { name: "Antigravity", tag: "Tool" },
    ],
  },
];

const TECH_ICONS: Record<string, string> = {
  Python: "🐍", Java: "♨", JavaScript: "JS", HTML: "H", CSS: "C",
  Arrays: "[]", "Linked Lists": "↔", Recursion: "↺", Sorting: "↕",
  React: "⚛", Vite: "⚡", Supabase: "⚡", Firebase: "🔥", Vercel: "▲",
  Git: "G", GitHub: "G", "VS Code": "V", Cursor: "✦", Antigravity: "🪐",
};

const PROJECTS = [
  {
    id: "01",
    name: "DesiCart",
    tagline: "Shop Indian, shop smart.",
    desc: "A full-stack e-commerce web application with product listings, cart management, and a smooth checkout flow. Built with Vite on the frontend and a dedicated backend service, deployed live on Vercel.",
    tags: ["Vite", "JavaScript", "Vercel"],
    accent: "#6366f1",
    live: "https://desi-cart-mn5x.vercel.app",
    repo: "https://github.com/anandabhishek24365-design/DesiCart",
    codeLines: [
      { text: "// DesiCart — e-commerce platform", color: "#4a4a68" },
      { text: "const cart = useCartStore();", color: "#e2e8f0" },
      { text: "", color: "" },
      { text: "function addToCart(product) {", color: "#a5b4fc" },
      { text: "  cart.add({ ...product,", color: "#94a3b8" },
      { text: "    qty: 1, ts: Date.now() });", color: "#fbbf24" },
      { text: "}", color: "#a5b4fc" },
      { text: "", color: "" },
      { text: "return <CartDrawer />;", color: "#86efac" },
    ],
  },
  {
    id: "02",
    name: "Army Base",
    tagline: "Full-stack, battle-ready.",
    desc: "A full-stack web application with a Vite frontend, Node.js API routes, and dual cloud deployment on both Vercel and Firebase. Features a clean UI with server-side logic for dynamic data handling.",
    tags: ["Node.js", "Firebase", "Vercel"],
    accent: "#10b981",
    live: "https://army-base.vercel.app",
    repo: "https://github.com/anandabhishek24365-design/Army-Base",
    codeLines: [
      { text: "// Army Base — full-stack app", color: "#4a4a68" },
      { text: "app.get('/api/data', async (req, res) => {", color: "#e2e8f0" },
      { text: "  const data = await db.query(", color: "#a5f3fc" },
      { text: "    'SELECT * FROM records'", color: "#86efac" },
      { text: "  );", color: "#94a3b8" },
      { text: "  res.json({ data });", color: "#fbbf24" },
      { text: "});", color: "#e2e8f0" },
    ],
  },
  {
    id: "03",
    name: "College Post",
    tagline: "Courier room control system.",
    desc: "A college courier room control & package management system that streamlines parcel logging, student pickup notifications, package tracking, and mailroom intake operations. Built with Firebase Firestore for real-time tracking and deployed on Vercel.",
    tags: ["Firebase", "Firestore", "Courier System", "Vite"],
    accent: "#f59e0b",
    live: "https://college-post-puce.vercel.app",
    repo: "https://github.com/anandabhishek24365-design/college-post",
    codeLines: [
      { text: "// College Post — courier room control", color: "#4a4a68" },
      { text: "const packagesRef = collection(db, 'packages');", color: "#e2e8f0" },
      { text: "", color: "" },
      { text: "onSnapshot(packagesRef, (snap) => {", color: "#a5b4fc" },
      { text: "  const packages = snap.docs.map(", color: "#94a3b8" },
      { text: "    d => ({ id: d.id, ...d.data() })", color: "#fbbf24" },
      { text: "  );", color: "#94a3b8" },
      { text: "  setPackages(packages);", color: "#86efac" },
      { text: "});", color: "#a5b4fc" },
    ],
  },
  {
    id: "04",
    name: "AutoPluck",
    tagline: "Autonomous farm bot.",
    desc: "Integrated autonomous agricultural bot with line tracking, dynamic obstacle detection, and automated plucking actuation. IoT edge telemetry streams live operational status to a central web monitoring interface.",
    tags: ["Autonomous Navigation", "Edge Microcontrollers", "IoT", "Robotics"],
    accent: "#a78bfa",
    live: "",
    repo: "https://github.com/anandabhishek24365-design/AutoPluck",
    codeLines: [
      { text: "// AutoPluck — smart farm bot", color: "#4a4a68" },
      { text: "bot.on('line', () => follow());", color: "#a5b4fc" },
      { text: "bot.on('obstacle', () => avoid());", color: "#fbbf24" },
      { text: "", color: "" },
      { text: "if (cropDetected) {", color: "#e2e8f0" },
      { text: "  actuator.pluck({ gentle: true });", color: "#86efac" },
      { text: "  telemetry.send(status);", color: "#94a3b8" },
      { text: "}", color: "#e2e8f0" },
    ],
  },
  {
    id: "05",
    name: "Vasus Brakes",
    tagline: "Strategy meets the shop floor.",
    desc: "Industrial strategy and automation modernization project for Vasus Brakes' rubber compression molding machines producing EV brake components. Competitor benchmarking, process analysis, and a phased modernization roadmap.",
    tags: ["Industrial Analysis", "Process Optimization", "Automation Roadmap"],
    accent: "#fb923c",
    live: "",
    repo: "",
    codeLines: [
      { text: "// Vasus Brakes — industrial strategy", color: "#4a4a68" },
      { text: "const benchmarks = await analyze({", color: "#e2e8f0" },
      { text: "  competitors: ['Mech EX','J.R.D',", color: "#94a3b8" },
      { text: "    'Hydromac'],", color: "#94a3b8" },
      { text: "  metrics: ['tonnage','PLC','cycle'],", color: "#fbbf24" },
      { text: "});", color: "#e2e8f0" },
      { text: "return buildRoadmap(benchmarks);", color: "#86efac" },
    ],
  },
  {
    id: "06",
    name: "Smart Fertilizer Robot",
    tagline: "Precision farming, zero waste.",
    desc: "Autonomous tracked agricultural rover applying high-precision micro-doses of fertilizer directly to plant root zones. Dual-controller setup with Arduino Uno & Raspberry Pi coordinating NEMA17 steppers and precision dosing pumps.",
    tags: ["Arduino", "Raspberry Pi", "NEMA17", "Soil Sensors", "CAD"],
    accent: "#38bdf8",
    live: "",
    repo: "",
    codeLines: [
      { text: "// Fertilizer Micro Dosing Robot", color: "#4a4a68" },
      { text: "const soil = sensors.read('pH');", color: "#e2e8f0" },
      { text: "const dose = calcDose(soil, zone);", color: "#a5f3fc" },
      { text: "", color: "" },
      { text: "stepper.move(toRootZone);", color: "#fbbf24" },
      { text: "pump.dispense(dose); // µL", color: "#86efac" },
      { text: "gps.log(position);", color: "#94a3b8" },
    ],
  },
  {
    id: "07",
    name: "Ecosphere-X",
    tagline: "De-risking clean energy loans.",
    desc: "IoT-based performance tracking and microplanning platform using ESP32 microcontrollers to monitor solar asset health in real time, reducing agricultural clean energy loan defaults caused by premature hardware failure.",
    tags: ["ESP32", "IoT", "ThingSpeak", "C++", "CleanTech", "LiFePO4"],
    accent: "#10b981",
    live: "",
    repo: "",
    codeLines: [
      { text: "// Ecosphere-X — IoT telemetry", color: "#4a4a68" },
      { text: "esp32.read({ voltage, current,", color: "#e2e8f0" },
      { text: "  temperature, irradiance });", color: "#a5f3fc" },
      { text: "", color: "" },
      { text: "thingspeak.push(metrics);", color: "#86efac" },
      { text: "dashboard.update(liveData);", color: "#fbbf24" },
      { text: "loan.riskScore = predict(health);", color: "#94a3b8" },
    ],
  },
];

const TIMELINE = [
  {
    year: "2026 · Project 03",
    title: "AutoPluck — Smart Farm Bot",
    desc: "Led development of an autonomous agricultural bot with line tracking, obstacle detection, and robotic plucking actuation. Implemented IoT edge telemetry for live web monitoring.",
    active: true,
    tag: "Edge Robotics & AgriTech",
    tagColor: "#a78bfa",
  },
  {
    year: "2026",
    title: "College Post — Courier Room Control System",
    desc: "Built a campus courier room control system with real-time package tracking and student pickup notifications powered by Firebase Firestore. Deployed on Vercel.",
    active: false,
    tag: "Firebase · Firestore",
    tagColor: "#6366f1",
  },
  {
    year: "2026 · Project 04",
    title: "Vasus Brakes — Industrial Strategy & Automation",
    desc: "Conducted operational benchmarking for Vasus Brakes' rubber compression molding machines producing EV brake components. Built a phased modernization roadmap covering ARAI compliance and shop-floor automation.",
    active: false,
    tag: "Industrial Manufacturing",
    tagColor: "#fb923c",
  },
  {
    year: "2026",
    title: "Army Base — Full-Stack App",
    desc: "Full-stack application with a Vite frontend, Node.js API routes, and dual cloud deployment on Vercel and Firebase.",
    active: false,
    tag: "Node.js · Firebase",
    tagColor: "#6366f1",
  },
  {
    year: "2026",
    title: "DesiCart — E-Commerce Platform",
    desc: "Full-stack e-commerce web app with product listings, cart management, and checkout flow. Built with Vite, deployed live on Vercel.",
    active: false,
    tag: "Vite · Vercel",
    tagColor: "#6366f1",
  },
  {
    year: "2025–26 · Project 02",
    title: "Smart Fertilizer Micro Dosing Robot",
    desc: "Designed an autonomous tracked rover applying precision micro-doses of fertilizer to plant root zones. Integrated Arduino Uno + Raspberry Pi dual-controller with NEMA17 steppers and soil sensor array.",
    active: false,
    tag: "AgriTech & Robotics",
    tagColor: "#38bdf8",
  },
  {
    year: "2025–26 · Project 01",
    title: "Ecosphere-X — Renewable Energy Microplanning",
    desc: "Engineered an IoT platform using ESP32 to track solar asset health and de-risk agricultural clean energy loans. Built a ThingSpeak dashboard for real-time power and system telemetry.",
    active: false,
    tag: "Fintech & CleanTech",
    tagColor: "#10b981",
  },
  {
    year: "2025",
    title: "Joined NIIT University",
    desc: "Started B.Tech in CSE (AI & Data Science) at NIIT University. Began learning Python, DSA, and web fundamentals from the ground up.",
    active: false,
    tag: "Education",
    tagColor: "#6366f1",
  },
];

const REPOS = [
  { name: "DesiCart", desc: "Full-stack e-commerce app. Live on Vercel.", lang: "JavaScript", color: "#f7df1e", stars: 0, forks: 0 },
  { name: "Army-Base", desc: "Full-stack app with Node API + Firebase.", lang: "JavaScript", color: "#f7df1e", stars: 0, forks: 0 },
  { name: "college-post", desc: "Social platform with Firestore real-time sync.", lang: "JavaScript", color: "#f7df1e", stars: 0, forks: 0 },
  { name: "AutoPluck", desc: "New project — in early development.", lang: "JavaScript", color: "#f7df1e", stars: 0, forks: 0 },
];

const LEARNING_TAGS = ["Python", "Java", "DSA", "Supabase", "Firebase", "Git", "HTML", "CSS"];

// ─── Contrib graph ────────────────────────────────────────────────────────────

function makeContribData() {
  return Array.from({ length: 26 }, () =>
    Array.from({ length: 7 }, () => {
      const r = Math.random();
      return r < 0.28 ? 0 : r < 0.52 ? 1 : r < 0.72 ? 2 : r < 0.88 ? 3 : 4;
    })
  );
}
const CONTRIB = makeContribData();
const C_COLORS = ["#12121c", "#1e1b4b", "#3730a3", "#6366f1", "#a5b4fc"];

// ─── Navbar ───────────────────────────────────────────────────────────────────

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ onLogout }: { onLogout?: () => void }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const go = (id: string) => {
    setOpen(false);
    document.getElementById(id.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <>
      <nav
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
          background: scrolled ? "rgba(6,6,10,0.9)" : "transparent",
          backdropFilter: scrolled ? "blur(24px)" : "none",
          WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "1px solid transparent",
          transition: "all 0.3s ease",
        }}
      >
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
            {/* Logo */}
            <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ display: "flex", alignItems: "center", gap: 12, background: "none", border: "none", cursor: "pointer" }}>
              <div style={{
                width: 34, height: 34, borderRadius: 9, background: "var(--accent)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 15, color: "#fff",
                boxShadow: "0 0 20px rgba(99,102,241,0.4)",
              }}>A</div>
              <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 600, fontSize: 14, color: "var(--text)", letterSpacing: "-0.01em" }} className="hidden-mobile">
                Abhishek Anand
              </span>
            </button>

            {/* Center links */}
            <div className="nav-links" style={{ display: "flex", gap: 32 }}>
              {NAV_LINKS.map(l => (
                <button key={l} onClick={() => go(l)} className="nav-link">{l}</button>
              ))}
            </div>

            {/* Right */}
            <div className="nav-right" style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <a href="#" aria-label="GitHub" className="icon-btn"><IconGithub size={18} /></a>
              <a href="#" aria-label="LinkedIn" className="icon-btn"><IconLinkedin size={18} /></a>
              <button onClick={() => go("Contact")} className="btn-primary" style={{ padding: "9px 18px", fontSize: 13 }}>
                Resume
              </button>
              {onLogout && (
                <button
                  onClick={onLogout}
                  title="Back to lock screen"
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "8px 14px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                    background: "rgba(255,255,255,0.04)", backdropFilter: "blur(8px)",
                    color: "var(--text-2)", fontSize: 12, fontFamily: "Manrope, sans-serif",
                    fontWeight: 500, cursor: "pointer", transition: "all .2s",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(244,63,94,0.4)";
                    (e.currentTarget as HTMLButtonElement).style.color = "#f43f5e";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(244,63,94,0.08)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.04)";
                  }}
                >
                  <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <polyline points="16 17 21 12 16 7" />
                    <line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Logout
                </button>
              )}
            </div>

            <button className="hamburger" onClick={() => setOpen(!open)} aria-label="Menu">
              <div style={{ width: 22, height: 1.5, background: "var(--text)", marginBottom: 6, borderRadius: 2, transition: "all 0.2s", transform: open ? "rotate(45deg) translate(5px,5px)" : "none" }} />
              <div style={{ width: 16, height: 1.5, background: "var(--text)", marginBottom: 6, borderRadius: 2, opacity: open ? 0 : 1, transition: "all 0.2s" }} />
              <div style={{ width: 22, height: 1.5, background: "var(--text)", borderRadius: 2, transition: "all 0.2s", transform: open ? "rotate(-45deg) translate(5px,-5px)" : "none" }} />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        style={{
          position: "fixed", inset: 0, zIndex: 90, background: "rgba(6,6,10,0.98)",
          backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)",
          display: "flex", flexDirection: "column", padding: "90px 32px 40px",
          opacity: open ? 1 : 0, pointerEvents: open ? "auto" : "none",
          transition: "opacity 0.25s ease",
        }}
      >
        {NAV_LINKS.map((l, i) => (
          <button
            key={l}
            onClick={() => go(l)}
            style={{
              textAlign: "left", padding: "18px 0", background: "none", border: "none",
              borderBottom: "1px solid rgba(255,255,255,0.06)", cursor: "pointer",
              fontFamily: "Manrope, sans-serif", fontSize: 22, fontWeight: 600, color: "var(--text)",
              transform: open ? "translateY(0)" : "translateY(16px)",
              transition: `all 0.3s ease ${i * 60}ms`,
              opacity: open ? 1 : 0,
            }}
          >{l}</button>
        ))}
        <div style={{ display: "flex", gap: 12, marginTop: 32 }}>
          <a href="#" className="btn-secondary" style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}><IconGithub size={15} /> GitHub</a>
          <a href="#" className="btn-secondary" style={{ flex: 1, justifyContent: "center", textDecoration: "none" }}><IconLinkedin size={15} /> LinkedIn</a>
        </div>
        <button className="btn-primary" style={{ marginTop: 12, justifyContent: "center" }}>Resume</button>
      </div>
    </>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroTerminal() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouse = useCallback((e: MouseEvent) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    setTilt({
      x: ((e.clientY - cy) / rect.height) * -8,
      y: ((e.clientX - cx) / rect.width) * 8,
    });
  }, []);

  useEffect(() => {
    window.addEventListener("mousemove", handleMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouse);
  }, [handleMouse]);

  return (
    <div ref={containerRef} style={{ position: "relative", display: "flex", justifyContent: "center", alignItems: "center", minHeight: 420 }}>
      {/* Radial glow */}
      <div style={{
        position: "absolute", width: 340, height: 340, borderRadius: "50%",
        background: "radial-gradient(circle, rgba(99,102,241,0.14) 0%, transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Main terminal */}
      <div
        style={{
          background: "var(--surface)", border: "1px solid rgba(99,102,241,0.35)",
          borderRadius: 18, overflow: "hidden", width: 300, position: "relative", zIndex: 2,
          boxShadow: "0 24px 80px rgba(0,0,0,0.5), 0 0 40px rgba(99,102,241,0.12)",
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
          transition: "transform 0.15s ease",
        }}
      >
        {/* Title bar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 7, padding: "11px 16px",
          background: "var(--bg-2)", borderBottom: "1px solid var(--border)",
        }}>
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f43f5e" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#f59e0b" }} />
          <div style={{ width: 11, height: 11, borderRadius: "50%", background: "#10b981" }} />
          <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 6 }}>~/abhishek</span>
        </div>

        {/* Code body */}
        <div style={{ padding: "18px 20px" }} className="mono">
          {[
            { t: "$ whoami", c: "#6ee7b7", indent: 0 },
            { t: "abhishek-anand", c: "#f0f0f5", indent: 0 },
            { t: "", c: "", indent: 0 },
            { t: "$ cat profile.json", c: "#6ee7b7", indent: 0 },
            { t: "{", c: "#f0f0f5", indent: 0 },
            { t: '"role": "Software Developer",', c: "#a5b4fc", indent: 1 },
            { t: '"stack": ["React","Node","Java"],', c: "#fbbf24", indent: 1 },
            { t: '"status": "available",', c: "#86efac", indent: 1 },
            { t: '"passion": "Building things."', c: "#a5b4fc", indent: 1 },
            { t: "}", c: "#f0f0f5", indent: 0 },
            { t: "", c: "", indent: 0 },
            { t: "$ _", c: "#6366f1", indent: 0 },
          ].map((l, i) => (
            <div key={i} style={{ fontSize: 11.5, lineHeight: "1.8", color: l.c, paddingLeft: l.indent * 14 }}>
              {l.t}{i === 11 && <span className="cursor">▋</span>}
            </div>
          ))}
        </div>
      </div>

      {/* Floating badges */}
      {[
        { label: "⚛ React", color: "#61dafb", bg: "rgba(97,218,251,0.08)", border: "rgba(97,218,251,0.25)", top: "8%", right: "-5%", float: "float-1" },
        { label: "🟢 Node.js", color: "#86efac", bg: "rgba(134,239,172,0.08)", border: "rgba(134,239,172,0.25)", bottom: "18%", left: "0%", float: "float-3" },
        { label: "JS ES2024", color: "#fbbf24", bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", bottom: "4%", right: "4%", float: "float-2" },
        { label: "♨ Java", color: "#fb7185", bg: "rgba(251,113,133,0.08)", border: "rgba(251,113,133,0.25)", top: "22%", left: "-2%", float: "float-2" },
      ].map((b) => (
        <div
          key={b.label}
          className={`floating-badge ${b.float}`}
          style={{
            position: "absolute", top: b.top, bottom: b.bottom, left: b.left, right: b.right,
            background: b.bg, border: `1px solid ${b.border}`, borderRadius: 8,
            padding: "6px 12px", fontFamily: "JetBrains Mono, monospace", fontSize: 11,
            fontWeight: 600, color: b.color, backdropFilter: "blur(8px)", zIndex: 3,
          }}
        >{b.label}</div>
      ))}

      {/* Avatar monogram */}
      <div
        className="float-1"
        style={{
          position: "absolute", top: "-6%", right: "6%",
          width: 58, height: 58, borderRadius: 16,
          background: "linear-gradient(135deg, #6366f1 0%, #818cf8 100%)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 22, color: "#fff",
          boxShadow: "0 8px 32px rgba(99,102,241,0.45)",
          border: "1px solid rgba(165,180,252,0.3)", zIndex: 4,
        }}
      >AA</div>
    </div>
  );
}

function Hero() {
  const role = useTypewriter(TYPEWRITER_ROLES, 75, 2000);

  return (
    <section id="home" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", overflow: "hidden" }}>
      {/* Background grid + glow */}
      <div className="bg-grid" style={{ position: "absolute", inset: 0, zIndex: 0 }} />
      <div style={{ position: "absolute", top: "20%", left: "-8%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.09) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", bottom: "10%", right: "5%", width: 300, height: 300, borderRadius: "50%", background: "radial-gradient(circle, rgba(167,139,250,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", width: "100%", paddingTop: 96, paddingBottom: 64, position: "relative", zIndex: 1 }}>
        <div className="hero-grid">
          {/* Left */}
          <div>
            {/* Eyebrow */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "6px 14px", borderRadius: 100, marginBottom: 28,
              background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.25)",
            }}>
              <span className="pulse-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--accent-2)", display: "inline-block" }} />
              <span className="mono" style={{ fontSize: 10.5, letterSpacing: "0.12em", color: "var(--accent-2)", textTransform: "uppercase" }}>
                Software Developer • Builder • Problem Solver
              </span>
            </div>

            {/* Headline */}
            <h1 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(36px, 4.5vw, 62px)", fontWeight: 800, lineHeight: 1.08, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 24 }}>
              Building digital{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                experiences
              </span>{" "}
              that are fast, useful &amp;{" "}
              <span style={{ color: "var(--accent-2)" }}>beautifully</span>{" "}
              engineered.
            </h1>

            {/* Typewriter role */}
            <div style={{ marginBottom: 20, height: 28 }}>
              <span className="mono" style={{ fontSize: 14, color: "var(--accent)" }}>
                &gt; {role}<span className="cursor">|</span>
              </span>
            </div>

            {/* Paragraph */}
            <p style={{ fontSize: 16, lineHeight: 1.75, color: "var(--text-2)", maxWidth: 500, marginBottom: 36 }}>
              I&apos;m Abhishek Anand, a software developer passionate about building modern web
              applications, solving real-world problems, and continuously learning new technologies.
            </p>

            {/* CTAs */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: 14, marginBottom: 36 }}>
              <button
                className="btn-primary"
                onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}
              >
                View My Work <IconArrowRight />
              </button>
              <button
                className="btn-secondary"
                onClick={() => document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" })}
              >
                Let&apos;s Connect
              </button>
            </div>

            {/* Availability */}
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
              <span style={{ fontSize: 13, color: "var(--text-2)" }}>Available for opportunities</span>
            </div>
          </div>

          {/* Right */}
          <HeroTerminal />
        </div>

        {/* Scroll hint */}
        <div style={{ textAlign: "center", marginTop: 56, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, opacity: 0.4 }}>
          <span className="mono" style={{ fontSize: 10, letterSpacing: "0.18em", color: "var(--text-3)", textTransform: "uppercase" }}>Scroll to explore</span>
          <div style={{ width: 1, height: 40, background: "linear-gradient(to bottom, var(--text-3), transparent)" }} />
        </div>
      </div>
    </section>
  );
}

// ─── Stats ────────────────────────────────────────────────────────────────────

function Stats() {
  return (
    <section style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "52px 40px" }}>
        <div className="stats-grid">
          {STATS.map((s, i) => (
            <FadeIn key={i} delay={i * 80}>
              <div style={{ textAlign: "center", padding: "0 20px" }}>
                <p style={{
                  fontFamily: "Manrope, sans-serif", fontSize: "clamp(36px, 4vw, 52px)", fontWeight: 800,
                  letterSpacing: "-0.04em", lineHeight: 1, marginBottom: 8,
                  backgroundImage: "linear-gradient(135deg, #f0f0f5 0%, #818cf8 100%)",
                  WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text",
                }}>{s.value}</p>
                <p style={{ fontSize: 13, color: "var(--text-3)", letterSpacing: "0.02em" }}>{s.label}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ────────────────────────────────────────────────────────────────────

function About() {
  return (
    <section id="about" style={{ background: "var(--bg)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "40%", right: "-5%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <FadeIn>
          <p className="section-label" style={{ marginBottom: 16 }}>// about_me</p>
        </FadeIn>

        <div className="about-grid">
          <FadeIn>
            {/* Profile photo */}
            <div style={{ marginBottom: 36 }}>
              <div style={{
                display: "inline-block", position: "relative",
              }}>
                {/* Decorative ring */}
                <div style={{
                  position: "absolute", inset: -6,
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, rgba(184,150,90,0.6), rgba(192,83,58,0.35), rgba(18,16,14,0.4))",
                  zIndex: 0,
                }} />
                <div style={{
                  position: "absolute", inset: -3,
                  borderRadius: "50%",
                  background: "var(--bg)",
                  zIndex: 1,
                }} />
                <img
                  src={profilePhoto}
                  alt="Abhishek Anand"
                  style={{
                    width: 120, height: 120,
                    borderRadius: "50%",
                    objectFit: "cover",
                    objectPosition: "top",
                    display: "block",
                    position: "relative", zIndex: 2,
                    boxShadow: "0 8px 32px rgba(67,56,202,0.18)",
                  }}
                />
                {/* Online badge */}
                <div style={{
                  position: "absolute", bottom: 6, right: 6, zIndex: 3,
                  width: 16, height: 16, borderRadius: "50%",
                  background: "#16a34a",
                  border: "2px solid var(--bg)",
                  boxShadow: "0 0 8px rgba(22,163,74,0.5)",
                }} />
              </div>
            </div>

            <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(30px, 3.5vw, 48px)", fontWeight: 800, lineHeight: 1.15, letterSpacing: "-0.03em", color: "var(--text)" }}>
              Turning ideas into{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg, #b8965a, #c0533a)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                reliable digital
              </span>{" "}
              products.
            </h2>
          </FadeIn>

          <div>
            <FadeIn delay={100}>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-2)", marginBottom: 18 }}>
                I&apos;m a BTech CSE (AI &amp; Data Science) student at NIIT University, passionate about technology, software development, and building solutions that solve real-world problems.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-2)", marginBottom: 18 }}>
                My interests span Python, Data Structures &amp; Algorithms, web development, AI &amp; Data Science, and I enjoy turning ideas into working projects—from designing user-friendly interfaces to developing the logic and functionality behind them.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-2)", marginBottom: 18 }}>
                I&apos;ve worked on projects involving AI-powered platforms, automation, dashboards, and smart systems, and I&apos;ve also participated in hackathons where I&apos;ve learned to build, test, and improve solutions under real-world constraints.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-2)", marginBottom: 18 }}>
                I believe the best way to grow as a developer is to keep learning, experiment with new technologies, and build consistently. Every project gives me an opportunity to learn something new and become a better problem solver.
              </p>
              <p style={{ fontSize: 15, lineHeight: 1.8, color: "var(--text-2)", marginBottom: 28 }}>
                Currently, I&apos;m focused on strengthening my technical skills, building meaningful projects, and growing into a well-rounded software developer.
              </p>

              <p className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 12, letterSpacing: "0.08em" }}>// currently_learning</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {LEARNING_TAGS.map(t => (
                  <span key={t} className="chip">{t}</span>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>

        {/* Terminal */}
        <FadeIn delay={150} className="mt-14">
          <div className="terminal-snippet">
            <div className="terminal-bar">
              <div className="dot" style={{ background: "#f43f5e" }} />
              <div className="dot" style={{ background: "#f59e0b" }} />
              <div className="dot" style={{ background: "#10b981" }} />
              <span className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginLeft: 8 }}>~/profile.json</span>
            </div>
            <div style={{ padding: "18px 22px" }} className="mono">
              {[
                ["{", "#e2e8f0", 0],
                ['"focus": "Full-Stack Web Development",', "#a5b4fc", 1],
                ['"approach": "Learn, Build, Iterate",', "#fbbf24", 1],
                ['"goal": "Ship meaningful software",', "#86efac", 1],
                ['"tools": ["React", "Node.js", "Java", "SQL"],', "#a5b4fc", 1],
                ['"mindset": "Always curious"', "#f0f0f5", 1],
                ["}", "#e2e8f0", 0],
              ].map(([t, c, i], idx) => (
                <div key={idx} style={{ fontSize: 12, lineHeight: 1.9, color: c as string, paddingLeft: (i as number) * 16 }}>{t as string}</div>
              ))}
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}

// ─── Skills ───────────────────────────────────────────────────────────────────

function Skills() {
  return (
    <section id="skills" style={{ background: "var(--bg-2)", padding: "100px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <FadeIn>
          <p className="section-label" style={{ marginBottom: 16 }}>// tech_stack</p>
          <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Tech Stack
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 56 }}>
            Technologies I work with regularly, grouped by domain.
          </p>
        </FadeIn>

        <div className="skills-grid">
          {SKILLS.map((cat, ci) => (
            <FadeIn key={cat.category} delay={ci * 90}>
              <div className="skill-category-card">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 3, height: 20, borderRadius: 2, background: cat.color }} />
                  <p className="mono" style={{ fontSize: 11, color: cat.color, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600 }}>
                    {cat.category}
                  </p>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {cat.items.map(item => (
                    <div key={item.name} className="skill-item">
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div className="skill-icon" style={{ borderColor: `${cat.color}30`, color: cat.color }}>{TECH_ICONS[item.name] ?? item.name[0]}</div>
                        <span style={{ fontSize: 14, fontWeight: 500, color: "var(--text)" }}>{item.name}</span>
                      </div>
                      <span className="chip" style={{ fontSize: 10 }}>{item.tag}</span>
                    </div>
                  ))}
                </div>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Projects ─────────────────────────────────────────────────────────────────

function ProjectCard({ p, reverse }: { p: (typeof PROJECTS)[0]; reverse?: boolean }) {
  const [hovered, setHovered] = useState(false);
  return (
    <FadeIn>
      <div
        className="project-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ borderColor: hovered ? `${p.accent}50` : "var(--border)", boxShadow: hovered ? `0 24px 80px ${p.accent}12` : "none" }}
      >
        <div className={`project-inner ${reverse ? "project-reverse" : ""}`}>
          {/* Code mockup */}
          <div
            className="project-visual"
            style={{ background: `linear-gradient(135deg, ${p.accent}0d 0%, var(--bg-2) 100%)` }}
          >
            <div
              style={{
                width: "100%", maxWidth: 320, borderRadius: 14,
                background: "var(--surface)", border: `1px solid ${p.accent}30`,
                overflow: "hidden",
                transform: hovered ? "scale(1.025) translateY(-3px)" : "scale(1)",
                transition: "transform 0.4s ease",
                boxShadow: hovered ? `0 16px 48px ${p.accent}20` : "none",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", background: "var(--bg-2)", borderBottom: "1px solid var(--border)" }}>
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#f43f5e" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#f59e0b" }} />
                <div style={{ width: 9, height: 9, borderRadius: "50%", background: "#10b981" }} />
                <span className="mono" style={{ fontSize: 10, color: "var(--text-3)", marginLeft: 6 }}>
                  {p.name.toLowerCase().replace(/ /g, "-")}.tsx
                </span>
              </div>
              <div style={{ padding: "14px 16px" }}>
                {p.codeLines.map((l, i) => (
                  <div key={i} className="mono" style={{ fontSize: 11, lineHeight: "1.85", color: l.color }}>{l.text || " "}</div>
                ))}
              </div>
            </div>

            {/* Accent bar */}
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${p.accent}, transparent)` }} />
          </div>

          {/* Content */}
          <div className="project-content">
            <div className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 6 }}>Project {p.id}</div>
            <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(22px, 2.5vw, 28px)", fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text)", marginBottom: 6 }}>
              {p.name}
            </h3>
            <p style={{ fontSize: 13, fontStyle: "italic", color: p.accent, marginBottom: 14, fontFamily: "Manrope, sans-serif" }}>
              {p.tagline}
            </p>
            <p style={{ fontSize: 14, lineHeight: 1.75, color: "var(--text-2)", marginBottom: 20 }}>
              {p.desc}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginBottom: 24 }}>
              {p.tags.map(t => (
                <span key={t} className="chip chip-accent" style={{ borderColor: `${p.accent}40`, color: p.accent, background: `${p.accent}10` }}>{t}</span>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              <a href={p.repo} target="_blank" rel="noopener noreferrer" className="btn-ghost"><IconGithub size={13} /> GitHub</a>
              {p.live && (
                <a href={p.live} target="_blank" rel="noopener noreferrer" className="btn-ghost"><IconExternal size={13} /> Live Demo</a>
              )}
            </div>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

function Projects() {
  return (
    <section id="projects" style={{ background: "var(--bg)", padding: "100px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <FadeIn>
          <p className="section-label" style={{ marginBottom: 16 }}>// selected_projects</p>
          <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 8 }}>
            Selected Projects
          </h2>
          <p style={{ fontSize: 15, color: "var(--text-2)", marginBottom: 56, maxWidth: 520 }}>
            Some things I&apos;ve built while turning ideas into working products.
          </p>
        </FadeIn>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {PROJECTS.map((p, i) => (
            <ProjectCard key={`proj-${p.id}`} p={p} reverse={i % 2 !== 0} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Experience ───────────────────────────────────────────────────────────────

function Experience() {
  return (
    <section id="experience" style={{ background: "var(--bg-2)", padding: "100px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div className="exp-grid">
          {/* Timeline */}
          <div>
            <FadeIn>
              <p className="section-label" style={{ marginBottom: 16 }}>// journey</p>
              <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(28px, 3vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 52 }}>
                My Journey
              </h2>
            </FadeIn>

            <div style={{ position: "relative", paddingLeft: 28 }}>
              <div style={{ position: "absolute", left: 0, top: 6, bottom: 6, width: 1, background: "linear-gradient(to bottom, var(--accent), rgba(99,102,241,0.1))" }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 40 }}>
                {TIMELINE.map((item, i) => (
                  <FadeIn key={i} delay={i * 100}>
                    <div style={{ position: "relative" }} className="timeline-item">
                      <div style={{
                        position: "absolute", left: -34, top: 4, width: 13, height: 13, borderRadius: "50%",
                        background: item.active ? ((item as any).tagColor ?? "var(--accent)") : "var(--bg-2)",
                        border: `2px solid ${item.active ? ((item as any).tagColor ?? "var(--accent)") : "var(--text-3)"}`,
                        boxShadow: item.active ? `0 0 16px ${((item as any).tagColor ?? "rgba(99,102,241,0.6)")}88` : "none",
                        transition: "all 0.2s",
                      }} />
                      <div className="mono" style={{ fontSize: 11, color: "var(--accent-2)", marginBottom: 6, letterSpacing: "0.06em" }}>{item.year}</div>
                      <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 17, fontWeight: 700, color: "var(--text)", marginBottom: 8 }}>{item.title}</h3>
                      {"tag" in item && item.tag && (
                        <span style={{
                          display: "inline-block", marginBottom: 8,
                          padding: "2px 9px", borderRadius: 20,
                          background: `${(item as any).tagColor}18`,
                          border: `1px solid ${(item as any).tagColor}40`,
                          color: (item as any).tagColor,
                          fontSize: 10.5, fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 600, letterSpacing: "0.06em",
                        }}>{item.tag}</span>
                      )}
                      <p style={{ fontSize: 14, lineHeight: 1.7, color: "var(--text-2)" }}>{item.desc}</p>
                    </div>
                  </FadeIn>
                ))}
              </div>
            </div>
          </div>

          {/* University Projects */}
          <div style={{ gridColumn: "1 / -1", marginTop: 64 }}>
            <FadeIn>
              <p className="section-label" style={{ marginBottom: 16 }}>// university.projects</p>
              <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(22px, 2.5vw, 32px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 32 }}>
                Projects at NIIT University
              </h2>
            </FadeIn>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(480px, 1fr))", gap: 24 }}>
              {[
                {
                  num: "01", title: "Ecosphere-X", subtitle: "Renewable Energy-Backed Microplanning",
                  domain: "Fintech & CleanTech", role: "Project Manager & System Developer",
                  accent: "#10b981",
                  summary: "Engineered an IoT-based performance tracking and microplanning platform to de-risk agricultural clean energy loans and curb defaults caused by premature hardware failure.",
                  points: [
                    "Integrated ESP32 microcontrollers with voltage, current, temperature, and irradiance sensors for real-time asset telemetry.",
                    "Developed a cloud data pipeline and live monitoring dashboard on ThingSpeak to stream system health and power usage metrics.",
                    "Researched viable hardware alternatives, incorporating LiFePO4 battery storage and perovskite photovoltaic cells to improve asset longevity.",
                  ],
                  stack: ["ESP32", "IoT Sensors", "ThingSpeak API", "LiFePO4", "C++", "CleanTech"],
                },
                {
                  num: "02", title: "Smart Fertilizer Micro Dosing Robot", subtitle: "Autonomous Agricultural Rover",
                  domain: "AgriTech & Autonomous Robotics", role: "Robotics Design & Embedded Hardware Contributor",
                  accent: "#38bdf8",
                  summary: "Designed an autonomous tracked agricultural rover applying high-precision micro-doses of fertilizer directly to plant root zones to eliminate runoff and minimize input waste.",
                  points: [
                    "Drafted CAD chassis schematics and integrated dual-crawler rubber track mechanisms for rough field navigation.",
                    "Integrated a dual-controller setup (Arduino Uno & Raspberry Pi) to coordinate NEMA17 stepper motors and precision dosing pumps.",
                    "Built an integrated sensor array incorporating DHT22, soil pH sensors, HC-SR04 ultrasonic modules, and GPS for targeted application.",
                  ],
                  stack: ["Arduino Uno", "Raspberry Pi", "NEMA17 Steppers", "Soil pH Sensors", "Ultrasonic", "CAD/AutoCAD"],
                },
                {
                  num: "03", title: "AutoPluck", subtitle: "Smart Farm Bot with Navigation & Harvesting",
                  domain: "Edge Robotics & AgriTech", role: "Project Lead & Robotics Engineer",
                  accent: "#a78bfa",
                  summary: "Built an integrated autonomous agricultural bot equipped with line tracking, dynamic obstacle detection, and automated plucking actuation.",
                  points: [
                    "Engineered an autonomous line-following guidance loop coupled with active obstacle avoidance.",
                    "Designed and calibrated a robotic plucking mechanism for non-destructive crop harvesting.",
                    "Implemented IoT edge telemetry to transmit live operational status to a central web monitoring interface.",
                  ],
                  stack: ["Autonomous Navigation", "Line Followers", "Robotic Actuators", "Edge Microcontrollers", "IoT Web Interface"],
                },
                {
                  num: "04", title: "Vasus Brakes", subtitle: "Industrial Strategy & Automation Modernization",
                  domain: "Industrial Manufacturing & Process Optimization", role: "Project Contributor & Industrial Strategy Analyst",
                  accent: "#fb923c",
                  summary: "Conducted operational and technological benchmarking for Vasus Brakes' four-pillar rubber compression molding machines producing EV brake components.",
                  points: [
                    "Performed competitor benchmarking against major hydraulic press manufacturers (Mech EX, J.R.D, Hydromac) covering tonnage capacity and PLC automation levels.",
                    "Analyzed operational bottlenecks in the compression molding cycle and formulated solutions for automated cycle timing and digital quality logging.",
                    "Built a phased strategic modernization roadmap spanning ARAI compliance, digital presence, and shop-floor automation integration.",
                  ],
                  stack: ["Industrial Process Optimization", "Rubber Compression Molding", "Competitor Benchmarking", "Industrial Automation Roadmap"],
                },
              ].map((p, i) => (
                <FadeIn key={`uni-${p.num}`} delay={i * 80}>
                  <div style={{
                    background: "#1e293b", border: "1px solid #334155", borderRadius: 16,
                    padding: 28, display: "flex", flexDirection: "column", gap: 18,
                    borderTop: `3px solid ${p.accent}`,
                    transition: "transform 0.2s, box-shadow 0.2s",
                  }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(-4px)";
                      (e.currentTarget as HTMLElement).style.boxShadow = `0 16px 48px rgba(0,0,0,0.35), 0 0 0 1px ${p.accent}33`;
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.transform = "translateY(0)";
                      (e.currentTarget as HTMLElement).style.boxShadow = "none";
                    }}
                  >
                    {/* Header row */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                      <div>
                        <span style={{
                          display: "inline-block", padding: "3px 10px", borderRadius: 20,
                          background: `${p.accent}18`, border: `1px solid ${p.accent}40`,
                          color: p.accent, fontSize: 10.5, fontFamily: "JetBrains Mono, monospace",
                          fontWeight: 600, letterSpacing: "0.08em", marginBottom: 10,
                        }}>PROJECT {p.num}</span>
                        <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 18, fontWeight: 800, color: "#f1f5f9", marginBottom: 4, letterSpacing: "-0.02em" }}>{p.title}</h3>
                        <p style={{ fontSize: 12.5, color: "#94a3b8", fontStyle: "italic" }}>{p.subtitle}</p>
                      </div>
                      <span style={{
                        flexShrink: 0, padding: "4px 10px", borderRadius: 6,
                        background: "rgba(255,255,255,0.04)", border: "1px solid #334155",
                        fontSize: 10.5, color: "#64748b", fontFamily: "JetBrains Mono, monospace",
                        whiteSpace: "nowrap",
                      }}>{p.domain}</span>
                    </div>

                    {/* Role */}
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 3, height: 3, borderRadius: "50%", background: p.accent, flexShrink: 0 }} />
                      <span style={{ fontSize: 12.5, color: "#94a3b8", fontWeight: 500 }}>{p.role}</span>
                    </div>

                    {/* Summary */}
                    <p style={{ fontSize: 13.5, color: "#cbd5e1", lineHeight: 1.75, borderLeft: `2px solid ${p.accent}50`, paddingLeft: 14 }}>{p.summary}</p>

                    {/* Bullets */}
                    <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
                      {p.points.map((pt, j) => (
                        <li key={j} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ color: p.accent, fontSize: 12, marginTop: 3, flexShrink: 0 }}>▸</span>
                          <span style={{ fontSize: 13, color: "#94a3b8", lineHeight: 1.65 }}>{pt}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Tech stack chips */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 6, paddingTop: 4, borderTop: "1px solid #1e3a4a" }}>
                      {p.stack.map(s => (
                        <span key={s} style={{
                          padding: "3px 9px", borderRadius: 5,
                          background: "rgba(255,255,255,0.04)", border: "1px solid #334155",
                          fontSize: 11, color: "#64748b", fontFamily: "JetBrains Mono, monospace",
                        }}>{s}</span>
                      ))}
                    </div>
                  </div>
                </FadeIn>
              ))}
            </div>
          </div>

          {/* Education + Repos */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {/* Education */}
            <FadeIn delay={80}>
              <p className="section-label" style={{ marginBottom: 16 }}>// education</p>
              <div className="card">
                <div style={{ width: 46, height: 46, borderRadius: 13, background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.25)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22, marginBottom: 18 }}>🎓</div>
                <p className="mono" style={{ fontSize: 11, color: "var(--text-3)", marginBottom: 4 }}>B.Tech · CSE (AI &amp; Data Science)</p>
                <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 4 }}>NIIT University</h3>
                <p style={{ fontSize: 14, color: "var(--text-2)", marginBottom: 16 }}>Neemrana, Rajasthan · India</p>
                <div style={{ display: "flex", gap: 8 }}>
                  <span className="chip">2025 – 2029</span>
                  <span className="chip chip-accent">In Progress</span>
                </div>
              </div>
            </FadeIn>

            {/* GitHub section */}
            <FadeIn delay={120}>
              <div className="card">
                <p className="section-label" style={{ marginBottom: 14 }}>// code.build.repeat</p>
                <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 6 }}>Code. Build. Repeat.</h3>
                <p style={{ fontSize: 13, color: "var(--text-2)", marginBottom: 18 }}>Consistently pushing commits and shipping projects.</p>

                {/* Contrib graph */}
                <div style={{ overflowX: "auto" }}>
                  <div style={{ display: "flex", gap: 3 }}>
                    {CONTRIB.map((week, wi) => (
                      <div key={wi} style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                        {week.map((val, di) => (
                          <div
                            key={di}
                            style={{
                              width: 10, height: 10, borderRadius: 2.5,
                              background: C_COLORS[val], cursor: "pointer",
                              transition: "transform 0.12s",
                            }}
                            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1.4)"; }}
                            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = "scale(1)"; }}
                            title={`${val} contribution${val !== 1 ? "s" : ""}`}
                          />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>Less</span>
                    {C_COLORS.map((c, i) => <div key={i} style={{ width: 10, height: 10, borderRadius: 2, background: c }} />)}
                    <span style={{ fontSize: 11, color: "var(--text-3)" }}>More</span>
                  </div>
                  <a href="https://github.com/anandabhishek24365-design?tab=repositories" target="_blank" rel="noopener noreferrer" className="btn-ghost" style={{ fontSize: 12, padding: "5px 12px" }}>
                    <IconGithub size={13} /> View GitHub
                  </a>
                </div>
              </div>
            </FadeIn>

            {/* Repo cards */}
            <FadeIn delay={160}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                {REPOS.map(r => (
                  <a
                    key={r.name}
                    href={`https://github.com/anandabhishek24365-design/${r.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="repo-card"
                    style={{ textDecoration: "none" }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <IconGithub size={13} />
                      <span style={{ fontSize: 12, fontWeight: 600, color: "var(--accent-2)", fontFamily: "JetBrains Mono, monospace" }}>{r.name}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-2)", lineHeight: 1.5, marginBottom: 12 }}>{r.desc}</p>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                        <div style={{ width: 9, height: 9, borderRadius: "50%", background: r.color }} />
                        <span style={{ fontSize: 11, color: "var(--text-3)" }}>{r.lang}</span>
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-3)" }}>
                        <IconStar /> {r.stars}
                      </span>
                      <span style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 11, color: "var(--text-3)" }}>
                        <IconFork /> {r.forks}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Contact ──────────────────────────────────────────────────────────────────

type FormState = "idle" | "sending" | "success" | "error";

function Contact() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<FormState>("idle");
  const [submitError, setSubmitError] = useState("");

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = "Name is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Valid email required";
    if (!form.subject.trim()) e.subject = "Subject is required";
    if (form.message.length < 20) e.message = "Message must be at least 20 characters";
    return e;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setSubmitError("");
    setStatus("sending");

    try {
      await sendContactMessage(form);
      setStatus("success");
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error) {
      console.error("Unable to send contact form to Supabase", error);
      setStatus("error");
      setSubmitError(error instanceof Error ? error.message : "Unable to send your message right now.");
    }
  };

  return (
    <section id="contact" style={{ background: "var(--bg)", padding: "100px 0", position: "relative", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: "30%", left: "50%", transform: "translateX(-50%)", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)", pointerEvents: "none" }} />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 40px", position: "relative", zIndex: 1 }}>
        <FadeIn>
          <div style={{ textAlign: "center", marginBottom: 60 }}>
            <p className="section-label" style={{ marginBottom: 16 }}>// contact</p>
            <h2 style={{ fontFamily: "Manrope, sans-serif", fontSize: "clamp(32px, 4vw, 56px)", fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text)", marginBottom: 16 }}>
              Have an idea?{" "}
              <span style={{ backgroundImage: "linear-gradient(135deg, #818cf8, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                Let&apos;s build it.
              </span>
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-2)", maxWidth: 460, margin: "0 auto" }}>
              I&apos;m always interested in learning, collaborating, and building meaningful digital products.
            </p>
          </div>
        </FadeIn>

        <div className="contact-grid">
          {/* Contact methods — Logo Buttons Only */}
          <FadeIn>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <div>
                <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 18, fontWeight: 700, color: "var(--text)", marginBottom: 16 }}>
                  Get in Touch
                </h3>

                <div style={{ display: "flex", flexDirection: "column", gap: 14, alignItems: "flex-start" }}>
                  {[
                    { icon: <IconMail size={22} />, label: "Email", href: "mailto:anandabhishek24365@gmail.com", color: "#ea4335", bg: "rgba(234,67,53,0.08)", border: "rgba(234,67,53,0.25)" },
                    { icon: <IconLinkedin size={22} />, label: "LinkedIn", href: "https://www.linkedin.com/in/abhishek-anand-49724236a/", color: "#0a66c2", bg: "rgba(10,102,194,0.08)", border: "rgba(10,102,194,0.25)" },
                    { icon: <IconGithub size={22} />, label: "GitHub", href: "https://github.com/anandabhishek24365-design", color: "#818cf8", bg: "rgba(129,140,248,0.08)", border: "rgba(129,140,248,0.25)" },
                  ].map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      title={item.label}
                      aria-label={item.label}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 56,
                        height: 56,
                        borderRadius: 14,
                        background: item.bg,
                        border: `1px solid ${item.border}`,
                        color: item.color,
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                        transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                        cursor: "pointer",
                        textDecoration: "none",
                      }}
                      onMouseEnter={e => {
                        const el = e.currentTarget;
                        el.style.transform = "translateY(-4px) scale(1.08)";
                        el.style.boxShadow = `0 10px 24px -4px ${item.color}40`;
                        el.style.background = item.color;
                        el.style.color = "#ffffff";
                      }}
                      onMouseLeave={e => {
                        const el = e.currentTarget;
                        el.style.transform = "none";
                        el.style.boxShadow = "0 4px 12px rgba(0,0,0,0.05)";
                        el.style.background = item.bg;
                        el.style.color = item.color;
                      }}
                    >
                      {item.icon}
                    </a>
                  ))}
                </div>
              </div>

              <div className="card" style={{ marginTop: 10 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                  <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: "50%", background: "#10b981", display: "inline-block" }} />
                  <p style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>Available for opportunities</p>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-2)" }}>Open to internships, freelance projects, and full-time roles.</p>
              </div>
            </div>
          </FadeIn>

          {/* Form */}
          <FadeIn delay={100}>
            <div className="card" style={{ padding: 36 }}>
              {status === "success" ? (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: 16, padding: "48px 0" }}>
                  <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>✓</div>
                  <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>Message sent successfully!</h3>
                  <p style={{ fontSize: 14, color: "var(--text-2)" }}>Thanks for reaching out. I&apos;ll get back to you soon.</p>
                  <button className="btn-secondary" style={{ marginTop: 8 }} onClick={() => setStatus("idle")}>Send another</button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {[
                      { field: "name" as const, label: "Name", placeholder: "Abhishek Anand", type: "text" },
                      { field: "email" as const, label: "Email", placeholder: "you@example.com", type: "email" },
                    ].map(f => (
                      <div key={f.field}>
                        <label className="form-label">{f.label}</label>
                        <input
                          type={f.type}
                          className="form-input"
                          placeholder={f.placeholder}
                          value={form[f.field]}
                          onChange={e => setForm({ ...form, [f.field]: e.target.value })}
                          style={errors[f.field] ? { borderColor: "var(--error)" } : {}}
                        />
                        {errors[f.field] && <p className="form-error">{errors[f.field]}</p>}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label className="form-label">Subject</label>
                    <input
                      className="form-input"
                      placeholder="Let's work together"
                      value={form.subject}
                      onChange={e => setForm({ ...form, subject: e.target.value })}
                      style={errors.subject ? { borderColor: "var(--error)" } : {}}
                    />
                    {errors.subject && <p className="form-error">{errors.subject}</p>}
                  </div>
                  <div style={{ marginBottom: 24 }}>
                    <label className="form-label">Message</label>
                    <textarea
                      className="form-input form-textarea"
                      placeholder="Tell me about your project or idea..."
                      rows={5}
                      value={form.message}
                      onChange={e => setForm({ ...form, message: e.target.value })}
                      style={errors.message ? { borderColor: "var(--error)" } : {}}
                    />
                    {errors.message && <p className="form-error">{errors.message}</p>}
                  </div>
                  <button type="submit" className="btn-primary" style={{ width: "100%", justifyContent: "center" }} disabled={status === "sending"}>
                    {status === "sending" ? (
                      <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" style={{ animation: "spin 0.8s linear infinite" }}>
                          <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" strokeDasharray="24" strokeLinecap="round" />
                        </svg>
                        Sending…
                      </span>
                    ) : <>Send Message <IconArrowRight /></>}
                  </button>
                  {status === "error" && (
                    <p className="form-error" style={{ marginTop: 12, textAlign: "center" }}>
                      {submitError || "Unable to send your message right now. Please try again."}
                    </p>
                  )}
                </form>
              )}
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer() {
  const [show, setShow] = useState(false);
  useEffect(() => {
    const fn = () => setShow(window.scrollY > 500);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <footer style={{ background: "var(--bg-2)", borderTop: "1px solid var(--border)", padding: "32px 0" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px" }}>
        <div className="footer-inner">
          <p style={{ fontSize: 13, color: "var(--text-3)" }}>© 2026 Abhishek Anand</p>
          <p className="mono" style={{ fontSize: 12, color: "var(--text-3)" }}>Built with curiosity &amp; code.</p>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            {[
              { icon: <IconGithub size={17} />, label: "GitHub" },
              { icon: <IconLinkedin size={17} />, label: "LinkedIn" },
              { icon: <IconMail size={17} />, label: "Email" },
            ].map(item => (
              <a key={item.label} href="#" aria-label={item.label} className="footer-icon">{item.icon}</a>
            ))}
          </div>
        </div>
      </div>

      {/* Back to top */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
        aria-label="Back to top"
        style={{
          position: "fixed", bottom: 32, right: 32, zIndex: 50,
          width: 42, height: 42, borderRadius: 12,
          background: "var(--accent)",
          border: "none", cursor: "pointer", color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: "0 4px 24px rgba(99,102,241,0.45)",
          opacity: show ? 1 : 0, pointerEvents: show ? "auto" : "none",
          transform: show ? "translateY(0)" : "translateY(12px)",
          transition: "all 0.3s ease",
        }}
      >
        <IconChevronUp size={17} />
      </button>
    </footer>
  );
}

// ─── Geometric background ─────────────────────────────────────────────────────

function GeometricBackground() {
  const shapes = [
    // hexagons
    { type: "hex",  x: "6%",  y: "10%", size: 130, color: "rgba(184,150,90,0.06)",  stroke: "rgba(184,150,90,0.2)",   anim: "geo-drift-a 28s ease-in-out infinite" },
    { type: "hex",  x: "86%", y: "15%", size: 90,  color: "rgba(192,83,58,0.05)",   stroke: "rgba(192,83,58,0.18)",   anim: "geo-drift-b 34s ease-in-out infinite 4s" },
    { type: "hex",  x: "72%", y: "70%", size: 110, color: "rgba(18,16,14,0.03)",    stroke: "rgba(18,16,14,0.1)",     anim: "geo-drift-c 30s ease-in-out infinite 2s" },
    { type: "hex",  x: "16%", y: "76%", size: 65,  color: "rgba(184,150,90,0.04)",  stroke: "rgba(184,150,90,0.14)",  anim: "geo-drift-a 38s ease-in-out infinite 7s" },
    { type: "tri",  x: "50%", y: "6%",  size: 95,  color: "rgba(192,83,58,0.04)",   stroke: "rgba(192,83,58,0.18)",   anim: "geo-drift-b 22s ease-in-out infinite 1s" },
    { type: "tri",  x: "3%",  y: "48%", size: 75,  color: "rgba(184,150,90,0.04)",  stroke: "rgba(184,150,90,0.16)",  anim: "geo-drift-c 32s ease-in-out infinite 3s" },
    { type: "tri",  x: "91%", y: "53%", size: 60,  color: "rgba(18,16,14,0.03)",    stroke: "rgba(18,16,14,0.1)",     anim: "geo-drift-a 24s ease-in-out infinite 9s" },
    { type: "circ", x: "36%", y: "83%", size: 160, color: "transparent",            stroke: "rgba(184,150,90,0.1)",   anim: "geo-pulse 9s ease-in-out infinite" },
    { type: "circ", x: "63%", y: "33%", size: 220, color: "transparent",            stroke: "rgba(18,16,14,0.05)",    anim: "geo-pulse 13s ease-in-out infinite 3s" },
    { type: "circ", x: "20%", y: "28%", size: 65,  color: "rgba(192,83,58,0.04)",   stroke: "rgba(192,83,58,0.13)",   anim: "geo-drift-b 36s ease-in-out infinite 5s" },
    { type: "dia",  x: "46%", y: "53%", size: 85,  color: "rgba(184,150,90,0.03)",  stroke: "rgba(184,150,90,0.11)",  anim: "geo-drift-c 40s ease-in-out infinite 10s" },
  ];

  const hexPath = (s: number) => {
    const r = s / 2;
    const pts = Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 6;
      return `${r + r * Math.cos(a)},${r + r * Math.sin(a)}`;
    });
    return `M${pts.join("L")}Z`;
  };

  const triPath = (s: number) => `M${s/2},4 L${s-4},${s-4} L4,${s-4}Z`;
  const diaPath = (s: number) => `M${s/2},4 L${s-4},${s/2} L${s/2},${s-4} L4,${s/2}Z`;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none", overflow: "hidden" }}>
      {shapes.map((sh, i) => (
        <div key={i} style={{
          position: "absolute", left: sh.x, top: sh.y,
          width: sh.size, height: sh.size,
          animation: sh.anim,
          willChange: "transform",
        }}>
          <svg width={sh.size} height={sh.size} viewBox={`0 0 ${sh.size} ${sh.size}`} fill="none">
            {sh.type === "hex"  && <path d={hexPath(sh.size)} fill={sh.color} stroke={sh.stroke} strokeWidth="1" />}
            {sh.type === "tri"  && <path d={triPath(sh.size)} fill={sh.color} stroke={sh.stroke} strokeWidth="1" />}
            {sh.type === "dia"  && <path d={diaPath(sh.size)} fill={sh.color} stroke={sh.stroke} strokeWidth="1" />}
            {sh.type === "circ" && <circle cx={sh.size/2} cy={sh.size/2} r={sh.size/2 - 2} fill={sh.color} stroke={sh.stroke} strokeWidth="1" />}
          </svg>
        </div>
      ))}
    </div>
  );
}

// ─── Supabase Messages Modal ──────────────────────────────────────────────────

function MessagesModal({ onClose }: { onClose: () => void }) {
  const [messages, setMessages] = useState<ContactMessageRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadMessages = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchContactMessages();
      setMessages(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load messages from Supabase.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 999990,
        background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)",
        display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%", maxWidth: 680, maxHeight: "85vh",
          background: "#0d0d14", border: "1px solid rgba(99,102,241,0.3)",
          borderRadius: 16, display: "flex", flexDirection: "column",
          overflow: "hidden", boxShadow: "0 20px 50px rgba(0,0,0,0.8)",
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: "20px 24px", borderBottom: "1px solid rgba(255,255,255,0.08)",
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: "rgba(255,255,255,0.02)"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center", color: "#a5b4fc"
            }}>
              <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22,6 12,13 2,6"/>
              </svg>
            </div>
            <div>
              <h3 style={{ fontFamily: "Manrope, sans-serif", fontSize: 16, fontWeight: 700, color: "#f3f4f6", margin: 0 }}>
                Supabase Messages
              </h3>
              <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>
                {messages.length} form submission{messages.length === 1 ? "" : "s"} recorded in database
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={loadMessages}
              disabled={loading}
              title="Refresh messages"
              style={{
                padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(255,255,255,0.1)",
                background: "rgba(255,255,255,0.05)", color: "#d1d5db", fontSize: 12,
                cursor: "pointer", display: "flex", alignItems: "center", gap: 6
              }}
            >
              <svg width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 4 23 10 17 10"/>
                <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
              </svg>
              Refresh
            </button>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none",
                background: "rgba(255,255,255,0.08)", color: "#9ca3af",
                cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center"
              }}
            >
              ✕
            </button>
          </div>
        </div>

        {/* Content body */}
        <div style={{ padding: 24, overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 14 }}>
          {loading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              Loading messages from Supabase...
            </div>
          ) : error ? (
            <div style={{ padding: 20, borderRadius: 10, background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#fca5a5", fontSize: 13 }}>
              {error}
            </div>
          ) : messages.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#9ca3af" }}>
              <p style={{ fontSize: 15, fontWeight: 500, color: "#d1d5db", marginBottom: 6 }}>No messages yet</p>
              <p style={{ fontSize: 13, color: "#6b7280" }}>Submissions from the portfolio Contact form will appear here in real-time.</p>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                style={{
                  padding: 16, borderRadius: 12, background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.07)", display: "flex", flexDirection: "column", gap: 8
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "#f9fafb" }}>{m.name}</span>
                    <a href={`mailto:${m.email}`} style={{ fontSize: 12, color: "#818cf8", textDecoration: "none" }}>
                      &lt;{m.email}&gt;
                    </a>
                  </div>
                  <span style={{ fontSize: 11, fontFamily: "monospace", color: "#6b7280" }}>
                    {new Date(m.created_at).toLocaleString()}
                  </span>
                </div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#e5e7eb", borderBottom: "1px dashed rgba(255,255,255,0.08)", paddingBottom: 6 }}>
                  Subject: {m.subject}
                </div>
                <p style={{ fontSize: 13, color: "#9ca3af", margin: 0, whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                  {m.message}
                </p>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Portfolio tabs shell ─────────────────────────────────────────────────────

const TAB_ICONS: Record<Tab, React.ReactNode> = {
  About: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Skills: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  ),
  Projects: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  ),
  Experience: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  ),
  Contact: (
    <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 2L11 13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  ),
};

// ─── Portfolio tabs shell ─────────────────────────────────────────────────────

function PortfolioTabs({ onLogout, fadeIn }: { onLogout: () => void; fadeIn: boolean }) {
  const [active, setActive] = useState<Tab>("About");
  const [visible, setVisible] = useState<Tab>("About");
  const [animating, setAnimating] = useState(false);
  const [showMessages, setShowMessages] = useState(false);

  const switchTab = (t: Tab) => {
    if (t === active || animating) return;
    setAnimating(true);
    setActive(t);
    setTimeout(() => { setVisible(t); setAnimating(false); }, 220);
  };

  const tabContent: Record<Tab, React.ReactElement> = {
    About:      <About />,
    Skills:     <Skills />,
    Projects:   <Projects />,
    Experience: <Experience />,
    Contact:    <Contact />,
  };

  return (
    <div style={{
      background: "var(--bg)", minHeight: "100vh",
      opacity: fadeIn ? 1 : 0, transition: "opacity 0.6s ease",
      display: "flex", flexDirection: "column",
      position: "relative",
    }}>
      <GeometricBackground />
      {showMessages && <MessagesModal onClose={() => setShowMessages(false)} />}

      {/* ── Dynamic Top Bar ── */}
      <header style={{
        position: "sticky", top: 0, zIndex: 100,
        background: "rgba(250,249,245,0.85)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(18,16,14,0.06)",
        padding: "0 32px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
        height: 68, gap: 20,
      }}>
        {/* Logo & Interactive Avatar */}
        <button
          onClick={() => switchTab("About")}
          style={{
            display: "flex", alignItems: "center", gap: 12,
            background: "none", border: "none", cursor: "pointer", padding: 0, textDecoration: "none"
          }}
        >
          <div
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 50%, #4338ca 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 16, color: "#ffffff",
              boxShadow: "0 0 16px rgba(99,102,241,0.35), inset 0 1px 0 rgba(255,255,255,0.2)",
              transition: "transform 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.08) rotate(-3deg)")}
            onMouseLeave={e => (e.currentTarget.style.transform = "scale(1) rotate(0deg)")}
          >
            A
          </div>
          <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
            <span style={{ fontFamily: "Manrope, sans-serif", fontWeight: 800, fontSize: 15, color: "var(--text)", letterSpacing: "-0.02em", lineHeight: 1.2 }}>
              Abhishek Anand
            </span>
            <span style={{ fontSize: 11, color: "var(--text-3)", fontFamily: "monospace", display: "flex", alignItems: "center", gap: 5, marginTop: 2 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#10b981", boxShadow: "0 0 8px #10b981" }} />
              Available for work
            </span>
          </div>
        </button>

        {/* Dynamic Floating Tab Capsule */}
        <nav style={{
          display: "flex", alignItems: "center", gap: 4,
          padding: "5px 6px", borderRadius: 999,
          background: "rgba(18,16,14,0.04)",
          border: "1px solid rgba(18,16,14,0.08)",
          boxShadow: "inset 0 1px 2px rgba(0,0,0,0.03)",
        }}>
          {TABS.map(t => {
            const isActive = t === active;
            return (
              <button
                key={t}
                onClick={() => switchTab(t)}
                style={{
                  display: "flex", alignItems: "center", gap: 7,
                  padding: "7px 16px", borderRadius: 999, border: "none",
                  fontFamily: "Manrope, sans-serif", fontWeight: isActive ? 700 : 500, fontSize: 13,
                  background: isActive ? "#12100e" : "transparent",
                  color: isActive ? "#ffffff" : "var(--text-2)",
                  boxShadow: isActive ? "0 4px 14px rgba(18,16,14,0.25)" : "none",
                  transition: "all 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
                  cursor: "pointer",
                  letterSpacing: "-0.01em",
                }}
                onMouseEnter={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text)";
                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(18,16,14,0.05)";
                  }
                }}
                onMouseLeave={e => {
                  if (!isActive) {
                    (e.currentTarget as HTMLButtonElement).style.color = "var(--text-2)";
                    (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                  }
                }}
              >
                <span style={{ opacity: isActive ? 1 : 0.7, color: isActive ? "#a5b4fc" : "currentColor", display: "flex", alignItems: "center" }}>
                  {TAB_ICONS[t]}
                </span>
                {t}
              </button>
            );
          })}
        </nav>

        {/* Action Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <button
            onClick={onLogout}
            style={{
              display: "flex", alignItems: "center", gap: 7,
              padding: "8px 16px", borderRadius: 999,
              border: "1px solid rgba(18,16,14,0.12)",
              background: "rgba(255,255,255,0.5)",
              backdropFilter: "blur(8px)",
              color: "var(--text)", fontSize: 12.5,
              fontFamily: "Manrope, sans-serif", fontWeight: 600,
              flexShrink: 0, transition: "all 0.2s ease", cursor: "pointer",
            }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(244,63,94,0.4)";
              el.style.color = "#f43f5e";
              el.style.background = "rgba(244,63,94,0.08)";
              el.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = "rgba(18,16,14,0.12)";
              el.style.color = "var(--text)";
              el.style.background = "rgba(255,255,255,0.5)";
              el.style.transform = "none";
            }}
          >
            <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </header>

      {/* ── Tab content panel ── */}
      <main style={{ flex: 1, overflow: "auto", position: "relative", zIndex: 1 }}>
        <div style={{
          opacity: animating ? 0 : 1,
          transform: animating ? "translateY(10px)" : "translateY(0)",
          transition: "opacity 0.22s ease, transform 0.22s ease",
        }}>
          {tabContent[visible]}
        </div>
      </main>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────

export default function App() {
  const [authed, setAuthed] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  const handleLogin = () => {
    setTimeout(() => {
      setAuthed(true);
      requestAnimationFrame(() => setTimeout(() => setFadeIn(true), 40));
    }, 300);
  };

  const handleLogout = () => {
    setFadeIn(false);
    setTimeout(() => {
      setAuthed(false);
      window.scrollTo({ top: 0 });
    }, 400);
  };

  if (!authed) return <LoginPage onLogin={handleLogin} />;

  return (
    <>
    <CustomCursor />
    <PortfolioTabs onLogout={handleLogout} fadeIn={fadeIn} />
    </>
  );
}
