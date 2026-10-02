export type AmbientType = 'none' | 'rain' | 'cafe' | 'waves' | 'forest';
export type BellType = 'bell' | 'chime' | 'ding' | 'pop';

class SoundEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private currentSource: AudioBufferSourceNode | null = null;
  private _volume = 0.4;
  private _muted = false;

  private getCtx() {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = this._muted ? 0 : this._volume;
      this.masterGain.connect(this.ctx.destination);
    }
    return { ctx: this.ctx, master: this.masterGain! };
  }

  setVolume(v: number) {
    this._volume = v;
    if (this.masterGain && !this._muted) this.masterGain.gain.value = v;
  }

  setMuted(m: boolean) {
    this._muted = m;
    if (this.masterGain) this.masterGain.gain.value = m ? 0 : this._volume;
  }

  playAmbient(type: AmbientType) {
    this.stopAmbient();
    if (type === 'none') return;
    const { ctx, master } = this.getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const sr = ctx.sampleRate;
    const len = sr * 3;
    const buf = ctx.createBuffer(2, len, sr);

    for (let ch = 0; ch < 2; ch++) {
      const d = buf.getChannelData(ch);
      if (type === 'rain' || type === 'forest') {
        for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
      } else if (type === 'cafe') {
        let last = 0;
        for (let i = 0; i < len; i++) {
          const w = Math.random() * 2 - 1;
          d[i] = (last + 0.02 * w) / 1.02;
          last = d[i];
          d[i] *= 3.5;
        }
      } else if (type === 'waves') {
        for (let i = 0; i < len; i++) {
          const t = i / sr;
          const env = (Math.sin(2 * Math.PI * 0.15 * t) * 0.5 + 0.5) ** 1.5;
          d[i] = (Math.random() * 2 - 1) * env;
        }
      }
    }

    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;

    const filter = ctx.createBiquadFilter();
    if (type === 'rain') {
      filter.type = 'bandpass'; filter.frequency.value = 1200; filter.Q.value = 0.4;
    } else if (type === 'cafe') {
      filter.type = 'lowpass'; filter.frequency.value = 500;
    } else if (type === 'waves') {
      filter.type = 'lowpass'; filter.frequency.value = 700;
    } else {
      filter.type = 'highpass'; filter.frequency.value = 300;
    }

    src.connect(filter);
    filter.connect(master);
    src.start();
    this.currentSource = src;
  }

  stopAmbient() {
    if (this.currentSource) {
      try { this.currentSource.stop(); } catch { /* already stopped */ }
      this.currentSource = null;
    }
  }

  playNotification(type: BellType = 'bell') {
    const { ctx, master } = this.getCtx();
    if (ctx.state === 'suspended') ctx.resume();

    const now = ctx.currentTime;

    if (type === 'bell') {
      [880, 1100, 660].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(master);
        osc.type = 'sine'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0, now + i * 0.15);
        gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.2);
        osc.start(now + i * 0.15); osc.stop(now + i * 0.15 + 1.3);
      });
    } else if (type === 'chime') {
      [523, 659, 784, 1047].forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain); gain.connect(master);
        osc.type = 'triangle'; osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25, now + i * 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.2 + 1.0);
        osc.start(now + i * 0.2); osc.stop(now + i * 0.2 + 1.1);
      });
    } else if (type === 'ding') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(master);
      osc.type = 'sine'; osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(800, now + 0.6);
      gain.gain.setValueAtTime(0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
      osc.start(now); osc.stop(now + 0.9);
    } else if (type === 'pop') {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(master);
      osc.type = 'sine'; osc.frequency.setValueAtTime(400, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.1);
      gain.gain.setValueAtTime(0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.start(now); osc.stop(now + 0.2);
    }
  }
}

export const soundEngine = typeof window !== 'undefined' ? new SoundEngine() : null;
