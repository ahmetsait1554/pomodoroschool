import { useState } from 'react';
import { X, Bird, Building2, Trees, Coffee, Flame, CloudRain, CloudLightning, Wind, Waves, Droplets, Tent, Music, Volume2, Play, Square } from 'lucide-react';
import { AMBIENT_SOUNDS, MUSIC_TRACKS } from '@/lib/constants';
import { audioEngine } from '@/lib/audio';

type Props = { onClose: () => void };

const ICON_MAP: Record<string, typeof CloudRain> = {
  Bird, Building2, Trees, Coffee, Flame, CloudRain, CloudLightning, Wind, Waves, Droplets, Tent,
};

export default function AudioLibrary({ onClose }: Props) {
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({});
  const [activeMusic, setActiveMusic] = useState<Record<string, number>>({});

  function toggleSound(id: string) {
    if (activeSounds[id] !== undefined) {
      audioEngine.stopSound(id);
      setActiveSounds((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      const vol = 0.4;
      audioEngine.playSound(id, vol);
      setActiveSounds((prev) => ({ ...prev, [id]: vol }));
    }
  }

  function setSoundVolume(id: string, vol: number) {
    audioEngine.setVolume(id, vol);
    setActiveSounds((prev) => ({ ...prev, [id]: vol }));
  }

  function toggleMusic(id: string, url: string) {
    if (activeMusic[id] !== undefined) {
      audioEngine.stopMusic(id);
      setActiveMusic((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
    } else {
      const vol = 0.5;
      audioEngine.playMusic(id, url, vol);
      setActiveMusic((prev) => ({ ...prev, [id]: vol }));
    }
  }

  function setMusicVolume(id: string, url: string, vol: number) {
    audioEngine.setMusicVolume(id, vol);
    setActiveMusic((prev) => ({ ...prev, [id]: vol }));
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/15 bg-slate-900/70 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 transition hover:text-white">
          <X size={20} />
        </button>

        <div className="p-6">
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
              <Volume2 size={20} className="text-orange-400" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-white">Ses ve Müzik Kütüphanesi</h2>
              <p className="text-sm text-slate-400">Sesleri ve müzikleri aynı anda çal</p>
            </div>
          </div>

          {/* Ambient Sounds */}
          <section className="mb-6">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
              <CloudRain size={16} className="text-orange-400" /> Ortam Sesleri
            </h3>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              {AMBIENT_SOUNDS.map((sound) => {
                const Icon = ICON_MAP[sound.icon] || CloudRain;
                const isActive = activeSounds[sound.id] !== undefined;
                return (
                  <div key={sound.id} className={`rounded-xl border p-3 transition ${isActive ? 'border-orange-400/40 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
                    <button
                      onClick={() => toggleSound(sound.id)}
                      className="flex w-full items-center gap-2 text-sm"
                    >
                      <Icon size={16} className={isActive ? 'text-orange-400' : 'text-slate-400'} />
                      <span className={`flex-1 text-left ${isActive ? 'text-orange-300' : 'text-slate-300'}`}>{sound.name}</span>
                      <span className={`flex h-5 w-5 items-center justify-center rounded-full ${isActive ? 'bg-orange-500' : 'bg-slate-600'}`}>
                        {isActive ? <Square size={10} className="text-white" /> : <Play size={10} className="text-white ml-0.5" />}
                      </span>
                    </button>
                    {isActive && (
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={activeSounds[sound.id]}
                        onChange={(e) => setSoundVolume(sound.id, parseFloat(e.target.value))}
                        className="mt-2 w-full accent-orange-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Music */}
          <section>
            <h3 className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-300">
              <Music size={16} className="text-orange-400" /> Lofi / Enstrümantal
            </h3>
            <div className="space-y-2">
              {MUSIC_TRACKS.map((track) => {
                const isActive = activeMusic[track.id] !== undefined;
                return (
                  <div key={track.id} className={`rounded-xl border p-3 transition ${isActive ? 'border-orange-400/40 bg-orange-500/10' : 'border-white/10 bg-white/5'}`}>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => toggleMusic(track.id, track.url)}
                        className={`flex h-9 w-9 items-center justify-center rounded-lg transition ${isActive ? 'bg-orange-500' : 'bg-white/10 hover:bg-white/20'}`}
                      >
                        {isActive ? <Square size={14} className="text-white" /> : <Play size={14} className="text-white ml-0.5" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${isActive ? 'text-orange-300' : 'text-slate-200'}`}>{track.name}</p>
                        <p className="text-xs text-slate-500">{track.artist} · {track.duration}</p>
                      </div>
                    </div>
                    {isActive && (
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={activeMusic[track.id]}
                        onChange={(e) => setMusicVolume(track.id, track.url, parseFloat(e.target.value))}
                        className="mt-2 w-full accent-orange-500"
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
