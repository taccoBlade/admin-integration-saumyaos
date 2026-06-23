class AudioEngine {
  private ctx: AudioContext | null = null;

  // Boot sequence nodes
  private bootGain: GainNode | null = null;
  private bootFilter: BiquadFilterNode | null = null;
  private bootOsc1: OscillatorNode | null = null;
  private bootOsc2: OscillatorNode | null = null;
  private bootSubOsc: OscillatorNode | null = null;

  // Boot sequence control flags
  private playedKeySwitch = false;
  private playedCrank1 = false;
  private playedCrank2 = false;
  private playedCrank3 = false;
  private playedGearShift = false;
  private playedPop1 = false;
  private playedPop2 = false;
  private playedPop3 = false;

  init() {
    if (!this.ctx) {
      // Create audio context only on user interaction to prevent warnings/block
      const AudioContextClass = window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === "suspended") {
      this.ctx.resume();
    }
  }

  playBootChime() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Play a rising, premium pentatonic synth bell sequence
    const notes = [261.63, 329.63, 392.00, 523.25, 659.25]; // C4, E4, G4, C5, E5
    
    notes.forEach((freq, idx) => {
      const time = now + idx * 0.15;
      this.playBell(freq, time, 1.5 - idx * 0.1);
    });
  }

  playClick() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(1000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.06);
  }

  playSwitch() {
    this.init();
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    
    // Play two closely-spaced ticks to sound like a physical mechanical switch toggle
    this.playTick(now, 0.04);
    this.playTick(now + 0.04, 0.03);
  }

  playGearClunk() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // Low-frequency transmission clunk (sine sweep 160Hz -> 30Hz)
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "sine";
    osc.frequency.setValueAtTime(160, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.12);
    
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.12);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(now);
    osc.stop(now + 0.15);
    
    // High frequency metallic click (triangle sweep 1200Hz -> 600Hz)
    const oscClick = this.ctx.createOscillator();
    const gainClick = this.ctx.createGain();
    
    oscClick.type = "triangle";
    oscClick.frequency.setValueAtTime(1200, now);
    oscClick.frequency.exponentialRampToValueAtTime(600, now + 0.04);
    
    gainClick.gain.setValueAtTime(0.05, now);
    gainClick.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);
    
    oscClick.connect(gainClick);
    gainClick.connect(this.ctx.destination);
    
    oscClick.start(now);
    oscClick.stop(now + 0.05);
  }

  updateBootAudio(progress: number) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    if (progress < 5) {
      this.resetBootFlags();
    }

    // 1. Key Switch Click
    if (progress >= 5 && !this.playedKeySwitch) {
      this.playSwitch();
      this.playedKeySwitch = true;
    }

    // 2. Cranking Starter Motor pulses (tick-chugs)
    if (progress >= 15 && progress < 22 && !this.playedCrank1) {
      this.playTick(now, 0.12);
      this.playedCrank1 = true;
    }
    if (progress >= 24 && progress < 30 && !this.playedCrank2) {
      this.playTick(now, 0.12);
      this.playedCrank2 = true;
    }
    if (progress >= 32 && progress < 38 && !this.playedCrank3) {
      this.playTick(now, 0.12);
      this.playedCrank3 = true;
    }

    // 3. Engine Firing & Throttle Revving
    if (progress >= 40 && progress < 100) {
      if (!this.bootOsc1) {
        try {
          this.bootGain = this.ctx.createGain();
          this.bootGain.gain.setValueAtTime(0, now);
          this.bootGain.gain.linearRampToValueAtTime(0.18, now + 0.1);
          this.bootGain.connect(this.ctx.destination);

          this.bootFilter = this.ctx.createBiquadFilter();
          this.bootFilter.type = "lowpass";
          this.bootFilter.Q.setValueAtTime(2.0, now);
          this.bootFilter.frequency.setValueAtTime(100, now);
          this.bootFilter.connect(this.bootGain);

          this.bootOsc1 = this.ctx.createOscillator();
          this.bootOsc1.type = "sawtooth";
          this.bootOsc1.frequency.setValueAtTime(10, now);
          this.bootOsc1.connect(this.bootFilter);

          this.bootOsc2 = this.ctx.createOscillator();
          this.bootOsc2.type = "triangle";
          this.bootOsc2.frequency.setValueAtTime(10.15, now);
          this.bootOsc2.connect(this.bootFilter);

          this.bootSubOsc = this.ctx.createOscillator();
          this.bootSubOsc.type = "sine";
          this.bootSubOsc.frequency.setValueAtTime(5, now);
          this.bootSubOsc.connect(this.bootFilter);

          this.bootOsc1.start(now);
          this.bootOsc2.start(now);
          this.bootSubOsc.start(now);
        } catch (e) {
          console.error("Failed to start boot audio engines", e);
        }
      }

      // Calculate RPM dynamically
      let rpm = 1200;
      if (progress >= 40 && progress < 80) {
        const ratio = (progress - 40) / 40; // 0 to 1
        rpm = 1200 + ratio * 6300; // 1200 to 7500
      } else if (progress >= 80 && progress < 95) {
        // Redline pop zone: bounce around redline (7500 RPM)
        const bounce = (progress % 2 === 0) ? 7700 : 7300;
        rpm = bounce;
      } else if (progress >= 95) {
        // Drop before boot complete
        rpm = 3000;
      }

      // Apply RPM to synth frequencies
      const f1 = rpm / 120;
      const f2 = (rpm / 120) * 1.015;
      const fSub = rpm / 240;
      const cutoff = 80 + (rpm / 8200) * 750;

      if (this.bootOsc1 && this.bootOsc2 && this.bootSubOsc && this.bootFilter) {
        this.bootOsc1.frequency.linearRampToValueAtTime(f1, now + 0.05);
        this.bootOsc2.frequency.linearRampToValueAtTime(f2, now + 0.05);
        this.bootSubOsc.frequency.linearRampToValueAtTime(fSub, now + 0.05);
        this.bootFilter.frequency.linearRampToValueAtTime(cutoff, now + 0.05);
      }

      // Pop triggers:
      if (progress >= 83 && progress < 88 && !this.playedPop1) {
        this.playPop(now);
        this.playedPop1 = true;
        if (this.bootGain) {
          this.bootGain.gain.setValueAtTime(0.02, now);
          this.bootGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
        }
      }
      if (progress >= 88 && progress < 93 && !this.playedPop2) {
        this.playPop(now);
        this.playedPop2 = true;
        if (this.bootGain) {
          this.bootGain.gain.setValueAtTime(0.02, now);
          this.bootGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
        }
      }
      if (progress >= 93 && progress < 97 && !this.playedPop3) {
        this.playPop(now);
        this.playedPop3 = true;
        if (this.bootGain) {
          this.bootGain.gain.setValueAtTime(0.02, now);
          this.bootGain.gain.linearRampToValueAtTime(0.18, now + 0.15);
        }
      }
    }

    // 4. Shutdown / Fade out
    if (progress >= 100 && this.bootOsc1) {
      const g = this.bootGain;
      const o1 = this.bootOsc1;
      const o2 = this.bootOsc2;
      const sub = this.bootSubOsc;

      if (g) {
        g.gain.setValueAtTime(g.gain.value, now);
        g.gain.exponentialRampToValueAtTime(0.0001, now + 0.4);
      }

      setTimeout(() => {
        try {
          if (o1) o1.stop();
          if (o2) o2.stop();
          if (sub) sub.stop();
        } catch {
          // ignore
        }
      }, 450);

      this.bootOsc1 = null;
      this.bootOsc2 = null;
      this.bootSubOsc = null;
      this.bootGain = null;
      this.bootFilter = null;
    }
  }

  resetBootFlags() {
    this.playedKeySwitch = false;
    this.playedCrank1 = false;
    this.playedCrank2 = false;
    this.playedCrank3 = false;
    this.playedGearShift = false;
    this.playedPop1 = false;
    this.playedPop2 = false;
    this.playedPop3 = false;
  }

  private playTick(time: number, volume: number = 0.05) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = "triangle";
    osc.frequency.setValueAtTime(1200, time);
    osc.frequency.exponentialRampToValueAtTime(300, time + 0.02);

    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.02);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + 0.03);
  }

  private playPop(time: number) {
    if (!this.ctx) return;
    const now = time;

    // 1. Low frequency thump (sine wave)
    const thumpOsc = this.ctx.createOscillator();
    const thumpGain = this.ctx.createGain();
    thumpOsc.type = "sine";
    thumpOsc.frequency.setValueAtTime(140, now);
    thumpOsc.frequency.exponentialRampToValueAtTime(10, now + 0.18);
    
    thumpGain.gain.setValueAtTime(0.8, now);
    thumpGain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    
    thumpOsc.connect(thumpGain);
    thumpGain.connect(this.ctx.destination);
    thumpOsc.start(now);
    thumpOsc.stop(now + 0.2);

    // 2. High frequency crack/snap (triangle sweep)
    const snapOsc = this.ctx.createOscillator();
    const snapGain = this.ctx.createGain();
    snapOsc.type = "triangle";
    snapOsc.frequency.setValueAtTime(2500, now);
    snapOsc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

    snapGain.gain.setValueAtTime(0.4, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

    snapOsc.connect(snapGain);
    snapGain.connect(this.ctx.destination);
    snapOsc.start(now);
    snapOsc.stop(now + 0.07);

    // 3. Noise burst for high-fidelity crackle/air hiss
    try {
      const bufferSize = this.ctx.sampleRate * 0.08; // 80ms of noise
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;
      
      const noiseFilter = this.ctx.createBiquadFilter();
      noiseFilter.type = "bandpass";
      noiseFilter.frequency.setValueAtTime(1000, now);
      noiseFilter.Q.setValueAtTime(1.0, now);

      const noiseGain = this.ctx.createGain();
      noiseGain.gain.setValueAtTime(0.25, now);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      noiseNode.connect(noiseFilter);
      noiseFilter.connect(noiseGain);
      noiseGain.connect(this.ctx.destination);
      
      noiseNode.start(now);
      noiseNode.stop(now + 0.09);
    } catch (err) {
      console.warn("White noise generation failed (fallback used)", err);
    }
  }

  playBell(freq: number, time: number, duration: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, time);

    // Add a very subtle second harmonic for warmth
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();
    osc2.type = "triangle";
    osc2.frequency.setValueAtTime(freq * 2, time);

    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.12, time + 0.05); // quick attack
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    gain2.gain.setValueAtTime(0, time);
    gain2.gain.linearRampToValueAtTime(0.03, time + 0.03);
    gain2.gain.exponentialRampToValueAtTime(0.0001, time + duration * 0.5);

    filter.type = "lowpass";
    filter.frequency.setValueAtTime(1500, time);

    osc.connect(gain);
    osc2.connect(gain2);
    
    gain.connect(filter);
    gain2.connect(filter);
    
    filter.connect(this.ctx.destination);

    osc.start(time);
    osc.stop(time + duration + 0.1);
    
    osc2.start(time);
    osc2.stop(time + duration + 0.1);
  }
}

export const sysAudio = new AudioEngine();
