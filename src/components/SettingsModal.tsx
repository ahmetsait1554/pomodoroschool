import { useState } from 'react';
import { X, Settings as SettingsIcon } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import type { ProfilePreferences } from '@/lib/supabase';

type Props = { onClose: () => void };

export default function SettingsModal({ onClose }: Props) {
  const { profile, updatePreferences, updateDisplayName } = useAuth();
  const prefs = profile?.preferences;
  const [work, setWork] = useState(prefs?.workDuration ?? 25);
  const [shortBreak, setShortBreak] = useState(prefs?.shortBreakDuration ?? 5);
  const [longBreak, setLongBreak] = useState(prefs?.longBreakDuration ?? 15);
  const [autoBreaks, setAutoBreaks] = useState(prefs?.autoStartBreaks ?? false);
  const [autoPomo, setAutoPomo] = useState(prefs?.autoStartPomodoros ?? false);
  const [notif, setNotif] = useState(prefs?.notificationEnabled ?? true);
  const [sound, setSound] = useState(prefs?.soundEnabled ?? true);
  const [name, setName] = useState(profile?.display_name ?? 'Student');
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    const newPrefs: Partial<ProfilePreferences> = {
      workDuration: work,
      shortBreakDuration: shortBreak,
      longBreakDuration: longBreak,
      autoStartBreaks: autoBreaks,
      autoStartPomodoros: autoPomo,
      notificationEnabled: notif,
      soundEnabled: sound,
    };
    await updatePreferences(newPrefs);
    if (name !== profile?.display_name) {
      await updateDisplayName(name);
    }
    setSaving(false);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-2xl border border-white/10 bg-slate-900/95 p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button onClick={onClose} className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors">
          <X size={20} />
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/20">
            <SettingsIcon size={20} className="text-orange-400" />
          </div>
          <h2 className="text-xl font-semibold text-white">Ayarlar</h2>
        </div>

        <div className="space-y-6">
          <section>
            <h3 className="mb-3 text-sm font-medium text-slate-300">Profil</h3>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Görünür ad"
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-slate-500 outline-none focus:border-orange-500/50"
            />
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-slate-300">Süreler (dakika)</h3>
            <div className="grid grid-cols-3 gap-3">
              <DurationInput label="Odak" value={work} onChange={setWork} min={1} max={90} color="text-orange-400" />
              <DurationInput label="Kısa Mola" value={shortBreak} onChange={setShortBreak} min={1} max={30} color="text-emerald-400" />
              <DurationInput label="Uzun Mola" value={longBreak} onChange={setLongBreak} min={1} max={60} color="text-blue-400" />
            </div>
          </section>

          <section>
            <h3 className="mb-3 text-sm font-medium text-slate-300">Tercihler</h3>
            <div className="space-y-2">
              <ToggleRow label="Molaları otomatik başlat" checked={autoBreaks} onChange={setAutoBreaks} />
              <ToggleRow label="Pomodoroları otomatik başlat" checked={autoPomo} onChange={setAutoPomo} />
              <ToggleRow label="Tarayıcı bildirimleri" checked={notif} onChange={setNotif} />
              <ToggleRow label="Sesli uyarı" checked={sound} onChange={setSound} />
            </div>
          </section>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="mt-6 w-full rounded-xl bg-gradient-to-r from-orange-500 to-amber-600 py-3 font-semibold text-white shadow-lg shadow-orange-500/20 transition hover:shadow-orange-500/40 disabled:opacity-50"
        >
          {saving ? 'Kaydediliyor...' : 'Kaydet'}
        </button>
      </div>
    </div>
  );
}

function DurationInput({ label, value, onChange, min, max, color }: {
  label: string; value: number; onChange: (v: number) => void; min: number; max: number; color: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <label className={`mb-2 block text-xs font-medium ${color}`}>{label}</label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.max(min, Math.min(max, parseInt(e.target.value) || min)))}
        className="w-full bg-transparent text-center text-xl font-bold text-white outline-none"
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3">
      <span className="text-sm text-slate-200">{label}</span>
      <button
        onClick={() => onChange(!checked)}
        className={`relative h-6 w-11 rounded-full transition ${checked ? 'bg-orange-500' : 'bg-slate-600'}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all ${checked ? 'left-[22px]' : 'left-0.5'}`} />
      </button>
    </div>
  );
}
