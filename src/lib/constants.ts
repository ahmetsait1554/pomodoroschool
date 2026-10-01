import type { TimerMode } from './supabase';

export const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Odak',
  short_break: 'Kısa Mola',
  long_break: 'Uzun Mola',
};

export const MODE_COLORS: Record<TimerMode, string> = {
  work: '#f97316',
  short_break: '#10b981',
  long_break: '#3b82f6',
};

export const MODE_GRADIENTS: Record<TimerMode, string> = {
  work: 'from-orange-500/20 to-amber-500/5',
  short_break: 'from-emerald-500/20 to-teal-500/5',
  long_break: 'from-blue-500/20 to-cyan-500/5',
};

export type BackgroundCategory = 'nature' | 'urban' | 'cozy' | 'pomodoro' | 'custom';

export type BackgroundOption = {
  id: string;
  name: string;
  url: string;
  overlay: string;
  category: BackgroundCategory;
};

export const BACKGROUND_CATEGORIES: { id: BackgroundCategory; name: string }[] = [
  { id: 'nature', name: 'Doğa' },
  { id: 'urban', name: 'Şehir & Gece' },
  { id: 'cozy', name: 'İç Mekan' },
  { id: 'pomodoro', name: 'Lofi' },
  { id: 'custom', name: 'Anime' },
];

export const BACKGROUNDS: BackgroundOption[] = [
  // Doğa
  {
    id: 'forest',
    name: 'Sisli Orman',
    url: 'https://images.pexels.com/photos/10195041/pexels-photo-10195041.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'nature',
  },
  {
    id: 'mountain_lake',
    name: 'Dağ Gölü',
    url: 'https://images.pexels.com/photos/538507/pexels-photo-538507.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'nature',
  },
  {
    id: 'ocean',
    name: 'Sakin Okyanus',
    url: 'https://images.pexels.com/photos/28570440/pexels-photo-28570440.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'nature',
  },
  {
    id: 'tropical_beach',
    name: 'Tropik Sahil',
    url: 'https://images.pexels.com/photos/12811877/pexels-photo-12811877.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'nature',
  },
  {
    id: 'autumn_forest',
    name: 'Sonbahar Ormanı',
    url: 'https://images.pexels.com/photos/1640820/pexels-photo-1640820.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'nature',
  },
  {
    id: 'aurora',
    name: 'Kuzey Işıkları',
    url: 'https://images.pexels.com/photos/15487406/pexels-photo-15487406.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'nature',
  },
  {
    id: 'zen',
    name: 'Zen Bahçesi',
    url: 'https://images.pexels.com/photos/18848793/pexels-photo-18848793.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'nature',
  },
  {
    id: 'snowy_mountain',
    name: 'Karlı Dağlar',
    url: 'https://images.pexels.com/photos/35636373/pexels-photo-35636373.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'nature',
  },
  // Şehir & Gece
  {
    id: 'rain',
    name: 'Yağmurlu Pencere',
    url: 'https://images.pexels.com/photos/18581833/pexels-photo-18581833.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'urban',
  },
  {
    id: 'city_night',
    name: 'Gece Şehri',
    url: 'https://images.pexels.com/photos/9174342/pexels-photo-9174342.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'urban',
  },
  {
    id: 'city_bokeh',
    name: 'Şehir Işıkları',
    url: 'https://images.pexels.com/photos/17580079/pexels-photo-17580079.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.55)',
    category: 'urban',
  },
  // İç Mekan
  {
    id: 'library',
    name: 'Sıcak Kütüphane',
    url: 'https://images.pexels.com/photos/877971/pexels-photo-877971.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'cozy',
  },
  {
    id: 'coffee_shop',
    name: 'Kahve Dükkanı',
    url: 'https://images.pexels.com/photos/34338427/pexels-photo-34338427.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'cozy',
  },
  {
    id: 'cafe_warm',
    name: 'Sıcak Kafe',
    url: 'https://images.pexels.com/photos/35518412/pexels-photo-35518412.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1280',
    overlay: 'rgba(15, 23, 42, 0.5)',
    category: 'cozy',
  },
];

export type ParticleEffectType = 'rain' | 'snow' | 'leaves' ;

export type ParticleEffect = {
  id: ParticleEffectType;
  name: string;
  icon: string;
};

export const PARTICLE_EFFECTS: ParticleEffect[] = [
  { id: 'rain', name: 'Yağmur', icon: 'CloudRain' },
  { id: 'snow', name: 'Kar', icon: 'Snowflake' },
  { id: 'leaves', name: 'Yapraklar', icon: 'Leaf' },
];

export type AmbientSound = {
  id: string;
  name: string;
  icon: string;
  url: string;
};

export type MusicTrack = {
  id: string;
  name: string;
  artist: string;
  url: string;
  duration: string;
};

const RAW_BASE = 'https://raw.githubusercontent.com/ahmetsait1554/pomodoroschool/main';

export const AMBIENT_SOUNDS: AmbientSound[] = [
  { id: 'birdvoice', name: 'Kuş Sesleri', icon: 'Bird', url: `${RAW_BASE}/birdvoice.mp3` },
  { id: 'city', name: 'Şehir', icon: 'Building2', url: `${RAW_BASE}/city.mp3` },
  { id: 'forest', name: 'Orman', icon: 'Trees', url: `${RAW_BASE}/forest.mp3` },
  { id: 'kahvehane', name: 'Kahvehane', icon: 'Coffee', url: `${RAW_BASE}/kahvehane.mp3` },
  { id: 'kamp_atesi', name: 'Kamp Ateşi', icon: 'Flame', url: `${RAW_BASE}/kamp%20ate%C5%9Fi.mp3` },
  { id: 'yagmur', name: 'Yağmur', icon: 'CloudRain', url: `${RAW_BASE}/ya%C4%9Fmur.mp3` },
  { id: 'thunder', name: 'Gök Gürültüsü', icon: 'CloudLightning', url: `${RAW_BASE}/thunder.mp3` },
  { id: 'ruzgar', name: 'Rüzgar', icon: 'Wind', url: `${RAW_BASE}/r%C3%BCzgar.mp3` },
  { id: 'river', name: 'Akarsu', icon: 'Waves', url: `${RAW_BASE}/river.mp3` },
  { id: 'power_water', name: 'Şelale', icon: 'Droplets', url: `${RAW_BASE}/power%20water.mp3` },
  { id: 'power_kamp_atesi', name: 'Büyük Kamp Ateşi', icon: 'Tent', url: `${RAW_BASE}/power%20kamp%20ate%C5%9F.mp3` },
];

export const MUSIC_TRACKS: MusicTrack[] = [
  { id: 'Büyük kamp ateşi', name: 'ateş', artist: 'unknown', url: 'https://github.com/ahmetsait1554/pomodoroschool/blob/aae014c21edd0f28fdfef96a171177b8e7c3e52f/power%20kamp%20ate%C5%9F.mp3', duration: '3:12' },
  { id: 'lofi2', name: 'Sakin Piyano', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2022/03/15/audio_8e6a30c3e4.mp3', duration: '4:05' },
  { id: 'lofi3', name: 'Gece Düşleri', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2022/11/22/audio_febc50a614.mp3', duration: '2:48' },
  { id: 'lofi4', name: 'Yağmurlu Gün', artist: 'Pixabay', url: 'https://cdn.pixabay.com/audio/2023/01/30/audio_9b6e1d9e3f.mp3', duration: '3:30' },
];

export const POMODORO_BEFORE_LONG_BREAK = 4;
