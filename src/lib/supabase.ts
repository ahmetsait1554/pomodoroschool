import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(url, anonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

export type AppUser = {
  id: string;
  email: string;
};

export type TimerMode = 'work' | 'short_break' | 'long_break';

export type ProfilePreferences = {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
  favoriteBackground: string;
  autoStartBreaks: boolean;
  autoStartPomodoros: boolean;
  soundEnabled: boolean;
  notificationEnabled: boolean;
};

export const defaultPreferences: ProfilePreferences = {
  workDuration: 25,
  shortBreakDuration: 5,
  longBreakDuration: 15,
  favoriteBackground: 'forest',
  autoStartBreaks: false,
  autoStartPomodoros: false,
  soundEnabled: true,
  notificationEnabled: true,
};

export type Profile = {
  id: string;
  display_name: string;
  avatar_url: string | null;
  preferences: ProfilePreferences;
};

export type Task = {
  id: string;
  user_id: string;
  title: string;
  completed: boolean;
  completed_session_count: number;
  created_at: string;
};

export type Session = {
  id: string;
  user_id: string;
  mode: string;
  duration_seconds: number;
  task_title: string | null;
  completed_at: string;
};

export type Room = {
  id: string;
  name: string;
  description: string | null;
  host_id: string;
  current_mode: TimerMode;
  started_at: string | null;
  duration_seconds: number;
  max_members: number;
  created_at: string;
};

export type RoomMember = {
  id: string;
  room_id: string;
  user_id: string;
  display_name: string;
  last_seen: string;
};
