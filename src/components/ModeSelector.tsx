import type { TimerMode } from '@/lib/supabase';
import { MODE_LABELS } from '@/lib/constants';

type Props = {
  currentMode: TimerMode;
  onSwitch: (mode: TimerMode) => void;
};

const modes: TimerMode[] = ['work', 'short_break', 'long_break'];

export default function ModeSelector({ currentMode, onSwitch }: Props) {
  return (
    <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
      {modes.map((m) => (
        <button
          key={m}
          onClick={() => onSwitch(m)}
          className={`rounded-full px-5 py-2 text-sm font-medium transition ${
            currentMode === m
              ? 'bg-white/15 text-white shadow-sm'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          {MODE_LABELS[m]}
        </button>
      ))}
    </div>
  );
}
