/*
# Pomodoro School — Core Schema

1. Purpose
- "Pomodoro School" is a multi-user focus platform. Users sign in with email/password.
- This migration creates the tables for user profiles, tasks, focus sessions, ambient/sound preferences, co-working rooms, and room members.

2. New Tables
- `profiles` — per-user display name, avatar URL, and preferences (JSONB: custom durations, favorite background, theme).
- `tasks` — a user's current and completed tasks ("Şu an ne yapıyorum?").
- `sessions` — completed pomodoro sessions for statistics (date, duration_seconds, mode, task title).
- `rooms` — co-working rooms with a shared timer state (name, current mode, started_at, duration_seconds).
- `room_members` — presence in a room (user_id, room_id, joined_at, last_seen).

3. Security
- Enable RLS on every table.
- Owner-scoped CRUD on profiles, tasks, sessions (auth.uid() = user_id).
- Rooms are readable by any authenticated user (public room list), but only the creator can update/delete.
- Room members: any authenticated user can read (to see who's in a room), but a user can only insert/update/delete their own membership row.
- All owner columns default to auth.uid() so inserts that omit user_id succeed.
*/

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student',
  avatar_url text,
  preferences jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_profile" ON profiles;
CREATE POLICY "select_own_profile" ON profiles FOR SELECT
  TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "insert_own_profile" ON profiles;
CREATE POLICY "insert_own_profile" ON profiles FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "update_own_profile" ON profiles;
CREATE POLICY "update_own_profile" ON profiles FOR UPDATE
  TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

-- TASKS
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  completed boolean NOT NULL DEFAULT false,
  completed_session_count int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);

-- SESSIONS (for statistics)
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  mode text NOT NULL DEFAULT 'work',
  duration_seconds int NOT NULL,
  task_title text,
  completed_at timestamptz DEFAULT now()
);
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_own_sessions" ON sessions;
CREATE POLICY "select_own_sessions" ON sessions FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_sessions" ON sessions;
CREATE POLICY "insert_own_sessions" ON sessions FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_sessions" ON sessions;
CREATE POLICY "delete_own_sessions" ON sessions FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_sessions_user_completed ON sessions(user_id, completed_at);

-- ROOMS (co-working)
CREATE TABLE IF NOT EXISTS rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  host_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  current_mode text NOT NULL DEFAULT 'work',
  started_at timestamptz,
  duration_seconds int NOT NULL DEFAULT 1500,
  max_members int NOT NULL DEFAULT 10,
  created_at timestamptz DEFAULT now()
);
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_rooms" ON rooms;
CREATE POLICY "select_rooms" ON rooms FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_room" ON rooms;
CREATE POLICY "insert_own_room" ON rooms FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "update_own_room" ON rooms;
CREATE POLICY "update_own_room" ON rooms FOR UPDATE
  TO authenticated USING (auth.uid() = host_id) WITH CHECK (auth.uid() = host_id);

DROP POLICY IF EXISTS "delete_own_room" ON rooms;
CREATE POLICY "delete_own_room" ON rooms FOR DELETE
  TO authenticated USING (auth.uid() = host_id);

-- ROOM MEMBERS (presence)
CREATE TABLE IF NOT EXISTS room_members (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student',
  last_seen timestamptz DEFAULT now(),
  UNIQUE (room_id, user_id)
);
ALTER TABLE room_members ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_room_members" ON room_members;
CREATE POLICY "select_room_members" ON room_members FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_membership" ON room_members;
CREATE POLICY "insert_own_membership" ON room_members FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_membership" ON room_members;
CREATE POLICY "update_own_membership" ON room_members FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_membership" ON room_members;
CREATE POLICY "delete_own_membership" ON room_members FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id);

-- Realtime: enable publication for rooms and room_members for live presence
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'rooms'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE rooms;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'room_members'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE room_members;
  END IF;
END $$;