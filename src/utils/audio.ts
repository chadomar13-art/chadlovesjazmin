/**
 * Romantic ambient audio synthesizer using Web Audio API
 * Generates soft harp-like pentatonic chords and gentle chimes
 */

class RomanticAudio {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private ambientOscillators: { osc: OscillatorNode; gain: GainNode }[] = [];
  private isPlayingAmbient: boolean = false;

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public playChime(freqIndex: number = 0) {
    if (this.isMuted) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const pentatonic = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
      const freq = pentatonic[freqIndex % pentatonic.length];

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

      // Soft envelope
      const now = this.ctx.currentTime;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.08, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.2);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 1.25);
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public playSuccessChord() {
    if (this.isMuted) return;
    const notes = [523.25, 659.25, 783.99, 1046.50]; // C Major arpeggio
    notes.forEach((freq, idx) => {
      setTimeout(() => {
        try {
          this.initContext();
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, this.ctx.currentTime);

          const now = this.ctx.currentTime;
          gain.gain.setValueAtTime(0, now);
          gain.gain.linearRampToValueAtTime(0.06, now + 0.04);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 1.7);
        } catch {}
      }, idx * 110);
    });
  }

  public toggleMute(): boolean {
    this.isMuted = !this.isMuted;
    if (this.isMuted) {
      this.stopAmbient();
    }
    return this.isMuted;
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public startAmbient() {
    if (this.isMuted || this.isPlayingAmbient) return;
    try {
      this.initContext();
      if (!this.ctx) return;

      const freqs = [130.81, 164.81, 196.00, 246.94]; // C-E-G-B warm ambient pad
      this.ambientOscillators = freqs.map((f) => {
        const osc = this.ctx!.createOscillator();
        const gain = this.ctx!.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, this.ctx!.currentTime);
        gain.gain.setValueAtTime(0.012, this.ctx!.currentTime);
        osc.connect(gain);
        gain.connect(this.ctx!.destination);
        osc.start();
        return { osc, gain };
      });
      this.isPlayingAmbient = true;
    } catch {}
  }

  public stopAmbient() {
    this.ambientOscillators.forEach(({ osc, gain }) => {
      try {
        if (this.ctx) {
          gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + 0.5);
          setTimeout(() => osc.stop(), 550);
        } else {
          osc.stop();
        }
      } catch {}
    });
    this.ambientOscillators = [];
    this.isPlayingAmbient = false;
  }
}

export const audioManager = new RomanticAudio();
