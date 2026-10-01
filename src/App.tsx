import { useState, useEffect, useCallback, useRef } from 'react';
import { GraduationCap, BarChart3, Users, Settings, LogOut, Flame, ImagePlus, Music, User } from 'lucide-react';
import { AuthProvider, useAuth } from '@/lib/auth';
import { useTimer } from '@/lib/useTimer';
import { supabase } from '@/lib/supabase';
import { BACKGROUNDS, type ParticleEffectType } from '@/lib/constants';
import { fetchCustomBackgrounds, type CustomBackground } from '@/lib/customBackgrounds';
import AuthModal from '@/components/AuthModal';
import TimerDisplay from '@/components/TimerDisplay';
import ModeSelector from '@/components/ModeSelector';
import TaskPanel from '@/components/TaskPanel';
import BackgroundSelector from '@/components/BackgroundSelector';
import BackgroundLibrary from '@/components/BackgroundLibrary';
import AmbientSoundPanel from '@/components/AmbientSoundPanel';
import AudioLibrary from '@/components/AudioLibrary';
import StatisticsPanel from '@/components/StatisticsPanel';
import CoworkingPanel from '@/components/CoworkingPanel';
import SettingsModal from '@/components/SettingsModal';
import ParticleCanvas from '@/components/ParticleCanvas';
import ParticleControls from '@/components/ParticleControls';
import LegalPages, { type LegalPage } from '@/components/LegalPages';
import Footer from '@/components/Footer';
import ProfilePanel from '@/components/ProfilePanel';

type View = 'focus' | 'stats' | 'rooms' | 'profile';

function getLegalPageFromHash(): LegalPage {
  const hash = window.location.hash.replace('#/', '').replace('#', '');
  if (['kvkk', 'privacy', 'terms', 'contact'].includes(hash)) return hash as LegalPage;
  return null;
}

function AppContent() {
  const { session, profile, loading, signOut } = useAuth();
  const [showAuth, setShowAuth] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showBgLibrary, setShowBgLibrary] = useState(false);
  const [showAudioLibrary, setShowAudioLibrary] = useState(false);
  const [view, setView] = useState<View>('focus');
  const [bgId, setBgId] = useState(() => localStorage.getItem('ps_bg') || 'forest');
  const [particleEffect, setParticleEffect] = useState<ParticleEffectType | null>(
    () => (localStorage.getItem('ps_particle_effect') as ParticleEffectType | null) || null
  );
  const [particleIntensity, setParticleIntensity] = useState(() =>
    parseFloat(localStorage.getItem('ps_particle_intensity') || '0.5')
  );
  const [customBgs, setCustomBgs] = useState<CustomBackground[]>([]);
  const [legalPage, setLegalPage] = useState<LegalPage>(() => getLegalPageFromHash());

  useEffect(() => {
    fetchCustomBackgrounds().then(setCustomBgs);
  }, []);

  useEffect(() => {
    const onHashChange = () => setLegalPage(getLegalPageFromHash());
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  function openLegalPage(page: LegalPage) {
    window.location.hash = `/${page}`;
    setLegalPage(page);
  }
  function closeLegalPage() {
    window.location.hash = '';
    setLegalPage(null);
  }

  const prefs = profile?.preferences;
  const sessionRef = useRef(session);
  sessionRef.current = session;

  const handleSessionComplete = useCallback((info: { mode: string; durationSeconds: number; taskTitle: string }) => {
    if (!sessionRef.current) return;
    supabase.from('sessions').insert({
      user_id: sessionRef.current.user.id,
      mode: info.mode,
      duration_seconds: info.durationSeconds,
      task_title: info.taskTitle || null,
    });
  }, []);

  const timer = useTimer({
    workDuration: prefs?.workDuration ?? 25,
    shortBreakDuration: prefs?.shortBreakDuration ?? 5,
    longBreakDuration: prefs?.longBreakDuration ?? 15,
    autoStartBreaks: prefs?.autoStartBreaks ?? false,
    autoStartPomodoros: prefs?.autoStartPomodoros ?? false,
    soundEnabled: prefs?.soundEnabled ?? true,
    notificationEnabled: prefs?.notificationEnabled ?? true,
    onComplete: handleSessionComplete,
  });

  useEffect(() => {
    if (prefs?.favoriteBackground) setBgId(prefs.favoriteBackground);
  }, [prefs?.favoriteBackground]);

  const handleBgChange = useCallback((id: string) => {
    setBgId(id);
    localStorage.setItem('ps_bg', id);
    setShowBgLibrary(false);
    if (session) {
      supabase.from('profiles').update({ preferences: { ...prefs, favoriteBackground: id } }).eq('id', session.user.id);
    }
  }, [session, prefs]);

  const handleParticleToggle = useCallback((effect: ParticleEffectType | null) => {
    setParticleEffect(effect);
    if (effect) localStorage.setItem('ps_particle_effect', effect);
    else localStorage.removeItem('ps_particle_effect');
  }, []);

  const handleIntensityChange = useCallback((v: number) => {
    setParticleIntensity(v);
    localStorage.setItem('ps_particle_intensity', v.toString());
  }, []);

  const ALL_BACKGROUNDS = [...BACKGROUNDS, ...customBgs];
  const bg = ALL_BACKGROUNDS.find((b) => b.id === bgId) || ALL_BACKGROUNDS[0];

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg animate-pulse">
            <GraduationCap className="text-white" size={28} />
          </div>
          <p className="text-sm text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <>
        <LandingPage onAuth={() => setShowAuth(true)} bg={bg} onLegalPage={openLegalPage} />
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
        {legalPage && <LegalPages page={legalPage} onClose={closeLegalPage} />}
      </>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <img
          src={bg.url}
          alt=""
          className="h-full w-full object-cover animate-pan"
        />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${bg.overlay}, rgba(15,23,42,0.85))` }} />
      </div>
      {particleEffect && (
        <ParticleCanvas effect={particleEffect} intensity={particleIntensity} />
      )}

      <header className="sticky top-0 z-30 border-b border-white/5 bg-slate-950/40 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-500/20">
              <GraduationCap className="text-white" size={22} />
            </div>
            <span className="text-lg font-bold text-white">Pomodoro School</span>
          </div>

          <nav className="hidden items-center gap-1 sm:flex">
            <NavButton icon={Flame} label="Odak" active={view === 'focus'} onClick={() => setView('focus')} />
            <NavButton icon={BarChart3} label="İstatistik" active={view === 'stats'} onClick={() => setView('stats')} />
            <NavButton icon={Users} label="Ortak Çalışma" active={view === 'rooms'} onClick={() => setView('rooms')} />
            <NavButton icon={User} label="Profil" active={view === 'profile'} onClick={() => setView('profile')} />
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAudioLibrary(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Ses ve Müzik Kütüphanesi"
            >
              <Music size={18} />
            </button>
            <button
              onClick={() => setShowBgLibrary(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
              title="Arka Plan Kütüphanesi"
            >
              <ImagePlus size={18} />
            </button>
            <button
              onClick={() => setShowSettings(true)}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-white/10 hover:text-white"
            >
              <Settings size={18} />
            </button>
            <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-amber-600 text-xs font-bold text-white">
                {profile?.display_name.charAt(0).toUpperCase()}
              </div>
              <span className="hidden text-sm text-slate-200 sm:block">{profile?.display_name}</span>
            </div>
            <button
              onClick={signOut}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition hover:bg-red-500/10 hover:text-red-400"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>

        <nav className="flex items-center gap-1 px-4 pb-2 sm:hidden">
          <NavButton icon={Flame} label="Odak" active={view === 'focus'} onClick={() => setView('focus')} />
          <NavButton icon={BarChart3} label="İstat" active={view === 'stats'} onClick={() => setView('stats')} />
          <NavButton icon={Users} label="Ortak" active={view === 'rooms'} onClick={() => setView('rooms')} />
          <NavButton icon={User} label="Profil" active={view === 'profile'} onClick={() => setView('profile')} />
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        {view === 'focus' && (
          <div className="animate-fade-in">
            <div className="mb-6 flex justify-center">
              <ModeSelector currentMode={timer.mode} onSwitch={timer.switchMode} />
            </div>
            <div className={`grid grid-cols-1 gap-6 lg:grid-cols-3 transition-all duration-500 ${timer.isRunning && timer.mode === 'work' ? 'lg:grid-cols-1' : ''}`}>
              <div className={`flex flex-col items-center justify-center transition-all duration-500 ${timer.isRunning && timer.mode === 'work' ? 'min-h-[60vh]' : 'lg:col-span-2'}`}>
                <TimerDisplay
                  mode={timer.mode}
                  secondsLeft={timer.secondsLeft}
                  totalSeconds={timer.totalSeconds}
                  isRunning={timer.isRunning}
                  onStart={timer.start}
                  onPause={timer.pause}
                  onReset={timer.reset}
                  onSkip={timer.skipToNext}
                />
                <div className="mt-6 flex items-center gap-4 rounded-full border border-white/10 bg-white/5 px-6 py-3 backdrop-blur-md">
                  <Flame size={18} className="text-orange-400" />
                  <span className="text-sm text-slate-200">
                    Bugün: <span className="font-bold text-white">{timer.completedWorkSessions}</span> Pomodoro
                  </span>
                </div>
              </div>
              {!(timer.isRunning && timer.mode === 'work') && (
                <div className="space-y-4 animate-fade-in">
                  <TaskPanel currentTask={timer.currentTask} onCurrentTaskChange={timer.setCurrentTask} />
                  <BackgroundSelector selected={bgId} onSelect={handleBgChange} />
                  <button
                    onClick={() => setShowBgLibrary(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 py-3 text-sm font-medium text-slate-300 backdrop-blur-md transition hover:bg-white/10 hover:text-white"
                  >
                    <ImagePlus size={16} /> Arka Plan Kütüphanesi
                  </button>
                  <ParticleControls
                    activeEffect={particleEffect}
                    intensity={particleIntensity}
                    onToggle={handleParticleToggle}
                    onIntensityChange={handleIntensityChange}
                  />
                  <AmbientSoundPanel onOpenLibrary={() => setShowAudioLibrary(true)} />
                </div>
              )}
            </div>
          </div>
        )}

        {view === 'stats' && (
          <div className="animate-fade-in">
            <StatisticsPanel />
          </div>
        )}

        {view === 'rooms' && (
          <div className="animate-fade-in">
            <CoworkingPanel />
          </div>
        )}

        {view === 'profile' && (
          <div className="animate-fade-in">
            <ProfilePanel />
          </div>
        )}
      </main>

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
      {showBgLibrary && (
        <BackgroundLibrary selected={bgId} onSelect={handleBgChange} onClose={() => setShowBgLibrary(false)} />
      )}
      {showAudioLibrary && (
        <AudioLibrary onClose={() => setShowAudioLibrary(false)} />
      )}
      {!(timer.isRunning && timer.mode === 'work' && view === 'focus') && (
        <Footer onLegalPage={openLegalPage} />
      )}
      {legalPage && <LegalPages page={legalPage} onClose={closeLegalPage} />}
    </div>
  );
}

function NavButton({ icon: Icon, label, active, onClick }: { icon: typeof Flame; label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition ${
        active ? 'bg-white/10 text-white' : 'text-slate-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={16} />
      {label}
    </button>
  );
}

function LandingPage({ onAuth, bg, onLegalPage }: { onAuth: () => void; bg: typeof BACKGROUNDS[number]; onLegalPage: (page: LegalPage) => void }) {
  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="fixed inset-0 -z-10">
        <img src={bg.url} alt="" className="h-full w-full object-cover animate-pan" />
        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, ${bg.overlay}, rgba(15,23,42,0.9))` }} />
      </div>

      <div className="mx-auto flex min-h-screen max-w-4xl flex-col items-center justify-center px-6 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-orange-500 to-amber-600 shadow-2xl shadow-orange-500/30">
          <GraduationCap className="text-white" size={40} />
        </div>
        <h1 className="mb-4 text-5xl font-bold tracking-tight text-white sm:text-6xl">
          Pomodoro School
        </h1>
        <p className="mb-8 max-w-xl text-lg text-slate-300">
          Odaklanmayı sanata çeviren atmosferik bir çalışma platformu. Pomodoro tekniği, ortam sesleri, ortak çalışma odaları ve daha fazlası.
        </p>
        <button
          onClick={onAuth}
          className="rounded-2xl bg-gradient-to-r from-orange-500 to-amber-600 px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-orange-500/30 transition hover:scale-105 hover:shadow-orange-500/50"
        >
          Başla
        </button>

        <div className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {[
            { icon: Flame, title: 'Odak Sayacı', desc: 'Özelleştirilebilir pomodoro süreleri' },
            { icon: BarChart3, title: 'İstatistikler', desc: 'Günlük, haftalık ve aylık takip' },
            { icon: Users, title: 'Ortak Çalışma', desc: 'Arkadaşlarınla birlikte odaklan' },
          ].map((f) => (
            <div key={f.title} className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-md text-left">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
                <f.icon size={20} className="text-orange-400" />
              </div>
              <h3 className="mb-1 font-semibold text-white">{f.title}</h3>
              <p className="text-sm text-slate-400">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
      <Footer onLegalPage={onLegalPage} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
