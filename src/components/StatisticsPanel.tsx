import { useEffect, useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Calendar, Clock, Flame, Crown, Lock, Play } from 'lucide-react';
import { supabase, type Session } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

type Range = 'day' | 'week' | 'month';

export default function StatisticsPanel() {
  const { session, profile } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [range, setRange] = useState<Range>('week');
  const [adLoading, setAdLoading] = useState(false);
  const [adCountdown, setAdCountdown] = useState(0);
  const [adStep, setAdStep] = useState<'idle' | 'watching' | 'done'>('idle');

  const isPremium = profile?.is_premium ?? false;

  useEffect(() => {
    if (!session) return;
    const now = new Date();
    const days = range === 'day' ? 1 : range === 'week' ? 7 : 30;
    const from = new Date(now);
    from.setDate(now.getDate() - days + 1);
    from.setHours(0, 0, 0, 0);

    supabase
      .from('sessions')
      .select('*')
      .eq('user_id', session.user.id)
      .gte('completed_at', from.toISOString())
      .order('completed_at', { ascending: true })
      .then(({ data }) => {
        if (data) setSessions(data as Session[]);
      });
  }, [session, range]);

  const stats = useMemo(() => {
    const workSessions = sessions.filter((s) => s.mode === 'work');
    const totalMinutes = workSessions.reduce((sum, s) => sum + s.duration_seconds / 60, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayCount = workSessions.filter((s) => new Date(s.completed_at) >= today).length;

    const days = range === 'day' ? 1 : range === 'week' ? 7 : 30;
    const buckets: { label: string; count: number; minutes: number }[] = [];
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const next = new Date(d);
      next.setDate(d.getDate() + 1);
      const daySessions = workSessions.filter((s) => {
        const sd = new Date(s.completed_at);
        return sd >= d && sd < next;
      });
      buckets.push({
        label: d.toLocaleDateString('tr-TR', { weekday: 'short', day: range === 'month' ? 'numeric' : undefined }),
        count: daySessions.length,
        minutes: daySessions.reduce((sum, s) => sum + s.duration_seconds / 60, 0),
      });
    }
    return { totalMinutes, todayCount, totalSessions: workSessions.length, buckets };
  }, [sessions, range]);

  const maxCount = Math.max(1, ...stats.buckets.map((b) => b.count));

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

  if (!isPremium) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 size={22} className="text-orange-400" />
            <h2 className="text-xl font-semibold text-white">İstatistiklerim</h2>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-8 backdrop-blur-md text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10">
            <Lock size={28} className="text-amber-400" />
          </div>
          <h3 className="mb-2 text-lg font-bold text-white">Premium Özellik</h3>
          <p className="mb-6 max-w-md mx-auto text-sm text-slate-400">
            İstatistikler premium üyelere özel bir özelliktir. Reklam izleyerek ücretsiz premium üyelik kazanabilir ve tüm istatistiklere erişebilirsiniz.
          </p>

          {adStep === 'watching' ? (
            <div className="rounded-xl border border-white/10 bg-white/5 p-6">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full border-2 border-orange-500/30">
                <span className="text-2xl font-bold text-orange-400">{adCountdown}</span>
              </div>
              <p className="text-sm text-slate-300">Reklam izleniyor... Lütfen bekleyin.</p>
              <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-500 transition-all duration-1000" style={{ width: `${((15 - adCountdown) / 15) * 100}%` }} />
              </div>
            </div>
          ) : adStep === 'done' ? (
            <div className="flex items-center justify-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3">
              <Crown size={20} className="text-emerald-400" />
              <p className="text-sm font-medium text-emerald-200">Premium üyeliğin aktif! Sayfayı yenileyin.</p>
            </div>
          ) : (
            <button
              onClick={startAdDonation}
              disabled={adLoading}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-3 font-semibold text-white transition hover:shadow-lg hover:shadow-orange-500/30 disabled:opacity-50"
            >
              <Play size={18} /> Reklam İzle ve Premium Kazan
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BarChart3 size={22} className="text-orange-400" />
          <h2 className="text-xl font-semibold text-white">İstatistiklerim</h2>
          <span className="flex items-center gap-1 rounded-full bg-amber-500/20 px-2 py-0.5 text-xs font-medium text-amber-300">
            <Crown size={12} /> Premium
          </span>
        </div>
        <div className="inline-flex rounded-full border border-white/10 bg-white/5 p-1">
          {(['day', 'week', 'month'] as Range[]).map((r) => (
            <button
              key={r}
              onClick={() => setRange(r)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                range === r ? 'bg-white/15 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {r === 'day' ? 'Gün' : r === 'week' ? 'Hafta' : 'Ay'}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard icon={Calendar} label="Bugün" value={`${stats.todayCount} Pomodoro`} color="orange" />
        <StatCard icon={TrendingUp} label="Toplam Seans" value={`${stats.totalSessions}`} color="emerald" />
        <StatCard icon={Clock} label="Toplam Odak" value={`${Math.round(stats.totalMinutes)} dk`} color="blue" />
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="mb-6 text-sm font-medium text-slate-300">Tamamlanan Pomodorolar</h3>
        <div className="flex items-end justify-between gap-1.5" style={{ height: '200px' }}>
          {stats.buckets.map((b, i) => (
            <div key={i} className="group relative flex flex-1 flex-col items-center justify-end">
              <div className="absolute -top-8 hidden whitespace-nowrap rounded-lg bg-slate-800 px-2 py-1 text-xs text-white group-hover:block z-10">
                {b.count} seans · {Math.round(b.minutes)} dk
              </div>
              <div
                className="w-full max-w-[40px] rounded-t-lg bg-gradient-to-t from-orange-600/60 to-orange-400/80 transition-all duration-300 hover:from-orange-500 hover:to-orange-300"
                style={{ height: `${(b.count / maxCount) * 100}%`, minHeight: b.count > 0 ? '8px' : '2px' }}
              />
              <span className="mt-2 text-[10px] text-slate-500">{b.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md">
        <h3 className="mb-4 text-sm font-medium text-slate-300">Son Seanslar</h3>
        <div className="space-y-2">
          {sessions.slice(-8).reverse().map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 px-4 py-2.5">
              <div className="flex items-center gap-3">
                <span className={`h-2 w-2 rounded-full ${s.mode === 'work' ? 'bg-orange-400' : s.mode === 'short_break' ? 'bg-emerald-400' : 'bg-blue-400'}`} />
                <span className="text-sm text-slate-200">{s.task_title || (s.mode === 'work' ? 'Odak Seansı' : 'Mola')}</span>
              </div>
              <span className="text-xs text-slate-500">
                {new Date(s.completed_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })} · {Math.round(s.duration_seconds / 60)} dk
              </span>
            </div>
          ))}
          {sessions.length === 0 && (
            <div className="flex flex-col items-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                <BarChart3 size={28} className="text-orange-400" />
              </div>
              <p className="mb-1 font-medium text-white">Henüz veri yok</p>
              <p className="mb-4 max-w-xs text-sm text-slate-500">İlk pomodoro seansını tamamla, istatistiklerin buraya gelmeye başlasın.</p>
              <div className="flex items-center gap-1.5 rounded-full border border-orange-500/20 bg-orange-500/10 px-4 py-1.5 text-xs font-medium text-orange-300">
                <Flame size={12} /> Odak sekmesine geç ve başla
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color }: { icon: typeof Calendar; label: string; value: string; color: string }) {
  const colors: Record<string, string> = {
    orange: 'text-orange-400 bg-orange-500/10',
    emerald: 'text-emerald-400 bg-emerald-500/10',
    blue: 'text-blue-400 bg-blue-500/10',
  };
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-md">
      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl ${colors[color]}`}>
        <Icon size={20} />
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="mt-1 text-xs text-slate-400">{label}</p>
    </div>
  );
}
