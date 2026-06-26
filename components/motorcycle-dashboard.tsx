"use client";

import { useState, useEffect, useRef } from "react";
import { useOS } from "@/lib/os-context";

interface ExhaustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  alpha: number;
  size: number;
  maxLife: number;
  life: number;
  type: "smoke" | "spark";
}

export function MotorcycleDashboard() {
  const { addLog, theme } = useOS();

  // Engine States
  const [ignition, setIgnition] = useState(false);
  const [engineState, setEngineState] = useState<"OFF" | "CRANKING" | "IDLE" | "RUNNING">("OFF");
  const [rpm, setRpm] = useState(0);
  const [speed, setSpeed] = useState(0);
  const [gear, setGear] = useState("N");
  const [isThrottling, setIsThrottling] = useState(false);
  const [isShifting, setIsShifting] = useState(false);

  // Simulated Telemetry
  const [tireTempFront, setTireTempFront] = useState(25); // Celsius
  const [tireTempRear, setTireTempRear] = useState(25);
  const [engineTemp, setEngineTemp] = useState(30);
  const [oilPressure, setOilPressure] = useState(0); // PSI
  const [airFlow, setAirFlow] = useState(0); // g/s
  const [clutchActive, setClutchActive] = useState(false);
  const [liveTime, setLiveTime] = useState("--:--:--");

  // Wheel and Vibration Animations
  const [wheelRotation, setWheelRotation] = useState(0);
  const [cylinderShake, setCylinderShake] = useState({ x: 0, y: 0 });

  // Web Audio refs
  const audioCtxRef = useRef<AudioContext | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const subOscRef = useRef<OscillatorNode | null>(null);
  const synthGainRef = useRef<GainNode | null>(null);
  const lfoRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  // Physics & Animation timing refs
  const lastTimeRef = useRef<number>(0);
  const throttleTimeRef = useRef<number>(0); // ms of continuous throttle
  const gearShiftTimerRef = useRef<number | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const particlesRef = useRef<ExhaustParticle[]>([]);
  const frameIdRef = useRef<number | null>(null);

  // Shift points (km/h)
  const upshiftThresholds = [
    { from: "1", to: "2", speed: 30 },
    { from: "2", to: "3", speed: 60 },
    { from: "3", to: "4", speed: 90 },
    { from: "4", to: "5", speed: 115 },
    { from: "5", to: "6", speed: 140 },
  ];

  const downshiftThresholds = [
    { from: "6", to: "5", speed: 132 },
    { from: "5", to: "4", speed: 108 },
    { from: "4", to: "3", speed: 82 },
    { from: "3", to: "2", speed: 54 },
    { from: "2", to: "1", speed: 26 },
  ];

  // Helper to play short mechanical sounds using standard audio context
  const playMechanicalClick = (freqStart: number, freqEnd: number, duration: number, vol: number) => {
    if (!audioCtxRef.current) return;
    try {
      const ctx = audioCtxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(freqStart, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freqEnd, ctx.currentTime + duration);
      gain.gain.setValueAtTime(vol, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + duration + 0.05);
    } catch (e) {
      console.error(e);
    }
  };

  // Initialize Web Audio API nodes
  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master output gain
      const mainGain = ctx.createGain();
      mainGain.gain.setValueAtTime(0, ctx.currentTime);
      mainGain.connect(ctx.destination);
      mainGainRef.current = mainGain;

      // Resonant Lowpass Filter (simulates chrome exhaust mufflers)
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.Q.setValueAtTime(2.5, ctx.currentTime);
      filter.frequency.setValueAtTime(120, ctx.currentTime);
      filter.connect(mainGain);
      filterNodeRef.current = filter;

      // Synth signal gain (modulated by LFO for chug)
      const synthGain = ctx.createGain();
      synthGain.gain.setValueAtTime(0.5, ctx.currentTime);
      synthGain.connect(filter);
      synthGainRef.current = synthGain;

      // Detuned Parallel-Twin Oscillators
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(20, ctx.currentTime);
      osc1.connect(synthGain);
      osc1.start(0);
      osc1Ref.current = osc1;

      const osc2 = ctx.createOscillator();
      osc2.type = "triangle";
      osc2.frequency.setValueAtTime(20.2, ctx.currentTime);
      osc2.connect(synthGain);
      osc2.start(0);
      osc2Ref.current = osc2;

      // Sub-bass thud oscillator
      const subOsc = ctx.createOscillator();
      subOsc.type = "sine";
      subOsc.frequency.setValueAtTime(10, ctx.currentTime);
      subOsc.connect(synthGain);
      subOsc.start(0);
      subOscRef.current = subOsc;

      // LFO combustion stroke amplitude modulator
      const lfo = ctx.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(8, ctx.currentTime);

      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.25, ctx.currentTime);

      lfo.connect(lfoGain);
      lfoGain.connect(synthGain.gain);
      lfo.start(0);
      lfoRef.current = lfo;
      lfoGainRef.current = lfoGain;

      addLog("vehicle", "Web Audio engine nodes loaded");
    } catch (err) {
      console.error("Audio Context initialization failed", err);
    }
  };

  const closeAudio = () => {
    try {
      if (osc1Ref.current) osc1Ref.current.stop();
      if (osc2Ref.current) osc2Ref.current.stop();
      if (subOscRef.current) subOscRef.current.stop();
      if (lfoRef.current) lfoRef.current.stop();

      osc1Ref.current = null;
      osc2Ref.current = null;
      subOscRef.current = null;
      lfoRef.current = null;

      if (audioCtxRef.current && audioCtxRef.current.state !== "closed") {
        audioCtxRef.current.close();
      }
      audioCtxRef.current = null;
    } catch (e) {
      console.error(e);
    }
  };

  // Ignition control switch toggle
  const handleIgnition = () => {
    if (!ignition) {
      setIgnition(true);
      addLog("vehicle", "Ignition key turned ON. Systems initialized.");
      initAudio();
      setTimeout(() => {
        playMechanicalClick(800, 300, 0.08, 0.15);
      }, 50);
    } else {
      setIgnition(false);
      setEngineState("OFF");
      setRpm(0);
      setSpeed(0);
      setGear("N");
      setIsThrottling(false);
      setIsShifting(false);
      setClutchActive(false);
      throttleTimeRef.current = 0;
      setTireTempFront(25);
      setTireTempRear(25);
      setEngineTemp(30);
      setOilPressure(0);
      setAirFlow(0);
      closeAudio();
      addLog("vehicle", "Ignition key turned OFF. Systems powered down.");
    }
  };

  // Starter Button push
  const handleStarterPress = () => {
    if (!ignition || engineState !== "OFF") return;

    setEngineState("CRANKING");
    addLog("vehicle", "Starter motor cranking parallel-twin engine...");

    if (audioCtxRef.current) {
      const ctx = audioCtxRef.current;
      if (ctx.state === "suspended") ctx.resume();

      // Crank sounds
      // Pulse 1
      playMechanicalClick(140, 60, 0.12, 0.25);
      // Pulse 2
      setTimeout(() => {
        if (engineStateRef.current === "CRANKING") playMechanicalClick(130, 50, 0.12, 0.25);
      }, 250);
      // Pulse 3
      setTimeout(() => {
        if (engineStateRef.current === "CRANKING") playMechanicalClick(125, 45, 0.12, 0.25);
      }, 500);

      // Start engine after 850ms
      setTimeout(() => {
        if (engineStateRef.current !== "CRANKING") return;
        setEngineState("IDLE");
        setRpm(1200);
        setGear("N");
        setOilPressure(42);
        setEngineTemp(45);
        addLog("vehicle", "Engine fired up. Idle stabilized at 1200 RPM.");
        
        // Trigger visual exhaust puffs
        triggerExhaustPuffs(6);

        // Turn on audio hum
        if (mainGainRef.current) {
          mainGainRef.current.gain.linearRampToValueAtTime(0.12, ctx.currentTime + 0.1);
        }
      }, 850);
    }
  };

  // Handle engine kill
  const handleKillSwitch = () => {
    if (engineState === "OFF") return;
    setEngineState("OFF");
    setRpm(0);
    setSpeed(0);
    setGear("N");
    setIsThrottling(false);
    setIsShifting(false);
    setClutchActive(false);
    throttleTimeRef.current = 0;
    setOilPressure(0);
    setAirFlow(0);
    if (mainGainRef.current && audioCtxRef.current) {
      mainGainRef.current.gain.linearRampToValueAtTime(0, audioCtxRef.current.currentTime + 0.15);
    }
    playMechanicalClick(250, 100, 0.08, 0.1);
    addLog("vehicle", "Engine killed via switch.");
  };

  // Sync state reference to prevent setTimeout closures from reading stale state
  const engineStateRef = useRef(engineState);
  useEffect(() => {
    engineStateRef.current = engineState;
  }, [engineState]);

  // Exhaust canvas particle triggers
  const triggerExhaustPuffs = (count: number) => {
    for (let i = 0; i < count; i++) {
      particlesRef.current.push({
        x: 84,
        y: 246,
        vx: -2.5 - Math.random() * 2,
        vy: (Math.random() - 0.5) * 1.5,
        alpha: 0.8,
        size: 3 + Math.random() * 4,
        maxLife: 25 + Math.random() * 20,
        life: 0,
        type: "smoke",
      });
    }
  };

  // Main physical updates and canvas drawing loops
  useEffect(() => {
    const updateLoop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const deltaTime = (timestamp - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = timestamp;

      // Limit large delta times from window swaps
      const dt = Math.min(deltaTime, 0.1);

      // Handle variables based on engine state
      if (engineState === "IDLE" || engineState === "RUNNING") {
        
        // 1. Shifting State Machine
        if (isShifting) {
          // RPM drops rapidly during clutch shifts
          setRpm((prev) => {
            const targetClutchRpm = gear === "1" ? 3800 : 4200;
            const nextRpm = prev - (prev - targetClutchRpm) * dt * 8;
            return Math.max(nextRpm, 1500);
          });

          // Decelerate slightly during shifting
          setSpeed((prev) => {
            const nextSpeed = prev - 8 * dt;
            return Math.max(nextSpeed, 0);
          });

        } else {
          // Normal Riding / Acceleration
          if (isThrottling) {
            setEngineState("RUNNING");
            // Accumulate throttle duration
            throttleTimeRef.current = Math.min(throttleTimeRef.current + dt * 1000, 15000);
            
            // Calculate speed target on 15s curve to 160
            const progress = throttleTimeRef.current / 15000;
            const targetSpeed = Math.pow(progress, 1.22) * 160;
            
            setSpeed((prev) => {
              const diff = targetSpeed - prev;
              return parseFloat((prev + diff * dt * 15).toFixed(1));
            });

            // Derive RPM based on current Speed and Gear mapping
            setRpm(() => {
              const curSpeed = speed;
              let derivedRpm = 1200;
              if (gear === "N") {
                derivedRpm = 1200 + (progress * 7000);
              } else if (gear === "1") {
                derivedRpm = 1200 + (curSpeed / 30) * (7600 - 1200);
              } else if (gear === "2") {
                derivedRpm = 4000 + ((curSpeed - 30) / 30) * (7600 - 4000);
              } else if (gear === "3") {
                derivedRpm = 4300 + ((curSpeed - 60) / 30) * (7600 - 4300);
              } else if (gear === "4") {
                derivedRpm = 4500 + ((curSpeed - 90) / 25) * (7600 - 4500);
              } else if (gear === "5") {
                derivedRpm = 4800 + ((curSpeed - 115) / 25) * (7600 - 4800);
              } else if (gear === "6") {
                derivedRpm = 5000 + ((curSpeed - 140) / 20) * (7200 - 5000);
              }
              // Add rev limiter cut vibration at redline
              if (derivedRpm >= 7600) {
                derivedRpm = 7500 + (Math.sin(timestamp * 0.08) * 150);
              }
              return Math.min(derivedRpm, 8200);
            });

            // Adjust auxiliary variables
            setAirFlow((prev) => prev + (rpm / 20 - prev) * 0.1);
            setOilPressure((prev) => prev + (55 - prev) * 0.05);
            setEngineTemp((prev) => Math.min(prev + dt * 0.8, 115));
            setTireTempFront((prev) => Math.min(prev + dt * 0.1, 48));
            setTireTempRear((prev) => Math.min(prev + dt * 0.18, 54));

          } else {
            // Idle Deceleration (Engine Braking)
            throttleTimeRef.current = Math.max(throttleTimeRef.current - dt * 2500, 0);
            
            setSpeed((prev) => {
              const nextSpeed = prev - 18 * dt; // engine brake deceleration rate
              return Math.max(parseFloat(nextSpeed.toFixed(1)), 0);
            });

            setRpm((prev) => {
              let targetIdleRpm = 1200;
              if (speed > 2) {
                // Map RPM down to matching gear rolling speed
                if (gear === "1") targetIdleRpm = 1200 + (speed / 30) * (5000 - 1200);
                else if (gear === "2") targetIdleRpm = 3000 + ((speed - 30) / 30) * (2000);
                else if (gear === "3") targetIdleRpm = 3200 + ((speed - 60) / 30) * (1800);
                else if (gear === "4") targetIdleRpm = 3300 + ((speed - 90) / 25) * (1700);
                else if (gear === "5") targetIdleRpm = 3500 + ((speed - 115) / 25) * (1500);
                else if (gear === "6") targetIdleRpm = 3700 + ((speed - 140) / 20) * (1300);
              }
              const nextRpm = prev - (prev - targetIdleRpm) * dt * 5;
              return Math.max(nextRpm, 1200);
            });

            setAirFlow((prev) => prev + (12 - prev) * 0.15);
            setOilPressure((prev) => prev + (42 - prev) * 0.15);
            setEngineTemp((prev) => Math.max(prev - dt * 0.15, 65));
            setTireTempFront((prev) => Math.max(prev - dt * 0.06, 25));
            setTireTempRear((prev) => Math.max(prev - dt * 0.08, 25));

            if (speed === 0 && gear === "N") {
              setEngineState("IDLE");
            }
          }

          // 2. Shifting thresholds triggers
          if (!isShifting && gear !== "N") {
            // Upshifting checks
            const nextUp = upshiftThresholds.find((t) => t.from === gear && speed >= t.speed);
            if (nextUp) {
              triggerShift(nextUp.to);
            }

            // Downshifting checks
            const nextDown = downshiftThresholds.find((t) => t.from === gear && speed < t.speed);
            if (nextDown) {
              triggerShift(nextDown.to);
            }
          }

          // Gear 1 shift in from Neutral
          if (gear === "N" && isThrottling && speed === 0 && !isShifting) {
            triggerShift("1");
          }
          // Back to Neutral if stopped and idling
          if (gear === "1" && speed === 0 && !isThrottling && !isShifting) {
            triggerShift("N");
          }
        }

        // 3. Engine vibration calculations
        const vibrAmplitude = Math.min((rpm / 8200) * 1.6, 2.5);
        if (rpm > 1200) {
          setCylinderShake({
            x: (Math.random() - 0.5) * vibrAmplitude,
            y: (Math.random() - 0.5) * vibrAmplitude,
          });
        } else {
          // Gentle idle tickover vibration
          setCylinderShake({
            x: (Math.random() - 0.5) * 0.3,
            y: (Math.random() - 0.5) * 0.3,
          });
        }

        // 4. Wheels rotation angle accretion
        const distanceRot = (speed / 3.6) * dt; // meters driven this frame
        const circFront = 2 * Math.PI * 0.33; // 19" wheel diam ~ 0.66m (Radius = 0.33m)
        const rotFront = (distanceRot / circFront) * 360;
        setWheelRotation((prev) => (prev + rotFront) % 360);
      }

      // Update Audio parameter synthesis nodes
      if (audioCtxRef.current && mainGainRef.current) {
        const now = audioCtxRef.current.currentTime;
        const curRpm = Math.max(rpm, 0);

        const baseFreq = Math.max(16, curRpm / 60); // base rotation Hz
        
        // Twin firing offset detuning
        if (osc1Ref.current) osc1Ref.current.frequency.setTargetAtTime(baseFreq, now, 0.05);
        if (osc2Ref.current) osc2Ref.current.frequency.setTargetAtTime(baseFreq * 1.006 + 0.3, now, 0.05);
        if (subOscRef.current) subOscRef.current.frequency.setTargetAtTime(baseFreq * 0.5, now, 0.05);

        // Modulate resonant filter cutoff based on RPM (open exhaust at high speeds)
        const cutoff = Math.max(120, 100 + (curRpm / 8200) * 450);
        if (filterNodeRef.current) filterNodeRef.current.frequency.setTargetAtTime(cutoff, now, 0.08);

        // Combustion strokes syncopated LFO rate
        const strokeFreq = Math.max(5, (curRpm / 60) * 0.5);
        if (lfoRef.current) lfoRef.current.frequency.setTargetAtTime(strokeFreq, now, 0.05);

        // Volumes
        let targetVolume = 0;
        if (engineState === "IDLE") {
          targetVolume = 0.14;
        } else if (engineState === "RUNNING") {
          targetVolume = 0.14 + Math.min((curRpm - 1200) / 7000, 1) * 0.28;
        }
        
        if (isShifting) {
          targetVolume *= 0.55; // dip exhaust volume when clutch is pulled
        }

        mainGainRef.current.gain.setTargetAtTime(targetVolume, now, 0.08);
      }

      // 5. Canvas Exhaust Particles updates
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Emit particles based on engine cycle state
          if (rpm > 0) {
            const emitRate = Math.min(Math.floor(rpm / 1500) + 1, 6);
            for (let e = 0; e < emitRate; e++) {
              const particleType: "smoke" | "spark" = Math.random() < 0.04 ? "spark" : "smoke";
              particlesRef.current.push({
                x: 84, // exhaust pipe tip location inside canvas coordinates
                y: 246 + (Math.random() - 0.5) * 4,
                vx: -2.0 - (speed / 15) - Math.random() * 4,
                vy: (Math.random() - 0.5) * (0.8 + speed / 40),
                alpha: particleType === "spark" ? 1.0 : 0.2 + Math.random() * 0.3,
                size: particleType === "spark" ? 1.2 : 2.5 + Math.random() * 5,
                maxLife: 20 + Math.random() * 25,
                life: 0,
                type: particleType,
              });
            }
          }

          // Update & draw particles
          particlesRef.current.forEach((p) => {
            p.life++;
            p.x += p.vx;
            p.y += p.vy;
            p.alpha = Math.max(0, p.alpha - 0.022);
            p.size += p.type === "spark" ? 0.02 : 0.18; // smoke expands

            ctx.save();
            if (p.type === "spark") {
              ctx.shadowBlur = 8;
              ctx.shadowColor = "#f97316";
              ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha})`;
            } else {
              // cyan hot smoke
              ctx.fillStyle = `rgba(212, 175, 55, ${p.alpha * 0.14})`;
            }
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
          });

          // Filter out dead particles
          particlesRef.current = particlesRef.current.filter((p) => p.life < p.maxLife && p.alpha > 0);
        }
      }

      frameIdRef.current = requestAnimationFrame(updateLoop);
    };

    frameIdRef.current = requestAnimationFrame(updateLoop);

    return () => {
      if (frameIdRef.current) cancelAnimationFrame(frameIdRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [engineState, isThrottling, gear, speed, rpm, isShifting, theme.accent]);

  // Handle Clutch Shifting sequence
  const triggerShift = (targetGear: string) => {
    if (isShifting) return;
    setIsShifting(true);
    setClutchActive(true);
    const sourceGear = gear;
    
    // Set immediate gear state displaying the target gear selection
    setGear(targetGear);
    
    // Play structural mechanical dog clutch clunk
    playMechanicalClick(180, 42, 0.06, 0.32);

    addLog("vehicle", `Clutch engaged: Shift gearbox [Gear ${sourceGear} → ${targetGear}]`);

    // Lock shifter block for 300ms clutch throw duration
    gearShiftTimerRef.current = window.setTimeout(() => {
      setIsShifting(false);
      setClutchActive(false);
      addLog("vehicle", `Clutch released: Transmission locked in Gear ${targetGear}`);
    }, 300);
  };

  // Clean up timers & context on unmount
  useEffect(() => {
    return () => {
      closeAudio();
      if (gearShiftTimerRef.current) clearTimeout(gearShiftTimerRef.current);
    };
  }, []);

  // Update Live Time Clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], { 
        hour: "2-digit", 
        minute: "2-digit", 
        second: "2-digit", 
        hour12: true 
      });
      setLiveTime(timeStr);
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Throttle events
  const handleThrottleStart = () => {
    if (!ignition || engineState === "OFF") {
      addLog("vehicle", "Error: Turn on ignition and starter motor before throttling.");
      return;
    }
    setIsThrottling(true);
    addLog("vehicle", "Throttle engaged (accelerating parallel-twin)...");
  };

  const handleThrottleStop = () => {
    setIsThrottling(false);
    addLog("vehicle", "Throttle released (engine braking active)...");
  };

  // Speedometer gauge mapping: (0 km/h = -130 deg, 200 km/h = 130 deg)
  const needleRotation = -130 + (Math.min(speed, 200) / 200) * 260;

  return (
    <div className="w-full bg-[#07080a] border border-white/5 rounded-3xl p-6 xl:p-8 backdrop-blur-md flex flex-col gap-8 shadow-2xl relative overflow-hidden">
      
      {/* Visual background blueprint grid lines */}
      <div className="absolute inset-0 pointer-events-none opacity-5 bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

      {/* Top Banner details */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-white/5 pb-4 relative z-10">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-attention-400 font-bold">GARAGE PORTFOLIO HUB // TELEMETRY STATUS</span>
          <h3 className="text-2xl font-bold tracking-tight text-white mt-0.5">Royal Enfield Super Meteor 650</h3>
        </div>
        <div className="mt-2 sm:mt-0 flex gap-3 text-[10px] font-mono">
          <div className="px-3 py-1 bg-neutral-900 border border-white/5 rounded-md flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${ignition ? "bg-attention-400 animate-pulse" : "bg-attention-500"}`} />
            <span>SYS_POWER: {ignition ? "ONLINE" : "OFFLINE"}</span>
          </div>
          <div className="px-3 py-1 bg-neutral-900 border border-white/5 rounded-md flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full ${engineState !== "OFF" && engineState !== "CRANKING" ? "bg-attention-400 animate-pulse" : "bg-attention-500"}`} />
            <span>ENGINE: {engineState}</span>
          </div>
        </div>
      </div>

      {/* Grid columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">

        {/* Left Column: Motorcycle Blueprint Visualizer */}
        <div className="lg:col-span-7 xl:col-span-8 bg-black/40 border border-white/5 rounded-2xl p-4 flex flex-col justify-between min-h-[380px] relative overflow-hidden">
          
          <div className="flex justify-between items-center text-[10px] text-slate-500 border-b border-white/5 pb-3">
            <span>[CRUISERBLUEPRINT_V1.06]</span>
            <span className="text-attention-400 font-semibold uppercase">{gear === "N" ? "Neutral Idle Mode" : `Transmission: Gear ${gear}`}</span>
          </div>

          {/* Interactive SVG Schematic container */}
          <div className="relative w-full h-64 my-4 flex items-center justify-center">
            
            {/* Ambient Neon underglow */}
            <div 
              className={`absolute bottom-4 left-[20%] w-[60%] h-8 rounded-full filter blur-xl transition-all duration-300 pointer-events-none ${
                ignition ? "opacity-35 scale-100" : "opacity-0 scale-50"
              }`}
              style={{
                backgroundColor: theme.accent,
                boxShadow: `0 0 30px ${theme.accent}`,
                transform: `scale(${1 + (rpm / 8200) * 0.15})`
              }}
            />

            {/* Exhaust Canvas particles layer */}
            <canvas 
              ref={canvasRef} 
              width={600} 
              height={350} 
              className="absolute inset-0 w-full h-full pointer-events-none z-20"
            />

            {/* The SVG motorcycle */}
            <svg 
              viewBox="0 0 600 350" 
              className="w-full h-full text-slate-400 select-none drop-shadow-[0_4px_12px_rgba(0,0,0,0.5)] z-10"
            >
              <defs>
                <radialGradient id="headlightGlow" cx="50%" cy="50%" r="50%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.6" />
                  <stop offset="30%" stopColor="#d4af37" stopOpacity="0.25" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                </radialGradient>
                <linearGradient id="beamGrad" x1="0%" y1="50%" x2="100%" y2="50%">
                  <stop offset="0%" stopColor="#d4af37" stopOpacity="0.4" />
                  <stop offset="35%" stopColor="#d4af37" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#d4af37" stopOpacity="0" />
                </linearGradient>
                <linearGradient id="chromeGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor="#cbd5e1" />
                  <stop offset="30%" stopColor="#ffffff" />
                  <stop offset="50%" stopColor="#94a3b8" />
                  <stop offset="85%" stopColor="#cbd5e1" />
                  <stop offset="100%" stopColor="#475569" />
                </linearGradient>
                <linearGradient id="engineGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#1e293b" />
                  <stop offset="50%" stopColor="#0f172a" />
                  <stop offset="100%" stopColor="#334155" />
                </linearGradient>
              </defs>

              {/* Headlight beam projection */}
              {ignition && (
                <polygon 
                  points="425,112 600,45 600,280 425,128"
                  fill="url(#beamGrad)"
                  className="transition-all duration-100"
                  style={{
                    opacity: 0.6 + (Math.sin(Date.now() * 0.05) * 0.08) + (rpm / 8200) * 0.25
                  }}
                />
              )}

              {/* Floor blueprint line */}
              <line x1="20" y1="280" x2="580" y2="280" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 6" />

              {/* Swingarm rear suspension arm */}
              <path d="M 120,220 L 210,220 L 230,230 L 120,235 Z" fill="#0f172a" stroke="#475569" strokeWidth="2.5" />
              
              {/* Rear suspension dual shock spring (connected!) */}
              <g>
                <line x1="120" y1="220" x2="145" y2="155" stroke="#1e293b" strokeWidth="5" />
                {/* Coil effect: draw zigzag or curved overlapping lines */}
                {[...Array(6)].map((_, i) => {
                  const y = 160 + i * 9;
                  const x = 145 - i * 3.6;
                  return (
                    <ellipse key={i} cx={x} cy={y} rx="5.5" ry="3.5" fill="none" stroke="url(#chromeGrad)" strokeWidth="2" />
                  );
                })}
                <line x1="120" y1="220" x2="145" y2="155" stroke="url(#chromeGrad)" strokeWidth="1.5" />
              </g>

              {/* Main Frame chassis tube lines (Double cradle) */}
              <path d="M 395,100 L 260,150 L 210,220 L 255,248 L 350,248 L 380,185 Q 395,115 395,100 Z" fill="none" stroke="#18181b" strokeWidth="4.5" />
              <path d="M 395,100 Q 300,165 240,165 Q 185,165 140,174" fill="none" stroke="#27272a" strokeWidth="3" />

              {/* Rear fender cruiser hugging wrapper */}
              <path d="M 64,220 A 58 58 0 0 1 155,178 L 160,190 A 48 48 0 0 0 76,220 Z" fill="#0f172a" stroke="#334155" strokeWidth="1.5" />
              <circle cx="70" cy="186" r="4.5" fill="#ef4444" stroke="#7f1d1d" strokeWidth="1" /> {/* tail light */}

              {/* Side Cover Panel below rider seat */}
              <path d="M 195,162 C 205,160 250,160 262,168 C 265,198 245,228 215,228 C 195,228 190,208 195,162 Z" fill="#18181b" stroke="#3f3f46" strokeWidth="1.5" />
              <text x="228" y="210" textAnchor="middle" fill="#94a3b8" className="text-[5.5px] font-sans font-bold italic tracking-wide">Meteor 650</text>

              {/* Teardrop fuel tank with shiny gradient */}
              <path 
                d="M 260,152 C 255,115 315,90 385,94 C 395,97 398,110 382,122 C 354,142 290,154 260,152 Z" 
                fill="url(#engineGrad)" 
                stroke="#475569" 
                strokeWidth="2.5" 
              />
              <path d="M 320,118 C 335,110 355,110 370,117" fill="none" stroke="#e2e8f0" strokeWidth="1.5" className="opacity-40" />
              {/* RE tank emblem */}
              <circle cx="345" cy="120" r="5" fill="#18181b" stroke="url(#chromeGrad)" strokeWidth="0.8" />
              <text x="345" y="122.2" textAnchor="middle" className="fill-attention-400 text-[4px] font-mono font-bold tracking-tight">RE</text>
              <ellipse cx="335" cy="98" rx="4" ry="1.5" fill="#475569" stroke="#94a3b8" strokeWidth="0.5" /> {/* cap */}

              {/* Seat split dual cruiser saddle - premium brown leather */}
              {/* Pillion passenger seat */}
              <path 
                d="M 135,162 C 145,152 165,150 190,160 C 190,166 175,168 165,168 C 150,168 140,166 135,162 Z" 
                fill="#2e1f15" 
                stroke="#d97706" 
                strokeWidth="1.2" 
              />
              {/* Rider scooped saddle */}
              <path 
                d="M 190,160 C 195,148 220,138 240,138 C 255,138 262,146 270,140 C 266,153 255,162 235,162 C 215,162 200,162 190,160 Z" 
                fill="#2e1f15" 
                stroke="#d97706" 
                strokeWidth="1.2" 
              />

              {/* Engine Block group (vibrates when revving) */}
              <g style={{ transform: `translate3d(${cylinderShake.x}px, ${cylinderShake.y}px, 0)` }}>
                {/* Cohesive engine backing case */}
                <path 
                  d="M 270,165 L 342,150 L 350,205 L 332,246 L 265,246 L 258,205 Z" 
                  fill="#141416" 
                  stroke="#2d2d30" 
                  strokeWidth="1.5" 
                />
                
                {/* 2nd cylinder (behind, darker grey for 3D depth) */}
                <path d="M 276,202 L 302,154 L 328,154 L 296,202 Z" fill="#1e293b" opacity="0.65" />
                <line x1="285" y1="188" x2="310" y2="188" stroke="#0f172a" strokeWidth="1.2" />
                <line x1="290" y1="178" x2="315" y2="178" stroke="#0f172a" strokeWidth="1.2" />
                <line x1="295" y1="168" x2="320" y2="168" stroke="#0f172a" strokeWidth="1.2" />

                {/* 1st cylinder (front, detailed) */}
                <path d="M 292,202 L 320,150 L 348,150 L 312,202 Z" fill="url(#engineGrad)" stroke="#475569" strokeWidth="1.5" />
                {/* Cooling fin horizontal slices */}
                <line x1="299" y1="190" x2="328" y2="190" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="304" y1="180" x2="333" y2="180" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="309" y1="170" x2="338" y2="170" stroke="#0f172a" strokeWidth="1.5" />
                <line x1="314" y1="160" x2="343" y2="160" stroke="#0f172a" strokeWidth="1.5" />
                
                {/* Cylinder head chrome caps */}
                <rect x="315" y="142" width="36" height="8" rx="2.5" fill="url(#chromeGrad)" stroke="#64748b" strokeWidth="0.8" />

                {/* Engine crankcase casing */}
                <circle cx="295" cy="222" r="22" fill="#27272a" stroke="url(#chromeGrad)" strokeWidth="2.2" />
                {/* RE circular cover badge */}
                <circle cx="295" cy="222" r="13" fill="#18181b" stroke="#3f3f46" strokeWidth="1" />
                <text x="295" y="224.5" textAnchor="middle" className="fill-zinc-400 text-[4px] font-mono tracking-tight font-bold">RE 650</text>
              </g>

              {/* Swept chrome exhaust pipes */}
              {/* Pipe sweeps out from front cylinder head and runs low */}
              <path 
                d="M 330,165 C 362,170 365,225 330,242 L 84,242" 
                fill="none" 
                stroke="url(#chromeGrad)" 
                strokeWidth="5" 
                strokeLinecap="round" 
              />
              {/* Exhaust muffler shield details */}
              <path 
                d="M 210,242 L 86,242" 
                fill="none" 
                stroke="url(#chromeGrad)" 
                strokeWidth="7.2" 
                strokeLinecap="round" 
              />
              <path 
                d="M 210,242 L 86,242" 
                fill="none" 
                stroke="#ffffff" 
                strokeWidth="1.5" 
                strokeLinecap="round" 
                className="opacity-60"
              />

              {/* Front telescopic forks (raked 35°, connected directly to axle!) */}
              <g>
                {/* Chrome Fork Leg */}
                <line x1="395" y1="100" x2="480" y2="220" stroke="url(#chromeGrad)" strokeWidth="5.5" strokeLinecap="round" />
                {/* Triple Tree Clamps */}
                <line x1="390" y1="110" x2="400" y2="105" stroke="#18181b" strokeWidth="4" />
                <line x1="393" y1="95" x2="403" y2="90" stroke="#18181b" strokeWidth="4" />

                {/* Headlight (mounted close, not floating!) */}
                <ellipse cx="418" cy="120" rx="10" ry="10" fill="#1e293b" stroke="url(#chromeGrad)" strokeWidth="1.8" />
                <path d="M 425,112 A 10 10 0 0 1 425,128 Z" fill="#ffffff" />
                {ignition && <circle cx="425" cy="120" r="6" fill="url(#headlightGlow)" className="animate-pulse" />}

                {/* Handlebars curved */}
                <path d="M 395,100 Q 380,80 365,80" fill="none" stroke="url(#chromeGrad)" strokeWidth="3" strokeLinecap="round" />
                <line x1="365" y1="80" x2="350" y2="82" stroke="#09090b" strokeWidth="4.5" strokeLinecap="round" /> {/* grip */}
                
                {/* Chrome rearview mirror */}
                <line x1="375" y1="80" x2="370" y2="60" stroke="url(#chromeGrad)" strokeWidth="1.5" />
                <circle cx="370" cy="58" r="6.5" fill="#18181b" stroke="url(#chromeGrad)" strokeWidth="1" />

                {/* Front fender wrapper */}
                <path d="M 436,178 A 62 62 0 0 1 506,184" fill="none" stroke="#0f172a" strokeWidth="5" strokeLinecap="round" />
              </g>

              {/* REAR WHEEL ASSEMBLY (Rotates, splits spokes for alloy look) */}
              <g 
                style={{
                  transform: `rotate(${wheelRotation}deg)`,
                  transformOrigin: "120px 220px",
                }}
              >
                {/* Tire rubber */}
                <circle cx="120" cy="220" r="60" fill="none" stroke="#18181b" strokeWidth="15" />
                {/* Rim outline */}
                <circle cx="120" cy="220" r="51.5" fill="none" stroke="#475569" strokeWidth="1.8" />
                {/* Hub center */}
                <circle cx="120" cy="220" r="12" fill="#334155" stroke="url(#chromeGrad)" strokeWidth="1" />
                {/* Brake disc rotor */}
                <circle cx="120" cy="220" r="24" fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 3" />
                {/* 5 split alloy spokes pairs (10 spokes total) */}
                {[...Array(5)].map((_, i) => {
                  const deg = (i * 360) / 5;
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 120 + Math.cos(rad - 0.05) * 51.5;
                  const y1 = 220 + Math.sin(rad - 0.05) * 51.5;
                  const x2 = 120 + Math.cos(rad + 0.05) * 51.5;
                  const y2 = 220 + Math.sin(rad + 0.05) * 51.5;
                  return (
                    <g key={i} className="opacity-90">
                      <line x1="120" y1="220" x2={x1} y2={y1} stroke="url(#chromeGrad)" strokeWidth="2.5" />
                      <line x1="120" y1="220" x2={x2} y2={y2} stroke="url(#chromeGrad)" strokeWidth="2.5" />
                    </g>
                  );
                })}
              </g>

              {/* FRONT WHEEL ASSEMBLY (Rotates, splits spokes for alloy look) */}
              <g 
                style={{
                  transform: `rotate(${wheelRotation * 1.05}deg)`, 
                  transformOrigin: "480px 220px",
                }}
              >
                {/* Tire rubber */}
                <circle cx="480" cy="220" r="60" fill="none" stroke="#18181b" strokeWidth="12" />
                {/* Rim outline */}
                <circle cx="480" cy="220" r="53.5" fill="none" stroke="#475569" strokeWidth="1.8" />
                {/* Hub center */}
                <circle cx="480" cy="220" r="11" fill="#334155" stroke="url(#chromeGrad)" strokeWidth="1" />
                {/* Brake rotor */}
                <circle cx="480" cy="220" r="28" fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="2 4" />
                {/* 5 split alloy spokes pairs (10 spokes total) */}
                {[...Array(5)].map((_, i) => {
                  const deg = (i * 360) / 5;
                  const rad = (deg * Math.PI) / 180;
                  const x1 = 480 + Math.cos(rad - 0.05) * 53.5;
                  const y1 = 220 + Math.sin(rad - 0.05) * 53.5;
                  const x2 = 480 + Math.cos(rad + 0.05) * 53.5;
                  const y2 = 220 + Math.sin(rad + 0.05) * 53.5;
                  return (
                    <g key={i} className="opacity-90">
                      <line x1="480" y1="220" x2={x1} y2={y1} stroke="url(#chromeGrad)" strokeWidth="2.2" />
                      <line x1="480" y1="220" x2={x2} y2={y2} stroke="url(#chromeGrad)" strokeWidth="2.2" />
                    </g>
                  );
                })}
              </g>

              {/* Front Wheel Brake Caliper (Stationary) */}
              <path d="M 445,178 L 452,185 L 442,198 L 435,191 Z" fill="#0f172a" stroke="#64748b" strokeWidth="1" />
              <rect x="442" y="180" width="4" height="12" fill="#ef4444" rx="1" /> {/* caliper clip */}

            </svg>

            {/* Simulated Live telemetry tags overlay */}
            <div className="absolute top-2 left-2 flex flex-col gap-1.5 pointer-events-none text-[8px] font-mono text-slate-400 bg-neutral-950/80 border border-white/5 p-2 rounded-md">
              <span className="text-slate-500 uppercase tracking-widest text-[7px] font-bold">Wheel Telemetry</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-attention-400 inline-block" />
                FRONT TIRE: <span className="text-white">{tireTempFront.toFixed(0)}°C // 32 PSI</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-attention-400 inline-block" />
                REAR TIRE: <span className="text-white">{tireTempRear.toFixed(0)}°C // 36 PSI</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-attention-400 inline-block" />
                WHEEL_ROT: <span className="text-white">{(speed * 9.6).toFixed(0)} RPM</span>
              </span>
            </div>

            <div className="absolute top-2 right-2 flex flex-col gap-1.5 pointer-events-none text-[8px] font-mono text-slate-400 bg-neutral-950/80 border border-white/5 p-2 rounded-md">
              <span className="text-slate-500 uppercase tracking-widest text-[7px] font-bold">Combustion Telemetry</span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-attention-400 inline-block" />
                ENG_TEMP: <span className={engineTemp > 100 ? "text-attention-400 font-bold" : "text-white"}>{engineTemp.toFixed(1)}°C</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-attention-400 inline-block" />
                OIL_PRESS: <span className="text-white">{oilPressure.toFixed(0)} PSI</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-attention-400 inline-block" />
                AIR_FLOW: <span className="text-white">{airFlow.toFixed(1)} g/s</span>
              </span>
            </div>

            {/* Gear Dogs dynamic shifting banner */}
            {isShifting && (
              <div className="absolute inset-0 bg-neutral-950/70 border border-attention-500/20 rounded-xl flex flex-col items-center justify-center pointer-events-none z-30 animate-pulse">
                <span className="text-[9px] uppercase tracking-widest font-mono text-attention-400 font-bold">TRANSMISSION DOGS ACTIVE</span>
                <span className="text-xl font-mono font-extrabold text-white mt-1">CLUTCH DISENGAGED</span>
                <span className="text-[8px] font-mono text-slate-500 mt-0.5">SLIDING DOG RINGS COUPLING NEXT RATIO</span>
              </div>
            )}
          </div>

          {/* Bottom status metrics */}
          <div className="border-t border-white/5 pt-3 text-[9px] font-mono text-slate-500 flex justify-between items-center">
            <span>DISPLACEMENT: 648CC SOHC PARALLEL-TWIN</span>
            <span>MAX TORQUE: 52.3 NM @ 5650 RPM</span>
          </div>

        </div>

        {/* Right Column: Speedometer / Tachometer & Telemetry Controls */}
        <div className="lg:col-span-5 xl:col-span-4 bg-[#0a0c10]/70 border border-white/5 rounded-2xl p-5 sm:p-6 flex flex-col gap-6 items-center">
          
          <div className="w-full text-center border-b border-white/5 pb-3">
            <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500">Telemetry Cockpit</span>
            <h4 className="text-md font-bold tracking-tight text-white mt-0.5">Gauge Dashboard</h4>
          </div>

          {/* Main Dial Gauge (Royal Enfield Super Meteor 650 Retro-Modern Cluster) */}
          <div className="relative w-64 h-64 flex items-center justify-center rounded-full border-4 border-zinc-700 bg-zinc-950 shadow-[inset_0_0_20px_rgba(0,0,0,0.9),0_8px_25px_rgba(0,0,0,0.7)] overflow-hidden">
            
            {/* Accented ambient dial glow */}
            <div 
              className="absolute inset-0 opacity-10 pointer-events-none transition-all duration-300"
              style={{
                background: ignition 
                  ? `radial-gradient(circle, ${theme.accent} 0%, transparent 80%)` 
                  : "none"
              }}
            />

            {/* Gauge Dial SVG markings */}
            <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full text-zinc-700 select-none">
              
              {/* Outer dial ring */}
              <circle cx="100" cy="100" r="91" fill="none" stroke="currentColor" strokeWidth="0.5" />
              <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="0.8" />
              
              {/* Speed dial major arc */}
              <path 
                d="M 42 166 A 81 81 0 1 1 158 166" 
                fill="none" 
                stroke={ignition ? "#52525b" : "currentColor"} 
                strokeWidth="1.2" 
              />

              {/* Dynamic Speedometer ticks (minor 10 km/h, major 20 km/h) */}
              {[...Array(21)].map((_, idx) => {
                const val = idx * 10;
                const angle = -130 + (val / 200) * 260;
                const rad = ((angle - 90) * Math.PI) / 180;
                const isMajor = val % 20 === 0;
                
                const r1 = 86;
                const r2 = isMajor ? 76 : 81;
                
                const x1 = 100 + Math.cos(rad) * r1;
                const y1 = 100 + Math.sin(rad) * r1;
                const x2 = 100 + Math.cos(rad) * r2;
                const y2 = 100 + Math.sin(rad) * r2;

                return (
                  <line 
                    key={val} 
                    x1={x1} y1={y1} x2={x2} y2={y2} 
                    stroke={ignition ? "#d4d4d8" : "currentColor"} 
                    strokeWidth={isMajor ? 1.5 : 0.8}
                    className="transition-all duration-300"
                  />
                );
              })}

              {/* Speed values numbering labels (20, 40, ..., 200) */}
              {[20, 40, 60, 80, 100, 120, 140, 160, 180, 200].map((val) => {
                const angle = -130 + (val / 200) * 260;
                const rad = ((angle - 90) * Math.PI) / 180;
                
                const rText = 66;
                const tx = 100 + Math.cos(rad) * rText;
                const ty = 100 + Math.sin(rad) * rText + 3.2;

                return (
                  <text 
                    key={val} 
                    x={tx} y={ty} 
                    textAnchor="middle" 
                    className={`text-[8.5px] font-sans font-bold select-none transition-all duration-300 ${
                      ignition ? "fill-zinc-300" : "fill-zinc-700"
                    }`}
                  >
                    {val}
                  </text>
                );
              })}

              {/* 0 km/h red start marker */}
              {ignition && (
                <line 
                  x1={100 + Math.cos((-130 - 90) * Math.PI / 180) * 86}
                  y1={100 + Math.sin((-130 - 90) * Math.PI / 180) * 86}
                  x2={100 + Math.cos((-130 - 90) * Math.PI / 180) * 75}
                  y2={100 + Math.sin((-130 - 90) * Math.PI / 180) * 75}
                  stroke="#ef4444" 
                  strokeWidth="2" 
                />
              )}

              {/* Inner Round LCD Screen Dial */}
              <circle 
                cx="100" cy="100" r="50" 
                fill={ignition ? "#e0f2fe" : "#111115"} 
                stroke="#18181b" 
                strokeWidth="2.5" 
                className="transition-all duration-300" 
              />
              <path d="M 50,100 A 50 50 0 0 1 150,100 Z" fill="rgba(212, 175, 55, 0.05)" pointer-events="none" />

              {/* LCD Display segments (Active when ignition is ON) */}
              {ignition && (
                <g className="transition-opacity duration-300">
                  {/* Fuel Icon */}
                  <text x="64" y="103" textAnchor="middle" fill="#1e3a8a" className="text-[7px] font-sans font-bold opacity-80">⛽</text>
                  
                  {/* Curved fuel meter segments */}
                  {[0, 1, 2, 3, 4].map((i) => {
                    const angle = 145 + i * 16;
                    const rad = (angle * Math.PI) / 180;
                    
                    const rInner = 38;
                    const rOuter = 44;
                    
                    const x1 = 100 + Math.cos(rad) * rInner;
                    const y1 = 100 + Math.sin(rad) * rInner;
                    const x2 = 100 + Math.cos(rad) * rOuter;
                    const y2 = 100 + Math.sin(rad) * rOuter;

                    const isLit = i < 4; // 80% full

                    return (
                      <line 
                        key={i} 
                        x1={x1} y1={y1} x2={x2} y2={y2} 
                        stroke={isLit ? "#1e3a8a" : "#94a3b8"} 
                        strokeWidth="3.2" 
                        strokeLinecap="round"
                        className="opacity-90"
                      />
                    );
                  })}

                  {/* Gear Display Indicator */}
                  <text x="100" y="74" textAnchor="middle" fill="#1e3a8a" className="text-[6.5px] font-mono tracking-wider font-bold opacity-80">GEAR</text>
                  <text x="100" y="93" textAnchor="middle" fill="#0f172a" className="text-[19px] font-sans font-black tracking-tight">{gear === "N" ? "0" : gear}</text>

                  {/* ECO cruiser indicator */}
                  {engineState === "RUNNING" && rpm > 0 && rpm < 3500 && (
                    <text x="124" y="86" textAnchor="middle" fill="#047857" className="text-[6.5px] font-mono font-bold tracking-wide animate-pulse">ECO</text>
                  )}

                  {/* Live Clock Time display */}
                  <text x="100" y="112" textAnchor="middle" fill="#1e3a8a" className="text-[6px] font-mono tracking-wider font-bold opacity-75">TIME</text>
                  <text x="100" y="125" textAnchor="middle" fill="#0f172a" className="text-[9.5px] font-sans font-bold tracking-wide">{liveTime}</text>
                </g>
              )}

              {/* Royal Enfield branding (below LCD on the black frame) */}
              <text x="100" y="156" textAnchor="middle" fill="#cbd5e1" className="font-serif text-[7px] tracking-[0.25em] font-extrabold opacity-80">ROYAL ENFIELD</text>

              {/* Warning Lights bracket path at the bottom */}
              <path d="M 58,162 A 72 72 0 0 0 142,162" fill="none" stroke="#27272a" strokeWidth="2.0" />

              {/* Dynamic Warning Indicator Lights */}
              {/* ABS Warning Light (Yellow, active if speed is 0) */}
              <circle cx="68" cy="172" r="6.5" fill={ignition && speed === 0 ? "#d4af37" : "#18181b"} stroke="#27272a" strokeWidth="0.5" />
              <text x="68" y="174" textAnchor="middle" fill={ignition && speed === 0 ? "#000000" : "#4b5563"} className="font-sans font-black text-[4.5px]">ABS</text>

              {/* Battery Warning Light (Red, active if engine off) */}
              <circle cx="84" cy="172" r="6.5" fill={ignition && (engineState === "OFF" || engineState === "CRANKING") ? "#ef4444" : "#18181b"} stroke="#27272a" strokeWidth="0.5" />
              <rect x="81.5" y="170" width="5" height="4.2" rx="0.5" fill="none" stroke={ignition && (engineState === "OFF" || engineState === "CRANKING") ? "#ffffff" : "#4b5563"} strokeWidth="0.8" />
              <rect x="82.5" y="169" width="1" height="1" fill={ignition && (engineState === "OFF" || engineState === "CRANKING") ? "#ffffff" : "#4b5563"} />
              <rect x="84.5" y="169" width="1" height="1" fill={ignition && (engineState === "OFF" || engineState === "CRANKING") ? "#ffffff" : "#4b5563"} />

              {/* Green Neutral N Light (Bottom center) */}
              <circle cx="100" cy="172" r="7" fill={ignition && gear === "N" ? "#22c55e" : "#18181b"} stroke={ignition && gear === "N" ? "#4ade80" : "#27272a"} strokeWidth="0.8" className="transition-all duration-300" />
              <text x="100" y="174.5" textAnchor="middle" fill={ignition && gear === "N" ? "#052e16" : "#4b5563"} className="font-sans font-black text-[7.5px] select-none">N</text>

              {/* Oil Pressure Warning (Red, active if engine off) */}
              <circle cx="116" cy="172" r="6.5" fill={ignition && (engineState === "OFF" || engineState === "CRANKING") ? "#ef4444" : "#18181b"} stroke="#27272a" strokeWidth="0.5" />
              <path d="M 113,174.5 L 119,174.5 Q 120,173 118.5,172.2 L 117,171.5 L 117,170 L 118,170" fill="none" stroke={ignition && (engineState === "OFF" || engineState === "CRANKING") ? "#ffffff" : "#4b5563"} strokeWidth="0.8" />

              {/* Engine Check Warning (Yellow, active if engine off) */}
              <circle cx="132" cy="172" r="6.5" fill={ignition && engineState === "OFF" ? "#d4af37" : "#18181b"} stroke="#27272a" strokeWidth="0.5" />
              <rect x="129" y="170.2" width="6" height="3.8" rx="0.5" fill="none" stroke={ignition && engineState === "OFF" ? "#000000" : "#4b5563"} strokeWidth="0.8" />
              <rect x="131" y="168.7" width="2" height="1.5" fill={ignition && engineState === "OFF" ? "#000000" : "#4b5563"} />

              {/* Analog Physical Speedometer Needle (sweeps outer speed ring) */}
              <g 
                transform={`rotate(${ignition ? needleRotation : -130} 100 100)`}
                style={{ 
                  transform: `rotate(${ignition ? needleRotation : -130}deg)`,
                  transformOrigin: "100px 100px"
                }}
                className="transition-transform duration-75"
              >
                {/* Needle taper body */}
                <path 
                  d="M 97.5,100 L 99.2,20 L 100.8,20 L 102.5,100 Z" 
                  fill="#ef4444" 
                  stroke="#7f1d1d"
                  strokeWidth="0.5"
                  className="drop-shadow-[0_2px_4px_rgba(0,0,0,0.65)]" 
                />
                {/* Needle center dial cap */}
                <circle cx="100" cy="100" r="14" fill="#0d0d0f" stroke="#27272a" strokeWidth="1.2" />
                <circle cx="100" cy="100" r="4.5" fill="#52525b" />
              </g>

            </svg>

          </div>

          {/* Shifter HUD and Ignition Controls */}
          <div className="w-full flex flex-col gap-4">
            
            {/* Alert Indicator Row (Shift Flash & Clutch active) */}
            <div className="grid grid-cols-2 gap-2 text-[8px] font-mono font-bold text-center">
              <div className={`py-1.5 rounded border transition-all ${
                ignition && rpm >= 7200 
                  ? "bg-attention-950 border-attention-500 text-attention-400 animate-pulse shadow-[0_0_10px_rgba(212, 175, 55, 0.2)]" 
                  : "bg-neutral-950 border-white/5 text-slate-600"
              }`}>
                SHIFT INDICATOR
              </div>
              <div className={`py-1.5 rounded border transition-all ${
                clutchActive 
                  ? "bg-attention-950 border-attention-500 text-attention-400 shadow-[0_0_10px_rgba(212, 175, 55,0.2)]" 
                  : "bg-neutral-950 border-white/5 text-slate-600"
              }`}>
                CLUTCH ENGAGED
              </div>
            </div>

            {/* Mechanical Controls Box (Key + Engine Starter) */}
            <div className="bg-black/60 border border-white/5 p-4 rounded-xl flex justify-around items-center gap-4">
              
              {/* Metallic Ignition Key */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[7.5px] uppercase font-mono text-slate-500 tracking-wider">IGNITION KEY</span>
                <button 
                  onClick={handleIgnition}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center cursor-pointer transition-all duration-300 relative ${
                    ignition 
                      ? "bg-attention-950/20 border-attention-500/50 shadow-[0_0_12px_rgba(212, 175, 55,0.15)]" 
                      : "bg-neutral-900 border-white/10 hover:border-white/20"
                  }`}
                >
                  {/* Metal key slot illustration */}
                  <div 
                    className="w-1.5 h-7 bg-zinc-700 rounded-sm relative transition-all duration-300"
                    style={{
                      transform: `rotate(${ignition ? "90" : "0"}deg)`
                    }}
                  >
                    <div className="absolute top-0.5 left-0.5 right-0.5 bottom-0.5 bg-zinc-500 rounded-sm" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-black" />
                  </div>
                </button>
              </div>

              {/* Red Starter Switch button */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[7.5px] uppercase font-mono text-slate-500 tracking-wider">ENGINE STARTER</span>
                <button 
                  onMouseDown={handleStarterPress}
                  onTouchStart={(e) => { e.preventDefault(); handleStarterPress(); }}
                  disabled={!ignition || engineState !== "OFF"}
                  className={`w-12 h-12 rounded-full border border-attention-500/30 flex items-center justify-center relative transition-all active:scale-95 ${
                    !ignition 
                      ? "bg-neutral-950 border-neutral-900 cursor-not-allowed opacity-30" 
                      : engineState === "OFF"
                        ? "bg-attention-700 hover:bg-attention-600 shadow-[0_0_12px_rgba(212, 175, 55, 0.2)] cursor-pointer"
                        : "bg-attention-950/20 border-attention-500/20 cursor-not-allowed"
                  }`}
                >
                  <div className="w-5 h-5 rounded-full border-2 border-white/40 flex items-center justify-center">
                    <span className="w-1.5 h-1.5 bg-white/70 rounded-full" />
                  </div>
                </button>
              </div>

              {/* Red Starter Switch button */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[7.5px] uppercase font-mono text-slate-500 tracking-wider">ENGINE KILL</span>
                <button 
                  onClick={handleKillSwitch}
                  disabled={!ignition || engineState === "OFF"}
                  className={`w-12 h-12 rounded-full border flex items-center justify-center relative transition-all active:scale-95 ${
                    !ignition || engineState === "OFF"
                      ? "bg-neutral-950 border-neutral-900 cursor-not-allowed opacity-30" 
                      : "bg-zinc-800 hover:bg-zinc-700 border-zinc-500/40 cursor-pointer shadow-[0_0_10px_rgba(0,0,0,0.5)]"
                  }`}
                >
                  <div className="w-5 h-2 bg-attention-500 rounded" />
                </button>
              </div>

            </div>

            {/* Hold Throttle Grip Accelerator */}
            <div className="flex flex-col items-center gap-2">
              
              <button
                onMouseDown={handleThrottleStart}
                onMouseUp={handleThrottleStop}
                onMouseLeave={isThrottling ? handleThrottleStop : undefined}
                onTouchStart={(e) => { e.preventDefault(); handleThrottleStart(); }}
                onTouchEnd={(e) => { e.preventDefault(); handleThrottleStop(); }}
                disabled={!ignition || engineState === "OFF"}
                className={`relative w-full h-14 flex items-center justify-center rounded-xl border select-none font-semibold text-xs tracking-widest transition-all ${
                  !ignition || engineState === "OFF"
                    ? "bg-[#0c0d10] border-white/5 text-slate-600 cursor-not-allowed"
                    : isThrottling 
                      ? "bg-attention-950/20 border-attention-500 text-attention-300 shadow-[0_0_16px_rgba(212, 175, 55,0.25)] cursor-pointer"
                      : "bg-[#0e1117] hover:bg-[#141a24] border-white/10 text-slate-300 cursor-pointer active:border-white/20"
                }`}
              >
                {/* Dynamic Throttle progress bar backdrop */}
                {ignition && engineState !== "OFF" && (
                  <div 
                    className="absolute inset-y-0 left-0 bg-attention-500/10 transition-all duration-100 pointer-events-none"
                    style={{
                      width: `${(rpm / 8200) * 100}%`
                    }}
                  />
                )}

                <span className="relative z-10 select-none uppercase font-mono tracking-wider">
                  {!ignition || engineState === "OFF" 
                    ? "ENGINE OFF" 
                    : isThrottling 
                      ? "REVVING 160 KM/H (15S RAMP)..." 
                      : "HOLD THROTTLE GRIP TO RIDE"
                  }
                </span>
              </button>
              <span className="text-[7.5px] font-mono text-slate-500 tracking-wider uppercase text-center mt-1">
                Revving simulates sequential gear box clutch changes in 15 seconds.
              </span>
            </div>

            {/* Diagnostic Log display */}
            <div className="bg-black/80 border border-white/5 rounded-xl p-3 h-28 flex flex-col justify-between">
              <span className="text-[7.5px] uppercase font-mono text-slate-500 tracking-widest border-b border-white/5 pb-1">Cockpit Logs System</span>
              <div className="flex-1 overflow-y-auto mt-1 flex flex-col gap-1 text-[7.5px] font-mono text-slate-400 [scrollbar-width:none]">
                <div className="text-attention-400/90">&gt; SUPER_METEOR_650 OS ACTIVE</div>
                {gear !== "N" && (
                  <div>&gt; SPEED PHYSICS AT: {speed} KM/H</div>
                )}
                {isThrottling && (
                  <div className="text-attention-400/90">&gt; THROTTLE GRIP DEFLECTION: {((rpm / 8200) * 100).toFixed(0)}%</div>
                )}
                {isShifting && (
                  <div className="text-attention-400 font-bold">&gt; TRANSMISSION DOG RATIO CLUNK ENVELOPE</div>
                )}
                {!ignition && (
                  <div className="text-attention-400/90">&gt; POWER OFF: SYSTEM SHUTDOWN</div>
                )}
                {ignition && engineState === "IDLE" && (
                  <div className="text-attention-400/90">&gt; ENGINE STARTED: STEADY 1200 RPM IDLE</div>
                )}
              </div>
              <span className="text-[7px] text-slate-600 font-mono text-right mt-1">Telemetry Sync: 60Hz</span>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
}
