/**
 * Audio Engine using Web Audio API
 * Generates rich synthetic sound effects & soothing ambient music
 * 100% self-contained, no external audio files required!
 */
class AudioManager {
  constructor() {
    this.ctx = null;
    this.sfxEnabled = true;
    this.bgmEnabled = true;
    this.sfxVolume = 0.8;
    this.bgmVolume = 0.4;
    this.bgmInterval = null;
    this.bgmStep = 0;
    this.initialized = false;
  }

  init() {
    if (this.initialized) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        this.initialized = true;
        if (this.bgmEnabled) {
          this.startBGM();
        }
      }
    } catch (e) {
      console.warn('AudioContext not supported or blocked:', e);
    }
  }

  ensureContext() {
    if (!this.initialized) {
      this.init();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  // Generic tone generator
  playTone(freq, type = 'sine', duration = 0.15, gainVal = 0.2, pitchBend = 0) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (pitchBend !== 0) {
        osc.frequency.exponentialRampToValueAtTime(Math.max(20, freq + pitchBend), now + duration);
      }

      const masterVol = gainVal * this.sfxVolume;
      gain.gain.setValueAtTime(masterVol, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } catch (e) {
      // Audio play error safe guard
    }
  }

  // SFX: Block pick up
  playPick() {
    this.playTone(420, 'triangle', 0.08, 0.15, 60);
  }

  // SFX: Block placed on board
  playDrop() {
    this.playTone(280, 'sine', 0.1, 0.25, -80);
    setTimeout(() => {
      this.playTone(180, 'triangle', 0.12, 0.2, -40);
    }, 20);
  }

  // SFX: Line blast / clear (ascending chime)
  playLineClear(lineCount = 1) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    const baseFreqs = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6
    const count = Math.min(lineCount + 2, baseFreqs.length);

    for (let i = 0; i < count; i++) {
      setTimeout(() => {
        this.playTone(baseFreqs[i], 'triangle', 0.25, 0.28, 10);
      }, i * 65);
    }
  }

  // SFX: Combo streak escalation
  playCombo(comboCount = 1) {
    if (!this.sfxEnabled) return;
    this.ensureContext();
    if (!this.ctx) return;

    // Pitch increases with combo multiplier
    const root = 440 * Math.pow(1.08, Math.min(comboCount, 12));
    const chord = [root, root * 1.2599, root * 1.4983, root * 2]; // Major arpeggio

    chord.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sine', 0.35, 0.22, 15);
      }, idx * 45);
    });
  }

  // SFX: Lucky Wheel spin tick
  playSpinTick() {
    this.playTone(850, 'square', 0.02, 0.08, -300);
  }

  // SFX: Win prize / celebration
  playWinPrize() {
    const melody = [523.25, 659.25, 783.99, 1046.50, 1174.66, 1318.51];
    melody.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'triangle', 0.28, 0.25);
      }, idx * 80);
    });
  }

  // SFX: Game Over jingle
  playGameOver() {
    const sadNotes = [440, 415.3, 392, 349.23]; // A4, Ab4, G4, F4
    sadNotes.forEach((freq, idx) => {
      setTimeout(() => {
        this.playTone(freq, 'sawtooth', 0.45, 0.2, -20);
      }, idx * 160);
    });
  }

  // SFX: Button Click
  playClick() {
    this.playTone(560, 'sine', 0.05, 0.12, -120);
  }

  // SFX: Booster used (e.g. Bomb, Hammer)
  playBooster() {
    this.playTone(220, 'sawtooth', 0.35, 0.3, -150);
    setTimeout(() => {
      this.playTone(880, 'sine', 0.2, 0.25, 100);
    }, 100);
  }

  // Ambient chill BGM synthesized with subtle chords & plucks
  startBGM() {
    if (this.bgmInterval) return;
    const chords = [
      [261.63, 329.63, 392.00], // C major
      [220.00, 261.63, 329.63], // A minor
      [174.61, 220.00, 261.63], // F major
      [196.00, 246.94, 293.66]  // G major
    ];

    this.bgmInterval = setInterval(() => {
      if (!this.bgmEnabled || !this.ctx || this.ctx.state === 'suspended') return;
      try {
        const chord = chords[Math.floor(this.bgmStep / 4) % chords.length];
        const note = chord[this.bgmStep % chord.length];
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note, now);

        const vol = 0.04 * this.bgmVolume;
        gain.gain.setValueAtTime(vol, now);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 1.2);

        this.bgmStep = (this.bgmStep + 1) % 16;
      } catch (e) {}
    }, 450);
  }

  stopBGM() {
    if (this.bgmInterval) {
      clearInterval(this.bgmInterval);
      this.bgmInterval = null;
    }
  }

  setSfxEnabled(val) {
    this.sfxEnabled = val;
  }

  setBgmEnabled(val) {
    this.bgmEnabled = val;
    if (val) {
      this.startBGM();
    } else {
      this.stopBGM();
    }
  }

  setSfxVolume(val) {
    this.sfxVolume = Math.max(0, Math.min(1, val));
  }

  setBgmVolume(val) {
    this.bgmVolume = Math.max(0, Math.min(1, val));
  }
}

window.audioManager = new AudioManager();
