import { CloudRain, Snowflake, Leaf, Sparkles } from 'lucide-react';
import { PARTICLE_EFFECTS, type ParticleEffectType } from '@/lib/constants';

type Props = {
  activeEffect: ParticleEffectType | null;
  intensity: number;
  onToggle: (effect: ParticleEffectType | null) => void;
  onIntensityChange: (v: number) => void;
};

const ICON_MAP: Record<string, typeof CloudRain> = {
  CloudRain, Snowflake, Leaf,
};

export default function ParticleControls({ activeEffect, intensity, onToggle, onIntensityChange }: Props) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-white">Hava Efektleri</h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {PARTICLE_EFFECTS.map((eff) => {
          const Icon = ICON_MAP[eff.icon] || CloudRain;
          const isActive = activeEffect === eff.id;
          return (
            <button
              key={eff.id}
              onClick={() => onToggle(isActive ? null : eff.id)}
              className={`flex flex-col items-center gap-1.5 rounded-xl border px-2 py-3 text-xs transition ${
                isActive
                  ? 'border-orange-400/40 bg-orange-500/15 text-orange-300'
                  : 'border-white/10 bg-white/5 text-slate-300 hover:bg-white/10'
              }`}
            >
              <Icon size={20} />
              <span>{eff.name}</span>
            </button>
          );
        })}
      </div>

      {activeEffect && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between">
            <label className="text-xs font-medium text-slate-400">Yoğunluk</label>
            <span className="text-xs text-slate-500">{Math.round(intensity * 100)}%</span>
          </div>
          <input
            type="range"
            min="0.1"
            max="1"
            step="0.05"
            value={intensity}
            onChange={(e) => onIntensityChange(parseFloat(e.target.value))}
            className="w-full accent-orange-500"
          />
        </div>
      )}
    </div>
  );
}
