import { useState } from 'react';
import { User, Heart, Crown, Settings, Play, Check, X } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

export default function ProfilePanel() {
  const { session, profile, updateDisplayName, signOut } = useAuth();
  const [editName, setEditName] = useState(false);
  const [nameInput, setNameInput] = useState(profile?.display_name || '');
  const [adLoading, setAdLoading] = useState(false);
  const [adStep, setAdStep] = useState<'idle' | 'watching' | 'done'>('idle');
  const [adCountdown, setAdCountdown] = useState(0);

  async function saveName() {
    if (!nameInput.trim()) return;
    await updateDisplayName(nameInput.trim());
    setEditName(false);
  }

  async function startAdDonation() {
    setAdLoading(true);
    setAdStep('watching');
    setAdCountdown(15);

    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    setTimeout(async () => {
      setAdStep('done');
      setAdLoading(false);
      if (session) {
        await supabase.from('profiles').update({ is_premium: true }).eq('id', session.user.id);
      }
    }, 15000);
  }

  const isPremium = profile?.is_premium ?? false;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <User size={22} className="text-orange-400" />
        <h2 className="text-xl font-semibold text-white">Profilim</h2>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 text-2xl font-bold text-white shadow-lg shadow-orange-500/20">
            {profile?.display_name?.charAt(0).toUpperCase() || '?'}
          </div>
          <div className="flex-1">
            {editName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={nameInput}
                  onChange={(e) => setNameInput(e.target.value)}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-white outline-none focus:border-orange-500/50"
                  onKeyDown={(e) => { if (e.key === 'Enter') saveName(); }}
                  autoFocus
                />
                <button onClick={saveName} className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/20 text-orange-300 transition hover:bg-orange-500/30">
                  <Check size={16} />
                </button>
                <button onClick={() => { setEditName(false); setNameInput(profile?.display_name || ''); }} className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 transition hover:bg-white/10">
                  <X size={16} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">{profile?.display_name}</h3>
                <button onClick={() => setEditName(true)} className="text-xs text-slate-400 transition hover:text-white">
                  <Settings size={14} />
                </button>
              </div>
            )}
            <p className="mt-0.5 text-sm text-slate-400">{session?.user?.email}</p>
            <div className="mt-2 flex items-center gap-2">
              {isPremium ? (
                <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-3 py-0.5 text-xs font-medium text-amber-300">
                  <Crown size={12} /> Premium Üye
                </span>
              ) : (
                <span className="rounded-full bg-white/5 px-3 py-0.5 text-xs text-slate-400">Ücretsiz Üye</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-white">
          <Heart size={16} className="text-orange-400" /> Bağış Yap
        </h3>
        <p className="mb-4 text-sm text-slate-400">
          Reklam izleyerek Pomodoro School'a destek olabilir ve <strong className="text-amber-300">Premium üyelik</strong> kazanabilirsiniz. Premium üyeler istatistiklere tam erişim sağlar.
        </p>

        {isPremium ? (
          <div className="flex items-center gap-3 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
            <Crown size={20} className="text-amber-400" />
            <div>
              <p className="text-sm font-medium text-amber-200">Premium üyeliğin aktif!</p>
              <p className="text-xs text-amber-300/70">İstatistiklere tam erişimin var.</p>
            </div>
          </div>
        ) : adStep === 'watching' ? (
          <div className="rounded-xl border border-white/10 bg-white/5 p-6 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-orange-500/30">
              <span className="text-2xl font-bold text-orange-400">{adCountdown}</span>
            </div>
            <p className="text-sm text-slate-300">Reklam izleniyor... Lütfen bekleyin.</p>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000" style={{ width: `${((15 - adCountdown) / 15) * 100}%` }} />
            </div>
          </div>
        ) : adStep === 'done' ? (
          <div className="flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
            <Check size={20} className="text-emerald-400" />
            <div>
              <p className="text-sm font-medium text-emerald-200">Teşekkürler! Premium üyeliğin aktif edildi.</p>
              <p className="text-xs text-emerald-300/70">İstatistiklere artık tam erişebilirsin.</p>
            </div>
          </div>
        ) : (
          <button
            onClick={startAdDonation}
            disabled={adLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
          >
            <Play size={18} /> Reklam İzle ve Premium Kazan
          </button>
        )}
      </div>

      <button
        onClick={signOut}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 py-3 text-sm font-medium text-red-300 transition hover:bg-red-500/20"
      >
        Çıkış Yap
      </button>
    </div>
  );
}
