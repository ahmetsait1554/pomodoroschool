import { useState } from 'react';
import { X, GraduationCap, Mail, Lock, User, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth';

type Props = { onClose: () => void };

export default function AuthModal({ onClose }: Props) {
  const { signIn, signUp } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const result = mode === 'login'
      ? await signIn(email, password)
      : await signUp(email, password, displayName || 'Student');
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div
        className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/15 bg-slate-900/70 shadow-2xl backdrop-blur-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-0 -z-10 bg-gradient-to-br from-orange-500/10 via-transparent to-amber-500/5" />
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 transition hover:text-white">
          <X size={20} />
        </button>

        <div className="p-8">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/30">
              <GraduationCap className="text-white" size={30} />
            </div>
            <h2 className="text-xl font-semibold text-white">
              {mode === 'login' ? 'Tekrar Hoş Geldin' : "Pomodoro School'a Katıl"}
            </h2>
            <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
              <Sparkles size={13} className="text-orange-400" />
              {mode === 'login' ? 'Verilerin seni bekliyor' : 'Odak yolculuğunu başlat'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'signup' && (
              <div className="relative">
                <User size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Görünür ad"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-white/10"
                />
              </div>
            )}
            <div className="relative">
              <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="email"
                required
                placeholder="E-posta"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-white/10"
              />
            </div>
            <div className="relative">
              <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="password"
                required
                placeholder="Şifre"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-slate-500 outline-none transition focus:border-orange-500/50 focus:bg-white/10"
              />
            </div>

            {error && (
              <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50"
            >
              {loading ? 'Yükleniyor...' : mode === 'login' ? 'Giriş Yap' : 'Üye Ol'}
            </button>
          </form>

          <p className="mt-5 text-center text-sm text-slate-400">
            {mode === 'login' ? 'Hesabın yok mu?' : 'Zaten üye misin?'}{' '}
            <button
              onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(null); }}
              className="font-medium text-orange-400 transition hover:text-orange-300"
            >
              {mode === 'login' ? 'Üye Ol' : 'Giriş Yap'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
