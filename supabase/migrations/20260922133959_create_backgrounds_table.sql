/*
# Create backgrounds table for global background library

1. New Tables
- `backgrounds`
  - `id` (uuid, primary key)
  - `name` (text, not null) — display name shown in the library
  - `storage_path` (text, not null) — path in the `backgrounds` storage bucket
  - `category` (text, not null, default 'custom') — category label (nature, urban, cozy, custom)
  - `overlay` (text, not null, default 'rgba(15, 23, 42, 0.55)') — CSS overlay for readability
  - `sort_order` (int, default 0) — ordering within category
  - `created_at` (timestamptz, default now())

2. Security
- Enable RLS on `backgrounds`.
- SELECT is public (TO anon, authenticated) so all users — including unauthenticated visitors — can see and use the backgrounds.
- No INSERT/UPDATE/DELETE policies: only developers/admins manage backgrounds via the service role or SQL, never from the frontend.

3. Storage
- Creates a public bucket `backgrounds` so images are accessible via public URLs.
- All users can read; no user can write (uploads are done by the developer via MCP/SQL).
*/

CREATE TABLE IF NOT EXISTS backgrounds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  storage_path text NOT NULL,
  category text NOT NULL DEFAULT 'custom',
  overlay text NOT NULL DEFAULT 'rgba(15, 23, 42, 0.55)',
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE backgrounds ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_backgrounds" ON backgrounds;
CREATE POLICY "public_read_backgrounds" ON backgrounds
  FOR SELECT
  TO anon, authenticated
  USING (true);

INSERT INTO storage.buckets (id, name, public)
VALUES ('backgrounds', 'backgrounds', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "public_read_backgrounds_bucket" ON storage.objects;
CREATE POLICY "public_read_backgrounds_bucket" ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'backgrounds');
