import { useState } from 'react';
import { CloudRain, Wind, Flame, Waves, Droplets, Radio, Volume2, Library } from 'lucide-react';
import { AMBIENT_SOUNDS } from '@/lib/constants';
import { audioEngine } from '@/lib/audio';

type Props = {
  onOpenLibrary: () => void;
};

const ICON_MAP: Record<string, typeof CloudRain> = {
  CloudRain, Wind, Flame, Waves, Droplets, Radio,
};

export default function AmbientSoundPanel({ onOpenLibrary }: Props) {
  const [activeSounds, setActiveSounds] = useState<Record<string, number>>({});

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

  function setVolume(id: string, vol: number) {
    audioEngine.setVolume(id, vol);
    setActiveSounds((prev) => ({ ...prev, [id]: vol }));
  }

  const activeCount = Object.keys(activeSounds).length;

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Volume2 size={18} className="text-orange-400" />
          <h3 className="text-sm font-semibold text-white">Ortam Sesleri</h3>
          {activeCount > 0 && (
            <span className="rounded-full bg-orange-500/20 px-2 py-0.5 text-xs text-orange-300">{activeCount} aktif</span>
          )}
        </div>
        <button
          onClick={onOpenLibrary}
          className="flex items-center gap-1.5 rounded-lg bg-white/5 px-2.5 py-1.5 text-xs text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          <Library size={13} /> Kütüphane
        </button>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {AMBIENT_SOUNDS.slice(0, 6).map((sound) => {
          const Icon = ICON_MAP[sound.icon] || CloudRain;
          const isActive = activeSounds[sound.id] !== undefined;
          return (
            <div key={sound.id}>
              <button
                onClick={() => toggleSound(sound.id)}
                className={`flex w-full items-center gap-2 rounded-xl border px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'border-orange-400/40 bg-orange-500/15 text-orange-300'
                    : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
                }`}
              >
                <Icon size={16} />
                <span className="flex-1 text-left">{sound.name}</span>
              </button>
              {isActive && (
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={activeSounds[sound.id]}
                  onChange={(e) => setVolume(sound.id, parseFloat(e.target.value))}
                  className="mt-1.5 w-full accent-orange-500"
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
