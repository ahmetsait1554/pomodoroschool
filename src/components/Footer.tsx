import { GraduationCap } from 'lucide-react';
import type { LegalPage } from './LegalPages';

export default function Footer({ onLegalPage }: { onLegalPage: (page: LegalPage) => void }) {
  return (
    <footer className="border-t border-white/5 bg-slate-950/60 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
              <GraduationCap className="text-white" size={16} />
            </div>
            <span className="text-sm font-bold text-white">Pomodoro School</span>
          </div>

          <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <button onClick={() => onLegalPage('kvkk')} className="text-xs text-slate-400 transition hover:text-white">KVKK Aydınlatma Metni</button>
            <button onClick={() => onLegalPage('privacy')} className="text-xs text-slate-400 transition hover:text-white">Gizlilik Politikası</button>
            <button onClick={() => onLegalPage('terms')} className="text-xs text-slate-400 transition hover:text-white">Kullanım Şartları</button>
            <button onClick={() => onLegalPage('contact')} className="text-xs text-slate-400 transition hover:text-white">İletişim</button>
          </nav>

          <p className="text-xs text-slate-500">© {new Date().getFullYear()} Pomodoro School</p>
        </div>
      </div>
    </footer>
  );
}
