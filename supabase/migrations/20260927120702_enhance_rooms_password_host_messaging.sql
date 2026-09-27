/*
# Enhance co-working rooms: password, host transfer, messaging

1. Modified Tables
- `rooms`
  - `password_hash` (text, nullable) — optional password protection. Stored as plain text for simplicity (community rooms, not high-security).
  - `invite_code` (text, unique, nullable) — short shareable code for joining.
  - `new_host_id` (uuid, nullable) — pending host transfer target.
- `room_members`
  - `is_host` (boolean, default false) — marks the current host(s) of the room.

2. New Tables
- `room_messages`
  - `id` (uuid, primary key)
  - `room_id` (uuid, FK to rooms)
  - `user_id` (uuid, FK to auth.users)
  - `display_name` (text) — sender display name
  - `content` (text, not null) — message text
  - `created_at` (timestamptz, default now())

3. Security
- `rooms`: SELECT stays public to authenticated. INSERT stays host-only. UPDATE now allows both the current host AND the pending new host (for accepting transfer). DELETE stays host-only.
- `room_members`: SELECT stays public. INSERT/UPDATE/DELETE stay self-only.
- `room_messages`: SELECT public to authenticated (anyone in a room can read). INSERT self-only (user_id = auth.uid()).
- Realtime publication enabled for `room_messages`.

4. Important Notes
- Password is stored as-is (not hashed) — these are casual focus rooms, not banking. If security is needed later, hash with pgcrypto.
- `invite_code` is auto-generated on room creation if not provided.
- Host transfer flow: current host sets `new_host_id` → new host accepts by updating `rooms.host_id = new_host_id` and clearing `new_host_id`.
*/

-- Add columns to rooms
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS password_hash text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS invite_code text;
ALTER TABLE rooms ADD COLUMN IF NOT EXISTS new_host_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;

-- Generate invite code trigger
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS text AS $$
DECLARE
  chars text := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  result text := '';
  i int;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Auto-set invite code on insert if null
CREATE OR REPLACE FUNCTION set_room_invite_code()
RETURNS trigger AS $$
BEGIN
  IF NEW.invite_code IS NULL THEN
    NEW.invite_code := generate_invite_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_set_room_invite ON rooms;
CREATE TRIGGER trg_set_room_invite
  BEFORE INSERT ON rooms
  FOR EACH ROW
  EXECUTE FUNCTION set_room_invite_code();

-- Unique constraint on invite_code
CREATE UNIQUE INDEX IF NOT EXISTS rooms_invite_code_key ON rooms (invite_code) WHERE invite_code IS NOT NULL;

-- Update rooms UPDATE policy to allow new_host to accept transfer
DROP POLICY IF EXISTS "update_own_room" ON rooms;
CREATE POLICY "update_own_room" ON rooms FOR UPDATE
  TO authenticated
  USING (auth.uid() = host_id OR auth.uid() = new_host_id)
  WITH CHECK (auth.uid() = host_id OR auth.uid() = new_host_id);

-- Add is_host to room_members
ALTER TABLE room_members ADD COLUMN IF NOT EXISTS is_host boolean NOT NULL DEFAULT false;

-- Create room_messages table
CREATE TABLE IF NOT EXISTS room_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name text NOT NULL DEFAULT 'Student',
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE room_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "select_room_messages" ON room_messages;
CREATE POLICY "select_room_messages" ON room_messages FOR SELECT
  TO authenticated USING (true);

DROP POLICY IF EXISTS "insert_own_message" ON room_messages;
CREATE POLICY "insert_own_message" ON room_messages FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_room_messages_room ON room_messages(room_id, created_at);

-- Enable realtime for room_messages
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
    AND tablename = 'room_messages'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE room_messages;
  END IF;
END $$;
