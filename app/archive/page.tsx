"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Music, Play, Pause, X, MapPin, Calendar, Clock, Activity, ShieldAlert, Orbit, Trash2 } from "lucide-react";
import Link from "next/link";
import { sysAudio } from "@/lib/audio-engine";

/* ─── DATA MODELS ─── */
interface PolaroidMemory {
  title: string;
  image: string;
  date: string;
  location: string;
  coordinates: string;
  lore: string;
  whyItMattered: string;
}

interface EraData {
  version: string;
  title: string;
  subtitle: string;
  dates: string;
  status: string;
  focus: string;
  gradientClass: string; // Dynamic grainy gradient
  soundtrack: {
    title: string;
    artist: string;
  };
  memories: PolaroidMemory[];
}

const ERAS: EraData[] = [
  {
    version: "v1.0",
    title: "Foundation Era",
    subtitle: "Ahmedabad Schooling & Early Focus",
    dates: "2006 — 2022",
    status: "ARCHIVED // BUILD_STABLE",
    focus: "Visual framing, physics curiosity, initial mechanical fascination",
    gradientClass: "from-slate-900 via-neutral-950 to-zinc-900",
    soundtrack: {
      title: "Fix You",
      artist: "Coldplay"
    },
    memories: [
      {
        title: "First Camera Focus",
        image: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=600&auto=format&fit=crop",
        date: "14 Oct 2018",
        location: "Ahmedabad, India",
        coordinates: "23.0225° N, 72.5714° E",
        lore: "Taking hands on a crop-sensor DSLR body. Spending hours learning how to control aperture and iso, training the eye to capture moments of light.",
        whyItMattered: "Laid the foundation for cinematography and visual pacing. Taught me to look at details."
      },
      {
        title: "System Initialization",
        image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=600&auto=format&fit=crop",
        date: "04 Oct 2006",
        location: "Ahmedabad, Gujarat",
        coordinates: "23.0300° N, 72.5800° E",
        lore: "System boot initialization. Early childhood interest in puzzle solving, structural lego blocks, and building toys.",
        whyItMattered: "The absolute starting line. First principles alignment toward engineering and mechanical construction."
      }
    ]
  },
  {
    version: "v2.0",
    title: "Exploration Era",
    subtitle: "PDEU Civil Engineering & The Rebuild",
    dates: "2023",
    status: "ARCHIVED // REBUILDING_SYSTEM",
    focus: "Hostel life adapt, structural testing, and Jaundice recovery",
    gradientClass: "from-emerald-950 via-slate-950 to-neutral-950",
    soundtrack: {
      title: "Intro",
      artist: "The xx"
    },
    memories: [
      {
        title: "First Hostel Day",
        image: "https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=600&auto=format&fit=crop",
        date: "01 Aug 2023",
        location: "Gandhinagar Hostels",
        coordinates: "23.2156° N, 72.6369° E",
        lore: "Moving into the hostel block. Desk v1.0 established with a laptop, textbooks, and a desk lamp. The start of personal independence.",
        whyItMattered: "Forced adaptation to self-reliance and late-night collaboration routines."
      },
      {
        title: "Truss Buckling Test",
        image: "https://images.unsplash.com/photo-1581094288338-2314dddb7ecc?q=80&w=600&auto=format&fit=crop",
        date: "12 Apr 2024",
        location: "PDEU Structural Labs",
        coordinates: "23.1583° N, 72.6586° E",
        lore: "Assembling a scale model wooden truss. Loaded with sand weights until sudden elastic buckling of the main compression cord occurred at 48.5 kg.",
        whyItMattered: "First physical encounter with structural failure mechanics and mathematical limits."
      },
      {
        title: "The Rebuild (Jaundice Setback)",
        image: "https://images.unsplash.com/photo-1584030373081-f37b7bb4fa8e?q=80&w=600&auto=format&fit=crop",
        date: "15 Jan 2023",
        location: "Ahmedabad Clinic",
        coordinates: "23.0225° N, 72.5714° E",
        lore: "Diagnosed with acute Jaundice. Severe liver metric elevations. Energy reserves dropped to zero, resulting in a forced 6-week complete bed rest and a loss of 11kg of bodyweight.",
        whyItMattered: "The absolute physical reset. Tested mental durability and forced me to rebuild daily recovery baselines from absolute zero."
      }
    ]
  },
  {
    version: "v3.0",
    title: "Strength Era",
    subtitle: "Discipline Calibration & Heavy Pulls",
    dates: "2024",
    status: "ARCHIVED // PERFORMANCE_OK",
    focus: "Spinal loading limits, structural consistency, and progressive overload",
    gradientClass: "from-amber-950 via-slate-950 to-stone-950",
    soundtrack: {
      title: "Till I Collapse",
      artist: "Eminem"
    },
    memories: [
      {
        title: "The 210kg Deadlift PR",
        image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600&auto=format&fit=crop",
        date: "22 Mar 2024",
        location: "Gym Sector 7",
        coordinates: "23.0122° N, 72.5204° E",
        lore: "Spindle load: 210 KG. Absolute alignment of the posterior chain, raw mechanical leverage, pulling steel off the platform.",
        whyItMattered: "Physical validation of first principles. Taught me that discipline outweighs temporary motivation."
      },
      {
        title: "Recovery Routine",
        image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600&auto=format&fit=crop",
        date: "12 Jun 2023",
        location: "Home Platform",
        coordinates: "23.0300° N, 72.5800° E",
        lore: "Beginning progressive overload and high-frequency mobility cycles. Tracking daily caloric intake and logging sleep intervals to rebuild liver and muscular capacity.",
        whyItMattered: "The transitional adaptation. Showed me that structural routines can overcome any major physiological setback."
      },
      {
        title: "Consistency Routine",
        image: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600&auto=format&fit=crop",
        date: "10 Oct 2024",
        location: "Training Zone Platform",
        coordinates: "23.0501° N, 72.5602° E",
        lore: "Daily morning wakeups. Training focus shift from strength testing to routine durability. Establishing focus blocks under physical fatigue.",
        whyItMattered: "Built the work ethic required to write complex compilers late at night."
      }
    ]
  },
  {
    version: "v4.0",
    title: "Cruiser Era",
    subtitle: "Super Meteor 650 & Open Highways",
    dates: "2025",
    status: "ARCHIVED // ENGINE_LIVE",
    focus: "Parallel-twin cooling, adventure cruising, and geographic exploration",
    gradientClass: "from-orange-950 via-neutral-950 to-slate-950",
    soundtrack: {
      title: "Starboy",
      artist: "The Weeknd"
    },
    memories: [
      {
        title: "Super Meteor Delivery",
        image: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=600&auto=format&fit=crop",
        date: "05 Nov 2025",
        location: "Royal Enfield Store",
        coordinates: "23.0450° N, 72.5110° E",
        lore: "Taking delivery of the black and chrome parallel-twin. Firing up the 648cc engine. A mechanical monolith joining my personal garage.",
        whyItMattered: "Represented the shift to freedom, mechanical engineering connection, and road travel."
      },
      {
        title: "Rann of Kutch Cruise",
        image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=600&auto=format&fit=crop",
        date: "18 Jan 2026",
        location: "White Desert, Kutch",
        coordinates: "23.8000° N, 69.7500° E",
        lore: "Cruising the endless white salt plains. Parallel-twin exhaust note echoing. Distance coordinates hitting 1,280 km travel log.",
        whyItMattered: "The peak cruise. Cleared mental blocks and inspired new design aesthetics for systems building."
      }
    ]
  },
  {
    version: "v5.0",
    title: "Synthesis Build",
    subtitle: "Infrastructure Telemetry & Software Systems",
    dates: "2026 — Present",
    status: "ACTIVE // STABLE_RUN",
    focus: "QA Compaction algorithms, material optimization, and web OS platforms",
    gradientClass: "from-cyan-950 via-slate-950 to-neutral-950",
    soundtrack: {
      title: "Resonance",
      artist: "HOME"
    },
    memories: [
      {
        title: "PRO-MIX Release",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=600&auto=format&fit=crop",
        date: "15 Mar 2026",
        location: "Gandhinagar Lab Desk",
        coordinates: "23.1610° N, 72.6612° E",
        lore: "Deploying the concrete mix packing density compiler. Coding the Indian Standard validation curves to calculate binder compression strength.",
        whyItMattered: "Unifying geotechnical physics with functional software engineering."
      },
      {
        title: "NHAI Compaction Run",
        image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?q=80&w=600&auto=format&fit=crop",
        date: "01 Feb 2026",
        location: "National Highway Block 4",
        coordinates: "22.3072° N, 73.1812° E",
        lore: "Field testing automated compaction telemetry on highway paving operations, validating real-world data collection.",
        whyItMattered: "Testing structural analytics under true field environment constraints."
      }
    ]
  }
];

/* ─── CONSTELLATION NODES & TRAITS ─── */
interface ConstNode {
  id: string;
  label: string;
  subtitle: string;
  category: string;
  pctX: number;
  pctY: number;
  phase: number;
  density: number; // For simulation particle density representation
  traitCascade: string[];
  polaroidData: PolaroidMemory;
}

const CONSTELLATION_NODES: ConstNode[] = [
  {
    id: "foundation-node",
    label: "THE FOUNDATION",
    subtitle: "PDEU Years / 2018 - 2022",
    category: "ACADEMIC",
    pctX: 0.15,
    pctY: 0.25,
    phase: 0.5,
    density: 500,
    traitCascade: ["THE FOUNDATION", "Truss Buckling Test", "Hostel Desk v1.0"],
    polaroidData: ERAS[1].memories[0]
  },
  {
    id: "rebuild-node",
    label: "THE REBUILD",
    subtitle: "Jaundice Setback / Early 2023",
    category: "SETBACK",
    pctX: 0.25,
    pctY: 0.45,
    phase: 2.1,
    density: 400,
    traitCascade: ["THE REBUILD (Jaundice)", "Severe Weight Loss (-11kg)", "Daily Bed Rest"],
    polaroidData: ERAS[1].memories[2]
  },
  {
    id: "recovery-node",
    label: "RECOVERY ROUTINE",
    subtitle: "Adaptation / Mid 2023",
    category: "TRAIT",
    pctX: 0.35,
    pctY: 0.65,
    phase: 4.2,
    density: 600,
    traitCascade: ["RECOVERY ROUTINE", "Calorie Tracking", "Mobility Drills"],
    polaroidData: ERAS[2].memories[1]
  },
  {
    id: "strength-node",
    label: "PROVING STRENGTH",
    subtitle: "210 KG Deadlift / Late 2023",
    category: "STRENGTH",
    pctX: 0.50,
    pctY: 0.50,
    phase: 1.1,
    density: 1200,
    traitCascade: ["PROVING STRENGTH (210kg)", "Posterior Chain Mechanics", "Consistent Lift"],
    polaroidData: ERAS[2].memories[0]
  },
  {
    id: "freedom-node",
    label: "FIRST FREEDOM",
    subtitle: "Super Meteor 650 / 2024",
    category: "RIDE",
    pctX: 0.70,
    pctY: 0.35,
    phase: 0.8,
    density: 1800,
    traitCascade: ["FIRST FREEDOM (Meteor)", "Cruising salt flats", "12,450 km Travel Log"],
    polaroidData: ERAS[3].memories[0]
  },
  {
    id: "seeing-node",
    label: "SEEING DIFFERENTLY",
    subtitle: "Photography / 2024 - 2025",
    category: "CREATIVE",
    pctX: 0.85,
    pctY: 0.50,
    phase: 2.7,
    density: 600,
    traitCascade: ["SEEING DIFFERENTLY", "Visual Pacing", "DSLR Aperture Limits"],
    polaroidData: ERAS[0].memories[0]
  },
  {
    id: "systems-node",
    label: "SYSTEMS THINKING",
    subtitle: "PRO-MIX Compliance / 2025",
    category: "PROJECT",
    pctX: 0.55,
    pctY: 0.75,
    phase: 5.3,
    density: 700,
    traitCascade: ["SYSTEMS THINKING", "Binder Compaction", "Geotech Software"],
    polaroidData: ERAS[4].memories[0]
  },
  {
    id: "current-node",
    label: "CURRENT BUILD",
    subtitle: "Saumya.OS v5.0 / 2026",
    category: "SYSTEM",
    pctX: 0.75,
    pctY: 0.80,
    phase: 3.5,
    density: 800,
    traitCascade: ["CURRENT BUILD v5.0", "Next.js Web HUD", "Automated Compaction"],
    polaroidData: ERAS[4].memories[1]
  },
  {
    id: "blackbox-node",
    label: "[REDACTED]",
    subtitle: "Corrupted Sector / Unknown Event",
    category: "REDACTED",
    pctX: 0.90,
    pctY: 0.15,
    phase: 1.6,
    density: 300,
    traitCascade: ["UNKNOWN SOURCE", "[REDACTED] SECTOR DATA", "UNAUTHORIZED SECTOR"],
    polaroidData: {
      title: "[REDACTED]",
      image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
      date: "??/??/????",
      location: "CLASSIFIED",
      coordinates: "0.0000° N, 0.0000° E",
      lore: "",
      whyItMattered: ""
    }
  }
];

const CONSTELLATION_EDGES = [
  { from: "foundation-node", to: "rebuild-node" },
  { from: "rebuild-node", to: "recovery-node" },
  { from: "recovery-node", to: "strength-node" },
  { from: "strength-node", to: "freedom-node" },
  { from: "freedom-node", to: "seeing-node" },
  { from: "strength-node", to: "systems-node" },
  { from: "systems-node", to: "current-node" }
];

/* ─── HELPER COMPONENTS ─── */
function GlitchText({ text }: { text: string }) {
  const [displayText, setDisplayText] = useState(text);

  useEffect(() => {
    let active = true;
    let iterations = 0;
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-_";
    
    const interval = setInterval(() => {
      if (!active) return;
      
      const scrambled = text
        .split("")
        .map((char, index) => {
          if (index < iterations) {
            return text[index];
          }
          if (char === " ") return " ";
          return chars[Math.floor(Math.random() * chars.length)];
        })
        .join("");
      setDisplayText(scrambled);

      if (iterations >= text.length) {
        clearInterval(interval);
      }
      
      iterations += 1.5; // speed up decode
    }, 25);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [text]);

  return <span>{displayText}</span>;
}

function SlideshowGlitch() {
  const images = [
    "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=600&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=600&auto=format&fit=crop"
  ];
  
  const [index, setIndex] = useState(0);
  const [glitchStyle, setGlitchStyle] = useState<React.CSSProperties>({});

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % images.length);
      if (Math.random() > 0.4) {
        setGlitchStyle({
          transform: `skew(${(Math.random() - 0.5) * 15}deg) translate(${(Math.random() - 0.5) * 10}px, ${(Math.random() - 0.5) * 6}px) scale(${1 + Math.random() * 0.08})`,
          opacity: 0.45 + Math.random() * 0.5,
          filter: Math.random() > 0.6 ? "invert(1)" : "none"
        });
      } else {
        setGlitchStyle({
          transform: "none",
          opacity: 0.85,
          filter: "none"
        });
      }
    }, 140);

    return () => clearInterval(interval);
  }, [images.length]);

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={images[index]}
      alt="Sector Glitch"
      className="w-full h-full object-cover grayscale brightness-90 transition-transform duration-75"
      style={glitchStyle}
    />
  );
}

export default function ArchivePage() {
  const [activeTab, setActiveTab] = useState<"timeline" | "constellation" | "simulation">("timeline");
  const [isSimulationLocked, setIsSimulationLocked] = useState(true);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [decryptLog, setDecryptLog] = useState<string[]>([]);
  const [activeTimeline, setActiveTimeline] = useState<"A" | "B" | "C">("A");
  const [isReplaying, setIsReplaying] = useState(false);
  const [replayIndex, setReplayIndex] = useState(-1);
  const [replayCountdown, setReplayCountdown] = useState(0);
  const [activeSimulationNode, setActiveSimulationNode] = useState<ConstNode | null>(null);

  const activeTimelineRef = useRef(activeTimeline);
  const activeNodeRef = useRef(activeSimulationNode);
  const isReplayingRef = useRef(isReplaying);
  const replayIndexRef = useRef(replayIndex);

  useEffect(() => { activeTimelineRef.current = activeTimeline; }, [activeTimeline]);
  useEffect(() => { activeNodeRef.current = activeSimulationNode; }, [activeSimulationNode]);
  useEffect(() => { isReplayingRef.current = isReplaying; }, [isReplaying]);
  useEffect(() => { replayIndexRef.current = replayIndex; }, [replayIndex]);

  const getReplayPath = useCallback((timeline: "A" | "B" | "C") => {
    if (timeline === "B") {
      return ["foundation-node", "rebuild-node", "recovery-node", "strength-node", "systems-node", "current-node"];
    }
    if (timeline === "C") {
      return ["foundation-node", "rebuild-node", "recovery-node", "current-node"];
    }
    return ["foundation-node", "rebuild-node", "recovery-node", "strength-node", "freedom-node", "seeing-node", "systems-node", "current-node"];
  }, []);

  // Sync chime sounds when active node changes in autopilot
  const lastIndexRef = useRef(-1);
  useEffect(() => {
    if (!isReplaying) {
      lastIndexRef.current = -1;
      return;
    }
    if (replayIndex !== lastIndexRef.current) {
      lastIndexRef.current = replayIndex;
      const path = getReplayPath(activeTimeline);
      if (replayIndex >= 0 && replayIndex < path.length) {
        const nodeId = path[replayIndex];
        const node = CONSTELLATION_NODES.find(n => n.id === nodeId);
        if (node) {
          let freq = 440;
          if (node.id === "foundation-node") freq = 261.63;
          else if (node.id === "rebuild-node") freq = 196.00;
          else if (node.id === "recovery-node") freq = 293.66;
          else if (node.id === "strength-node") freq = 329.63;
          else if (node.id === "freedom-node") freq = 392.00;
          else if (node.id === "systems-node") freq = 440.00;
          else if (node.id === "current-node") freq = 523.25;
          sysAudio.playBell(freq, Date.now() / 1000, 1.2);
        }
      } else if (replayIndex === path.length) {
        sysAudio.playBootChime();
      }
    }
  }, [replayIndex, isReplaying, activeTimeline, getReplayPath]);

  // Autopilot cinematic ticker
  useEffect(() => {
    if (!isReplaying) return;

    setReplayIndex(-1);
    setReplayCountdown(18);

    const startTime = Date.now();
    const path = getReplayPath(activeTimeline);

    const interval = setInterval(() => {
      const elapsed = (Date.now() - startTime) / 1000;
      const remaining = Math.max(0, 18 - elapsed);
      setReplayCountdown(Math.ceil(remaining));

      if (elapsed >= 18) {
        setIsReplaying(false);
        setReplayIndex(-1);
        setActiveSimulationNode(null);
        clearInterval(interval);
        return;
      }

      if (elapsed < 2) {
        setReplayIndex(-1);
        setActiveSimulationNode(null);
      } else if (elapsed >= 16) {
        setReplayIndex(path.length);
        setActiveSimulationNode(null);
      } else {
        const progressFraction = (elapsed - 2) / 14;
        const idx = Math.floor(progressFraction * path.length);
        const clampedIdx = Math.min(path.length - 1, Math.max(0, idx));
        setReplayIndex(clampedIdx);

        const targetId = path[clampedIdx];
        const targetNode = CONSTELLATION_NODES.find(n => n.id === targetId);
        if (targetNode) {
          setActiveSimulationNode(targetNode);
        }
      }
    }, 100);

    return () => clearInterval(interval);
  }, [isReplaying, activeTimeline, getReplayPath]);

  const handleDecryptSimulation = () => {
    sysAudio.playSwitch();
    setIsDecrypting(true);
    setDecryptLog([]);

    const logs = [
      "INITIALIZING CAUSALITY DECRYPTION PROTOCOL...",
      "FETCHING SECTOR KEYS: PRIMARY_BUILD_v5.0...",
      "CRACKING CYCLIC REDUNDANCY CHECKS... [OK]",
      "DESTRUCTURING TIMELINE CAUSAL LINKS... [OK]",
      "SYNCHRONIZING GRAPH VELOCITIES: 60FPS...",
      "CALIBRATING SPRING CONSTANTS: K_STIFFNESS=0.08...",
      "MOUNTING TELEMETRY ENGINE... [OK]",
      "WARNING: DETECTED PARALLEL TIMELINE PATHWAYS...",
      "SUCCESS: LIFE.EXE SIMULATION DECRYPTED."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setDecryptLog((prev) => [...prev, log]);
        sysAudio.playClick();
        if (index === logs.length - 1) {
          setTimeout(() => {
            setIsSimulationLocked(false);
            setIsDecrypting(false);
          }, 500);
        }
      }, (index + 1) * 200);
    });
  };
  
  // Timeline Mode States
  const [selectedEraIndex, setSelectedEraIndex] = useState(ERAS.length - 1); // default v5.0
  const selectedEra = ERAS[selectedEraIndex];
  
  // Polaroid Lore Modal State
  const [selectedPolaroid, setSelectedPolaroid] = useState<PolaroidMemory | null>(null);

  // Soundtrack audio simulation state
  const [isPlaying, setIsPlaying] = useState(true);

  // Constellation Canvas References
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const constellationMouse = useRef({ x: -1000, y: -1000 });
  const simulationCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const simulationMouse = useRef({ x: -1000, y: -1000 });
  const hoveredNodeRef = useRef<ConstNode | null>(null);
  const [hoveredConstNode, setHoveredConstNode] = useState<ConstNode | null>(null);
  const [hyperspaceNode, setHyperspaceNode] = useState<{ x: number; y: number } | null>(null);

  // Grainy dynamic animated background shift styles
  const eraBgStyle = useMemo(() => {
    if (selectedEraIndex === 4) return "from-cyan-950 via-[#071317] to-[#04080a] shadow-[inset_0_0_100px_rgba(34,211,238,0.06)]";
    if (selectedEraIndex === 3) return "from-orange-950 via-[#190c05] to-[#0a0502] shadow-[inset_0_0_100px_rgba(249,115,22,0.06)]";
    if (selectedEraIndex === 2) return "from-amber-950 via-[#170e05] to-[#0a0602] shadow-[inset_0_0_100px_rgba(251,191,36,0.06)]";
    if (selectedEraIndex === 1) return "from-emerald-950 via-[#05140e] to-[#020805] shadow-[inset_0_0_100px_rgba(16,185,129,0.06)]";
    return "from-slate-950 via-[#0d1117] to-neutral-950 shadow-[inset_0_0_100px_rgba(148,163,184,0.04)]";
  }, [selectedEraIndex]);

  // Floating aura blobs config
  const auraBlobs = useMemo(() => {
    if (selectedEraIndex === 4) { // v5.0 Cyan
      return [
        { color: "bg-cyan-500/20", width: "w-[500px]", height: "h-[500px]", top: "top-[-10%]", left: "left-[-10%]", animateX: [-20, 20], animateY: [-10, 30], duration: 12 },
        { color: "bg-blue-600/10", width: "w-[600px]", height: "h-[600px]", bottom: "bottom-[-10%]", right: "right-[-10%]", animateX: [30, -10], animateY: [20, -20], duration: 15 },
        { color: "bg-emerald-500/5", width: "w-[400px]", height: "h-[400px]", top: "top-[30%]", left: "left-[40%]", animateX: [15, -15], animateY: [-20, 20], duration: 10 }
      ];
    }
    if (selectedEraIndex === 3) { // v4.0 Orange
      return [
        { color: "bg-orange-500/20", width: "w-[500px]", height: "h-[500px]", top: "top-[-10%]", left: "left-[-10%]", animateX: [-25, 25], animateY: [-20, 20], duration: 14 },
        { color: "bg-red-600/10", width: "w-[600px]", height: "h-[600px]", bottom: "bottom-[-10%]", right: "right-[-10%]", animateX: [20, -20], animateY: [30, -10], duration: 18 },
        { color: "bg-amber-600/5", width: "w-[400px]", height: "h-[400px]", top: "top-[30%]", left: "left-[40%]", animateX: [-15, 15], animateY: [15, -15], duration: 11 }
      ];
    }
    if (selectedEraIndex === 2) { // v3.0 Gold/Amber
      return [
        { color: "bg-amber-500/20", width: "w-[500px]", height: "h-[500px]", top: "top-[-10%]", left: "left-[-10%]", animateX: [-15, 25], animateY: [-10, 30], duration: 13 },
        { color: "bg-yellow-600/10", width: "w-[600px]", height: "h-[600px]", bottom: "bottom-[-10%]", right: "right-[-10%]", animateX: [30, -30], animateY: [10, -20], duration: 16 },
        { color: "bg-orange-600/5", width: "w-[400px]", height: "h-[400px]", top: "top-[30%]", left: "left-[40%]", animateX: [20, -10], animateY: [-15, 25], duration: 12 }
      ];
    }
    if (selectedEraIndex === 1) { // v2.0 Emerald
      return [
        { color: "bg-emerald-500/15", width: "w-[500px]", height: "h-[500px]", top: "top-[-10%]", left: "left-[-10%]", animateX: [-20, 10], animateY: [-20, 10], duration: 15 },
        { color: "bg-teal-600/10", width: "w-[600px]", height: "h-[600px]", bottom: "bottom-[-10%]", right: "right-[-10%]", animateX: [10, -30], animateY: [10, -30], duration: 19 },
        { color: "bg-green-500/5", width: "w-[400px]", height: "h-[400px]", top: "top-[30%]", left: "left-[40%]", animateX: [15, -15], animateY: [-15, 15], duration: 13 }
      ];
    }
    // v1.0 Slate
    return [
      { color: "bg-slate-500/10", width: "w-[500px]", height: "h-[500px]", top: "top-[-10%]", left: "left-[-10%]", animateX: [-10, 20], animateY: [-10, 20], duration: 16 },
      { color: "bg-zinc-600/10", width: "w-[600px]", height: "h-[600px]", bottom: "bottom-[-10%]", right: "right-[-10%]", animateX: [20, -10], animateY: [20, -10], duration: 20 },
      { color: "bg-neutral-500/5", width: "w-[400px]", height: "h-[400px]", top: "top-[30%]", left: "left-[40%]", animateX: [10, -10], animateY: [-10, 10], duration: 14 }
    ];
  }, [selectedEraIndex]);

  // Web Audio Synth loops
  const audioCtxRef = useRef<AudioContext | null>(null);
  const synthNodesRef = useRef<{ oscillators: OscillatorNode[]; gainNodes: GainNode[]; timeoutIds: NodeJS.Timeout[] }>({
    oscillators: [],
    gainNodes: [],
    timeoutIds: []
  });

  const stopSynth = useCallback(() => {
    synthNodesRef.current.timeoutIds.forEach((id) => clearTimeout(id));
    synthNodesRef.current.timeoutIds = [];

    synthNodesRef.current.oscillators.forEach((osc) => {
      try {
        osc.stop();
      } catch {}
      osc.disconnect();
    });
    synthNodesRef.current.oscillators = [];

    synthNodesRef.current.gainNodes.forEach((gain) => {
      gain.disconnect();
    });
    synthNodesRef.current.gainNodes = [];
  }, []);

  const startSynth = useCallback((eraIdx: number) => {
    stopSynth();

    if (!audioCtxRef.current) {
      const AudioCtx = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
    }

    const ctx = audioCtxRef.current;
    if (!ctx) return;

    if (ctx.state === "suspended") {
      ctx.resume();
    }

    const trackOsc = (osc: OscillatorNode) => synthNodesRef.current.oscillators.push(osc);
    const trackGain = (gain: GainNode) => synthNodesRef.current.gainNodes.push(gain);

    if (eraIdx === 0) {
      // "Fix You" (Coldplay): Warm organ chord loop (C -> Em -> Am -> F)
      const playChordsLoop = () => {
        const loopStart = ctx.currentTime;
        const chords = [
          [130.81, 164.81, 196.00], // C3, E3, G3
          [164.81, 196.00, 246.94], // E3, G3, B3
          [110.07, 130.81, 164.81], // A2, C3, E3
          [174.61, 220.00, 261.63]  // F3, A3, C4
        ];

        chords.forEach((chord, chordIdx) => {
          const startTime = loopStart + chordIdx * 2.0;
          const duration = 1.95;

          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = "triangle";
            osc.frequency.setValueAtTime(freq, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.04, startTime + 0.2);
            gain.gain.setValueAtTime(0.04, startTime + duration - 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(600, startTime);

            osc.connect(gain);
            gain.connect(filter);
            filter.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
            trackOsc(osc);
            trackGain(gain);
          });
        });

        const tId = setTimeout(playChordsLoop, 8000);
        synthNodesRef.current.timeoutIds.push(tId);
      };
      playChordsLoop();
    }
    else if (eraIdx === 1) {
      // "Intro" (The xx): Clean guitar plucks (A3, C4, E4, C4, G3, B3, D4, B3)
      const playIntroLoop = () => {
        const loopStart = ctx.currentTime;
        const melody = [
          220.00, 261.63, 329.63, 261.63,
          196.00, 246.94, 293.66, 246.94
        ];
        
        melody.forEach((freq, noteIdx) => {
          const startTime = loopStart + noteIdx * 0.35;
          const duration = 0.32;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.05, startTime + 0.01);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
          trackOsc(osc);
          trackGain(gain);
        });

        const tId = setTimeout(playIntroLoop, 2800);
        synthNodesRef.current.timeoutIds.push(tId);
      };
      playIntroLoop();
    }
    else if (eraIdx === 2) {
      // "Till I Collapse" (Eminem): Beats + brass stabs
      const playTillICollapseLoop = () => {
        const loopStart = ctx.currentTime;
        
        for (let beat = 0; beat < 4; beat++) {
          const startTime = loopStart + beat * 0.5;

          if (beat === 0 || beat === 2) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sine";
            osc.frequency.setValueAtTime(120, startTime);
            osc.frequency.exponentialRampToValueAtTime(45, startTime + 0.15);

            gain.gain.setValueAtTime(0.12, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.15);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.2);
            trackOsc(osc);
            trackGain(gain);
          }

          if (beat === 1 || beat === 3) {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(180, startTime);

            gain.gain.setValueAtTime(0.02, startTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.08);

            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start(startTime);
            osc.stop(startTime + 0.1);
            trackOsc(osc);
            trackGain(gain);
          }
        }

        const brassFreqs = [220.00, 277.18, 329.63, 440.00];
        brassFreqs.forEach((freq) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, loopStart);

          const filter = ctx.createBiquadFilter();
          filter.type = "peaking";
          filter.frequency.setValueAtTime(1200, loopStart);

          gain.gain.setValueAtTime(0, loopStart);
          gain.gain.linearRampToValueAtTime(0.03, loopStart + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, loopStart + 0.35);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(loopStart);
          osc.stop(loopStart + 0.4);
          trackOsc(osc);
          trackGain(gain);
        });

        const tId = setTimeout(playTillICollapseLoop, 2000);
        synthNodesRef.current.timeoutIds.push(tId);
      };
      playTillICollapseLoop();
    }
    else if (eraIdx === 3) {
      // "Starboy" (The Weeknd): Retro beat + pulsing dark bass (Am -> G -> F -> G)
      const playStarboyLoop = () => {
        const loopStart = ctx.currentTime;
        const bassNotes = [110.00, 98.00, 87.31, 98.00];

        bassNotes.forEach((freq, idx) => {
          const startTime = loopStart + idx * 0.4;
          const duration = 0.38;

          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const filter = ctx.createBiquadFilter();

          osc.type = "sawtooth";
          osc.frequency.setValueAtTime(freq, startTime);

          filter.type = "lowpass";
          filter.frequency.setValueAtTime(300, startTime);
          filter.frequency.exponentialRampToValueAtTime(100, startTime + duration);

          gain.gain.setValueAtTime(0, startTime);
          gain.gain.linearRampToValueAtTime(0.04, startTime + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

          osc.connect(filter);
          filter.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + duration);
          trackOsc(osc);
          trackGain(gain);
        });

        for (let t = 0; t < 8; t++) {
          const startTime = loopStart + t * 0.2;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(8000, startTime);

          gain.gain.setValueAtTime(0.01, startTime);
          gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.03);

          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(startTime);
          osc.stop(startTime + 0.04);
          trackOsc(osc);
          trackGain(gain);
        }

        const tId = setTimeout(playStarboyLoop, 1600);
        synthNodesRef.current.timeoutIds.push(tId);
      };
      playStarboyLoop();
    }
    else if (eraIdx === 4) {
      // "Resonance" (HOME): Retro synth pads (Fmaj7 -> G6)
      const playResonanceLoop = () => {
        const loopStart = ctx.currentTime;
        const chords = [
          [174.61, 220.00, 261.63, 329.63], // Fmaj7
          [196.00, 246.94, 293.66, 392.00]  // G6
        ];

        chords.forEach((chord, idx) => {
          const startTime = loopStart + idx * 2.0;
          const duration = 1.95;

          chord.forEach((freq) => {
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            const filter = ctx.createBiquadFilter();

            osc.type = "sawtooth";
            osc.frequency.setValueAtTime(freq, startTime);

            const oscDetune = ctx.createOscillator();
            oscDetune.type = "sawtooth";
            oscDetune.frequency.setValueAtTime(freq * 1.008, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(0.02, startTime + 0.3);
            gain.gain.setValueAtTime(0.02, startTime + duration - 0.2);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            filter.type = "lowpass";
            filter.frequency.setValueAtTime(500, startTime);
            filter.frequency.exponentialRampToValueAtTime(1000, startTime + 0.8);
            filter.frequency.exponentialRampToValueAtTime(400, startTime + duration);

            osc.connect(filter);
            oscDetune.connect(filter);
            filter.connect(gain);
            gain.connect(ctx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);
            oscDetune.start(startTime);
            oscDetune.stop(startTime + duration);
            
            trackOsc(osc);
            trackOsc(oscDetune);
            trackGain(gain);
          });
        });

        const tId = setTimeout(playResonanceLoop, 4000);
        synthNodesRef.current.timeoutIds.push(tId);
      };
      playResonanceLoop();
    }
  }, [stopSynth]);

  // Audio lifecycle hook
  useEffect(() => {
    if (activeTab === "timeline" && isPlaying) {
      startSynth(selectedEraIndex);
    } else {
      stopSynth();
    }
    return () => {
      stopSynth();
    };
  }, [selectedEraIndex, isPlaying, activeTab, startSynth, stopSynth]);

  // Constellation View Canvas Logic
  useEffect(() => {
    if (activeTab !== "constellation") return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    
    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const targetCoordsRef = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      const time = Date.now();
      const tempNodes = CONSTELLATION_NODES.map((node) => {
        const baseX = canvas.width * node.pctX;
        const baseY = canvas.height * node.pctY;
        const driftX = Math.sin(time / 1400 + node.phase) * 15;
        const driftY = Math.cos(time / 1600 + node.phase) * 12;
        return {
          ...node,
          x: baseX + driftX,
          y: baseY + driftY
        };
      });

      let foundHover: ConstNode | null = null;
      for (const node of tempNodes) {
        const dx = node.x - targetCoordsRef.x;
        const dy = node.y - targetCoordsRef.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 65) { // Increased hit radius check
          foundHover = node;
          break;
        }
      }

      // Optimize updates to prevent 60fps React renders during mouse movements
      if (foundHover?.id !== hoveredNodeRef.current?.id) {
        hoveredNodeRef.current = foundHover;
        setHoveredConstNode(foundHover);
      }
      constellationMouse.current = targetCoordsRef;
    };

    const handleCanvasClick = () => {
      const clickCoords = {
        x: constellationMouse.current.x,
        y: constellationMouse.current.y
      };

      const time = Date.now();
      const tempNodes = CONSTELLATION_NODES.map((node) => {
        const baseX = canvas.width * node.pctX;
        const baseY = canvas.height * node.pctY;
        const driftX = Math.sin(time / 1400 + node.phase) * 15;
        const driftY = Math.cos(time / 1600 + node.phase) * 12;
        return {
          ...node,
          x: baseX + driftX,
          y: baseY + driftY
        };
      });

      for (const node of tempNodes) {
        const dx = node.x - clickCoords.x;
        const dy = node.y - clickCoords.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 65) { // Increased hit radius check
          // Hyperspace zoom trigger
          setHyperspaceNode({ x: node.x, y: node.y });
          setTimeout(() => {
            setSelectedPolaroid(node.polaroidData);
            setHyperspaceNode(null);
          }, 600);
          break;
        }
      }
    };

    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("click", handleCanvasClick);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      // Calculations of node coords
      const nodesWithPos = CONSTELLATION_NODES.map((node) => {
        const baseX = canvas.width * node.pctX;
        const baseY = canvas.height * node.pctY;
        const driftX = Math.sin(time / 1400 + node.phase) * 15;
        const driftY = Math.cos(time / 1600 + node.phase) * 12;
        return {
          ...node,
          x: baseX + driftX,
          y: baseY + driftY
        };
      });

      // Find currently hovered node on this frame
      let hoveredNode: ConstNode | null = null;
      for (const node of nodesWithPos) {
        const dx = node.x - constellationMouse.current.x;
        const dy = node.y - constellationMouse.current.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 40) {
          hoveredNode = node;
          break;
        }
      }

      // Draw Proximity Connections (Drifting lines between close nodes)
      for (let i = 0; i < nodesWithPos.length; i++) {
        for (let j = i + 1; j < nodesWithPos.length; j++) {
          const n1 = nodesWithPos[i];
          const n2 = nodesWithPos[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 130) {
            // Draw a very faint line that fades out as distance increases
            const alpha = (1 - dist / 130) * 0.12;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      // Draw connection lines
      CONSTELLATION_EDGES.forEach((edge) => {
        const fromNode = nodesWithPos.find((n) => n.id === edge.from);
        const toNode = nodesWithPos.find((n) => n.id === edge.to);
        if (!fromNode || !toNode) return;

        // Check if this connection belongs to the hovered trait cascade list
        const isCascadeActive =
          hoveredNode &&
          hoveredNode.traitCascade.includes(fromNode.label) &&
          hoveredNode.traitCascade.includes(toNode.label);

        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);

        if (isCascadeActive) {
          ctx.strokeStyle = "rgba(34, 211, 238, 0.75)";
          ctx.lineWidth = 2.0;
          ctx.shadowBlur = 12;
          ctx.shadowColor = "rgba(34, 211, 238, 0.8)";
        } else {
          ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
          ctx.lineWidth = 0.8;
          ctx.shadowBlur = 0;
        }
        ctx.stroke();
        ctx.shadowBlur = 0; // reset
      });

      // Draw nodes
      nodesWithPos.forEach((node) => {
        const isNodeHovered = hoveredNode && hoveredNode.id === node.id;
        const isPartofCascade = hoveredNode && hoveredNode.traitCascade.includes(node.label);

        ctx.beginPath();
        
        if (isNodeHovered) {
          // Hovered core node (visually larger)
          ctx.arc(node.x, node.y, 8.5, 0, Math.PI * 2);
          ctx.fillStyle = "#ffffff";
          ctx.shadowBlur = 20;
          ctx.shadowColor = "rgba(34, 211, 238, 0.9)";
          ctx.fill();

          ctx.beginPath();
          ctx.arc(node.x, node.y, 18, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(34, 211, 238, 0.4)";
          ctx.stroke();

          // Cyberpunk Target Box (Reticle) around node
          ctx.save();
          ctx.strokeStyle = "rgba(34, 211, 238, 0.8)";
          ctx.lineWidth = 0.8;
          
          const rotAngle = time / 600;
          
          // Concentric rotating dash arcs
          ctx.beginPath();
          ctx.arc(node.x, node.y, 20, rotAngle, rotAngle + Math.PI * 0.5);
          ctx.stroke();
          
          ctx.beginPath();
          ctx.arc(node.x, node.y, 20, rotAngle + Math.PI, rotAngle + Math.PI * 1.5);
          ctx.stroke();

          // Outer targeting brackets
          const offset = 24;
          const len = 7;
          // Top Left
          ctx.beginPath();
          ctx.moveTo(node.x - offset, node.y - offset + len);
          ctx.lineTo(node.x - offset, node.y - offset);
          ctx.lineTo(node.x - offset + len, node.y - offset);
          ctx.stroke();
          // Top Right
          ctx.beginPath();
          ctx.moveTo(node.x + offset, node.y - offset + len);
          ctx.lineTo(node.x + offset, node.y - offset);
          ctx.lineTo(node.x + offset - len, node.y - offset);
          ctx.stroke();
          // Bottom Left
          ctx.beginPath();
          ctx.moveTo(node.x - offset, node.y + offset - len);
          ctx.lineTo(node.x - offset, node.y + offset);
          ctx.lineTo(node.x - offset + len, node.y + offset);
          ctx.stroke();
          // Bottom Right
          ctx.beginPath();
          ctx.moveTo(node.x + offset, node.y + offset - len);
          ctx.lineTo(node.x + offset, node.y + offset);
          ctx.lineTo(node.x + offset - len, node.y + offset);
          ctx.stroke();
          
          ctx.restore();
        } else if (isPartofCascade) {
          // Node is part of active hovered connection chain
          ctx.arc(node.x, node.y, 6.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(34, 211, 238, 0.9)";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "rgba(34, 211, 238, 0.6)";
          ctx.fill();
        } else {
          // Regular floating star node (visually larger)
          ctx.arc(node.x, node.y, 4.5, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
          ctx.fill();
        }
        ctx.shadowBlur = 0; // reset

        // Render basic label next to node by default, or bright label if hovered
        ctx.font = "8.5px monospace";
        ctx.textAlign = "left";
        
        if (isNodeHovered) {
          // Cyberpunk callout text layout with leader line
          ctx.font = "bold 9px monospace";
          
          const text = `${node.category} // ${node.label.toUpperCase()}`;
          const textWidth = ctx.measureText(text).width;

          const drawLeft = node.pctX > 0.65;
          const dir = drawLeft ? -1 : 1;
          const boxX = drawLeft ? node.x - 30 - textWidth - 8 : node.x + 30;

          // Callout leader lines
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(node.x + 12 * dir, node.y - 12);
          ctx.lineTo(node.x + 30 * dir, node.y - 12);
          ctx.strokeStyle = "#22d3ee";
          ctx.lineWidth = 0.8;
          ctx.stroke();

          // Text box background
          ctx.fillStyle = "rgba(8, 10, 14, 0.92)";
          ctx.fillRect(boxX, node.y - 21, textWidth + 8, 14);

          // Text box border
          ctx.strokeStyle = "#22d3ee";
          ctx.strokeRect(boxX, node.y - 21, textWidth + 8, 14);

          // Corner decoration tick
          ctx.fillStyle = "#22d3ee";
          ctx.fillRect(drawLeft ? boxX + textWidth + 6 : boxX, node.y - 21, 2, 2);

          // Draw Text
          ctx.fillStyle = "#ffffff";
          ctx.fillText(text, boxX + 4, node.y - 11);
        } else if (isPartofCascade) {
          ctx.fillStyle = "rgba(34, 211, 238, 0.85)";
          ctx.fillText(node.label.toUpperCase(), node.x + 8, node.y + 3);
        } else {
          ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
          ctx.fillText(node.label, node.x + 7, node.y + 3);
        }
      });

      // Draw instruction indicator
      ctx.font = "7.5px monospace";
      ctx.fillStyle = "rgba(255,255,255,0.3)";
      ctx.textAlign = "center";
      ctx.fillText("HOVER STAR TO TRACE TRAIT CASCADE // CLICK TO HYPERSPACE WARP", canvas.width / 2, canvas.height - 25);

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
      canvas.removeEventListener("click", handleCanvasClick);
    };
  }, [activeTab]);

  // 3D Life Simulation Canvas Logic
  useEffect(() => {
    if (activeTab !== "simulation" || isSimulationLocked) return;

    const canvas = simulationCanvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;

    const handleResize = () => {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
    };
    handleResize();
    window.addEventListener("resize", handleResize);

    // Initial 3D node coordinates mapping
    const simNodes = CONSTELLATION_NODES.map((node) => {
      let x = 0, y = 0, z = 0;
      if (node.id === "foundation-node") { x = -280; y = -120; z = -80; }
      else if (node.id === "rebuild-node") { x = -200; y = -40; z = -40; }
      else if (node.id === "recovery-node") { x = -100; y = 40; z = 0; }
      else if (node.id === "strength-node") { x = 0; y = 0; z = 40; }
      else if (node.id === "freedom-node") { x = 140; y = -80; z = 80; }
      else if (node.id === "seeing-node") { x = 240; y = -40; z = 120; }
      else if (node.id === "systems-node") { x = 100; y = 120; z = 40; }
      else if (node.id === "current-node") { x = 200; y = 140; z = 0; }
      else if (node.id === "blackbox-node") { x = 320; y = -180; z = -150; }

      // Generate orbital particles for each node
      const numOrbits = Math.floor(node.density / 20);
      const orbitParticles = Array.from({ length: numOrbits }).map(() => {
        const radius = 25 + Math.random() * 35;
        const angle = Math.random() * Math.PI * 2;
        const speed = 0.015 + Math.random() * 0.025;
        const yOffset = (Math.random() - 0.5) * 12;
        
        let color = "rgba(34, 211, 238, 0.4)"; // Cyan default
        if (node.category === "STRENGTH") color = "rgba(251, 191, 36, 0.4)"; // Gold
        else if (node.category === "SETBACK") color = "rgba(239, 68, 68, 0.5)"; // Red
        else if (node.category === "SYSTEM") color = "rgba(34, 211, 238, 0.5)"; // Cyan
        else if (node.category === "REDACTED") color = "rgba(255, 255, 255, 0.35)"; // White
        
        return { radius, angle, speed, yOffset, color };
      });

      return {
        ...node,
        x, y, z,
        vx: 0, vy: 0, vz: 0,
        baseX: x, baseY: y, baseZ: z,
        exploded: false,
        orbitParticles,
        alpha: 1.0,
        color: node.category === "STRENGTH" 
          ? "#fbbf24" 
          : node.category === "SETBACK" 
            ? "#ef4444" 
            : node.category === "REDACTED" 
              ? "#ffffff" 
              : "#22d3ee"
      };
    });

    interface Spark {
      x: number; y: number; z: number;
      vx: number; vy: number; vz: number;
      color: string;
      size: number;
      life: number;
    }
    let sparks: Spark[] = [];

    // Camera variables
    let rotX = 0.2;
    let rotY = -0.45;
    let cameraZ = 550;
    let targetZoom = 0.85;

    let lookAtX = 0;
    let lookAtY = 0;
    let lookAtZ = 0;

    let targetLookAtX = 0;
    let targetLookAtY = 0;
    let targetLookAtZ = 0;

    let shakeAmount = 0;

    // Timeline state detection inside loop
    let lastTimeline = activeTimelineRef.current;

    // Mouse drag rotation handling
    let isDragging = false;
    let startMouseX = 0;
    let startMouseY = 0;
    let startRotX = rotX;
    let startRotY = rotY;

    const handleCanvasMouseDown = (e: MouseEvent) => {
      // Find projected node under click first
      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      let clickedNode: (typeof simNodes)[0] | null = null;
      
      // Look at simulated nodes projected screen coords
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 400;

      // Filter active non-exploded nodes to see if one was clicked
      const clickCandidates = simNodes.filter(n => !n.exploded);

      // Project and find
      for (const node of clickCandidates) {
        const rx_rel = node.x - lookAtX;
        const ry_rel = node.y - lookAtY;
        const rz_rel = node.z - lookAtZ;

        // Yaw
        const x1 = rx_rel * Math.cos(rotY) - rz_rel * Math.sin(rotY);
        const z1 = rx_rel * Math.sin(rotY) + rz_rel * Math.cos(rotY);

        // Pitch
        const y2 = ry_rel * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = ry_rel * Math.sin(rotX) + z1 * Math.cos(rotX);

        const scale = fov / (z2 + cameraZ);
        if (scale > 0) {
          const screenX = centerX + x1 * scale;
          const screenY = centerY + y2 * scale;
          
          const dx = screenX - mouseX;
          const dy = screenY - mouseY;
          if (Math.sqrt(dx*dx + dy*dy) < 35) {
            clickedNode = node;
            break;
          }
        }
      }

      if (clickedNode) {
        sysAudio.playSwitch();
        shakeAmount = clickedNode.id === "blackbox-node" ? 22 : 12;
        setActiveSimulationNode(clickedNode);
      } else {
        isDragging = true;
        startMouseX = e.clientX;
        startMouseY = e.clientY;
        startRotX = rotX;
        startRotY = rotY;
      }
    };

    const handleCanvasMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      simulationMouse.current = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };

      if (isDragging) {
        const dx = e.clientX - startMouseX;
        const dy = e.clientY - startMouseY;
        rotY = startRotY + dx * 0.005;
        rotX = Math.max(-1.3, Math.min(1.3, startRotX + dy * 0.005));
      }
    };

    const handleCanvasMouseUp = () => {
      isDragging = false;
    };

    const handleCanvasWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraZ = Math.max(250, Math.min(1000, cameraZ + e.deltaY * 0.5));
    };

    canvas.addEventListener("mousedown", handleCanvasMouseDown);
    canvas.addEventListener("mousemove", handleCanvasMouseMove);
    canvas.addEventListener("mouseup", handleCanvasMouseUp);
    canvas.addEventListener("mouseleave", handleCanvasMouseUp);
    canvas.addEventListener("wheel", handleCanvasWheel, { passive: false });

    // Function to trigger a particle explosion
    const triggerExplosion = (x: number, y: number, z: number, color: string) => {
      sysAudio.playGearClunk();
      for (let i = 0; i < 150; i++) {
        const theta = Math.random() * Math.PI * 2;
        const phi = Math.acos(Math.random() * 2 - 1);
        const speed = 2 + Math.random() * 5.5;
        sparks.push({
          x, y, z,
          vx: Math.sin(phi) * Math.cos(theta) * speed,
          vy: Math.sin(phi) * Math.sin(theta) * speed,
          vz: Math.cos(phi) * speed,
          color,
          size: 1.0 + Math.random() * 2.0,
          life: 1.0
        });
      }
    };

    // Render loop
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const time = Date.now();

      // Check for timeline changes to trigger explosions
      const currentTimeline = activeTimelineRef.current;
      if (currentTimeline !== lastTimeline) {
        simNodes.forEach((node) => {
          const wasExploded = node.exploded;
          let shouldBeExploded = false;
          if (currentTimeline === "B" && node.id === "freedom-node") shouldBeExploded = true;
          if (currentTimeline === "C" && node.id === "strength-node") shouldBeExploded = true;

          if (shouldBeExploded && !wasExploded) {
            triggerExplosion(node.x, node.y, node.z, node.color);
          }
        });
        lastTimeline = currentTimeline;
      }

      // 1. UPDATE PHYSICS (SPRING FORCES & TIMELINE ALIGNMENTS)
      simNodes.forEach((node) => {
        const targetX = node.baseX;
        let targetY = node.baseY;
        const targetZ = node.baseZ;
        let targetAlpha = 1.0;

        let shouldBeExploded = false;
        if (currentTimeline === "B") {
          if (node.id === "freedom-node") {
            shouldBeExploded = true;
          } else if (node.id === "seeing-node") {
            targetY = node.baseY + 180;
            targetAlpha = 0.15;
          }
        } else if (currentTimeline === "C") {
          if (node.id === "strength-node") {
            shouldBeExploded = true;
          } else if (node.id === "recovery-node") {
            targetAlpha = 0.35;
          } else if (["freedom-node", "seeing-node", "systems-node", "current-node"].includes(node.id)) {
            targetY = node.baseY + 180;
            targetAlpha = 0.15;
          }
        }

        node.exploded = shouldBeExploded;

        // Apply Spring pulls if connected to the centered node
        const activeNode = activeNodeRef.current;
        if (activeNode && activeNode.id !== node.id && !node.exploded) {
          const simActive = simNodes.find(n => n.id === activeNode.id);
          if (simActive) {
            const isConnected = CONSTELLATION_EDGES.some(edge => 
              (edge.from === node.id && edge.to === activeNode.id) || 
              (edge.to === node.id && edge.from === activeNode.id)
            );
            if (isConnected) {
              const dx = simActive.x - node.x;
              const dy = simActive.y - node.y;
              const dz = simActive.z - node.z;
              const dist = Math.sqrt(dx*dx + dy*dy + dz*dz);
            const rest = 80;
            if (dist > rest) {
              const pull = (dist - rest) * 0.05;
              node.vx += (dx / dist) * pull;
              node.vy += (dy / dist) * pull;
              node.vz += (dz / dist) * pull;
            }
          }
        }
      }

        // Float drift
        const driftX = Math.sin(time / 1400 + node.phase) * 0.12;
        const driftY = Math.cos(time / 1600 + node.phase) * 0.10;
        const driftZ = Math.sin(time / 1800 + node.phase) * 0.12;

        if (!node.exploded) {
          const fx = (targetX - node.x) * 0.04;
          const fy = (targetY - node.y) * 0.04;
          const fz = (targetZ - node.z) * 0.04;
          node.vx += fx + driftX;
          node.vy += fy + driftY;
          node.vz += fz + driftZ;
        } else {
          node.vx += (targetX - node.x) * 0.005;
          node.vy += (targetY + 200 - node.y) * 0.005;
          node.vz += (targetZ - node.z) * 0.005;
        }

        node.vx *= 0.85;
        node.vy *= 0.85;
        node.vz *= 0.85;

        node.x += node.vx;
        node.y += node.vy;
        node.z += node.vz;

        node.alpha += (targetAlpha - node.alpha) * 0.1;
      });

      // Update explosion sparks
      sparks.forEach((spark) => {
        spark.x += spark.vx;
        spark.y += spark.vy;
        spark.z += spark.vz;
        spark.vx *= 0.96;
        spark.vy *= 0.96;
        spark.vz *= 0.96;
        spark.life -= 0.015;
      });
      sparks = sparks.filter(s => s.life > 0);

      // 2. CAMERA AND INTERPOLATIONS
      const isReplaying = isReplayingRef.current;
      const replayIndex = replayIndexRef.current;

      if (isReplaying) {
        const path = getReplayPath(currentTimeline);
        if (replayIndex === -1) {
          targetLookAtX = 0; targetLookAtY = 0; targetLookAtZ = 0;
          targetZoom = 0.55;
          rotY = time * 0.0001;
          rotX = 0.22;
        } else if (replayIndex === path.length) {
          targetLookAtX = 0; targetLookAtY = 0; targetLookAtZ = 0;
          targetZoom = 0.45;
          rotY = time * 0.0002;
          rotX = 0.25;
        } else {
          const targetNodeId = path[replayIndex];
          const targetNode = simNodes.find(n => n.id === targetNodeId);
          if (targetNode) {
            targetLookAtX = targetNode.x;
            targetLookAtY = targetNode.y;
            targetLookAtZ = targetNode.z;
            targetZoom = 1.35;
            rotY = time * 0.0003 + replayIndex * 0.55;
            rotX = 0.15;
          }
        }
      } else {
        const activeNode = activeNodeRef.current;
        if (activeNode) {
          const simN = simNodes.find(n => n.id === activeNode.id);
          if (simN) {
            targetLookAtX = simN.x;
            targetLookAtY = simN.y;
            targetLookAtZ = simN.z;
            targetZoom = 1.15;
          }
        } else {
          targetLookAtX = 0;
          targetLookAtY = 0;
          targetLookAtZ = 0;
          targetZoom = 0.85;
        }
      }

      lookAtX += (targetLookAtX - lookAtX) * 0.07;
      lookAtY += (targetLookAtY - lookAtY) * 0.07;
      lookAtZ += (targetLookAtZ - lookAtZ) * 0.07;

      if (isReplaying) {
        cameraZ += ((600 / targetZoom) - cameraZ) * 0.04;
      } else if (!isDragging) {
        cameraZ += ((600 / targetZoom) - cameraZ) * 0.06;
      }

      if (shakeAmount > 0) {
        shakeAmount *= 0.9;
        if (shakeAmount < 0.1) shakeAmount = 0;
      }

      ctx.save();
      if (shakeAmount > 0) {
        const shakeX = (Math.random() - 0.5) * shakeAmount;
        const shakeY = (Math.random() - 0.5) * shakeAmount;
        ctx.translate(shakeX, shakeY);
      }

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const fov = 400;

      // Draw Grid Floor in 3D
      ctx.strokeStyle = "rgba(34, 211, 238, 0.03)";
      ctx.lineWidth = 0.6;
      const gridCount = 8;
      const gridSpacing = 80;
      for (let i = -gridCount; i <= gridCount; i++) {
        const xStart = i * gridSpacing - lookAtX;
        const zStart = -gridCount * gridSpacing - lookAtZ;
        const xEnd = i * gridSpacing - lookAtX;
        const zEnd = gridCount * gridSpacing - lookAtZ;
        const yFloor = 180 - lookAtY;

        const sx_y = xStart * Math.cos(rotY) - zStart * Math.sin(rotY);
        const sz_y = xStart * Math.sin(rotY) + zStart * Math.cos(rotY);
        const sy_x = yFloor * Math.cos(rotX) - sz_y * Math.sin(rotX);
        const sz_x = yFloor * Math.sin(rotX) + sz_y * Math.cos(rotX);

        const ex_y = xEnd * Math.cos(rotY) - zEnd * Math.sin(rotY);
        const ez_y = xEnd * Math.sin(rotY) + zEnd * Math.cos(rotY);
        const ey_x = yFloor * Math.cos(rotX) - ez_y * Math.sin(rotX);
        const ez_x = yFloor * Math.sin(rotX) + ez_y * Math.cos(rotX);

        const startScale = fov / (sz_x + cameraZ);
        const endScale = fov / (ez_x + cameraZ);

        if (startScale > 0 && endScale > 0) {
          ctx.beginPath();
          ctx.moveTo(centerX + sx_y * startScale, centerY + sy_x * startScale);
          ctx.lineTo(centerX + ex_y * endScale, centerY + ey_x * endScale);
          ctx.stroke();
        }
      }

      // Draw Connection Lines between nodes
      CONSTELLATION_EDGES.forEach((edge) => {
        const fromN = simNodes.find(n => n.id === edge.from);
        const toN = simNodes.find(n => n.id === edge.to);
        if (!fromN || !toN) return;

        if (fromN.exploded && currentTimeline !== "A") return;
        if (toN.exploded && currentTimeline !== "A") return;

        const rx1 = fromN.x - lookAtX;
        const ry1 = fromN.y - lookAtY;
        const rz1 = fromN.z - lookAtZ;

        const rx2 = toN.x - lookAtX;
        const ry2 = toN.y - lookAtY;
        const rz2 = toN.z - lookAtZ;

        const ax_y = rx1 * Math.cos(rotY) - rz1 * Math.sin(rotY);
        const az_y = rx1 * Math.sin(rotY) + rz1 * Math.cos(rotY);
        const ay_x = ry1 * Math.cos(rotX) - az_y * Math.sin(rotX);
        const az_x = ry1 * Math.sin(rotX) + az_y * Math.cos(rotX);

        const bx_y = rx2 * Math.cos(rotY) - rz2 * Math.sin(rotY);
        const bz_y = rx2 * Math.sin(rotY) + rz2 * Math.cos(rotY);
        const by_x = ry2 * Math.cos(rotX) - bz_y * Math.sin(rotX);
        const bz_x = ry2 * Math.sin(rotX) + bz_y * Math.cos(rotX);

        const scaleA = fov / (az_x + cameraZ);
        const scaleB = fov / (bz_x + cameraZ);

        if (scaleA > 0 && scaleB > 0) {
          ctx.beginPath();
          ctx.moveTo(centerX + ax_y * scaleA, centerY + ay_x * scaleA);
          ctx.lineTo(centerX + bx_y * scaleB, centerY + by_x * scaleB);

          const activeNode = activeNodeRef.current;
          const isHighlighted = activeNode && (fromN.id === activeNode.id || toN.id === activeNode.id);
          
          const alphaLine = Math.min(fromN.alpha, toN.alpha);

          if (isHighlighted) {
            ctx.strokeStyle = `rgba(34, 211, 238, ${alphaLine * 0.75})`;
            ctx.lineWidth = 1.8;
            ctx.shadowBlur = 8;
            ctx.shadowColor = "#22d3ee";
          } else {
            ctx.strokeStyle = `rgba(255, 255, 255, ${alphaLine * 0.08})`;
            ctx.lineWidth = 0.7;
            ctx.shadowBlur = 0;
          }
          ctx.stroke();
          ctx.shadowBlur = 0;
        }
      });

      // Draw Orbit Particles revolving around each node
      simNodes.forEach((node) => {
        if (node.exploded && currentTimeline !== "A") return;

        node.orbitParticles.forEach((part) => {
          part.angle += part.speed;

          const ox = Math.cos(part.angle) * part.radius;
          const oz = Math.sin(part.angle) * part.radius;
          const oy = part.yOffset;

          const ax = node.x + ox - lookAtX;
          const ay = node.y + oy - lookAtY;
          const az = node.z + oz - lookAtZ;

          const rx = ax * Math.cos(rotY) - az * Math.sin(rotY);
          const rz = ax * Math.sin(rotY) + az * Math.cos(rotY);
          const ry = ay * Math.cos(rotX) - rz * Math.sin(rotX);
          const rz_final = ay * Math.sin(rotX) + rz * Math.cos(rotX);

          const scale = fov / (rz_final + cameraZ);
          if (scale > 0) {
            ctx.fillStyle = part.color;
            ctx.beginPath();
            ctx.arc(centerX + rx * scale, centerY + ry * scale, 0.8 * scale, 0, Math.PI * 2);
            ctx.globalAlpha = node.alpha;
            ctx.fill();
            ctx.globalAlpha = 1.0;
          }
        });
      });

      // Draw Node typography labels and core indicators
      simNodes.forEach((node) => {
        if (node.exploded && currentTimeline !== "A") return;

        const rx = node.x - lookAtX;
        const ry = node.y - lookAtY;
        const rz = node.z - lookAtZ;

        const x1 = rx * Math.cos(rotY) - rz * Math.sin(rotY);
        const z1 = rx * Math.sin(rotY) + rz * Math.cos(rotY);
        const y2 = ry * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = ry * Math.sin(rotX) + z1 * Math.cos(rotX);

        const scale = fov / (z2 + cameraZ);
        if (scale > 0) {
          const screenX = centerX + x1 * scale;
          const screenY = centerY + y2 * scale;

          const activeNode = activeNodeRef.current;
          const isSelected = activeNode && activeNode.id === node.id;

          ctx.beginPath();
          ctx.arc(screenX, screenY, (isSelected ? 6.5 : 3.5) * scale, 0, Math.PI * 2);
          ctx.fillStyle = node.color;
          ctx.globalAlpha = node.alpha;
          
          if (isSelected) {
            ctx.shadowBlur = 12 * scale;
            ctx.shadowColor = node.color;
          }
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.globalAlpha = 1.0;

          if (isSelected) {
            ctx.save();
            ctx.strokeStyle = node.color;
            ctx.lineWidth = 0.8;
            ctx.globalAlpha = node.alpha;
            
            const rAngle = time / 600;
            ctx.beginPath();
            ctx.arc(screenX, screenY, 14 * scale, rAngle, rAngle + Math.PI * 0.4);
            ctx.stroke();

            ctx.beginPath();
            ctx.arc(screenX, screenY, 14 * scale, rAngle + Math.PI, rAngle + Math.PI * 1.4);
            ctx.stroke();
            ctx.restore();
          }

          // Node Text Labels
          ctx.font = `bold ${isSelected ? 11 : 9.5}px monospace`;
          ctx.fillStyle = isSelected ? "#ffffff" : "rgba(255,255,255,0.6)";
          ctx.textAlign = "center";
          ctx.globalAlpha = node.alpha;
          
          ctx.fillText(node.label, screenX, screenY - 14 * scale);

          // Subtitle
          ctx.font = `${isSelected ? 8.5 : 7.5}px monospace`;
          ctx.fillStyle = isSelected ? node.color : "rgba(255,255,255,0.3)";
          ctx.fillText(node.subtitle, screenX, screenY + 16 * scale);

          // Density Indicator
          ctx.font = "6.5px monospace";
          ctx.fillStyle = "rgba(255,255,255,0.2)";
          ctx.fillText(`[ DENSITY: ${node.density}p ]`, screenX, screenY + 25 * scale);

          ctx.globalAlpha = 1.0;
        }
      });

      // Draw Explosion Sparks
      sparks.forEach((spark) => {
        const rx = spark.x - lookAtX;
        const ry = spark.y - lookAtY;
        const rz = spark.z - lookAtZ;

        const x1 = rx * Math.cos(rotY) - rz * Math.sin(rotY);
        const z1 = rx * Math.sin(rotY) + rz * Math.cos(rotY);
        const y2 = ry * Math.cos(rotX) - z1 * Math.sin(rotX);
        const z2 = ry * Math.sin(rotX) + z1 * Math.cos(rotX);

        const scale = fov / (z2 + cameraZ);
        if (scale > 0) {
          ctx.fillStyle = spark.color;
          ctx.beginPath();
          ctx.arc(centerX + x1 * scale, centerY + y2 * scale, spark.size * scale, 0, Math.PI * 2);
          ctx.globalAlpha = spark.life;
          ctx.fill();
          ctx.globalAlpha = 1.0;
        }
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
      canvas.removeEventListener("mousedown", handleCanvasMouseDown);
      canvas.removeEventListener("mousemove", handleCanvasMouseMove);
      canvas.removeEventListener("mouseup", handleCanvasMouseUp);
      canvas.removeEventListener("mouseleave", handleCanvasMouseUp);
      canvas.removeEventListener("wheel", handleCanvasWheel);
    };
  }, [activeTab, isSimulationLocked, getReplayPath]);

  return (
    <main className={`relative min-h-screen text-white overflow-x-hidden font-mono select-none transition-all duration-1000 bg-gradient-to-b ${eraBgStyle}`}>
      {/* Grainy Noise Overlay */}
      <svg className="hidden">
        <filter id="grain-noise">
          <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
          <feColorMatrix type="matrix" values="0 0 0 0 0   0 0 0 0 0   0 0 0 0 0  0 0 0 0.08 0" />
          <feComposite operator="in" in2="SourceGraphic" />
        </filter>
      </svg>
      <div className="absolute inset-0 pointer-events-none opacity-[0.08] mix-blend-overlay z-1" style={{ filter: "url(#grain-noise)" }} />

      {/* Cybernetic Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:30px_30px] pointer-events-none z-1 opacity-50" />

      {/* Dynamic Animated Grainy Background Blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        {auraBlobs.map((blob, idx) => (
          <motion.div
            key={idx}
            className={`absolute rounded-full filter blur-[120px] opacity-60 mix-blend-screen ${blob.color} ${blob.width} ${blob.height}`}
            style={{
              top: blob.top || "auto",
              bottom: blob.bottom || "auto",
              left: blob.left || "auto",
              right: blob.right || "auto",
            }}
            animate={{
              x: blob.animateX,
              y: blob.animateY,
              scale: [1, 1.15, 1],
            }}
            transition={{
              duration: blob.duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      {/* ── Top Bar / Controls ── */}
      <div className="relative z-30 pt-28 px-6 max-w-7xl mx-auto w-full flex flex-col md:flex-row gap-4 items-center justify-between pointer-events-auto">
        <div className="flex items-center gap-4">
          <Link
            href="/personal"
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.01] text-slate-350 hover:text-white hover:border-white/20 hover:bg-white/[0.04] transition-all text-xs font-semibold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            [ PERSONAL ]
          </Link>
          <div>
            <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest block">
              LIFE.ARCHIVE // VER_HISTORY
            </span>
            <h1 className="text-sm font-bold tracking-tight text-white uppercase mt-0.5">
              Version History of a Human
            </h1>
          </div>
        </div>

        {/* Magnetic View Mode Toggle Switch */}
        <div className="relative flex items-center gap-1.5 p-1 bg-neutral-950/60 border border-white/15 backdrop-blur-md rounded-full overflow-hidden">
          <button
            onClick={() => { sysAudio.playSwitch(); setActiveTab("timeline"); }}
            className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors duration-300 uppercase ${
              activeTab === "timeline" ? "text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            {activeTab === "timeline" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-full z-[-1]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Temporal Timeline
          </button>
          <button
            onClick={() => { sysAudio.playSwitch(); setActiveTab("constellation"); }}
            className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors duration-300 uppercase ${
              activeTab === "constellation" ? "text-black" : "text-slate-400 hover:text-white"
            }`}
          >
            {activeTab === "constellation" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-full z-[-1]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            Neural Constellation
          </button>
          <button
            onClick={() => { sysAudio.playSwitch(); setActiveTab("simulation"); }}
            className={`relative z-10 px-4 py-1.5 rounded-full text-[10px] font-bold tracking-wider transition-colors duration-300 uppercase flex items-center gap-1.5 ${
              activeTab === "simulation" 
                ? "text-black" 
                : isSimulationLocked 
                  ? "text-slate-500 hover:text-slate-350" 
                  : "text-slate-400 hover:text-white"
            }`}
          >
            {activeTab === "simulation" && (
              <motion.span
                layoutId="activeTabPill"
                className="absolute inset-0 bg-white rounded-full z-[-1]"
                transition={{ type: "spring", stiffness: 380, damping: 30 }}
              />
            )}
            {isSimulationLocked && <span className="text-[9px]">🔒</span>}
            Life Simulation
          </button>
        </div>
      </div>

      {/* ── Mode 1: Temporal Timeline View ── */}
      {activeTab === "timeline" && (
        <div className="relative z-10 pt-8 pb-20 px-6 max-w-7xl mx-auto w-full flex flex-col gap-12 pointer-events-auto">
          
          {/* Horizontal Era Navigation / Evolution Track */}
          <div className="relative flex items-center w-full bg-neutral-950/40 border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="flex gap-4 items-center overflow-x-auto pb-1 w-full scrollbar-thin scrollbar-thumb-white/10 hide-scrollbar pr-4">
              {ERAS.map((era, index) => {
                const isSelected = selectedEraIndex === index;
                const isPast = index < selectedEraIndex;
                return (
                  <div key={era.version} className="flex items-center gap-4 flex-shrink-0">
                    <button
                      onClick={() => setSelectedEraIndex(index)}
                      className={`relative px-5 py-3 rounded-xl border transition-all text-left flex flex-col gap-0.5 ${
                        isSelected
                          ? "border-cyan-500/50 bg-cyan-500/10 text-white shadow-[0_0_20px_rgba(34,211,238,0.15)]"
                          : "border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/15 hover:text-slate-200"
                      }`}
                    >
                      {/* Selection indicator line */}
                      {isSelected && (
                        <motion.div
                          layoutId="timelineIndicator"
                          className="absolute -bottom-[1px] left-4 right-4 h-[2px] bg-cyan-400 z-10"
                          transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                      )}
                      <span className="text-[8px] font-bold tracking-widest font-mono text-cyan-400">
                        {era.version === "v5.0" ? "v5.0 (CURRENT BUILD)" : era.version.toUpperCase()}
                      </span>
                      <span className="text-xs font-bold uppercase tracking-wide">
                        {era.title}
                      </span>
                    </button>
                    {index < ERAS.length - 1 && (
                      <span className={`text-slate-650 font-bold select-none text-xs transition-colors duration-500 ${isPast ? "text-cyan-500/50" : "text-white/10"}`}>
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Era layout container */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left HUD Metadata Panel */}
            <div className="lg:col-span-4 border border-white/10 bg-neutral-950/40 backdrop-blur-md rounded-3xl p-6 md:p-8 space-y-6">
              <div>
                <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">
                  ERA SYSTEM SPECIFICATIONS
                </span>
                <h2 className="text-2xl font-bold font-mono text-white tracking-tight mt-1 uppercase">
                  <GlitchText text={selectedEra.title} />
                </h2>
                <p className="text-[10px] text-slate-400 font-mono mt-0.5 uppercase tracking-wider">
                  {selectedEra.subtitle}
                </p>
              </div>

              {/* HUD specs table */}
              <div className="border border-white/5 bg-white/[0.01] rounded-2xl p-4 font-mono text-[10px] space-y-3">
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-500 uppercase">TEMPORAL SCAN</span>
                  <span className="text-white font-bold">{selectedEra.dates}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-white/5">
                  <span className="text-slate-500 uppercase">BUILD STATUS</span>
                  <span className="text-cyan-400 font-bold tracking-widest">{selectedEra.status}</span>
                </div>
                <div className="py-1">
                  <span className="text-slate-500 uppercase block mb-1">CORE SYSTEM FOCUS</span>
                  <span className="text-white font-bold leading-normal block">
                    <GlitchText text={selectedEra.focus} />
                  </span>
                </div>
              </div>

              {/* Milestones / System events log */}
              <div className="space-y-3 font-mono">
                <span className="text-[8px] text-slate-500 uppercase tracking-widest block">
                  TIMELINE MARKERS
                </span>
                <div className="space-y-2 text-[9px] border-l border-white/15 pl-4 ml-1">
                  {selectedEra.memories.map((mem, mIdx) => (
                    <div key={mIdx} className="relative py-0.5">
                      <span className="absolute -left-[20.5px] top-1.5 w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                      <span className="text-slate-500">{mem.date}</span>
                      <span className="text-white font-bold block">{mem.title.toUpperCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Polaroid memory stack desk */}
            <div className="lg:col-span-8 flex flex-col items-center justify-center p-6 md:p-12 min-h-[420px] border border-white/5 bg-white/[0.01] rounded-3xl relative overflow-hidden">
              <span className="absolute top-4 left-4 text-[8px] text-slate-500 font-mono uppercase tracking-widest">
                Scattered Memory Stack (Desk View)
              </span>

              {/* Stack items */}
              <div className="relative w-full max-w-md h-[340px] flex items-center justify-center">
                {selectedEra.memories.map((mem, mIdx) => {
                  // Predefined offsets/rotations for deterministic styling (not random on every react render)
                  const rotations = [-12, 10, -7, 12];
                  const offsetsX = [10, -25, 20, -15];
                  const offsetsY = [-10, 15, -8, 12];
                  
                  const rotation = rotations[mIdx % rotations.length];
                  const offsetX = offsetsX[mIdx % offsetsX.length];
                  const offsetY = offsetsY[mIdx % offsetsY.length];

                  return (
                    <motion.div
                      key={mem.title}
                      initial={{
                        rotate: rotation,
                        x: offsetX,
                        y: offsetY,
                        scale: 0.95,
                        opacity: 0,
                      }}
                      animate={{
                        rotate: rotation,
                        x: offsetX,
                        y: offsetY,
                        scale: 1,
                        opacity: 1,
                        zIndex: 10 + mIdx,
                      }}
                      whileHover={{
                        rotate: 0,
                        scale: 1.1,
                        x: offsetX,
                        y: offsetY - 15,
                        zIndex: 100,
                        boxShadow: "0 25px 50px rgba(0,0,0,0.65)",
                        transition: { type: "spring", stiffness: 280, damping: 18 }
                      }}
                      onClick={() => setSelectedPolaroid(mem)}
                      className="absolute w-52 sm:w-60 bg-[#faf9f6] text-black p-3 pb-6 rounded shadow-[0_4px_15px_rgba(0,0,0,0.4)] border border-black/5 cursor-pointer transform origin-center transition-shadow"
                    >
                      {/* Polaroid Photo Frame */}
                      <div className="relative w-full aspect-[4/3] bg-neutral-900 overflow-hidden mb-3.5 border border-black/10">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mem.image}
                          alt={mem.title}
                          className="w-full h-full object-cover grayscale opacity-90 contrast-110"
                        />
                      </div>
                      
                      {/* Polaroid handwritten caption title */}
                      <h4 className="font-playfair text-center font-bold text-sm tracking-wide text-neutral-800 italic select-none">
                        {mem.title}
                      </h4>
                      <p className="font-mono text-center text-[8px] text-slate-500 mt-1 select-none">
                        {mem.date}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Mode 2: Neural Constellation View ── */}
      {activeTab === "constellation" && (
        <div className="relative z-10 w-full h-[calc(100vh-140px)] pointer-events-auto">
          {/* Constellation HTML5 Canvas */}
          <canvas
            ref={canvasRef}
            className="absolute inset-0 w-full h-full z-10 cursor-crosshair"
          />

          {/* Cyber Trait Cascade Panel Overlay */}
          <AnimatePresence>
            {hoveredConstNode && (
              <motion.div
                initial={{ opacity: 0, x: -30, scale: 0.95 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: -30, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute bottom-6 left-6 z-20 w-80 bg-neutral-950/80 border border-cyan-500/30 backdrop-blur-md rounded-2xl p-5 shadow-[0_0_30px_rgba(6,182,212,0.15)] font-mono space-y-4"
              >
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-2">
                  <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest">
                    TARGET: {hoveredConstNode.category}
                  </span>
                  <span className="text-[8px] text-slate-500 font-mono">
                    SEC_LOCKED // {hoveredConstNode.id.toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-tight uppercase">
                    {hoveredConstNode.label}
                  </h3>
                  <p className="text-[9px] text-slate-400 mt-1 italic">
                    Coordinates: {hoveredConstNode.polaroidData.coordinates}
                  </p>
                </div>
                
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest block">
                    TRAIT CASCADE TREE
                  </span>
                  <div className="space-y-1.5 text-[10px]">
                    {hoveredConstNode.traitCascade.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        {idx > 0 && <span className="text-cyan-400 font-bold">↳</span>}
                        <span className={idx === 0 ? "text-cyan-400 font-bold" : "text-white"}>
                          {item}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="text-[7px] text-slate-500 border-t border-white/5 pt-2 flex justify-between">
                  <span>WARP LINK: ONLINE</span>
                  <span>CLICK STAR NODE TO WARP</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Hyperspace zoom flash effect overlay */}
          {hyperspaceNode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 2 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeIn" }}
              className="absolute inset-0 z-40 bg-white pointer-events-none flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(6,182,212,0.8) 40%, rgba(6,7,9,1) 90%)"
              }}
            />
          )}
        </div>
      )}

      {/* ── Mode 3: Life Simulation View ── */}
      {activeTab === "simulation" && (
        <div className="relative z-10 w-full h-[calc(100vh-140px)] flex flex-col pointer-events-auto overflow-hidden">
          {isSimulationLocked ? (
            <div className="flex-1 flex items-center justify-center p-6 bg-black/30">
              <div className="w-full max-w-xl border border-cyan-500/30 bg-neutral-950/90 backdrop-blur-md rounded-2xl p-6 shadow-[0_0_50px_rgba(6,182,212,0.1)] flex flex-col gap-6">
                <div className="flex items-center justify-between border-b border-cyan-500/20 pb-3">
                  <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                    SECURE_LINK // CAUSALITY_DECRYPTOR
                  </span>
                  <span className="text-[9px] text-slate-500">SYSTEM.EXE v1.08</span>
                </div>

                <div className="flex-1 min-h-[220px] bg-black/60 border border-white/5 rounded-xl p-4 font-mono text-[10px] text-slate-400 overflow-y-auto space-y-2">
                  <div>SAUMYA.OS ACCESS PORT: RESTRICTED.</div>
                  <div>DECRYPTION LEVEL 3 SECURITY CLEARANCE REQUIRED.</div>
                  <div className="text-amber-500/80">WARNING: UNRESOLVED TIMELINES DETECTED IN SECTORS B & C.</div>
                  {decryptLog.map((log, idx) => (
                    <div key={idx} className={idx === decryptLog.length - 1 ? "text-cyan-400 font-bold" : "text-slate-350"}>
                      &gt; {log}
                    </div>
                  ))}
                  {isDecrypting && (
                    <div className="text-cyan-400 animate-pulse mt-2">
                      DECRYPTING [{(decryptLog.length * 11).toString().padStart(2, "0")}%]...
                    </div>
                  )}
                </div>

                {!isDecrypting && (
                  <button
                    onClick={handleDecryptSimulation}
                    className="w-full py-3 rounded-xl border border-cyan-400 bg-cyan-500/10 text-cyan-300 hover:text-white hover:bg-cyan-500/20 hover:border-white shadow-[0_0_20px_rgba(6,182,212,0.15)] transition-all font-bold tracking-widest text-xs uppercase"
                  >
                    [ DECRYPT LIFE.EXE ]
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 relative w-full h-full flex flex-col lg:flex-row overflow-hidden select-none">
              
              {/* Autopilot overlay / title cards */}
              <AnimatePresence>
                {isReplaying && replayIndex === -1 && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-6"
                  >
                    <div className="text-center space-y-4">
                      <span className="text-[10px] text-cyan-400 tracking-[0.3em] font-bold block uppercase animate-pulse">
                        INITIALIZING AUTOPILOT OVERVIEW
                      </span>
                      <h2 className="text-3xl md:text-5xl font-black text-white tracking-widest uppercase font-mono">
                        SAUMYA.OS
                      </h2>
                      <p className="text-slate-500 text-xs tracking-wider uppercase font-mono max-w-sm mx-auto leading-relaxed">
                        VERSION HISTORY // LIFE.EXE SIMULATION IN PROGRESS...
                      </p>
                      <div className="w-48 h-1 bg-white/10 mx-auto rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ duration: 2.0, ease: "linear" }}
                          className="h-full bg-cyan-400"
                        />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Autopilot outro overlay / pull back card */}
              <AnimatePresence>
                {isReplaying && replayIndex >= getReplayPath(activeTimeline).length && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 z-40 bg-black/80 backdrop-blur-md flex flex-col items-center justify-center p-6"
                  >
                    <div className="text-center space-y-4">
                      <h2 className="text-2xl font-bold text-cyan-400 tracking-wider uppercase font-mono animate-pulse">
                        SIMULATION RE-COMPILING
                      </h2>
                      <p className="text-slate-400 text-xs tracking-wider uppercase font-mono max-w-md mx-auto leading-relaxed">
                        PULLING BACK TO WHOLE UNIVERSE CORE. ACTIVE TIMELINE: TIMELINE_{activeTimeline}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Sidebar Left: Timeline Selector & Autopilot controls */}
              <div className="lg:w-80 w-full bg-neutral-950/80 border-b lg:border-b-0 lg:border-r border-white/10 backdrop-blur-md p-5 flex flex-col gap-6 z-20 overflow-y-auto">
                <div className="space-y-1">
                  <span className="text-[8px] text-cyan-400 font-bold uppercase tracking-widest block">
                    CAUSALITY CONFIG
                  </span>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Timeline Branch Manager
                  </h3>
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    onClick={() => { sysAudio.playSwitch(); setActiveTimeline("A"); setActiveSimulationNode(null); }}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      activeTimeline === "A"
                        ? "border-cyan-500/50 bg-cyan-500/10 text-white shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                        : "border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/15 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase">TIMELINE A</span>
                      {activeTimeline === "A" && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />}
                    </div>
                    <span className="text-[11px] font-bold block mt-1 uppercase text-slate-200">
                      Primary Build
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal uppercase">
                      All milestones intact. Motorcycling, heavy lifts, and compiler builds operating at peak telemetry.
                    </p>
                  </button>

                  <button
                    onClick={() => { sysAudio.playSwitch(); setActiveTimeline("B"); setActiveSimulationNode(null); }}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      activeTimeline === "B"
                        ? "border-amber-500/50 bg-amber-500/10 text-white shadow-[0_0_15px_rgba(245,158,11,0.1)]"
                        : "border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/15 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase">TIMELINE B</span>
                      {activeTimeline === "B" && <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />}
                    </div>
                    <span className="text-[11px] font-bold block mt-1 uppercase text-slate-200">
                      Alternate Ride
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal uppercase">
                      FIRST FREEDOM (Cruiser) erased. Bike KMs and road trips drop to zero. Camera focus shifted.
                    </p>
                  </button>

                  <button
                    onClick={() => { sysAudio.playSwitch(); setActiveTimeline("C"); setActiveSimulationNode(null); }}
                    className={`text-left p-3.5 rounded-xl border transition-all ${
                      activeTimeline === "C"
                        ? "border-red-500/50 bg-red-500/10 text-white shadow-[0_0_15px_rgba(239,68,68,0.1)]"
                        : "border-white/5 bg-white/[0.01] text-slate-400 hover:border-white/15 hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold tracking-wider uppercase">TIMELINE C</span>
                      {activeTimeline === "C" && <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-ping" />}
                    </div>
                    <span className="text-[11px] font-bold block mt-1 uppercase text-slate-200">
                      Physical Baseline
                    </span>
                    <p className="text-[9px] text-slate-500 mt-1 leading-normal uppercase">
                      PROVING STRENGTH (210kg) erased. Severe recovery limiters. Systems building capabilities degraded.
                    </p>
                  </button>
                </div>

                <div className="border-t border-white/10 pt-4 mt-auto">
                  {!isReplaying ? (
                    <button
                      onClick={() => { sysAudio.playSwitch(); setIsReplaying(true); }}
                      className="w-full py-2.5 rounded-xl border border-cyan-400/50 bg-cyan-500/10 hover:bg-cyan-500/20 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                    >
                      <Play className="w-3.5 h-3.5 fill-cyan-400/20" />
                      REPLAY LIFE.EXE
                    </button>
                  ) : (
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center justify-between text-[9px] text-slate-400">
                        <span>AUTOPILOT TRAILER IN PROGRESS...</span>
                        <span className="font-bold text-cyan-400">{replayCountdown}S REMAINING</span>
                      </div>
                      <button
                        onClick={() => { sysAudio.playSwitch(); setIsReplaying(false); }}
                        className="w-full py-2.5 rounded-xl border border-red-500/40 bg-red-500/10 hover:bg-red-500/20 text-red-300 hover:text-white transition-all text-[10px] font-bold tracking-widest uppercase flex items-center justify-center gap-2"
                      >
                        <Pause className="w-3.5 h-3.5" />
                        ABORT TRAILER
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Center Screen: 3D canvas container */}
              <div className="flex-1 relative h-full bg-black/10 min-h-[300px]">
                <canvas
                  ref={simulationCanvasRef}
                  className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing z-10"
                />

                <div className="absolute top-4 right-4 z-20 pointer-events-none bg-neutral-950/70 border border-white/5 backdrop-blur-md rounded-xl p-3 text-[8.5px] text-slate-400 space-y-1 font-mono uppercase">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                    <span>STABLE NODES</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                    <span>STRENGTH TELEMETRY</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-400 animate-pulse" />
                    <span>SETBACK EVENTS</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                    <span>[REDACTED] SECTOR</span>
                  </div>
                  <div className="text-[7.5px] border-t border-white/5 pt-1.5 mt-1.5 text-slate-500">
                    DRAG CANVAS TO ROTATE // WHEEL TO ZOOM // CLICK NODE TO FOCUS
                  </div>
                </div>
              </div>

              {/* Sidebar Right: Telemetry HUD Panel */}
              <div className="lg:w-96 w-full bg-neutral-950/80 border-t lg:border-t-0 lg:border-l border-white/10 backdrop-blur-md p-6 flex flex-col gap-6 z-20 overflow-y-auto">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                  <span className="text-[9px] text-cyan-400 font-bold uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                    HUMAN.OS // SYSTEM_TELEMETRY
                  </span>
                  <span className="text-[8.5px] text-slate-500">
                    TIMELINE_{activeTimeline}
                  </span>
                </div>

                <div className="flex-1 space-y-5">
                  {activeSimulationNode ? (
                    activeSimulationNode.id === "blackbox-node" ? (
                      <div className="space-y-4">
                        <div className="border border-red-500/30 bg-red-500/5 rounded-xl p-4 text-center space-y-2">
                          <ShieldAlert className="w-8 h-8 text-red-500 animate-bounce mx-auto" />
                          <h4 className="text-sm font-bold text-red-500 uppercase tracking-widest">
                            ACCESS DENIED
                          </h4>
                          <p className="text-[9px] text-red-400 font-mono">
                            SECTOR CORRUPTED // AUTHENTICATION ERROR // DATA DEGRADATION DETECTED
                          </p>
                        </div>

                        <div className="aspect-[4/3] w-full bg-black rounded-xl border border-white/10 overflow-hidden relative">
                          <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] bg-[size:8px_8px] pointer-events-none z-10" />
                          <SlideshowGlitch />
                        </div>
                        
                        <div className="border-l-2 border-red-500/50 bg-white/[0.01] p-3 text-[9.5px] text-slate-400 leading-normal uppercase">
                          No text, description, or logs exist for this sector in the primary timeline archives.
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <span className="text-[8.5px] font-bold text-cyan-400 uppercase tracking-wider block">
                            NODE SPECIFICATION
                          </span>
                          <h4 className="text-base font-bold text-white uppercase tracking-tight mt-0.5">
                            {activeSimulationNode.label}
                          </h4>
                          <p className="text-[9px] text-slate-400 font-mono mt-0.5">
                            {activeSimulationNode.subtitle}
                          </p>
                        </div>

                        <div className="aspect-[4/3] w-full bg-black rounded-xl border border-white/10 overflow-hidden relative">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={activeSimulationNode.polaroidData.image}
                            alt={activeSimulationNode.label}
                            className="w-full h-full object-cover grayscale contrast-110 opacity-80"
                          />
                          <div className="absolute bottom-3 left-3 bg-black/80 px-2 py-0.5 border border-white/10 rounded text-[7.5px] text-slate-400">
                            {activeSimulationNode.polaroidData.date}
                          </div>
                        </div>

                        <div className="space-y-3 border-t border-white/5 pt-3 text-[10px] text-slate-350">
                          <div className="flex justify-between py-1 border-b border-white/5 font-mono text-[9px]">
                            <span className="text-slate-500">SECTOR LOCATION</span>
                            <span className="text-white font-bold">{activeSimulationNode.polaroidData.location}</span>
                          </div>
                          <div className="flex justify-between py-1 border-b border-white/5 font-mono text-[9px]">
                            <span className="text-slate-500">GEOGRAPHIC COORDS</span>
                            <span className="text-white font-bold">{activeSimulationNode.polaroidData.coordinates}</span>
                          </div>
                          <div className="space-y-1 py-1">
                            <span className="text-slate-500 text-[9px] block">CAUSAL LORE RECORD</span>
                            <p className="text-slate-200 leading-normal italic text-[9.5px]">
                              &quot;{activeSimulationNode.polaroidData.lore}&quot;
                            </p>
                          </div>
                          <div className="border-l-2 border-cyan-500/50 bg-white/[0.01] p-3 text-[9.5px] text-slate-300 leading-normal">
                            <span className="text-slate-500 text-[8px] font-bold block uppercase tracking-wider mb-1">
                              WHY IT MATTERED
                            </span>
                            {activeSimulationNode.polaroidData.whyItMattered}
                          </div>
                        </div>

                        {["freedom-node", "strength-node", "rebuild-node"].includes(activeSimulationNode.id) && (
                          <div className="pt-2 border-t border-white/5">
                            <button
                              onClick={() => {
                                sysAudio.playGearClunk();
                                if (activeSimulationNode.id === "freedom-node") {
                                  setActiveTimeline("B");
                                } else {
                                  setActiveTimeline("C");
                                }
                                setActiveSimulationNode(null);
                              }}
                              className="w-full py-2 px-3 rounded-lg border border-red-500/40 bg-red-500/5 hover:bg-red-500/15 hover:border-red-500 text-red-400 hover:text-white transition-all text-[8.5px] font-bold tracking-widest uppercase flex items-center justify-center gap-1.5"
                            >
                              <Trash2 className="w-3 h-3 text-red-400" />
                              [ WHAT IF THIS NEVER HAPPENED? ]
                            </button>
                            <span className="text-[7.5px] text-slate-500 font-mono mt-1 text-center block leading-relaxed">
                              WARNING: DELETING THIS CORE NODE WILL COLLAPSE ALL DOWNSTREAM CAUSAL EVENTS AND ADJUST STATISTICS IN REAL-TIME.
                            </span>
                          </div>
                        )}
                      </div>
                    )
                  ) : (
                    <div className="h-48 flex flex-col items-center justify-center text-center p-4 border border-dashed border-white/15 rounded-2xl">
                      <Orbit className="w-7 h-7 text-slate-600 animate-spin-slow mb-3" />
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest">
                        Awaiting Node Focus
                      </span>
                      <p className="text-[8px] text-slate-600 mt-1 max-w-[200px] leading-normal uppercase">
                        Select a floating typography checkpoint inside the 3D grid space to analyze its causality details.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/10 pt-4 space-y-3 font-mono text-[9px]">
                  <span className="text-[8px] text-slate-500 uppercase tracking-widest block">
                    TELEMETRY STATS ENGINE
                  </span>
                  
                  <div className="grid grid-cols-2 gap-2 text-[9px]">
                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                      <span className="text-slate-500 uppercase block text-[7.5px]">DAYS LIVED</span>
                      <span className="text-white font-bold text-xs">6,570 DAYS</span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                      <span className="text-slate-500 uppercase block text-[7.5px]">BIKE KMS</span>
                      <motion.span 
                        key={activeTimeline === "B" ? "bike-b" : "bike-a"}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-bold text-xs ${activeTimeline === "B" ? "text-red-400 line-through" : "text-white"}`}
                      >
                        {activeTimeline === "B" ? "0 KM" : "12,450 KM"}
                      </motion.span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                      <span className="text-slate-500 uppercase block text-[7.5px]">ROAD TRIPS</span>
                      <motion.span 
                        key={activeTimeline === "B" ? "trips-b" : "trips-a"}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-bold text-xs ${activeTimeline === "B" ? "text-red-400 line-through" : "text-white"}`}
                      >
                        {activeTimeline === "B" ? "0 TRIPS" : "18 TRIPS"}
                      </motion.span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                      <span className="text-slate-500 uppercase block text-[7.5px]">TOTAL PRs</span>
                      <motion.span 
                        key={activeTimeline === "C" ? "prs-b" : "prs-a"}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-bold text-xs ${activeTimeline === "C" ? "text-red-400 line-through" : "text-white"}`}
                      >
                        {activeTimeline === "C" ? "0 PRs" : "5 PRs"}
                      </motion.span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                      <span className="text-slate-500 uppercase block text-[7.5px]">PROJECTS</span>
                      <motion.span 
                        key={activeTimeline === "C" ? "proj-b" : "proj-a"}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-bold text-xs ${activeTimeline === "C" ? "text-amber-500" : "text-white"}`}
                      >
                        {activeTimeline === "C" ? "7 SYSTEMS" : "12 SYSTEMS"}
                      </motion.span>
                    </div>

                    <div className="bg-white/[0.01] border border-white/5 p-2 rounded-lg">
                      <span className="text-slate-500 uppercase block text-[7.5px]">PHOTO SESSIONS</span>
                      <motion.span 
                        key={activeTimeline === "B" ? "photo-b" : "photo-a"}
                        initial={{ scale: 0.9, opacity: 0.5 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className={`font-bold text-xs ${activeTimeline === "B" ? "text-amber-500" : "text-white"}`}
                      >
                        {activeTimeline === "B" ? "12 SESS" : "37 SESS"}
                      </motion.span>
                    </div>
                  </div>

                  <div className="bg-white/[0.01] border border-white/5 p-2.5 rounded-lg flex items-center justify-between">
                    <span className="text-slate-500 uppercase text-[7.5px]">OS CORE BUILD STATUS</span>
                    <motion.span 
                      key={activeTimeline}
                      initial={{ scale: 0.95 }}
                      animate={{ scale: 1 }}
                      className={`font-bold text-[9px] px-2 py-0.5 rounded tracking-wide ${
                        activeTimeline === "A" 
                          ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" 
                          : activeTimeline === "B"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse"
                            : "bg-red-500/10 text-red-400 border border-red-500/20 animate-pulse"
                      }`}
                    >
                      {activeTimeline === "A" && "v5.0 (STABLE)"}
                      {activeTimeline === "B" && "v5.0 (METEOR_OFFLINE)"}
                      {activeTimeline === "C" && "v5.0 (DEGRADED)"}
                    </motion.span>
                  </div>
                </div>

              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Global Audio Soundtrack Widget (Bottom-Left) ── */}
      {activeTab === "timeline" && (
        <div className="fixed bottom-6 left-6 z-25 bg-neutral-950/60 border border-white/10 rounded-2xl p-3.5 shadow-glass flex items-center gap-3.5 backdrop-blur-md pointer-events-auto select-none">
          <div className="p-2 bg-cyan-500/10 rounded-xl border border-cyan-500/20 text-cyan-400">
            <Music className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[7px] text-slate-500 uppercase tracking-widest block">
              ERA ANTHEM SOUNDTRACK
            </span>
            <span className="font-bold text-white text-[10px] block mt-0.5 tracking-tight">
              {selectedEra.soundtrack.title}
            </span>
            <span className="text-[8.5px] text-slate-400 font-medium font-mono">
              {selectedEra.soundtrack.artist}
            </span>
          </div>

          {/* animated equalizer bars */}
          <div className="flex gap-0.5 h-6 items-end px-2">
            {[1, 2, 3, 4, 5].map((bar) => (
              <span
                key={bar}
                className="w-[1.8px] bg-cyan-400 rounded-t"
                style={{
                  height: "100%",
                  transformOrigin: "bottom",
                  animation: isPlaying
                    ? `equalizer 1s ease-in-out infinite alternate ${bar * 0.15}s`
                    : "none",
                  maxHeight: isPlaying ? "20px" : "3px"
                }}
              />
            ))}
          </div>

          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="p-1.5 rounded-lg border border-white/15 hover:border-white/30 text-slate-400 hover:text-white transition-all bg-white/[0.01]"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          </button>
        </div>
      )}

      {/* ── Polaroid Detailed Lore Modal (Fullscreen) ── */}
      <AnimatePresence>
        {selectedPolaroid && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 pointer-events-auto">
            {/* Modal backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedPolaroid(null)}
              className="absolute inset-0 bg-black/95 backdrop-blur-md"
            />

            {/* Lore Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              transition={{ type: "spring", duration: 0.4 }}
              className="relative w-full max-w-2xl bg-neutral-950 border border-white/15 rounded-3xl p-6 md:p-8 overflow-hidden shadow-[0_0_60px_rgba(255,255,255,0.03)] max-h-[85vh] overflow-y-auto"
            >
              {/* High-tech grid background */}
              <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)] bg-[size:20px_20px] pointer-events-none opacity-40" />

              {/* Close Button */}
              <button
                onClick={() => setSelectedPolaroid(null)}
                className="absolute top-6 right-6 p-2 rounded-full border border-white/10 hover:border-white/30 bg-white/[0.02] text-slate-400 hover:text-white transition-all active:scale-95 z-20"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="relative z-10 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-8">
                {/* Photo Left */}
                <div className="md:col-span-5 flex flex-col justify-center">
                  <div className="aspect-[4/3] w-full rounded-2xl overflow-hidden border border-white/10 bg-black shadow-inner">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={selectedPolaroid.image}
                      alt={selectedPolaroid.title}
                      className="w-full h-full object-cover grayscale opacity-90 contrast-110"
                    />
                  </div>
                  <div className="mt-3.5 font-mono text-[8.5px] text-slate-500 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 text-cyan-400" />
                      <span>DATE: {selectedPolaroid.date}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-cyan-400" />
                      <span>LOC: {selectedPolaroid.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-cyan-400" />
                      <span>COORDS: {selectedPolaroid.coordinates}</span>
                    </div>
                  </div>
                </div>

                {/* Details Right */}
                <div className="md:col-span-7 flex flex-col justify-between space-y-5">
                  <div className="space-y-3">
                    <span className="text-[8px] font-mono text-cyan-400 font-bold uppercase tracking-widest block">
                      SYSTEM_MEMORY // DEEP_LORE
                    </span>
                    <h3 className="text-xl font-bold font-mono text-white tracking-tight uppercase border-b border-white/5 pb-2">
                      {selectedPolaroid.title}
                    </h3>
                    <p className="text-slate-300 text-xs md:text-sm font-mono leading-relaxed italic">
                      &quot;{selectedPolaroid.lore}&quot;
                    </p>
                  </div>

                  <div className="border-l-2 border-cyan-500/50 bg-white/[0.01] rounded-r-2xl p-4 space-y-1">
                    <span className="text-[8px] font-mono text-slate-500 uppercase tracking-widest block">
                      WHY IT MATTERED
                    </span>
                    <p className="text-slate-200 text-xs font-mono leading-relaxed">
                      {selectedPolaroid.whyItMattered}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modal decor footer */}
              <div className="mt-8 pt-4 border-t border-white/5 flex items-center justify-between text-[7.5px] font-mono text-slate-600 tracking-wider">
                <span>SYSTEM_LOG: MEMORY_READ_OK</span>
                <span>ARCHIVE_SECTOR_0{selectedEraIndex + 1}</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global CSS for loop animations */}
      <style jsx global>{`
        @keyframes equalizer {
          0% { transform: scaleY(0.1); }
          100% { transform: scaleY(1.0); }
        }
      `}</style>
    </main>
  );
}
