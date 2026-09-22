import { AMBIENT_SOUNDS } from './constants';

type ActiveSound = {
  source: AudioBufferSourceNode;
  gain: GainNode;
  filter: BiquadFilterNode;
};

type ActiveMusic = {
  audio: HTMLAudioElement;
  gain: GainNode;
  mediaSource: MediaElementAudioSourceNode;
};

class AudioEngine {
  private ctx: AudioContext | null = null;
  private noiseBuffer: AudioBuffer | null = null;
  private activeSounds: Map<string, ActiveSound> = new Map();
  private activeMusic: Map<string, ActiveMusic> = new Map();
  private masterGain: GainNode | null = null;

  private ensureContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new AudioContext();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.value = 0.8;
      this.masterGain.connect(this.ctx.destination);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private generateNoiseBuffer(ctx: AudioContext): AudioBuffer {
    const bufferSize = ctx.sampleRate * 4;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5;
    }
    return buffer;
  }

  playSound(soundId: string, volume: number): void {
    const sound = AMBIENT_SOUNDS.find((s) => s.id === soundId);
    if (!sound) return;

    if (this.activeSounds.has(soundId)) {
      this.setVolume(soundId, volume);
      return;
    }

    const ctx = this.ensureContext();
    if (!this.noiseBuffer) {
      this.noiseBuffer = this.generateNoiseBuffer(ctx);
    }

    const source = ctx.createBufferSource();
    source.buffer = this.noiseBuffer;
    source.loop = true;

    const filter = ctx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = sound.params.filterFreq;
    filter.Q.value = sound.params.q;

    const gain = ctx.createGain();
    gain.gain.value = volume;

    source.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);
    source.start();

    this.activeSounds.set(soundId, { source, gain, filter });
  }

  stopSound(soundId: string): void {
    const active = this.activeSounds.get(soundId);
    if (!active) return;
    active.source.stop();
    active.source.disconnect();
    active.filter.disconnect();
    active.gain.disconnect();
    this.activeSounds.delete(soundId);
  }

  setVolume(soundId: string, volume: number): void {
    const active = this.activeSounds.get(soundId);
    if (!active || !this.ctx) return;
    active.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
  }

  stopAll(): void {
    for (const id of this.activeSounds.keys()) {
      this.stopSound(id);
    }
    for (const id of this.activeMusic.keys()) {
      this.stopMusic(id);
    }
  }

  playMusic(trackId: string, url: string, volume: number): void {
    if (this.activeMusic.has(trackId)) {
      this.setMusicVolume(trackId, volume);
      return;
    }
    const ctx = this.ensureContext();
    const audio = new Audio(url);
    audio.loop = true;
    audio.crossOrigin = 'anonymous';
    const mediaSource = ctx.createMediaElementSource(audio);
    const gain = ctx.createGain();
    gain.gain.value = volume;
    mediaSource.connect(gain);
    gain.connect(this.masterGain!);
    audio.play().catch(() => {});
    this.activeMusic.set(trackId, { audio, gain, mediaSource });
  }

  stopMusic(trackId: string): void {
    const active = this.activeMusic.get(trackId);
    if (!active) return;
    active.audio.pause();
    active.audio.src = '';
    active.gain.disconnect();
    active.mediaSource.disconnect();
    this.activeMusic.delete(trackId);
  }

  setMusicVolume(trackId: string, volume: number): void {
    const active = this.activeMusic.get(trackId);
    if (!active || !this.ctx) return;
    active.gain.gain.setTargetAtTime(volume, this.ctx.currentTime, 0.1);
  }

  isMusicPlaying(trackId: string): boolean {
    return this.activeMusic.has(trackId);
  }

  playChime(): void {
    const ctx = this.ensureContext();
    const now = ctx.currentTime;
    const notes = [880, 1108.73, 1318.51];
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.frequency.value = freq;
      osc.type = 'sine';
      gain.gain.setValueAtTime(0, now + i * 0.15);
      gain.gain.linearRampToValueAtTime(0.3, now + i * 0.15 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.15 + 1.5);
      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now + i * 0.15);
      osc.stop(now + i * 0.15 + 1.5);
    });
  }
}

export const audioEngine = new AudioEngine();
