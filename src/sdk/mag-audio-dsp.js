/**
 * MAG (Master Autonomous Game-Replicator) - Procedural WebAudio DSP Synthesizer
 * Zero external MP3/WAV dependencies. Hardware-accelerated WebAudio synthesis.
 */
(function(root) {
  'use strict';

  class MAGAudioEngine {
    constructor() {
      this.ctx = null;
      this.masterGain = null;
      this.isInitialized = false;
      this.bgmTimer = null;
      this.bgmPlaying = false;
      this.noiseBuffer = null;
      this.volume = 0.8;
    }

    /**
     * Initializes AudioContext and builds master routing graph upon first user touch/click.
     */
    init() {
      if (this.isInitialized && this.ctx) {
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        return this.ctx;
      }

      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) {
        console.warn('[MAGAudio] WebAudio API not supported in this browser environment.');
        return null;
      }

      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(this.volume, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.buildWhiteNoiseBuffer();
      this.isInitialized = true;
      console.log('[MAGAudio] Hardware WebAudio DSP initialized. SampleRate:', this.ctx.sampleRate);
      return this.ctx;
    }

    /**
     * Generates a 2-second looped mono white noise buffer for tactile physical impacts.
     */
    buildWhiteNoiseBuffer() {
      if (!this.ctx) return;
      const bufferSize = this.ctx.sampleRate * 2;
      this.noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = this.noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
    }

    /**
     * Helper to guarantee active context before playing sounds.
     */
    ensureContext() {
      if (!this.ctx) {
        this.init();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume();
      }
    }

    /**
     * Player 1 & 2 Procedural Jump Sound (Upward Exponential Frequency Glide)
     */
    playJump() {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(170, now);
      osc.frequency.exponentialRampToValueAtTime(440, now + 0.14);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.18);
    }

    /**
     * Procedural Ground Landing Sound (Thud + Lowpass Noise)
     */
    playLand() {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;

      // Low bass thud
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, now);
      osc.frequency.exponentialRampToValueAtTime(35, now + 0.12);

      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);

      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(now);
      osc.stop(now + 0.14);

      // Noise puff
      if (this.noiseBuffer) {
        const noise = this.ctx.createBufferSource();
        noise.buffer = this.noiseBuffer;
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, now);

        const noiseGain = this.ctx.createGain();
        noiseGain.gain.setValueAtTime(0.25, now);
        noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.10);

        noise.connect(filter);
        filter.connect(noiseGain);
        noiseGain.connect(this.masterGain);

        noise.start(now);
        noise.stop(now + 0.11);
      }
    }

    /**
     * P1 Ability: Kinetic Anchor Activation (Square Wave Buzz + Bandpass Filter)
     */
    playP1Ability() {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'square';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.linearRampToValueAtTime(520, now + 0.22);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(750, now);
      filter.Q.setValueAtTime(4.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.3, now + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.26);
    }

    /**
     * P2 Ability: Resonance Pulse Trigger (Sawtooth Wave Glide + High Resonance)
     */
    playP2Ability() {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const filter = this.ctx.createBiquadFilter();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.25);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.0, now);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.32, now + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.27);
    }

    /**
     * Elastic Tether High Tension / Snap SFX
     */
    playTetherSnap() {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(95, now + 0.32);

      gain.gain.setValueAtTime(0.45, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.34);

      osc.connect(gain);
      gain.connect(this.masterGain);

      osc.start(now);
      osc.stop(now + 0.35);
    }

    /**
     * Co-op Pressure Switch Activation (Harmonic Major Triad)
     */
    playSwitchActivate() {
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [440, 554.37, 659.25]; // A4, C#5, E5
      notes.forEach((freq, idx) => {
        const start = this.ctx.currentTime + idx * 0.06;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.28, start + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.16);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + 0.18);
      });
    }

    /**
     * Puzzle Energy Gate Unlocked (Upward Sweeping Resonant Chord)
     */
    playGateOpen() {
      this.ensureContext();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'sine';
      osc2.type = 'triangle';

      osc1.frequency.setValueAtTime(220, now);
      osc1.frequency.exponentialRampToValueAtTime(880, now + 0.6);

      osc2.frequency.setValueAtTime(330, now);
      osc2.frequency.exponentialRampToValueAtTime(1320, now + 0.6);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.masterGain);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.68);
      osc2.stop(now + 0.68);
    }

    /**
     * Partner Boop / High-Five Emote Chime
     */
    playPartnerBoop() {
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, idx) => {
        const start = this.ctx.currentTime + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.32, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.12);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + 0.14);
      });
    }

    /**
     * Stage Victory Fanfare
     */
    playVictoryFanfare() {
      this.ensureContext();
      if (!this.ctx) return;

      const notes = [
        { f: 392.00, d: 0.15, offset: 0.00 }, // G4
        { f: 523.25, d: 0.15, offset: 0.18 }, // C5
        { f: 659.25, d: 0.15, offset: 0.36 }, // E5
        { f: 783.99, d: 0.30, offset: 0.54 }, // G5
        { f: 1046.5, d: 0.65, offset: 0.88 }  // C6
      ];

      notes.forEach(item => {
        const start = this.ctx.currentTime + item.offset;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(item.f, start);

        gain.gain.setValueAtTime(0.001, start);
        gain.gain.linearRampToValueAtTime(0.38, start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, start + item.d);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(start);
        osc.stop(start + item.d + 0.05);
      });
    }

    /**
     * Procedural Ambient Soundtrack Sequencer
     * Algorithmic chord progression & arpeggio running entirely in WebAudio.
     */
    startAmbientMusic(bpm = 112, scale = 'PENTATONIC') {
      if (this.bgmPlaying) return;
      this.ensureContext();
      if (!this.ctx) return;

      this.bgmPlaying = true;
      const chordChords = [
        [220.00, 277.18, 329.63, 440.00], // A minor / major variant
        [174.61, 220.00, 261.63, 349.23], // F
        [196.00, 246.94, 293.66, 392.00], // G
        [164.81, 196.00, 246.94, 329.63]  // E
      ];

      let chordIndex = 0;
      let noteStep = 0;
      const stepDuration = (60 / bpm) / 2; // Eighth note step

      const scheduleTick = () => {
        if (!this.bgmPlaying || !this.ctx) return;

        const currentChord = chordChords[chordIndex];
        const freq = currentChord[noteStep % currentChord.length];
        const now = this.ctx.currentTime;

        // Arp note
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        arpOsc.type = 'triangle';
        arpOsc.frequency.setValueAtTime(freq, now);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200 + Math.sin(now * 0.5) * 600, now);

        arpGain.gain.setValueAtTime(0.001, now);
        arpGain.gain.linearRampToValueAtTime(0.08, now + 0.02);
        arpGain.gain.exponentialRampToValueAtTime(0.0001, now + stepDuration * 0.85);

        arpOsc.connect(filter);
        filter.connect(arpGain);
        arpGain.connect(this.masterGain);

        arpOsc.start(now);
        arpOsc.stop(now + stepDuration);

        // Sub-bass note on beat 0
        if (noteStep === 0) {
          const bassOsc = this.ctx.createOscillator();
          const bassGain = this.ctx.createGain();
          bassOsc.type = 'sine';
          bassOsc.frequency.setValueAtTime(currentChord[0] * 0.5, now);

          bassGain.gain.setValueAtTime(0.12, now);
          bassGain.gain.exponentialRampToValueAtTime(0.001, now + stepDuration * 3.5);

          bassOsc.connect(bassGain);
          bassGain.connect(this.masterGain);

          bassOsc.start(now);
          bassOsc.stop(now + stepDuration * 4);
        }

        noteStep++;
        if (noteStep >= 4) {
          noteStep = 0;
          chordIndex = (chordIndex + 1) % chordChords.length;
        }

        this.bgmTimer = setTimeout(scheduleTick, stepDuration * 1000);
      };

      scheduleTick();
      console.log(`[MAGAudio] Procedural Soundtrack active at ${bpm} BPM.`);
    }

    /**
     * Stops the background synthesizer.
     */
    stopAmbientMusic() {
      this.bgmPlaying = false;
      if (this.bgmTimer) {
        clearTimeout(this.bgmTimer);
        this.bgmTimer = null;
      }
    }
  }

  const instance = new MAGAudioEngine();

  if (typeof window !== 'undefined') {
    window.MAGAudio = instance;
    window.MAGAudioEngine = MAGAudioEngine;
  }
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = instance;
    module.exports.MAGAudioEngine = MAGAudioEngine;
  }
})(typeof globalThis !== 'undefined' ? globalThis : this);
