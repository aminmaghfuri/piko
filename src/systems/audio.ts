class SoundController {
  private ctx: AudioContext | null = null;
  public enabled = true;

  public init(): void {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx && !this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        void this.ctx.resume();
      }
    } catch {
      // AudioContext unavailable
    }
  }

  public tone(
    freq: number,
    type: OscillatorType,
    duration: number,
    volume = 0.14,
    slideTo?: number,
  ): void {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      if (slideTo) {
        osc.frequency.exponentialRampToValueAtTime(slideTo, this.ctx.currentTime + duration);
      }
      gain.gain.setValueAtTime(volume, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + duration);
    } catch {
      // Ignore WebAudio transient errors
    }
  }

  public jump(): void {
    this.tone(260, 'sine', 0.2, 0.14, 540);
  }

  public coin(): void {
    this.tone(880, 'sine', 0.1, 0.1);
    window.setTimeout(() => this.tone(1318, 'sine', 0.16, 0.1), 60);
  }

  public ok(): void {
    this.tone(523, 'triangle', 0.12, 0.16);
    window.setTimeout(() => this.tone(659, 'triangle', 0.12, 0.16), 90);
    window.setTimeout(() => this.tone(784, 'triangle', 0.24, 0.18), 180);
  }

  public no(): void {
    this.tone(210, 'sawtooth', 0.18, 0.09, 150);
  }

  public win(): void {
    [523, 659, 784, 1046].forEach((freq, idx) => {
      window.setTimeout(() => this.tone(freq, 'triangle', 0.3, 0.18), idx * 130);
    });
  }

  public speak(text: string): void {
    if (!this.enabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.pitch = 1.1;
      window.speechSynthesis.speak(utterance);
    } catch {
      // Ignore speech synthesis errors
    }
  }
}

export const audioSys = new SoundController();
