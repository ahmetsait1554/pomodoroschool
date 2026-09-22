import { useState, useEffect } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { BACKGROUNDS } from '@/lib/constants';
import { fetchCustomBackgrounds, type CustomBackground } from '@/lib/customBackgrounds';

type Props = {
  selected: string;
  onSelect: (id: string) => void;
};

export default function BackgroundSelector({ selected, onSelect }: Props) {
  const [customBgs, setCustomBgs] = useState<CustomBackground[]>([]);

  useEffect(() => {
    fetchCustomBackgrounds().then(setCustomBgs);
  }, []);

  const QUICK_BACKGROUNDS = [...BACKGROUNDS.slice(0, 5), ...customBgs.slice(0, 4)];

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className="mb-4 flex items-center gap-2">
        <ImageIcon size={18} className="text-orange-400" />
        <h3 className="text-sm font-semibold text-white">Atmosfer</h3>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {QUICK_BACKGROUNDS.map((bg) => (
          <button
            key={bg.id}
            onClick={() => onSelect(bg.id)}
            className={`group relative aspect-video overflow-hidden rounded-lg border-2 transition ${
              selected === bg.id ? 'border-orange-400' : 'border-transparent hover:border-white/20'
            }`}
          >
            <img
              src={bg.url}
              alt={bg.name}
              loading="lazy"
              className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-black/40" />
            <span className="absolute bottom-1 left-1 right-1 truncate text-left text-[10px] font-medium text-white">
              {bg.name}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
