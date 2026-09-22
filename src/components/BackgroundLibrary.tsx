import { useState } from 'react';
import { X, Check } from 'lucide-react';
import { BACKGROUNDS, BACKGROUND_CATEGORIES, type BackgroundCategory } from '@/lib/constants';

type Props = {
  selected: string;
  onSelect: (id: string) => void;
  onClose: () => void;
};

export default function BackgroundLibrary({ selected, onSelect, onClose }: Props) {
  const [category, setCategory] = useState<BackgroundCategory | 'all'>('all');

  const filtered = category === 'all' ? BACKGROUNDS : BACKGROUNDS.filter((b) => b.category === category);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-3xl max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-6 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <h2 className="mb-1 text-xl font-semibold text-white">Arka Plan Kütüphanesi</h2>
        <p className="mb-5 text-sm text-slate-400">Odak atmosferini kişiselleştir</p>

        <div className="mb-5 flex flex-wrap gap-2">
          <CategoryButton label="Tümü" active={category === 'all'} onClick={() => setCategory('all')} />
          {BACKGROUND_CATEGORIES.map((cat) => (
            <CategoryButton
              key={cat.id}
              label={cat.name}
              active={category === cat.id}
              onClick={() => setCategory(cat.id)}
            />
          ))}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {filtered.map((bg) => (
            <button
              key={bg.id}
              onClick={() => onSelect(bg.id)}
              className={`group relative aspect-video overflow-hidden rounded-xl border-2 transition ${
                selected === bg.id ? 'border-orange-400' : 'border-transparent hover:border-white/20'
              }`}
            >
              <img
                src={bg.url}
                alt={bg.name}
                loading="lazy"
                className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
              {selected === bg.id && (
                <div className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-orange-500">
                  <Check size={14} className="text-white" />
                </div>
              )}
              <span className="absolute bottom-2 left-2 right-2 truncate text-left text-xs font-medium text-white">
                {bg.name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryButton({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
        active ? 'bg-orange-500/20 text-orange-300' : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
      }`}
    >
      {label}
    </button>
  );
}
