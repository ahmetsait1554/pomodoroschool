/*
# Add unique constraint on backgrounds.storage_path

1. Schema Changes
- Add UNIQUE constraint on `backgrounds.storage_path` so upsert (ON CONFLICT) works correctly.
*/

CREATE UNIQUE INDEX IF NOT EXISTS backgrounds_storage_path_key ON backgrounds (storage_path);
