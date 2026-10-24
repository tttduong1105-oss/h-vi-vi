/**
 * Web Audio API synthesizer for peaceful winter ambient melody and piano chimes.
 * No external audio files or CORS dependencies required.
 */
class WinterAudioSynth {
  private ctx: AudioContext | null = null;
  private isPlaying = false;
  private currentTimer: any = null;
  private volume = 0.4;
  private onStateChange?: (playing: boolean) => void;

  // Gentle winter pentatonic notes (in Hz)
  private melodyNotes = [
    // Eb major pentatonic / soft winter scale
    311.13, // Eb4
    349.23, // F4
    392.00, // G4
    466.16, // Bb4
    523.25, // C5
    622.25, // Eb5
    698.46, // F5
    783.99, // G5
  ];

  private sequence = [
    { note: 2, duration: 1.2, delay: 0 },
    { note: 3, duration: 1.0, delay: 1.0 },
    { note: 4, duration: 1.8, delay: 2.0 },
    { note: 3, duration: 0.9, delay: 3.8 },
    { note: 1, duration: 1.4, delay: 4.8 },
    { note: 0, duration: 2.2, delay: 6.2 },
    { note: 4, duration: 1.5, delay: 8.5 },
    { note: 5, duration: 1.8, delay: 10.0 },
    { note: 3, duration: 2.0, delay: 12.0 },
    { note: 2, duration: 2.5, delay: 14.2 },
  ];

  public subscribe(cb: (playing: boolean) => void) {
    this.onStateChange = cb;
  }

  private initContext() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  private playTone(freq: number, duration: number, startTime: number) {
    if (!this.ctx) return;

    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    // Soft chime overtone oscillator
    const osc2 = this.ctx.createOscillator();
    const gain2 = this.ctx.createGain();

    // Main bell/chime oscillator
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, startTime);

    // Subtle soft triangle overtone
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(freq * 2, startTime);

    const now = startTime;
    const baseVol = this.volume * 0.25;

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(baseVol, now + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(baseVol * 0.35, now + 0.05);
    gain2.gain.exponentialRampToValueAtTime(0.0001, now + duration * 0.8);

    osc.connect(gain);
    osc2.connect(gain2);

    gain.connect(this.ctx.destination);
    gain2.connect(this.ctx.destination);

    osc.start(now);
    osc2.start(now);

    osc.stop(now + duration + 0.1);
    osc2.stop(now + duration + 0.1);
  }

  public play() {
    this.initContext();
    if (!this.ctx) return;

    this.isPlaying = true;
    this.onStateChange?.(true);

    const loopLength = 17.0; // seconds

    const scheduleLoop = () => {
      if (!this.isPlaying || !this.ctx) return;
      const baseTime = this.ctx.currentTime + 0.1;

      this.sequence.forEach((item) => {
        const freq = this.melodyNotes[item.note % this.melodyNotes.length];
        this.playTone(freq, item.duration, baseTime + item.delay);
      });

      this.currentTimer = setTimeout(() => {
        if (this.isPlaying) {
          scheduleLoop();
        }
      }, loopLength * 1000);
    };

    scheduleLoop();
  }

  public pause() {
    this.isPlaying = false;
    if (this.currentTimer) {
      clearTimeout(this.currentTimer);
      this.currentTimer = null;
    }
    this.onStateChange?.(false);
  }

  public toggle(): boolean {
    if (this.isPlaying) {
      this.pause();
      return false;
    } else {
      this.play();
      return true;
    }
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getIsPlaying(): boolean {
    return this.isPlaying;
  }
}

export const winterAudio = new WinterAudioSynth();
