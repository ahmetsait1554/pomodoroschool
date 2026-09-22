import { Play, Pause, RotateCcw, SkipForward } from 'lucide-react';
import type { TimerMode } from '@/lib/supabase';
import { MODE_LABELS, MODE_COLORS } from '@/lib/constants';

type Props = {
  mode: TimerMode;
  secondsLeft: number;
  totalSeconds: number;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
};

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
}

export default function TimerDisplay({
  mode, secondsLeft, totalSeconds, isRunning, onStart, onPause, onReset, onSkip,
}: Props) {
  const progress = totalSeconds > 0 ? ((totalSeconds - secondsLeft) / totalSeconds) * 100 : 0;
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;
  const color = MODE_COLORS[mode];

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex h-[320px] w-[320px] items-center justify-center">
        <svg className="absolute inset-0 -rotate-90" viewBox="0 0 320 320">
          <circle cx="160" cy="160" r={radius} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="8" />
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
          />
        </svg>
        <div className="flex flex-col items-center gap-1">
          <span
            className="text-sm font-medium uppercase tracking-widest"
            style={{ color }}
          >
            {MODE_LABELS[mode]}
          </span>
          <span className="text-6xl font-bold tabular-nums text-white tracking-tight">
            {formatTime(secondsLeft)}
          </span>
          <span className="text-xs text-slate-500">
            {Math.round(progress)}% tamamlandı
          </span>
        </div>
      </div>

      <div className="mt-8 flex items-center gap-3">
        <button
          onClick={onReset}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Sıfırla"
        >
          <RotateCcw size={20} />
        </button>

        {isRunning ? (
          <button
            onClick={onPause}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105"
            style={{ backgroundColor: color, boxShadow: `0 8px 30px ${color}40` }}
            title="Duraklat"
          >
            <Pause size={28} className="fill-current" />
          </button>
        ) : (
          <button
            onClick={onStart}
            className="flex h-16 w-16 items-center justify-center rounded-full text-white shadow-lg transition hover:scale-105"
            style={{ backgroundColor: color, boxShadow: `0 8px 30px ${color}40` }}
            title="Başlat"
          >
            <Play size={28} className="fill-current ml-1" />
          </button>
        )}

        <button
          onClick={onSkip}
          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white"
          title="Geç"
        >
          <SkipForward size={20} />
        </button>
      </div>
    </div>
  );
}
